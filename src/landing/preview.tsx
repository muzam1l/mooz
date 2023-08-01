import { FC, useState } from 'react'
import { Stack, Toggle, Label, useTheme } from '@fluentui/react'

import Video from '../comps/video'
import { classes } from './styles'
import {
    dummyAudioDevice,
    dummyVideoDevice,
    startMediaDevice,
    stopMediaDevice,
    useCreateFormState,
    useJoinFormState,
    useLocalState,
} from '../state'
import { commonClasses } from '../utils/theme/common-styles'

const VideoPreview: FC = () => {
    const [mediaBtnsDisabled, setMediaBtnsDisabled] = useState(false)
    const [userStream, currentCameraId, currentMicId, audioDevices, videoDevices] = useLocalState(
        state => [
            state.userStream,
            state.currentCameraId,
            state.currentMicId,
            state.audioDevices,
            state.videoDevices,
        ],
    )
    const [createPageName] = useCreateFormState(state => [state.userName])
    const [joinPageName] = useJoinFormState(state => [state.userName])
    const userName = createPageName || joinPageName

    const audioDevice = audioDevices.find(d => d.deviceId === currentMicId)
    const videoDevice = videoDevices.find(d => d.deviceId === currentCameraId)

    const mediaInfo = [videoDevice?.label, audioDevice?.label].filter(Boolean).join('\n').trim()
    return (
        <Stack grow className={classes.preview}>
            <Stack horizontal horizontalAlign="space-between">
                <Toggle
                    className={commonClasses.mr4}
                    onChange={async (_, checked) => {
                        setMediaBtnsDisabled(true)
                        if (checked) {
                            await startMediaDevice(audioDevices[0] || dummyAudioDevice)
                        } else {
                            stopMediaDevice(audioDevices[0] || dummyAudioDevice)
                        }
                        setMediaBtnsDisabled(false)
                    }}
                    checked={!!currentMicId}
                    inlineLabel
                    label="Audio"
                    onText="On"
                    disabled={mediaBtnsDisabled}
                    offText="Off"
                />
                <Toggle
                    onChange={async (_, checked) => {
                        setMediaBtnsDisabled(true)

                        if (checked) {
                            await startMediaDevice(videoDevices[0] || dummyVideoDevice)
                        } else {
                            stopMediaDevice(videoDevices[0] || dummyVideoDevice)
                        }

                        setMediaBtnsDisabled(false)
                    }}
                    checked={!!currentCameraId}
                    inlineLabel
                    label="Video"
                    onText="On"
                    disabled={mediaBtnsDisabled}
                    offText="Off"
                />
            </Stack>
            <Stack.Item className={classes.mediaContainer}>
                <Video
                    stream={userStream}
                    info={mediaInfo}
                    personaText={userName}
                    label={currentCameraId || currentMicId ? 'You' : 'Media preview'}
                    noContextualMenu
                    muted
                />
            </Stack.Item>
        </Stack>
    )
}

export default VideoPreview
