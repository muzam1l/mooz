import { createServer } from 'http'
import { Server, ServerOptions } from 'socket.io'
import { nanoid } from 'nanoid'
import NodeCache from 'node-cache'
import {
  IClientToServerEvent,
  IRoom,
  IServerRoom,
  IServerToClientEvent,
  ISocketData,
} from './types'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import packageJson from './package.json'

import 'dotenv/config'

console.log('version', packageJson.version)
console.log('allow', process.env.ALLOW_ORIGIN)
const httpServer = createServer((_, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('ok\n');
})
const serverOpts: Partial<ServerOptions> = {
  cors: {
    origin: JSON.parse(process.env.ALLOW_ORIGIN || '"*"'),
    credentials: !!process.env.ALLOW_ORIGIN,
  },
}
const io = new Server<
  IClientToServerEvent,
  IServerToClientEvent,
  DefaultEventsMap,
  ISocketData
>(httpServer, serverOpts)

/*
12 hours expiry. 
It is long enough to last for any meeting (too long) and shouldn't be needed normally, just for the case i fuck up somewhere
*/
const stdTTL = 12 * 60 * 60
const roomsCache = new NodeCache({
  stdTTL,
})

class Rooms {
  private static internalKeys: [keyof Omit<IServerRoom, keyof IRoom>] = [
    'userIds',
  ]

  private static update(
    id: string,
    partial:
      | Partial<IServerRoom>
      | ((room: IServerRoom) => Partial<IServerRoom>),
  ): IServerRoom | null {
    const internal = roomsCache.get<IServerRoom>(id)
    if (!internal) {
      return null
    }

    let data: IServerRoom
    if (typeof partial === 'function') {
      data = {
        ...internal,
        ...partial(internal),
      }
    } else {
      data = {
        ...internal,
        ...partial,
      }
    }
    roomsCache.set<IServerRoom>(id, data)
    return data
  }

  static create(room: IRoom, userId: string): string {
    const id = nanoid()
    roomsCache.set<IServerRoom>(id, {
      ...room,
      id,
      userIds: [userId],
    })
    return id
  }

  static delete(id: string) {
    roomsCache.del(id)
  }

  static get(id?: string): IRoom | null {
    if (!id) {
      return null
    }
    const internal = roomsCache.get<IServerRoom>(id)
    if (!internal) {
      return null
    }

    let room: IRoom = {
      ...internal,
    }
    Rooms.internalKeys.forEach(key => {
      delete room[key as keyof IRoom]
    })
    return room
  }

  static size(id: string): number {
    return roomsCache.get<IServerRoom>(id)?.userIds.length || 0
  }

  static addUser(id: string, userId: string): void {
    if (this.getUsers(id).includes(userId)) {
      return
    }
    this.update(id, room => ({
      userIds: [...room.userIds, userId],
    }))
  }
  static removeUser(id: string, userId: string): void {
    this.update(id, room => ({
      userIds: room.userIds.filter(id => id !== userId),
    }))
  }

  static getUsers(id: string): string[] {
    return roomsCache.get<IServerRoom>(id)?.userIds || []
  }
}

const err = (msg: string): Error => ({
  name: 'Error',
  message: msg,
})
const GENERIC_ERROR = err('Something went wrong, try again later!')

io.use((socket, next) => {
  try {
    const { sessionId, currentRoomId } = socket.handshake.auth
    if (!sessionId) {
      return next(new Error('No sessionId provided'))
    }
    // TODO anonymous auth and/or rate limiting
    socket.data.sessionId = sessionId
    /**
    Socket joins the room with same sessionId
    This allows for extra layer above the socket.id, so we just communicate with the sessionId
    */
    socket.join(sessionId)

    // joins room person was already present in
    if (currentRoomId) {
      if (Rooms.getUsers(currentRoomId).includes(sessionId)) {
        socket.join(currentRoomId)
      } else {
        socket.emit('action:room_connection_terminated', {
          roomId: currentRoomId,
        })
      }
    }

    next()
  } catch (error) {
    console.error('Error in use.auth', error)
  }
})

