import { FunctionComponent, useState } from 'react'
import { mergeStyles, Stack, useTheme } from '@fluentui/react'
import { useRecoilState } from 'recoil'
import useSize from './use-video-size'
import { userStreamState, displayStreamState } from '../../atoms'
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

    const [userMedia] = useRecoilState(userStreamState)
    const [displayMedia] = useRecoilState(displayStreamState)
    const [remoteStreams] = useState<MediaStream[]>([])

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
                                maxHeight: '90vh',
                                maxWidth: `calc( 90vh * ${AR} )`,
                                height: y,
                                width: x,
                                backgroundColor: theme.palette.neutralLight,
                                border: `1px solid ${theme.palette.white}`,
                            }}
                        >
                            <VideoBox stream={stream} />
                        </Stack>
                    ),
            )}
        </div>
    )
}

export default VideoBoxes
