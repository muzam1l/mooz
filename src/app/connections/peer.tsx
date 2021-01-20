import { FunctionComponent, useCallback, useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import Peer from 'simple-peer'
import { remoteStreamsState, socketState, userStreamState } from '../../atoms'

interface Message {
    from: string
    signal?: any
}

interface PeerProps extends Peer.Options {
    /* socket id of remote connection to connect to */
    partner: string
}

const PeerComponent: FunctionComponent<PeerProps> = props => {
    const { partner, ...opts } = props
    const peerRef = useRef(new Peer(opts))

    const [remoteStreams, setRemoteStreams] = useRecoilState(remoteStreamsState)
    const remoteStreamRef = useRef(new MediaStream())
    const userStream = useRecoilValue(userStreamState)

    const socket = useRecoilValue(socketState)

    const onRemoteStream = useCallback(
        (stream: MediaStream) => {
            console.log('onStream', stream.getTracks())
            const remoteStream = remoteStreamRef.current
            // remove prev tracks
            remoteStream.getTracks().forEach(t => {
                t.stop()
                remoteStream.removeTrack(t)
            })

            // add new tracks
            stream.getTracks().forEach(t => remoteStream.addTrack(t))

            // save if not already
            const present = remoteStreams.find(s => s.remoteSocketId === partner)
            if (!present) {
                setRemoteStreams([...remoteStreams, {
                    remoteSocketId: partner,
                    stream: remoteStream
                }])
            }
        },
        [setRemoteStreams, remoteStreams, partner],
    )


    useEffect(() => {
        const peer = peerRef.current
        const onDataRecieved = (data: any) => alert(data)
        const onTrack = (track: any) => console.log('Got track', track)
        const onMessageRecieved = (msg: Message) => {
            const { signal, from } = msg
            if (signal && from === partner) {
                try {
                    peer.signal(signal)
                } catch (err) {
                    console.error(err)
                }
            }
        }
        const onConnected = () => {
            console.log('Conneted')
        }
        const onLocalSignal = (signal: any) => {
            socket.send({
                to: partner,
                signal,
            })
        }

        peer.on('stream', onRemoteStream)
        peer.on('track', onTrack)
        peer.on('signal', onLocalSignal)
        peer.on('data', onDataRecieved)
        peer.on('connect', onConnected)

        socket.on('message', onMessageRecieved)

        return () => {
            peer.off('stream', onRemoteStream)
            peer.off('track', onTrack)
            peer.off('signal', onLocalSignal)
            peer.off('connect', onConnected)
            peer.off('data', onDataRecieved)

            socket.off('message', onMessageRecieved)
        }
    }, [onRemoteStream, socket, partner])

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

    useEffect(() => {
        ;(window as any).peer = peerRef.current
    }, [])

    // send proposal to partner to join
    useEffect(() => {
        if (!opts.initiator) {
            socket.send({
                to: partner,
                proposal: true,
            })
        }
    }, []) // eslint-disable-line

    // destroy peer and remote stream when component exits
    useEffect(() => () => {
        peerRef.current.destroy()
        remoteStreamRef.current.getTracks().forEach(t => {
            t.stop()
            remoteStreamRef.current.removeTrack(t)
        })
    }, [])

    return null
}

export default PeerComponent
