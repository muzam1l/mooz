import { useCallback } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { removeConnectionsSelector, roomState, socketState } from '../../atoms'

const useAbort = (): (() => void) => {
    const [connections, removeConnections] = useRecoilState(removeConnectionsSelector)
    const setRoom = useSetRecoilState(roomState)
    const socket = useRecoilValue(socketState)

    const onAbort = useCallback(() => {
        removeConnections(connections)
        setRoom(null)
        socket.emit('leave_room')
    }, [removeConnections, connections, setRoom, socket])

    return onAbort
}

export default useAbort
