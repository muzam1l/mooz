import { useCallback, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
    audioDevicesState,
    displayStreamState,
    userStreamState,
    videoDevicesState,
    currentCameraIdState,
    currentMicIdState,
    remoteStreamsState,
} from '../../atoms'
import toast, { ToastType } from '../../comps/toast'
import { VIDEO_HEIGHT, ASPECT_RATIO } from '../settings'

interface UserMediaReturn {
    startUserMedia: (device?: MediaDeviceInfo) => Promise<void>
    stopUserMedia: (kind: 'videoinput' | 'audioinput') => Promise<void>
}

export const useUserMedia = (): UserMediaReturn => {
    const setCurrentCameraId = useSetRecoilState(currentCameraIdState)
    const setCurrentMicId = useSetRecoilState(currentMicIdState)

    const [userStream, setUserStream] = useRecoilState(userStreamState)
    const setAudioDevices = useSetRecoilState(audioDevicesState)
    const setVideoDevices = useSetRecoilState(videoDevicesState)

    const updateDeviceList = useCallback(async () => {
        if (!navigator.mediaDevices.ondevicechange) {
            navigator.mediaDevices.ondevicechange = updateDeviceList
        }
        const devices = await navigator.mediaDevices.enumerateDevices()

        const audio = devices.filter(device => device.kind === 'audioinput')
        const video = devices.filter(device => device.kind === 'videoinput')

        setAudioDevices(audio)
        setVideoDevices(video)
    }, [setAudioDevices, setVideoDevices])

    const start = useCallback(
        async (device?: MediaDeviceInfo) => {
            try {
                const config: MediaStreamConstraints = {
                    audio: {
                        deviceId: device?.deviceId,
                        echoCancellation: true,
                        noiseSuppression: true,
                    },
                    video: {
                        deviceId: device?.deviceId,
                        height: VIDEO_HEIGHT,
                        width: VIDEO_HEIGHT * ASPECT_RATIO,
                        aspectRatio: ASPECT_RATIO,
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

                // extra step just to ensure single audio/video track is present
                const audioTracks = stream.getAudioTracks()
                const videoTracks = stream.getVideoTracks()
                if (audioTracks.length > 0) {
                    audioTracks.forEach((t, i) => {
                        if (i > 0) {
                            t.stop()
                            stream.removeTrack(t)
                        }
                    })
                }
                if (videoTracks.length > 0) {
                    videoTracks.forEach((t, i) => {
                        if (i > 0) {
                            t.stop()
                            stream.removeTrack(t)
                        }
                    })
                }

                // set device ids for ui
                const audioDeviceId = audioTracks[0]?.getSettings?.()?.deviceId
                const videoDeviceId = videoTracks[0]?.getSettings?.()?.deviceId
                if (audioDeviceId) {
                    setCurrentMicId(audioDeviceId)
                }
                if (videoDeviceId) {
                    setCurrentCameraId(videoDeviceId)
                }

                if (!userStream) {
                    // save new stream as it is
                    setUserStream(stream)
                } else {
                    const audioTrack = stream.getAudioTracks()[0]
                    const videoTrack = stream.getVideoTracks()[0]
                    if (audioTrack) {
                        // remove prev audio track
                        userStream.getAudioTracks().forEach(t => {
                            t.stop()
                            userStream.removeTrack(t)
                        })
                        // add prev video track, if any, to stream
                        const prevVideo = userStream.getVideoTracks()[0]
                        if (prevVideo) {
                            stream.addTrack(prevVideo)
                        }
                    }
                    if (videoTrack) {
                        // remove prev video track
                        userStream.getVideoTracks().forEach(t => {
                            t.stop()
                            userStream.removeTrack(t)
                        })
                        // add prev audio track, if any, to stream
                        const prevAudio = userStream.getAudioTracks()[0]
                        if (prevAudio) {
                            stream.addTrack(prevAudio)
                        }
                    }
                    // save new stream
                    setUserStream(stream)
                }
                updateDeviceList()
            } catch (error) {
                toast('Error starting user media', { type: ToastType.error })
            }
        },
        [setUserStream, userStream, updateDeviceList, setCurrentCameraId, setCurrentMicId],
    )

    const stop = useCallback(
        async (kind: 'audioinput' | 'videoinput') => {
            if (!userStream) return

            const toStop: MediaStreamTrack[] = []

            if (kind === 'audioinput') {
                userStream.getAudioTracks().forEach(t => {
                    // t.stop()
                    toStop.push(t)
                    userStream.removeTrack(t)
                })
                setCurrentMicId(null)
            } else if (kind === 'videoinput') {
                userStream.getVideoTracks().forEach(t => {
                    // t.stop()
                    toStop.push(t)
                    userStream.removeTrack(t)
                })
                setCurrentCameraId(null)
            }

            if (userStream?.getTracks().length === 0) {
                setUserStream(null)
            } else {
                // just to trigger rerender of whatever depends on this stream
                const stream = userStream.clone()
                userStream.getTracks().forEach(t => {
                    // t.stop()
                    toStop.push(t)
                    userStream.removeTrack(t)
                })
                setUserStream(stream)
            }

            toStop.forEach(t => [t.stop()])
        },
        [userStream, setUserStream, setCurrentCameraId, setCurrentMicId],
    )

    return {
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
    const isRemoteDisplay = !!useRecoilValue(remoteStreamsState).find(r => r.isDisplay)

    const stop = useCallback(async () => {
        try {
            displayMedia?.getTracks().forEach(track => track.stop())
            setDisplayMedia(null)
            setStatus('off')
        } catch (err) {
            toast('Error stopping display media', { type: ToastType.error })
        }
    }, [displayMedia, setDisplayMedia])

    const start = useCallback(async () => {
        try {
            if (isRemoteDisplay) throw Error('No multiple display streams allowed')
            // BUG No Ts definition for getDisplayMedia
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stream = await (navigator.mediaDevices as any).getDisplayMedia({
                video: { cursor: 'always' },
            })
            stream.getVideoTracks()[0].onended = stop;
            setDisplayMedia(stream)
            setStatus('on')
        } catch (err) {
            toast('Error starting display media', { type: ToastType.error })
        }
    }, [setDisplayMedia, isRemoteDisplay, stop])

    return {
        displayMediaStatus: status,
        startDisplayMedia: start,
        stopDisplayMedia: stop,
    }
}
