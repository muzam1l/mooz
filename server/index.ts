import { createServer } from 'http'
import { Server, ServerOptions } from 'socket.io'
import { nanoid } from 'nanoid'
import NodeCache from 'node-cache'
import type { IServerToClientEvent, IClientToServerEvent, IRoom } from '../src/state/types'

import 'dotenv/config'

console.log("allow", process.env.ALLOW_ORIGIN)
const serverOpts: Partial<ServerOptions> = {
    cors: {
        origin: JSON.parse(process.env.ALLOW_ORIGIN || "\"*\""),
        credentials: !!process.env.ALLOW_ORIGIN,
    },
}

const httpServer = createServer()
const io = new Server<IClientToServerEvent, IServerToClientEvent>(httpServer, serverOpts)

/*
12 hours expiry. 
It is long enough to last for any meeting (too long) and shouldn't be needed normally, just for the case i fuck up somewhere
*/
const stdTTL = 12 * 60 * 60
const roomsCache = new NodeCache({
    stdTTL,
})
const peopleCache = new NodeCache({
    stdTTL,
})

interface IPerson {
    userId: string
}

type IServerRoom = {
    userIds: string[]
} & IRoom

class Rooms {
    private static internalKeys: [keyof Omit<IServerRoom, keyof IRoom>] = ["userIds"]

    private static update(id: string, partial: Partial<IServerRoom> | ((room: IServerRoom) => Partial<IServerRoom>)): IServerRoom | null {
        const internal = roomsCache.get<IServerRoom>(id)
        if (!internal) {
            return null
        }

        let data: IServerRoom
        if (typeof partial === "function") {
            data = {
                ...internal,
                ...partial(internal)
            }
        } else {
            data = {
                ...internal,
                ...partial
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
            userIds: [userId]
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
            ...internal
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
        this.update(id, room => ({
            userIds: [...room.userIds, userId]
        }))
    }
    static removeUser(id: string, userId: string): void {
        this.update(id, room => ({
            userIds: room.userIds.filter(id => id !== userId)
        }))
    }
}

const GENERIC_ERROR_MSG = "Something went wrong, try again later!"

io.on('connection', socket => {
    console.log('socket connected', socket.id)

    const transport = socket.conn.transport.name; // in most cases, "polling"
    console.log({ transport })

    socket.conn.on("upgrade", () => {
        const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
        console.log({ upgradedTransport })
    });

    socket.on("request:register_self", ({ userId, currendRoomId }, cb) => {
        try {
            // TODO anonymous auth and/or rate limiting
            peopleCache.set<IPerson>(socket.id, { userId })
            /**
             socket joins room with same userId
             This allows for extra layer above socket.id, so we just communicate with the userId
            */
            socket.join(userId)

            // joins room person was already present in
            if (currendRoomId) {
                socket.join(currendRoomId)
            }
            cb?.({ error: null })
        } catch (error) {
            console.error("Error in request:register_self", error)
            cb?.({ error: GENERIC_ERROR_MSG })
        }
    })

    socket.on("request:create_room", ({ room }, cb) => {
        try {
            const { userId } = peopleCache.get<IPerson>(socket.id) || {}

            if (!userId) {
                throw Error("Can't find session id for socket" + socket.id)
            }

            room.name = room.name || (room.created_by ? `Room by ${room.created_by}` : `with id ${room.id}`)
            const id = Rooms.create(room, userId)
            const created = Rooms.get(id)
            if (!created) {
                throw Error("Error creating room")
            }

            socket.join(id)
            io.to(userId).emit("action:room_connection_established", { room: created })

            cb?.({ error: null })
        } catch (err) {
            console.error("Error in request:create_room", err)
            cb?.({ error: GENERIC_ERROR_MSG })
        }
    })

    socket.on("request:join_room", async ({ userName, roomId: idOrLink }, cb) => {
        try {
            // TODO Get permission from the room
            const room = Rooms.get(getRoomId(idOrLink))
            if (!room) {
                cb?.({ error: 'Room not found or expired' })
                return
            }

            const capacity = room.opts?.capacity || 0
            if (Rooms.size(room.id) >= capacity) {
                cb?.({ error: 'Room is full, make a new one!' })
                return
            }

            const { userId } = peopleCache.get<IPerson>(socket.id) || {}
            if (!userId) throw Error('No userId for socket' + socket.id)

            socket.join(room.id)
            io.to(room.id).except(socket.id).emit("action:establish_peer_connection", {
                userName,
                userId,
            })
            io.to(socket.id).emit("action:room_connection_established", { room })
            Rooms.addUser(room.id, userId)

            cb?.({ error: null })
        } catch (err) {
            console.error('Error in request:join_room', err)
            cb?.({ error: GENERIC_ERROR_MSG })
        }
    })

    socket.on("request:leave_room", async ({ roomId }, cb) => {
        try {
            socket.leave(roomId)
            const { userId } = peopleCache.get<IPerson>(socket.id) || {}
            if (userId) {
                io.to(roomId).except(socket.id).emit("action:terminate_peer_connection", {
                    userId,
                })
                io.to(userId).emit("action:room_connection_terminated", {
                    roomId
                })
                Rooms.removeUser(roomId, userId)
            }
            if (Rooms.size(roomId) === 0) {
                Rooms.delete(roomId)
            }

            cb?.({ error: null })
        } catch (err) {
            console.error('Error in request:leave_room', err)
            cb?.({ error: GENERIC_ERROR_MSG })
        }
    })

    // TODO
    socket.on("request:report_person_left", ({ userId, roomId }, cb) => {
        try {
            io.to(userId).emit("action:room_connection_terminated", {
                roomId
            })
            io.to(roomId).emit("action:terminate_peer_connection", {
                userId,
            })
            Rooms.removeUser(roomId, userId)
            if (Rooms.size(roomId) === 0) {
                Rooms.delete(roomId)
            }
            cb?.({ error: null })
        } catch (err) {
            console.error('Error in request:report_person_left!', err)
            cb?.({ error: GENERIC_ERROR_MSG })
        }
    })

    socket.on("request:send_mesage", ({ to, data }, cb) => {
        const { userId } = peopleCache.get<IPerson>(socket.id) || {}
        if (!userId) return
        io.to(to).emit("action:message_received", {
            from: userId,
            data,
        })
        cb?.({ error: null })
    })

    socket.on('disconnecting', () => {
        peopleCache.del(socket.id)
    })
})

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

    // if (!id) throw Error('Cannot parse room id')
    // if (!roomsCache.has(id)) throw Error('Room not found')

    return id
}

const port = process.env.PORT || 5001
httpServer.listen(port, () => {
    console.log('listening on port', port)
})
