import { CommandBar, DefaultButton, ThemeProvider, useTheme } from '@fluentui/react'
import type { ICommandBarItemProps, IButtonProps } from '@fluentui/react'
import { FunctionComponent } from 'react'
import { useRecoilValue } from 'recoil'
import { audioDevicesState, videoDevicesState } from '../../atoms'
import { useDisplayMedia, useUserMedia } from '../use-streams'
import { LeaveButtonStyles, buttonStyles, containerStyles, lightOption, darkOption } from './styles'
import { darkPaletteAlt, lightPaletteAlt } from '../../utils/themes'
import { useTheme as useThemeType, useSetTheme } from '../../utils/theme-context'

interface MyCommandBarProps {
    onClickPeople?: () => void
    onClickChat?: () => void
}

const MyCommandBar: FunctionComponent<MyCommandBarProps> = ({ onClickPeople, onClickChat }) => {
    const theme = useTheme()
    const themeType = useThemeType()
    const setTheme = useSetTheme()

    const audioDevices = useRecoilValue(audioDevicesState)
    const videoDevices = useRecoilValue(videoDevicesState)
    const { displayMediaStatus, startDisplayMedia, stopDisplayMedia } = useDisplayMedia()
    const { currentMicId, currentCameraId, startUserMedia, stopUserMedia } = useUserMedia()

    const iconMuted = {
        color: theme.palette.neutralDark,
    }

    const items: ICommandBarItemProps[] = [
        {
            iconProps: currentMicId
                ? { iconName: 'Microphone' }
                : { iconName: 'MicOff', style: iconMuted },
            onClick: () => {
                // eslint-disable-next-line
                const dummyDevice: any = {
                    kind: 'audioinput',
                }
                if (!currentMicId)
                    startUserMedia(audioDevices.length ? audioDevices[0] : dummyDevice)
                else stopUserMedia('audioinput')
            },
            buttonStyles,
            key: 'audioToggle',
            // iconOnly: true,
            text: 'Audio',
            tooltipHostProps: {
                content: 'Toggle audio',
                delay: 0,
            },
            split: true,
            subMenuProps: !audioDevices.length
                ? undefined
                : {
                      items: audioDevices.map(device => ({
                          key: device.deviceId,
                          text: device.label,
                          iconProps:
                              currentMicId === device.deviceId
                                  ? { iconName: 'TVMonitorSelected' }
                                  : undefined,
                          onClick: () => {
                              startUserMedia(device)
                          },
                      })),
                  },
        },
        {
            iconProps: currentCameraId
                ? { iconName: 'Video' }
                : { iconName: 'VideoOff', style: iconMuted },
            onClick: () => {
                // eslint-disable-next-line
                const dummyDevice: any = {
                    kind: 'videoinput',
                }
                if (!currentCameraId)
                    startUserMedia(videoDevices.length ? videoDevices[0] : dummyDevice)
                else stopUserMedia('videoinput')
            },
            buttonStyles,
            key: 'videoToggle',
            // iconOnly: true,
            text: 'Video',
            tooltipHostProps: {
                content: 'Toggle video',
                delay: 0,
            },
            split: true,
            subMenuProps: !videoDevices.length
                ? undefined
                : {
                      items: videoDevices.map(device => ({
                          key: device.deviceId,
                          text: device.label,
                          iconProps:
                              currentCameraId === device.deviceId
                                  ? { iconName: 'TVMonitorSelected' }
                                  : undefined,
                          onClick: () => {
                              startUserMedia(device)
                          },
                      })),
                  },
        },
        {
            key: 'screen',
            text: 'Screen',
            // iconOnly: true,
            iconProps: {
                iconName: 'ScreenCast',
                style: displayMediaStatus !== 'on' ? iconMuted : {},
            },
            tooltipHostProps: {
                content: displayMediaStatus === 'on' ? 'Stop sharing' : 'Share your screen',
                delay: 0,
            },
            onClick: () => {
                if (displayMediaStatus === 'on') stopDisplayMedia()
                else startDisplayMedia()
            },
        },
        {
            onClick: onClickChat,
            buttonStyles,
            key: 'chat',
            // iconOnly: true,
            text: 'Chat',
            iconProps: {
                iconName: 'Chat',
            },
            tooltipHostProps: {
                content: 'Open chats',
                delay: 0,
            },
        },
        {
            onClick: onClickPeople,
            buttonStyles,
            key: 'people',
            // iconOnly: true,
            text: 'People',
            iconProps: {
                iconName: 'People',
            },
            tooltipHostProps: {
                content: 'Show participants',
                delay: 0,
            },
        },
    ]
    const overflowProps: IButtonProps = { ariaLabel: 'More commands' }
    const overflowItems: ICommandBarItemProps[] = [
        {
            key: 'theme',
            text: 'Choose theme',
            secondaryText: themeType,
            iconProps: { iconName: 'Contrast' },
            subMenuProps: {
                items: [
                    {
                        key: 'light',
                        text: 'Light',
                        className: lightOption,
                        onClick: () => themeType === 'dark' && setTheme?.('light'),
                    },
                    {
                        key: 'dark',
                        text: 'Dark',
                        className: darkOption,
                        onClick: () => themeType === 'light' && setTheme?.('dark'),
                    },
                ],
            },
        },
    ]
    const farItems: ICommandBarItemProps[] = [
        {
            // eslint-disable-next-line
            commandBarButtonAs: ({ text, key }) => (
                <DefaultButton text={text} key={key} styles={LeaveButtonStyles} />
            ),
            key: 'leave',
            text: 'Leave',
        },
        {
            buttonStyles,
            key: 'info',
            text: 'Info',
            // This needs an ariaLabel since it's icon-only
            ariaLabel: 'Info',
            iconOnly: true,
            iconProps: { iconName: 'Info' },
        },
    ]
    const palette = themeType === 'dark' ? darkPaletteAlt : lightPaletteAlt
    return (
        <ThemeProvider theme={{ ...palette }}>
            <CommandBar
                styles={containerStyles}
                items={items}
                overflowItems={overflowItems}
                overflowButtonProps={overflowProps}
                farItems={farItems}
                ariaLabel="Use left and right arrow keys to navigate between commands"
            />
        </ThemeProvider>
    )
}
export default MyCommandBar
