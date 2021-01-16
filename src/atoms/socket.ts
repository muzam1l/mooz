import { atom } from 'recoil'
import { Socket, io } from 'socket.io-client'

export const createSocket = (): Socket => {
    const socket = io('ws://localhost:3000')

    socket.on('connect', () => {
        console.log('Socket connected', socket.id)
    })
    socket.on('disconnect', () => {
        console.log('Socket disconnected')
    })

    return socket
}

export const socketState = atom<Socket>({
    key: 'socketState',
    default: createSocket(),
})
