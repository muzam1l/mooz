import { useCallback, useEffect } from 'react'
import type { FC } from 'react'
import CommandBar from './command-bar'
import SidePanel from './side-panel'
import { Media } from './media'
import Fullscreen from '../comps/full-screen'

import {
  IServerToClientEvent,
  createRemoteConnection,
  destroyRemoteConnection,
  useRemoteState,
} from '../state'

import './main.css'
import toast from '../comps/toast'
import { MediaPanel } from './media/panel'

const App: FC = () => {
  const [socket, connections] = useRemoteState(state => [
    state.socket,
    state.connections,
  ])

  const onPersonJoined: IServerToClientEvent['action:establish_peer_connection'] =
    useCallback(({ userId, userName }) => {
      createRemoteConnection({
        userId,
        userName,
        initiator: false,
      })
    }, [])

  const onMessage: IServerToClientEvent['action:message_received'] =
    useCallback(
      ({ from, data }) => {
        if ('connection' in data) {
          createRemoteConnection({
            userId: from,
            initiator: true,
            userName: data.userName || '',
          })
        } else if ('sdpSignal' in data) {
          const conn = connections.find(c => c.userId === from)
          if (!conn) return
          try {
            conn.metaData = data.metaData
            conn.peerInstance.signal(data.sdpSignal as string)
          } catch (error) {
            console.error('sdp signal error:', error)
          }
        }
      },
      [connections],
    )

  const onPersonLeft: IServerToClientEvent['action:terminate_peer_connection'] =
    useCallback(
      ({ userId }) => {
        const conn = connections.find(c => c.userId === userId)
        if (!conn) return
        toast(`${conn?.userName} left the meeting`)
        destroyRemoteConnection(conn)
      },
      [connections],
    )

  useEffect(() => {
    socket.on('action:establish_peer_connection', onPersonJoined)
    socket.on('action:message_received', onMessage)
    socket.on('action:terminate_peer_connection', onPersonLeft)
    return () => {
      socket.off('action:establish_peer_connection', onPersonJoined)
      socket.off('action:message_received', onMessage)
      socket.off('action:terminate_peer_connection', onPersonLeft)
    }
  }, [onMessage, onPersonJoined, onPersonLeft, socket])

  return (
    <Fullscreen>
      <CommandBar />
      <Media />
      <MediaPanel />
      <SidePanel />
    </Fullscreen>
  )
}

export default App
