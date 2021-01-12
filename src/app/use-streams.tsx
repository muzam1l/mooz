import { useCallback, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { audioDevicesState, displayStreamState, userStreamState, videoDevicesState } from '../atoms'

interface UserMediaReturn {
    currentCameraId: string | null
    currentMicId: string | null
    startUserMedia: (device?: MediaDeviceInfo) => Promise<void>
    stopUserMedia: (kind: 'videoinput' | 'audioinput') => Promise<void>
}

export const useUserMedia = (): UserMediaReturn => {
    const [currentCameraId, setCurrentCameraId] = useState<string | null>(null)
    const [currentMicId, setCurrentMicId] = useState<string | null>(null)
    const [userStream, setUserStream] = useRecoilState(userStreamState)
    const setAudioDevices = useSetRecoilState(audioDevicesState)
    const setVideoDevices = useSetRecoilState(videoDevicesState)

    const updateDeviceList = useCallback(async () => {
        const devices = await navigator.mediaDevices.enumerateDevices()

        const audio = devices.filter(device => device.kind === 'audioinput')
        const video = devices.filter(device => device.kind === 'videoinput')

        setAudioDevices(audio)
        setVideoDevices(video)
    }, [setAudioDevices, setVideoDevices])

    const start = useCallback(
        async (device?: MediaDeviceInfo) => {
            try {
                const aspectRatio = 4 / 3
                const height = 720
                const config: MediaStreamConstraints = {
                    audio: {
                        deviceId: device?.deviceId,
                        echoCancellation: true,
                        noiseSuppression: true,
                    },
                    video: {
                        deviceId: device?.deviceId,
                        height,
                        width: height * aspectRatio,
                        aspectRatio,
                        noiseSuppression: true,
                        resizeMode: 'none',
                    },
                }
                if (device?.kind === 'audioinput') {
                    config.video = false
                } else if (device?.kind === 'videoinput') {
                    config.audio = false
                }
                const stream = await navigator.mediaDevices.getUserMedia(config)
                const audioDeviceId = stream.getAudioTracks()[0]?.getSettings?.()?.deviceId
                const videoDeviceId = stream.getVideoTracks()[0]?.getSettings?.()?.deviceId
                if (audioDeviceId) {
                    setCurrentMicId(audioDeviceId)
                }
                if (videoDeviceId) {
                    setCurrentCameraId(videoDeviceId)
                }
                
                if (!userStream) {
                    // save new stream
                    setUserStream(stream)
                } else {
                    // add new tracks to the stream
                    const audioStream = stream.getAudioTracks()[0]
                    const videoStream = stream.getVideoTracks()[0]
                    // remove old streams and add new one
                    if (audioStream) {
                        userStream.getAudioTracks().forEach(t => {
                            t.stop()
                            userStream.removeTrack(t)
                        })
                    }
                    if (videoStream) {
                        userStream.getVideoTracks().forEach(t => {
                            t.stop()
                            userStream.removeTrack(t)
                        })
                    }

                    stream.getTracks().forEach(t => userStream.addTrack(t))
                }
                console.log(userStream?.getTracks())
                updateDeviceList()
            } catch (error) {
                // TODO handle errors in UI
                console.error('Error accessing media devices.', error)
            }
        },
        [setUserStream, userStream, updateDeviceList],
    )

    const stop = useCallback(
        async (kind: 'audioinput' | 'videoinput') => {
            if (kind === 'audioinput') {
                userStream?.getAudioTracks().forEach(t => {
                    t.stop()
                    userStream.removeTrack(t)
                })
                setCurrentMicId(null)
            } else if (kind === 'videoinput') {
                setCurrentCameraId(null)
                userStream?.getVideoTracks().forEach(t => {
                    t.stop()
                    userStream.removeTrack(t)
                })
            }
            if (userStream?.getTracks().length === 0) {
                setUserStream(null)
            }
        },
        [userStream, setUserStream, setCurrentCameraId, setCurrentMicId],
    )

    return {
        currentCameraId,
        currentMicId,
        startUserMedia: start,
        stopUserMedia: stop,
    }
}

type Status = 'on' | 'off' | 'default'

interface DisplayMediaReturn {
    displayMediaStatus: Status
    startDisplayMedia: () => Promise<void>
    stopDisplayMedia: () => Promise<void>
}
export const useDisplayMedia = (): DisplayMediaReturn => {
    const [displayMedia, setDisplayMedia] = useRecoilState(displayStreamState)
    const [status, setStatus] = useState<Status>('default')

    const start = useCallback(async () => {
        try {
            // eslint-disable-next-line
            const stream = await (navigator.mediaDevices as any).getDisplayMedia({
                video: { cursor: 'always' },
            })
            // BUG No Ts definition for getDisplayMedia
            setDisplayMedia(stream)
            setStatus('on')
        } catch (err) {
            console.error(err)
        }
    }, [setDisplayMedia])
    const stop = useCallback(async () => {
        try {
            displayMedia?.getTracks().forEach(track => track.stop())
            setDisplayMedia(null)
            setStatus('off')
        } catch (err) {
            console.error(err)
        }
    }, [displayMedia, setDisplayMedia])

    return {
        displayMediaStatus: status,
        startDisplayMedia: start,
        stopDisplayMedia: stop,
    }
}
