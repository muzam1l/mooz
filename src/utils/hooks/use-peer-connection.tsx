import { useCallback, useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import Peer from 'simple-peer'
import { userStreamState, remoteStreamsState, socketState } from '../../atoms'

interface Message {
    signal?: any
}

const usePeerConnection = (opts?: Peer.Options): Peer.Instance => {
    const peerRef = useRef(new Peer(opts))

    const [remoteStreams, setRemoteStreams] = useRecoilState(remoteStreamsState)
    const remoteStreamRef = useRef(new MediaStream())

    const userStream = useRecoilValue(userStreamState)
    const socket = useRecoilValue(socketState)

    const addStream = useCallback(
        (stream: MediaStream) => {
            const remoteStream = remoteStreamRef.current
            console.log('Got tracks', stream.getTracks())
            // remove prev tracks
            remoteStream.getTracks().forEach(t => {
                t.stop()
                remoteStream.removeTrack(t)
            })

            // add new tracks
            stream.getTracks().forEach(t => remoteStream.addTrack(t))

            console.log('Remote stream ref is', remoteStream.getTracks())
            // save if not already
            const present = remoteStreams.find(s => s.id === remoteStream.id)
            if (!present) {
                setRemoteStreams([...remoteStreams, remoteStream])
            }
        },
        [setRemoteStreams, remoteStreams],
    )

    useEffect(() => {
        const peer = peerRef.current

        peer.on('stream', addStream)
        peer.on('track', console.log)

        return () => {
            peer.off('stream', addStream)
        }
    }, [addStream])

    // static event listeners
    useEffect(() => {
        const peer = peerRef.current

        /*
         these callback functions dont need to be wrapped in useCallback
         as they are not supposed to change because peer instance is not supposed to change too
        */
        const onMessageRecieved = (msg: Message) => {
            const { signal } = msg
            if (signal) {
                try {
                    peer.signal(signal)
                } catch (err) {
                    console.error(err)
                }
            }
        }
        const onConnected = () => {
            console.log('Conneted')
            // peer.send('Hey peer, how are you doing?')
        }
        const onLocalSignal = (signal: any) => {
            socket.send({ signal })
        }

        peer.on('signal', onLocalSignal)
        // peer.on('data', onDataRecieved)
        peer.on('connect', onConnected)

        socket.on('message', onMessageRecieved)

        return () => {
            peer.off('signal', onLocalSignal)
            peer.off('connect', onConnected)
            // peer.off('data', onDataRecieved)

            socket.off('message', onMessageRecieved)
        }
    }, [])

    useEffect(() => {
        const peer = peerRef.current
        try {
            if (userStream) {
                peer.addStream(userStream)
            }
        } catch (err) {
            console.error(err)
        }
        return () => {
            try {
                if (userStream) {
                    peer.removeStream(userStream)
                }
            } catch (err) {
                console.error(err)
            }
        }
    }, [userStream])

    return peerRef.current
}

export default usePeerConnection
