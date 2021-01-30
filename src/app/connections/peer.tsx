import { FunctionComponent, useCallback, useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import Peer from 'simple-peer'
import { updateBandwidthRestriction } from '../../utils/helpers'
import {
    addMessageSelector,
    preferencesState,
    remoteStreamsState,
    socketState,
    userStreamState,
    PeerData,
    Message,
} from '../../atoms'
import { MoozPeer } from '../../react-app-env'

interface SignalMessage {
    from: string
    signal?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface PeerProps extends Peer.Options {
    partnerId: string
}

const createSdpTransform = (bitrate: number) => (sdp: string) =>
    updateBandwidthRestriction(sdp, bitrate)

const PeerComponent: FunctionComponent<PeerProps> = props => {
    const addMessage = useSetRecoilState(addMessageSelector)
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

    const saveInstance = () => {
        const peer = peerRef.current as Peer.Instance
        const moozPeer: MoozPeer = { peer, partnerId }
        if (!window.moozPeers) window.moozPeers = [moozPeer]
        
        // remove old copy
        window.moozPeers = window.moozPeers.filter(p => p.partnerId !== partnerId)
            
        // update
        window.moozPeers.push(moozPeer)
    }
    saveInstance()

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
        const onMessageRecieved = (msg: SignalMessage) => {
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
        const onDataRecieved = (str: string) => {
            try {
                const data: PeerData = JSON.parse(str)
                if (data.message) {
                    const msg: Message = {
                        ...data.message,
                        mine: false,
                    }
                    addMessage([msg])
                    // TODO toast
                }
            } catch (err) {
                // console.error('Data error', err)
            }
        }

        peer.on('stream', onRemoteStream)
        peer.on('signal', onLocalSignal)
        peer.on('data', onDataRecieved)
        peer.on('connect', onConnected)

        socket.on('message', onMessageRecieved)

        return () => {
            peer.off('stream', onRemoteStream)
            peer.off('signal', onLocalSignal)
            peer.off('connect', onConnected)
            peer.off('data', onDataRecieved)

            socket.off('message', onMessageRecieved)
        }
    }, [onRemoteStream, socket, partnerId, addMessage])

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
