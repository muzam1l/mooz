import { FunctionComponent } from 'react'
import { mergeStyles, Stack, useTheme } from '@fluentui/react'
import { useRecoilValue } from 'recoil'
import useSize from '../../utils/hooks/use-video-size'
import { userStreamState, displayStreamState, remoteStreamsState } from '../../atoms'
import VideoBox from '../../comps/video'

const container = mergeStyles({
    height: 'calc(100vh - 40px)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    overflowY: 'auto',
})

const AR = 4 / 3

const VideoBoxes: FunctionComponent = () => {
    const theme = useTheme()

    const userMedia = useRecoilValue(userStreamState)
    const displayMedia = useRecoilValue(displayStreamState)
    const remoteStreams = useRecoilValue(remoteStreamsState).map(s => s.stream)

    let count = remoteStreams.length
    if (userMedia) count += 1
    if (displayMedia) count += 1
    const { x, y } = useSize(count, AR)

    return (
        <div className={container}>
            {[userMedia, displayMedia, ...remoteStreams].filter(Boolean).map(
                stream =>
                    stream && (
                        <Stack
                            key={stream.id}
                            style={{
                                // maxHeight: '90vh',
                                // maxWidth: `calc( 90vh * ${AR} )`,
                                maxHeight: y,
                                maxWidth: x,
                                height: '100%',
                                width: '100%',
                                backgroundColor: theme.palette.neutralLight,
                                border: `1px solid ${theme.palette.white}`,
                            }}
                        >
                            <VideoBox muted={stream.id === userMedia?.id} stream={stream} />
                        </Stack>
                    ),
            )}
        </div>
    )
}

export default VideoBoxes