io.on('connection', socket => {
  console.log('socket connected', socket.id)

  const transport = socket.conn.transport.name // in most cases, "polling"
  console.log({ transport })

  socket.conn.on('upgrade', () => {
    const upgradedTransport = socket.conn.transport.name // in most cases, "websocket"
    console.log({ upgradedTransport })
  })

  socket.on('request:create_room', ({ room }, cb) => {
    try {
      room.name =
        room.name ||
        (room.created_by ? `Room by ${room.created_by}` : `with id ${room.id}`)
      const userId = socket.data.sessionId
      const id = Rooms.create(room, userId)
      const created = Rooms.get(id)
      if (!created) {
        cb?.(GENERIC_ERROR)
        return
      }

      socket.join(id)
      io.to(userId).emit('action:room_connection_established', {
        room: created,
      })

      cb?.()
    } catch (err) {
      console.error('Error in request:create_room', err)
      cb?.(GENERIC_ERROR)
    }
  })

  socket.on('request:join_room', async ({ userName, roomId: idOrLink }, cb) => {
    try {
      // TODO Get permission from the room
      const room = Rooms.get(getRoomId(idOrLink))
      if (!room) {
        cb?.(err('Room not found or expired'))
        return
      }

      const capacity = room.opts?.capacity || 0
      if (Rooms.size(room.id) >= capacity) {
        cb?.(err('Room is full, make a new one!'))
        return
      }

      // Find out the missing ones
      const sockets = await io.in(room.id).fetchSockets()
      const users = Rooms.getUsers(room.id)
      const missing = users.filter(
        userId => !sockets.find(socket => socket.data.sessionId === userId),
      )

      // Declare em Excommunicado
      missing.forEach(userId => {
        kickOut(userId, room.id)
      })

      const userId = socket.data.sessionId
      io.to(room.id)
        .except(socket.id)
        .emit('action:establish_peer_connection', {
          userName,
          userId,
        })
      socket.join(room.id)
      io.to(socket.id).emit('action:room_connection_established', { room })
      Rooms.addUser(room.id, userId)

      cb?.()
    } catch (err) {
      console.error('Error in request:join_room', err)
      cb?.(GENERIC_ERROR)
    }
  })

  socket.on('request:leave_room', async ({ roomId }, cb) => {
    try {
      socket.leave(roomId)
      kickOut(socket.data.sessionId, roomId)

      if (Rooms.size(roomId) === 0) {
        Rooms.delete(roomId)
      }

      cb?.()
    } catch (err) {
      console.error('Error in request:leave_room', err)
      cb?.(GENERIC_ERROR)
    }
  })

  socket.on('request:send_mesage', async ({ to, roomId, data }, cb) => {
    const userId = socket.data.sessionId
    const sockets = await io.fetchSockets()
    if (!sockets.find(socket => socket.data.sessionId === to)) {
      kickOut(to, roomId)
      cb?.(GENERIC_ERROR)
    }
    io.to(to).emit('action:message_received', {
      from: userId,
      data,
    })
    cb?.()
  })

  socket.on('disconnecting', () => { })
})

function kickOut(userId: string, roomId: string) {
  io.to(roomId)
    .emit('action:terminate_peer_connection', {
      userId,
    })
  io.to(userId).emit('action:room_connection_terminated', {
    roomId,
  })
  Rooms.removeUser(roomId, userId)
}

const PATH_REGEX = /^\/room\/(?<id>[A-Za-z0-9_-]+$)/
const ID_REGEX = /^(?<id>[A-Za-z0-9_-]+$)/

function getRoomId(idOrLink: string): string | undefined {
  let id: string | undefined
  try {
    const url = new URL(idOrLink) // throws if url is invalid
    /* This does not care about url host so any host is valid as long as that follows below pathname pattern
           /room/<room_id>
           room_id regex = ([A-Za-z0-9_-])+ (same as nanoid character set)
        */
    id = url.pathname.match(PATH_REGEX)?.groups?.id
  } catch (error) {
    // try link as id
    id = idOrLink.match(ID_REGEX)?.groups?.id
  }

  return id
}

const port = process.env.PORT || 5005
httpServer.listen(port, () => {
  console.log('listening on port', port)
})
