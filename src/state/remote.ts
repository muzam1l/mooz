import { io } from 'socket.io-client'
import { create } from 'zustand'
import {
  Stream,
  type IConnection,
  type IRemoteState,
  type IPeerData,
  IRoom,
} from './types'
import { debug, transformSdp, userLabel } from '../utils/helpers'
import toast, { Timeout, ToastType } from '../comps/toast'
import { playEnterRoomSound, playLeaveRoomSound, useLocalState } from './local'
import { useJoinFormState } from './landing'
import Peer from 'simple-peer'
import { MAX_BANDWIDTH, MIN_BANDWIDTH } from './constants'
import { onChatReceived } from './chat'
import adapter from 'webrtc-adapter'

export const createSocket = () => {
  const serverPort = process.env.REACT_APP_SAME_ORIGIN_SOCKET_PORT
  const { protocol, hostname, port } = window.location
  const url =
    process.env.REACT_APP_SOCKET_URL ||
    `${protocol}//${hostname}:${serverPort || port}`

  const socket = io(url, {
    withCredentials: !!process.env.REACT_APP_SOCKET_URL,
    auth(cb) {
      const { sessionId } = useLocalState.getState()
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const { id: currentRoomId } = useRemoteState.getState().room || {}
      cb({
        sessionId,
        currentRoomId,
      })
    },
  })

  socket.onAny((event, ...args) => {
    debug(`socket.io: got event '${event}' with args:`, ...args)
  })

  return socket
}

export const useRemoteState = create<IRemoteState>()(() => ({
  socket: createSocket(),
  room: null, // current room user is in, null maps to landing page
  connections: [],
}))

export const setupLocalMediaListeners = () => {
  const { userStream, displayStream } = useLocalState.getState()

  userStream.addEventListener('addtrack', ({ track }) => {
    const { connections } = useRemoteState.getState()
    connections.forEach(conn => {
      debug('adding track to the peer', track, conn)
      conn.peerInstance.addTrack(track, conn.userStream)
    })
  })
  userStream.addEventListener('removetrack', ({ track }) => {
    const { connections } = useRemoteState.getState()

    connections.forEach(conn => {
      debug('removing track from the peer', track, conn)
      conn.peerInstance.removeTrack(track, conn.userStream)
    })
  })
  displayStream.addEventListener('addtrack', ({ track }) => {
    const { connections } = useRemoteState.getState()

    connections.forEach(conn => {
      debug('adding display track to the peer', track, conn)
      conn.peerInstance.addTrack(track, conn.displayStream)
    })
  })
  displayStream.addEventListener('removetrack', ({ track }) => {
    const { connections } = useRemoteState.getState()

    connections.forEach(conn => {
      debug('removing display track from the peer', track, conn.displayStream)
      conn.peerInstance.removeTrack(track, conn.displayStream)
    })
  })
}

export const createPeerInstance = (opts: Peer.Options) => {
  return new Peer({
    sdpTransform: function transform(sdp) {
      const { connections } = useRemoteState.getState()
      const bandwidth =
        Math.max(MAX_BANDWIDTH / (connections.length || 1), MIN_BANDWIDTH) >>> 0

      // In modern browsers, use RTCRtpSender.setParameters to change bandwidth without
      // (local) renegotiation. Note that this will be within the envelope of
      // the initial maximum bandwidth negotiated via SDP.
      if (
        (adapter.browserDetails.browser === 'chrome' ||
          adapter.browserDetails.browser === 'safari' ||
          (adapter.browserDetails.browser === 'firefox' &&
            adapter.browserDetails.version &&
            adapter.browserDetails.version >= 64)) &&
        'RTCRtpSender' in window &&
        'setParameters' in window.RTCRtpSender.prototype
      ) {
        connections.forEach(({ peerInstance }) => {
          // USING INTERNAL API OF SIMPLE-PEER HERE, HOPEFULLY IT DOESN'T CHANGE!
          const sender = (
            peerInstance as unknown as { _pc?: RTCPeerConnection }
          )._pc?.getSenders()[0]
          if (!sender) return
          const parameters = sender.getParameters()
          if (!parameters.encodings || !parameters.encodings.length) {
            return
          }
          const encoding = parameters.encodings[0]
          if (encoding.maxBitrate !== bandwidth * 1000) {
            encoding.maxBitrate = bandwidth * 1000
            sender.setParameters(parameters)
          }
        })

        return sdp
      }

      // Fallback to the SDP changes with local renegotiation as way of limiting
      // the bandwidth.
      return transformSdp(sdp, bandwidth, this)
    },
    ...opts,
  })
}

