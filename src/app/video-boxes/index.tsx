import { FunctionComponent } from 'react'
import { Stack, Modal, ContextualMenu, useTheme } from '@fluentui/react'
import { useRecoilValue } from 'recoil'
import {
    container,
    containerInner,
    userMediaContainer,
    displayMediaContainer,
    modalStyles,
} from './styles'
import useSize from '../../utils/hooks/use-video-size'
import { userStreamState, displayStreamState, remoteStreamsState } from '../../atoms'
import VideoBox from '../../comps/video'

const AR = 4 / 3

const VideoBoxes: FunctionComponent = () => {
    const theme = useTheme()

    const userMedia = useRecoilValue(userStreamState)
    const displayMedia = useRecoilValue(displayStreamState)
    const remoteStreams = useRecoilValue(remoteStreamsState).map(s => s.stream)

    const count = remoteStreams.length
    const { x, y } = useSize(count, AR)

    return (
        <div style={{ backgroundColor: theme.semanticColors.bodyBackground }} className={container}>
            <div className={containerInner}>
                {remoteStreams.map(stream => (
                    <Stack
                        key={stream.id}
                        style={{
                            height: y,
                            maxWidth: x,
                            // backgroundColor: theme.palette.neutralLight,
                        }}
                    >
                        <VideoBox stream={stream} />
                    </Stack>
                ))}
            </div>

            <div className={userMediaContainer} id="user-media-container" />
            <div className={displayMediaContainer} id="display-media-container" />
            {displayMedia && (
                <Modal
                    isBlocking
                    isModeless
                    isOpen
                    styles={modalStyles}
                    layerProps={{
                        hostId: 'display-media-container',
                    }}
                    dragOptions={{
                        moveMenuItemText: 'Move',
                        closeMenuItemText: 'Close',
                        menu: ContextualMenu,
                    }}
                >
                    <VideoBox muted stream={displayMedia} />
                </Modal>
            )}
            {userMedia && (
                <Modal
                    isBlocking
                    isModeless
                    isOpen
                    styles={modalStyles}
                    layerProps={{
                        hostId: 'user-media-container',
                    }}
                    dragOptions={{
                        moveMenuItemText: 'Move',
                        closeMenuItemText: 'Close',
                        menu: ContextualMenu,
                    }}
                >
                    <VideoBox muted stream={userMedia} />
                </Modal>
            )}
        </div>
    )
}

export default VideoBoxes
