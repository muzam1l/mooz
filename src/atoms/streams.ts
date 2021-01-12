import { atom } from 'recoil'

export const userStreamState = atom<MediaStream | null>({
    key: 'userMediaState',
    default: null,
})
export const displayStreamState = atom<MediaStream | null>({
    key: 'displayMediaState',
    default: null,
})