export const createRemoteConnection = ({
  initiator,
  userId,
  userName,
}: Pick<IConnection, 'userId' | 'userName' | 'initiator'>) => {
  if (!Peer.WEBRTC_SUPPORT) {
    alert(
      'Your browser does not support WebRTC or it is disabled. Please use a WebRTC enabled browser to use this app.',
    )
    return
  }

  const state = useRemoteState.getState()
  if (state.connections.find(c => c.userId === userId)) {
    throw new Error(
      `createRemoteConnection: connection with user ${userId} already exists`,
    )
  }
  const { socket } = state
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const roomId = useRemoteState.getState().room?.id!
  const localState = useLocalState.getState()
  const { userName: nameSelf } = localState.preferences
  const { userStream, displayStream } = localState

  const peer = createPeerInstance({
    initiator,
  })

  const connection: IConnection = {
    userId,
    userName,
    peerInstance: peer,
    userStream: new Stream(),
    displayStream: new Stream(),
    initiator,
  }

  const reRenderConnection = () =>
    useRemoteState.setState(state => {
      return {
        connections: state.connections.map(c => {
          if (c.userId === userId) {
            return {
              ...c,
            }
          }
          return c
        }),
      }
    })

  userStream.getTracks().forEach(track => {
    debug('adding track to the peer', track, connection)
    peer.addTrack(track, connection.userStream)
  })
  displayStream.getTracks().forEach(track => {
    debug('adding display track t the  peer', track, connection)
    peer.addTrack(track, connection.displayStream)
  })

  peer.on('signal', sdpSignal => {
    state.socket.emit('request:send_mesage', {
      to: userId,
      roomId,
      data: {
        sdpSignal,
        metaData: {
          screenStreamId: connection.displayStream.id,
          userStreamId: connection.userStream.id,
        },
      },
    })
  })
  peer.on('error', err => {
    toast('Peer connection error', {
      type: ToastType.blocked,
      body: err.message,
      autoClose: Timeout.MEDIUM,
    })
    console.error(err)

    socket.emit('request:leave_room', {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      roomId,
    })
  })
  peer.on('close', () => {
    toast('Peer connection closed with ' + userLabel(connection), {
      type: ToastType.severeWarning,
      autoClose: Timeout.SHORT,
    })
  })
  peer.on('connect', () => {
    toast('Peer connection established with ' + userLabel(connection), {
      type: ToastType.success,
      autoClose: Timeout.SHORT,
    })
  })
  peer.on('data', (str: string) => {
    const data: IPeerData = JSON.parse(str)
    if (data.chat) {
      onChatReceived(data.chat)
    }
  })
  peer.on('track', (track, stream) => {
    debug('Peer track received', track, connection)
    // Following the assumption that stream id's are preserved across peers
    // Holds true on following tested browsers: Chrome, Firefox
    // Not true on following tested browsers: null

    // If the assumption does not hold true, all tracks are considered user media tracks!
    const metaData = useRemoteState
      .getState()
      .connections.find(conn => conn.userId === connection.userId)?.metaData
    const streamType =
      stream.id === metaData?.screenStreamId ? 'displayStream' : 'userStream'

    connection[streamType].addTrack(track)

    // cuz no listeners for remote streams
    reRenderConnection()

    stream.onremovetrack = ({ track }) => {
      debug('Peer track removed', track, stream)
      connection[streamType].removeTrack(track)
      reRenderConnection()
    }
  })

  if (!initiator) {
    socket.emit('request:send_mesage', {
      to: userId,
      roomId,
      data: {
        connection: true,
        userName: nameSelf || '',
      },
    })
  }

  useRemoteState.setState(state => ({
    connections: [...state.connections, connection],
  }))
}

export const destroyRemoteConnection = (connection: IConnection) => {
  useRemoteState.setState(state => {
    let connections = [...state.connections]
    connections = connections.filter(c => c.userId !== connection.userId)

    return { connections }
  })

  // destroy associated streams
  connection.userStream.destroy()
  connection.displayStream.destroy()
  connection.peerInstance.destroy()
}

export const requestLeaveRoom = () =>
  useRemoteState.setState(state => {
    const { socket, room } = state
    if (!room) {
      return {}
    }
    socket.emit('request:leave_room', { roomId: room.id }, error => {
      if (error) {
        toast(error.message, { type: ToastType.error })
      }
    })
    return {}
  })

export const enterRoom = (room: IRoom) => {
  useRemoteState.setState({
    room,
  })
  playEnterRoomSound()
  window.history.pushState({}, 'Mooz', `/room/${room.id}`)
  toast(`Joined ${room.name}`)

  useJoinFormState.setState({
    roomId: room.id,
  })
}

export const abortRoom = () => {
  useRemoteState.setState(state => {
    state.connections.forEach(connection => {
      destroyRemoteConnection(connection)
    })
    return {
      room: null,
    }
  })
  toast('Room aborted!, enjoy your lonely life', { type: ToastType.warning })
  playLeaveRoomSound()

  useLocalState.setState({
    showEmptyMediaPanel: true,
  })
}
