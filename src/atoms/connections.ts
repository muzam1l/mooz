import { nanoid } from 'nanoid'
import { atom, DefaultValue, selector } from 'recoil'
import { Socket, io } from 'socket.io-client'

export const createSocket = (): Socket => {
    const socket = io()

    socket.on('connect', () => {
        const id = sessionStorage.getItem('ID') || nanoid()
        socket.emit('register', id)

        sessionStorage.setItem('ID', id) // for newly generated
    })
    // socket.onAny((event, ...args) => {
    //     console.log(`got ${event} with args:`, ...args)
    // })

    return socket
}

export const socketState = atom<Socket>({
    key: 'socketState',
    default: createSocket(),
})

export interface Room {
    id?: string // server version of Room has id required, not here when filling details
    created_by?: string
    name?: string
    opts?: {
        maxPeople?: string
    }
}

// current room user is in, null maps to landing page
export const roomState = atom<Room | null>({
    key: 'roomState',
    default: null,
})

export interface RemoteStream {
    stream: MediaStream
    partnerId: string
    isDisplay?: boolean
}

export const remoteStreamsState = atom<RemoteStream[]>({
    key: 'remoteStreamsState',
    default: [],
})

export interface Connection {
    partnerId: string
    initiator: boolean
    partnerName?: string
}

export const connectionsState = atom<Connection[]>({
    key: 'connectionsState',
    default: [],
})

export const addConnectionsSelector = selector<Connection[]>({
    key: 'addConnectionsSelector',
    get: ({ get }) => get(connectionsState), // returns connectionsState as it is
    set: ({ get, set }, newVal) => {
        if (newVal instanceof DefaultValue) {
            throw Error('What were you thinking dude')
        }
        const connections = get(connectionsState)
        const toAdd: Connection[] = []
        newVal.forEach(val => {
            if (!connections.find(c => c.partnerId === val.partnerId)) {
                toAdd.push(val)
            }
        })
        if (toAdd.length) set(connectionsState, connections.concat(toAdd))
    },
})
export const removeConnectionsSelector = selector<Connection[]>({
    key: 'removeConnectionsSelector',
    get: ({ get }) => get(connectionsState), // returns connectionsState as it is
    set: ({ get, set }, newVal) => {
        if (newVal instanceof DefaultValue) {
            throw Error('What were you thinking dude')
        }
        // remove remote streams with remote ids as that of vals
        const remoteStreams = get(remoteStreamsState)
        set(
            remoteStreamsState,
            remoteStreams.filter(r => !newVal.find(v => v.partnerId === r.partnerId)),
        )

        // set new connections with val ones removed
        const connections = get(connectionsState)
        set(
            connectionsState,
            connections.filter(c => !newVal.find(v => v.partnerId === c.partnerId)),
        )

        // remove those peers 
        if (window.moozPeers) {
            window.moozPeers = window.moozPeers.filter(
                p => !newVal.find(v => v.partnerId === p.partnerId),
            )
        }
    },
})
