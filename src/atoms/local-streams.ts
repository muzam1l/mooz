import { atom } from 'recoil'

export const userStreamState = atom<MediaStream | null>({
    key: 'userMediaState',
    default: null,
})
export const displayStreamState = atom<MediaStream | null>({
    key: 'displayMediaState',
    default: null,
})

export const audioDevicesState = atom<MediaDeviceInfo[]>({
    key: 'audioDevicesState',
    default: [],
})

export const currentMicIdState = atom<string | null>({
    key: 'currentAudioDevice',
    default: null,
})

export const videoDevicesState = atom<MediaDeviceInfo[]>({
    key: 'videoDevicesState',
    default: [],
})

export const currentCameraIdState = atom<string | null>({
    key: 'currentVideoDevice',
    default: null,
})
