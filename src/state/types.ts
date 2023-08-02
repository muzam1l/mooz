import { Socket } from 'socket.io-client'
import Peer from 'simple-peer'
import { RefObject } from 'react'
import type {
  IServerToClientEvent,
  IRoom,
  IClientToServerEvent,
} from '@server/types'
export * from '@server/types'

// TODO Enum keys to reduce socket payload.
export type ISocketMessageData =
  | {
      connection: true
      userName: string
    }
  | {
      sdpSignal: unknown
      metaData: ConnectionMetaData
    }

type ConnectionMetaData = {
  screenStreamId: string
  userStreamId: string
}

export interface IChatState {
  messages: IChatMessage[]
}

export interface IPeerData {
  chat?: IChatMessage
}

export class Stream extends MediaStream {
  addTrack = (track: MediaStreamTrack): void => {
    super.addTrack(track)

    const ev = new MediaStreamTrackEvent('addtrack', { track })
    this.dispatchEvent(ev)
  }

  removeTrack = (track: MediaStreamTrack): void => {
    track.stop()
    super.removeTrack(track)

    const ev = new MediaStreamTrackEvent('removetrack', { track })
    this.dispatchEvent(ev)
  }

  destroy = (): void => {
    this.getTracks().forEach(this.removeTrack)
  }

  get empty(): boolean {
    return this.getTracks().length === 0
  }

  get noVideo(): boolean {
    return this.getVideoTracks().length === 0
  }

  get noAudio(): boolean {
    return this.getAudioTracks().length === 0
  }
}

export interface ILocalState {
  sessionId: string
  userStream: Stream
  displayStream: Stream
  videoDevices: MediaDeviceInfo[]
  audioDevices: MediaDeviceInfo[]
  currentCameraId: string | null
  currentMicId: string | null
  screenMediaActive: boolean
  inviteCoachmarkVisible: boolean
  showEmptyMediaPanel: boolean
  sidePanelTab: 'chats' | 'people' | undefined
  floatingChatEnabled: boolean
  fullscreenEnabled: boolean
  screenShareButtonRef?: RefObject<HTMLButtonElement>
  cameraButtonRef?: RefObject<HTMLButtonElement>
  micButtonRef?: RefObject<HTMLButtonElement>
  chatsButtonRef?: RefObject<HTMLButtonElement>
  preferences: {
    userName?: string
    meetingName?: string
  }
}

export interface IRemoteState {
  socket: Socket<
    IServerToClientEvent<ISocketMessageData>,
    IClientToServerEvent<ISocketMessageData>
  >
  room: IRoom | null
  connections: IConnection[]
}

export interface IChatMessage {
  id: string
  text: string
  userLabel: string
  mine?: boolean
}

export interface IConnection {
  userId: string
  initiator: boolean
  userName: string
  userStream: Stream
  displayStream: Stream
  peerInstance: Peer.Instance
  metaData?: ConnectionMetaData
}
