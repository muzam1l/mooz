import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { nanoid } from 'nanoid'
import NodeCache from 'node-cache'
// @ts-ignore
import gzipStatic from 'connect-gzip-static'
import finalhandler from 'finalhandler'
import { resolve } from 'path'

const serve = gzipStatic(resolve(__dirname, '../build'))

const IO_OPTIONS = { cors: { origin: '*' } }

const httpServer = createServer((req, res) => {
    const nxt = () => {
        req.url = '/'
        serve(req, res, finalhandler(req, res))
    }
    serve(req, res, nxt)
})

const io = new Server(httpServer, IO_OPTIONS)

const roomsCache = new NodeCache({
    /*
     12 hours expiry. 
     It is long enough to last for any meeting (too long) and shoudn't be needed normally, just for the case i fuck up somewhere
    */
    stdTTL: 43200,
})

interface Room {
    id: string // client version of Room may have id optional
    created_by?: string
    name?: string
    opts?: {
        maxPeople?: string // will be int parsed when used
    }
}

interface Person {
    sessionId: string
}

io.on('connection', (socket: Socket) => {
    console.log('socket connected', socket.id)

    socket.on('register', ({ sessionId, roomId }: { sessionId: string; roomId?: string }) => {
        roomsCache.set<Person>(socket.id, { sessionId })

        /**
         socket joins room with same session id
         This allows for extra layer above socket id so client just communicates with session id
        */
        socket.join(sessionId)

        // join rooms person is already in
        if (roomId) {
            socket.join(roomId)
            io.to(roomId).emit('person_reconnected', {
                sessionId,
            })
        }
    })

    socket.on('create_room', (room: Room, cb) => {
        try {
            // TODO anonymous auth and/or rate limiting
            const roomId = nanoid()
            room.id = roomId

            socket.join(roomId)
            roomsCache.set<Room>(roomId, room)
            io.to(socket.id).emit('joined_room', room)

            cb({ isError: false })
        } catch (err) {
            console.error(err)
            cb({ isError: true })
        }
    })

    socket.on('join_room', (opts, cb) => {
        try {
            const { name, link } = opts
            const room = getRoomFromLink(link) // throws error on no room

            const { sessionId } = roomsCache.get<Person>(socket.id) || {}
            if (!sessionId) throw Error('No session id')
            socket.join(room.id)
            socket.to(room.id).emit('person_joined', {
                name,
                sessionId,
            })
            io.to(socket.id).emit('joined_room', room)

            cb({ isError: false })
        } catch (err) {
            console.error('Error creating room', err)
            cb({ isError: true })
        }
    })

    socket.on('leave_room', () => {
        try {
            socket.rooms.forEach(room => {
                if (room === socket.id) return

                socket.leave(room)
                const { sessionId } = roomsCache.get<Person>(socket.id) || {}
                if (sessionId) {
                    socket.to(room).emit('person_left', {
                        sessionId,
                    })
                }
                io.in(room)
                    .allSockets()
                    .then(sockets => {
                        if (sockets.size === 0) {
                            // room is now empty, clear the memory reference
                            roomsCache.del(room)
                        }
                    })
            })
        } catch (err) {
            console.error('Error leaving room 😂', err)
        }
    })
    // person reports that person left
    socket.on('person_left', ({ sessionId }: { sessionId: string }) => {
        try {
            io.to(sessionId).emit('leave_room')
            // ALERT exposes memory leak as it does not leave socketio room
            // TODO make leaving persons socket (have to find that) leave rooms it is in

            socket.rooms.forEach(room => {
                if (room === socket.id) return
                const { sessionId: mySessionId } = roomsCache.get<Person>(socket.id) || {}
                if (room === mySessionId) return

                io.to(room).emit('person_left', {
                    sessionId,
                })
                io.in(room)
                    .allSockets()
                    .then(sockets => {
                        if (sockets.size === 0) {
                            // room is now empty, clear the memory reference
                            if (roomsCache.has(room)) roomsCache.del(room)
                        }
                    })
            })
        } catch (err) {
            console.error('Error leaving room 😂', err)
        }
    })

    /*
    messages ('message' events) are send as is to other socket specified by `to` key in data 
    `to` key is removed and `from` is added in delivered message\
    both `to` and `from` are session ids
    */
    socket.on('message', message => {
        const { to, ...msg } = message
        const { sessionId } = roomsCache.get<Person>(socket.id) || {}
        if (!sessionId) return
        socket.to(to).send({
            from: sessionId,
            ...msg,
        })
    })

    socket.on('disconnecting', () => {
        const { sessionId } = roomsCache.get<Person>(socket.id) || {} 
        roomsCache.del(socket.id)
        socket.rooms.forEach(room => {
            if (room !== socket.id || room !== sessionId) {
                if (sessionId) {
                    io.to(room).emit('person_disconnected', {
                        sessionId,
                    })
                }
            }
        })
    })
})
const PATH_REGEX = /^\/room\/(?<id>[A-Za-z0-9_-]+$)/
const ID_REGEX = /^(?<id>[A-Za-z0-9_-]+$)/

function getRoomFromLink(link: string): Room {
    let id: string | undefined
    try {
        const url = new URL(link) // throws if url is invalid
        /* This does not care about url host so any host is valid as long as that follows below pathname pattern
           /room/<room_id>
           room_id regex = ([A-Za-z0-9_-])+ (same as nanoid character set)
        */
        id = url.pathname.match(PATH_REGEX)?.groups?.id
    } catch (error) {
        // try link as id  
        id = link.match(ID_REGEX)?.groups?.id
    }

    if (!id) throw Error('Cannot parse room id')
    if (!roomsCache.has(id)) throw Error('Room not found')

    return roomsCache.get(id) as Room
}

httpServer.listen(process.env.PORT || 5000, () => {
    console.log('listening on port', process.env.PORT || 5000)
})
