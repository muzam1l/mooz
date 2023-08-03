import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ILocalState, Stream } from './types'
import { ASPECT_RATIO, VIDEO_RESOLUTION } from './constants'
import toast, { ToastType } from '../comps/toast'
import { nanoid } from 'nanoid'

const getSessionId = () => {
  const id = sessionStorage.getItem('ID') || nanoid()
  sessionStorage.setItem('ID', id)

  return id
}

export const useLocalState = create<ILocalState>()(
  persist(
    () =>
      ({
        sessionId: getSessionId(),
        userStream: new Stream(),
        displayStream: new Stream(),
        audioDevices: [],
        videoDevices: [],
        currentMicId: null,
        currentCameraId: null,
        screenMediaActive: false,
        inviteCoachmarkVisible: true,
        showEmptyMediaPanel: true,
        sidePanelTab: undefined,
        floatingChatEnabled: false,
        fullscreenEnabled: false,
        preferences: {},
      }) as ILocalState,
    {
      name: 'mooz-prefs',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ preferences: state.preferences }),
    },
  ),
)

export const updateDevicesList = async () => {
  if (!navigator.mediaDevices.ondevicechange) {
    navigator.mediaDevices.ondevicechange = updateDevicesList
  }
  const devices = await navigator.mediaDevices.enumerateDevices()
  const audioDevices = devices.filter(device => device.kind === 'audioinput')
  const videoDevices = devices.filter(device => device.kind === 'videoinput')

  useLocalState.setState({
    audioDevices,
    videoDevices,
  })
}

export const updateActiveMediaSources = () => {
  const stream = useLocalState.getState().userStream

  const currentMicId = stream.getAudioTracks()[0]?.getSettings?.()?.deviceId
  const currentCameraId = stream.getVideoTracks()[0]?.getSettings?.()?.deviceId

  useLocalState.setState({
    currentMicId,
    currentCameraId,
  })
}
export const updateActiveDiplayStatus = () => {
  const stream = useLocalState.getState().displayStream

  useLocalState.setState({
    screenMediaActive: !stream.empty,
  })
}

const commonDummyDevice = {
  toJSON: () => ({}),
  deviceId: '',
  label: '',
  groupId: '',
}

export const dummyAudioDevice: MediaDeviceInfo = {
  ...commonDummyDevice,
  kind: 'audioinput',
}

export const dummyVideoDevice: MediaDeviceInfo = {
  ...commonDummyDevice,
  kind: 'videoinput',
}

export const stopMediaDevice = (device: MediaDeviceInfo) => {
  const stream = useLocalState.getState().userStream
  stream.getTracks().forEach(track => {
    if (
      device.kind.startsWith(track.kind) &&
      track.getSettings().deviceId === device.deviceId
    ) {
      stream.removeTrack(track)
    }
  })
  updateActiveMediaSources()
}

export const startMediaDevice = async (device: MediaDeviceInfo) => {
  try {
    const config: MediaStreamConstraints = {
      audio: {
        deviceId: device.deviceId,
        echoCancellation: true,
        noiseSuppression: true,
      },
      video: {
        deviceId: device.deviceId,
        height: VIDEO_RESOLUTION,
        width: VIDEO_RESOLUTION * ASPECT_RATIO,
        aspectRatio: ASPECT_RATIO,
        noiseSuppression: true,
      },
    }
    const stream = useLocalState.getState().userStream
    if (device.kind === 'audioinput') {
      if (stream.getAudioTracks().length) {
        throw Error('Audio already active')
      }
      config.video = false
    } else if (device.kind === 'videoinput') {
      if (stream.getVideoTracks().length) {
        throw Error('Video already active')
      }
      config.audio = false
    }

    ; (await navigator.mediaDevices.getUserMedia(config))
      .getTracks()
      .forEach(track => {
        track.onended = () => stopMediaDevice(device)
        stream.addTrack(track)
      })

    updateDevicesList()
    updateActiveMediaSources()
  } catch (error) {
    const body = error instanceof Error ? error.message : 'Unknown error'
    toast('Cannot start media feed.', {
      type: ToastType.blocked,
      body,
    })
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

export const stopScreenCapture = () => {
  const stream = useLocalState.getState().displayStream
  stream.getTracks().forEach(track => {
    stream.removeTrack(track)
  })
  updateActiveDiplayStatus()
}

export const startScreenCapture = async () => {
  try {
    const stream = useLocalState.getState().displayStream
    if (stream.getTracks().length) {
      throw Error('Screen capture already active')
    }
    ; (
      await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as MediaTrackConstraints,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
    )
      .getTracks()
      .forEach(track => {
        track.onended = () => stopScreenCapture()
        stream.addTrack(track)
      })

    updateActiveDiplayStatus()
  } catch (err) {
    const body = err instanceof Error ? err.message : 'Unknown error'
    toast('Cannot start screen capture.', {
      type: ToastType.blocked,
      body,
    })
    // eslint-disable-next-line no-console
    console.error(err)
  }
}


const enterRoom = {
  src: '/sounds/enter-room.mp3',
  volume: 0.2
}
const leaveRoom = {
  src: '/sounds/abort-room.mp3',
  volume: 0.1
}
const chatReceived = {
  src: '/sounds/chat-received.mp3',
  volume: 0.3
}

// User interaction hack!
const audio = new Audio()
const onClick = () => {
  audio.play()
  window.removeEventListener('click', onClick)
}
window.addEventListener('click', onClick)

export const playEnterRoomSound = () => {
  audio.src = enterRoom.src
  audio.volume = enterRoom.volume
  audio.play()
}
export const playLeaveRoomSound = () => {
  audio.src = leaveRoom.src
  audio.volume = leaveRoom.volume
  audio.play()
}
export const playChatReceivedSound = () => {
  audio.src = chatReceived.src
  audio.volume = chatReceived.volume
  audio.play()
}