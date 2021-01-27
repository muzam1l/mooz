import { FunctionComponent, useCallback, useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import Peer from 'simple-peer'
import { updateBandwidthRestriction } from '../../utils/helpers'
import { preferencesState, remoteStreamsState, socketState, userStreamState } from '../../atoms'

interface Message {
    from: string
    signal?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface PeerProps extends Peer.Options {
    partnerId: string
}

const createSdpTransform = (bitrate: number) => (sdp: string) =>
    updateBandwidthRestriction(sdp, bitrate)

const PeerComponent: FunctionComponent<PeerProps> = props => {
    const preferences = useRecoilValue(preferencesState)
    const { partnerId, ...opts } = props
    const [remoteStreams, setRemoteStreams] = useRecoilState(remoteStreamsState)
    const remoteStreamRef = useRef(new MediaStream())
    const userStream = useRecoilValue(userStreamState)

    const socket = useRecoilValue(socketState)

    const peerRef = useRef<Peer.Instance>()
    if (!peerRef.current) {
        peerRef.current = new Peer({
            // eslint-disable-next-line
            sdpTransform: createSdpTransform(500) as any, // 250k max bitrate
            ...opts,
        })
    }

    const onRemoteStream = useCallback(
        (stream: MediaStream) => {
            // console.log('onStream', stream.getTracks())
            const remoteStream = remoteStreamRef.current
            // remove prev tracks
            remoteStream.getTracks().forEach(t => {
                t.stop()
                remoteStream.removeTrack(t)
            })

            // add new tracks
            stream.getTracks().forEach(t => remoteStream.addTrack(t))

            // save if not already
            const present = remoteStreams.find(s => s.partnerId === partnerId)
            if (!present) {
                setRemoteStreams([
                    ...remoteStreams,
                    {
                        stream: remoteStream,
                        partnerId,
                    },
                ])
            }
        },
        [setRemoteStreams, remoteStreams, partnerId],
    )

    useEffect(() => {
        const peer = peerRef.current as Peer.Instance
        // const onDataRecieved = (data: any) => alert(data)
        // const onTrack = (track: any) => console.log('Got track', track)
        const onMessageRecieved = (msg: Message) => {
            const { signal, from } = msg
            if (signal && from === partnerId) {
                try {
                    peer.signal(signal)
                } catch (err) {
                    // console.error(err)
                }
            }
        }
        const onConnected = () => {
            console.log('Conneted')
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onLocalSignal = (signal: any) => {
            socket.send({
                to: partnerId,
                signal,
            })
        }

        peer.on('stream', onRemoteStream)
        // peer.on('track', onTrack)
        peer.on('signal', onLocalSignal)
        // peer.on('data', onDataRecieved)
        peer.on('connect', onConnected)

        socket.on('message', onMessageRecieved)

        return () => {
            peer.off('stream', onRemoteStream)
            // peer.off('track', onTrack)
            peer.off('signal', onLocalSignal)
            peer.off('connect', onConnected)
            // peer.off('data', onDataRecieved)

            socket.off('message', onMessageRecieved)
        }
    }, [onRemoteStream, socket, partnerId])

    useEffect(() => {
        const peer = peerRef.current as Peer.Instance
        try {
            if (userStream) {
                peer.addStream(userStream)
            }
        } catch (err) {
            // console.error(err)
        }
        return () => {
            try {
                if (userStream) {
                    peer.removeStream(userStream)
                }
            } catch (err) {
                // console.error(err)
            }
        }
    }, [userStream])

    // send proposal to partner to join
    useEffect(() => {
        if (!opts.initiator) {
            socket.send({
                to: partnerId,
                proposal: true,
                name: preferences.name,
            })
        }
    }, []) // eslint-disable-line

    // destroy peer and remote stream when component exits
    useEffect(
        () => () => {
            peerRef.current?.destroy()
            remoteStreamRef.current.getTracks().forEach(t => {
                t.stop()
                remoteStreamRef.current.removeTrack(t)
            })
        },
        [],
    )

    return null
}

export default PeerComponent
