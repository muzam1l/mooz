import { useCallback, useEffect } from 'react'
import type { FunctionComponent } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import Peer from './peer'
import {
    Connection,
    addConnectionsSelector,
    removeConnectionsSelector,
    roomState,
    socketState,
} from '../../atoms'

const Connections: FunctionComponent = () => {
    const addConnections = useSetRecoilState(addConnectionsSelector)
    const [connections, removeConnections] = useRecoilState(removeConnectionsSelector)
    const setRoom = useSetRecoilState(roomState)
    const socket = useRecoilValue(socketState)

    const onPersonJoined = useCallback(
        (data: { socketId: string; name: string }) => {
            const { socketId: remoteSocketId } = data
            const connection: Connection = {
                initiator: false,
                remoteSocketId,
            }
            // setConnections(connections.concat(connection))
            addConnections([connection])
        },
        [addConnections],
    )

    const onMessage = useCallback(
        ({ proposal, from }) => {
            if (proposal) {
                const connection: Connection = {
                    initiator: true,
                    remoteSocketId: from,
                }
                // setConnections(connections.concat(connection))
                addConnections([connection])
            }
        },
        [addConnections],
    )

    const onPersonLeft = useCallback(
        ({ socketId }) => {
            // setConnections(connections.filter(p => p.remoteSocketId !== socketId))
            removeConnections(connections.filter(c => c.remoteSocketId === socketId))
        },
        [removeConnections, connections],
    )

    const onDisconnect = useCallback(() => {
        // clean up will be done by sever
        // setConnections([])
        removeConnections(connections)
        setRoom(null)
    }, [removeConnections, connections, setRoom])

    useEffect(() => {
        socket.on('person_joined', onPersonJoined)
        return () => {
            socket.off('person_joined', onPersonJoined)
        }
    }, [onPersonJoined, socket])

    useEffect(() => {
        socket.on('message', onMessage)
        return () => {
            socket.off('message', onMessage)
        }
    }, [onMessage, socket])

    useEffect(() => {
        socket.on('person_left', onPersonLeft)
        return () => {
            socket.off('person_left', onPersonLeft)
        }
    }, [onPersonLeft, socket])

    useEffect(() => {
        socket.on('disconnect', onDisconnect)
        return () => {
            socket.off('disconnect', onDisconnect)
        }
    }, [onDisconnect, socket])

    return (
        <>
            {connections.map(conn => (
                <Peer
                    key={conn.remoteSocketId}
                    initiator={conn.initiator}
                    partner={conn.remoteSocketId}
                />
            ))}
        </>
    )
}

export default Connections
