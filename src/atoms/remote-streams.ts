import { atom } from 'recoil'

export const one = 1

export const remoteStreamsState = atom<MediaStream[]>({
    key: 'remoteStreamsState',
    default: [],
})
