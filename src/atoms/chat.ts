import { atom, selector, DefaultValue } from 'recoil'

export interface Message {
    id: string
    text: string
    author?: string
    mine?: boolean
}

export interface PeerData {
    message?: Message
}

export const messagesState = atom<Message[]>({
    key: 'messagesState',
    default: [],
})

export const addMessageSelector = selector<Message[]>({
    key: 'addMessageSelector',
    get: ({ get }) => get(messagesState),
    set: ({ get, set }, newVal) => {
        if (newVal instanceof DefaultValue) throw Error('Nope')
        const messages = get(messagesState)
        set(messagesState, messages.concat(newVal))
        const peers = window.moozPeers || []
        newVal.forEach(message => {
            if (message.mine) {
                peers
                    .map(p => p.peer)
                    .forEach(peer => {
                        try {
                            const data: PeerData = { message }
                            peer.send(JSON.stringify(data))
                        } catch (err) {
                            console.error('Error sending message', err)
                        }
                    })
            }
        })
    },
})
