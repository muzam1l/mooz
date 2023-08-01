import {
    ActionButton,
    Coachmark,
    CommandBar,
    DefaultButton,
    DirectionalHint,
    FontSizes,
    TeachingBubbleContent,
    TooltipHost,
    useTheme,
} from '@fluentui/react'
import type { ICommandBarItemProps, IButtonProps } from '@fluentui/react'
import { FC, useContext, useEffect, useRef, useState } from 'react'
import {
    leaveButtonStyles,
    commandbarStyles,
    lightOption,
    darkOption,
    copyButtonStyles as inviteButtonStyles,
} from './styles'
import InfoCallout from '../../comps/info-overlay'
import {
    dummyAudioDevice,
    dummyVideoDevice,
    requestLeaveRoom,
    startMediaDevice,
    startScreenCapture,
    stopMediaDevice,
    stopScreenCapture,
    useLocalState,
    useRemoteState,
} from '../../state'
import { ColorSchemeContext } from '../../utils/theme/theme-context'
import { HoverButton } from '../../comps/hover-button'
import { useCopyToClipboard } from '../../hooks/use-copy-to-clipboard'
import { commonClasses } from '../../utils/theme/common-styles'

const CommandButton: FC<ICommandBarItemProps> = (props: ICommandBarItemProps) => {
    const {
        onClick,
        className,
        split,
        tooltipHostProps,
        disabled,
        iconProps,
        subMenuProps: menuProps,
        text,
        buttonStyles: styles,
        iconOnly,
        data,
        elementRef,
    } = props

    return (
        <TooltipHost {...tooltipHostProps} calloutProps={{ dismissOnTargetClick: true }}>
            <HoverButton
                elementRef={elementRef}
                data={data}
                className={className}
                split={split}
                onClick={onClick as any}
                disabled={disabled}
                styles={styles}
                iconProps={iconProps}
                menuProps={menuProps}
                text={!iconOnly ? text : undefined}
            />
        </TooltipHost>
    )
}

const OverflowButton: FC<IButtonProps> = ({
    onClick,
    className,
    disabled,
    menuProps: subMenuProps,
    iconProps,
    text,
    split,
}) => (
    <CommandButton
        key="overflow-button"
        iconProps={iconProps}
        className={className}
        text={text}
        split={split}
        disabled={disabled}
        iconOnly
        subMenuProps={subMenuProps}
        onClick={onClick as any}
        ariaLabel="More commands"
        tooltipHostProps={{
            content: 'Open menu',
            delay: 0,
        }}
    />
)

const InviteButton: FC<ICommandBarItemProps> = ({ tooltipHostProps, ...props }) => {
    const targetButton = useRef<HTMLDivElement>(null)
    const [visible] = useLocalState(state => [state.inviteCoachmarkVisible])

    const theme = useTheme()
    const room = useRemoteState(state => state.room)
    const link = room ? `${window.location.origin}/room/${room.id}` : ''
    const [copied, copy] = useCopyToClipboard()

    const hide = () => {
        if (useLocalState.getState().inviteCoachmarkVisible) {
            useLocalState.setState({ inviteCoachmarkVisible: false })
        }
    }

    useEffect(() => {
        document.body.addEventListener('singleclick', hide)
        return () => document.body.removeEventListener('singleclick', hide)
    }, [])

    return (
        <>
            <TooltipHost {...tooltipHostProps}>
                <ActionButton
                    elementRef={targetButton}
                    iconProps={{
                        iconName: copied ? 'CheckboxComposite' : undefined,
                    }}
                    disabled={copied}
                    onClick={() => {
                        if (!copied) {
                            copy(link)
                        }
                    }}
                    text={copied ? 'Copied!' : props.text}
                    styles={props.buttonStyles}
                    style={{
                        color: copied
                            ? theme.semanticColors.successIcon
                            : theme.semanticColors.primaryButtonBackground,
                    }}
                />
            </TooltipHost>
            {visible && (
                <Coachmark
                    positioningContainerProps={{
                        directionalHint: DirectionalHint.bottomCenter,
                    }}
                    delayBeforeMouseOpen={0}
                    isCollapsed={false}
                    target={targetButton.current}
                    ariaAlertText="A coachmark has appeared"
                    ariaLabelledByText="Coachmark notification"
                >
                    <TeachingBubbleContent
                        isClickableOutsideFocusTrap={true}
                        headline="Welcome to the Mooz Meeting!"
                        styles={{
                            headline: {
                                fontSize: FontSizes.mediumPlus,
                            },
                        }}
                        hasCloseButton
                        closeButtonAriaLabel="Close"
                        onDismiss={hide}
                    >
                        <div className={commonClasses.message}>
                            Invite your folks over here by sharing the meeting link.
                        </div>
                    </TeachingBubbleContent>
                </Coachmark>
            )}
        </>
    )
}

const MyCommandBar: FC = () => {
    const { setColorScheme, colorScheme } = useContext(ColorSchemeContext)
    const toggleChats = () =>
        useLocalState.setState(s => ({
            sidePanelTab: s.sidePanelTab === 'chats' ? undefined : 'chats',
        }))
    const togglePeople = () =>
        useLocalState.setState(s => ({
            sidePanelTab: s.sidePanelTab === 'people' ? undefined : 'people',
        }))
    const toggleFullscreen = () =>
        useLocalState.setState(s => ({
            fullscreenEnabled: !s.fullscreenEnabled,
        }))

    const [
        currentMicId,
        currentCameraId,
        audioDevices,
        videoDevices,
        displayStreamActive,
        fullscreenEnabled,
    ] = useLocalState(state => [
        state.currentMicId,
        state.currentCameraId,
        state.audioDevices,
        state.videoDevices,
        state.screenMediaActive,
        state.fullscreenEnabled,
    ])
    const connections = useRemoteState(state => state.connections)

    const isRemoteDisplay = connections.filter(c => !c.displayStream.empty).length > 0
    const [mediaBtnsDisabled, setMediaBtnsDisabled] = useState(false)

    const startAudio = async (device?: MediaDeviceInfo) => {
        setMediaBtnsDisabled(true)
        await startMediaDevice(device || dummyAudioDevice)
        setMediaBtnsDisabled(false)
    }
    const startVideo = async (device?: MediaDeviceInfo) => {
        setMediaBtnsDisabled(true)
        await startMediaDevice(device || dummyVideoDevice)
        setMediaBtnsDisabled(false)
    }
    const startScreen = async () => {
        setMediaBtnsDisabled(true)
        await startScreenCapture()
        setMediaBtnsDisabled(false)
    }
    const stopScreen = async () => {
        setMediaBtnsDisabled(true)
        await stopScreenCapture()
        setMediaBtnsDisabled(false)
    }
    const stopAudio = async (device?: MediaDeviceInfo) => {
        setMediaBtnsDisabled(true)
        await stopMediaDevice(device || dummyAudioDevice)
        setMediaBtnsDisabled(false)
    }
    const stopVideo = async (device?: MediaDeviceInfo) => {
        setMediaBtnsDisabled(true)
        await stopMediaDevice(device || dummyVideoDevice)
        setMediaBtnsDisabled(false)
    }

    const screenShareButtonRef = useRef<HTMLButtonElement | null>(null)
    const cameraButtonRef = useRef<HTMLButtonElement | null>(null)
    const micButtonRef = useRef<HTMLButtonElement | null>(null)
    const chatButtonRef = useRef<HTMLButtonElement | null>(null)
    useEffect(() => {
        useLocalState.setState({
            screenShareButtonRef,
            cameraButtonRef,
            micButtonRef,
            chatsButtonRef: chatButtonRef,
        })
    }, [])
    const items: ICommandBarItemProps[] = [
        {
            commandBarButtonAs: CommandButton,
            iconProps: currentCameraId ? { iconName: 'Video' } : { iconName: 'VideoOff' },
            onClick: () => {
                if (!currentCameraId) {
                    startVideo(videoDevices[0])
                } else {
                    stopVideo(videoDevices.find(d => d.deviceId === currentCameraId))
                }
            },
            elementRef: cameraButtonRef,
            disabled: mediaBtnsDisabled,
            key: 'videoToggle',
            text: 'Video',
            tooltipHostProps: {
                content: 'Toggle video',
                delay: 0,
            },
            data: { isHot: !!currentCameraId },
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
                              if (!currentCameraId) {
                                  startVideo(device)
                              } else if (currentCameraId === device.deviceId) {
                                  stopVideo(device)
                              } else {
                                  stopVideo(videoDevices.find(d => d.deviceId === currentCameraId))
                                  startVideo(device)
                              }
                          },
                      })),
                  },
        },
        {
            commandBarButtonAs: CommandButton,
            iconProps: currentMicId ? { iconName: 'Microphone' } : { iconName: 'MicOff' },
            onClick: () => {
                if (!currentMicId) {
                    startAudio(audioDevices[0])
                } else {
                    stopAudio(audioDevices.find(d => d.deviceId === currentMicId))
                }
            },
            elementRef: micButtonRef,
            data: { isHot: !!currentMicId },
            disabled: mediaBtnsDisabled,
            key: 'audioToggle',
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
                              if (!currentMicId) {
                                  startAudio(device)
                              } else if (currentMicId === device.deviceId) {
                                  stopAudio(device)
                              } else {
                                  stopAudio(audioDevices.find(d => d.deviceId === currentMicId))
                                  startAudio(device)
                              }
                          },
                      })),
                  },
        },
        {
            commandBarButtonAs: CommandButton,
            key: 'screen',
            text: 'Screen',
            elementRef: screenShareButtonRef,
            split: true,
            data: { isHot: displayStreamActive },
            disabled: mediaBtnsDisabled || (!displayStreamActive && isRemoteDisplay),
            iconProps: {
                iconName: 'ScreenCast',
            },
            tooltipHostProps: {
                content: displayStreamActive
                    ? 'Stop sharing'
                    : !isRemoteDisplay
                    ? 'Share your screen'
                    : "Someone's already sharing screen",
                delay: 0,
            },
            onClick: () => {
                if (!displayStreamActive) {
                    startScreen()
                } else {
                    stopScreen()
                }
            },
        },
        {
            commandBarButtonAs: CommandButton,
            onClick: toggleChats,
            key: 'chats',
            text: 'Chats',
            elementRef: chatButtonRef,
            iconProps: {
                iconName: 'Chat',
            },
            tooltipHostProps: {
                content: 'Chats',
                delay: 0,
            },
        },
        {
            commandBarButtonAs: CommandButton,
            onClick: togglePeople,
            key: 'people',
            text: 'People',
            iconProps: {
                iconName: 'People',
            },
            tooltipHostProps: {
                content: 'Meeting participants',
                delay: 0,
            },
        },
    ]
    const overflowItems: ICommandBarItemProps[] = [
        {
            key: 'theme',
            text: 'Choose theme',
            secondaryText: colorScheme,
            iconProps: { iconName: 'Contrast' },
            subMenuProps: {
                items: [
                    {
                        key: 'light',
                        text: 'Light',
                        className: lightOption,
                        onClick: () => colorScheme !== 'light' && setColorScheme('light'),
                    },
                    {
                        key: 'dark',
                        text: 'Dark',
                        className: darkOption,
                        onClick: () => colorScheme !== 'dark' && setColorScheme('dark'),
                    },
                ],
            },
        },
        {
            key: 'fullscreen',
            text: 'Toggle fullscreen',
            secondaryText: fullscreenEnabled ? 'On' : 'Off',
            iconProps: { iconName: 'Fullscreen' },
            onClick: toggleFullscreen,
        },
    ]

    const [showInfo, setShowInfo] = useState(false)
    const farItems: ICommandBarItemProps[] = [
        {
            commandBarButtonAs: InviteButton,
            buttonStyles: inviteButtonStyles,
            key: 'copy',
            text: 'Copy invite link',
            ariaLabel: 'Copy invite link',
        },
        {
            commandBarButtonAs: ({ text, key, tooltipHostProps }) => (
                <TooltipHost {...tooltipHostProps}>
                    <DefaultButton
                        onClick={() => requestLeaveRoom()}
                        text={text}
                        key={key}
                        styles={leaveButtonStyles}
                    />
                </TooltipHost>
            ),
            key: 'leave',
            text: 'Leave',
            tooltipHostProps: {
                delay: 0,
                content: 'Leave room',
            },
        },
        {
            commandBarButtonAs: CommandButton,
            className: 'commandbar-info-button',
            key: 'info',
            text: 'Info',
            ariaLabel: 'Info',
            iconOnly: true,
            iconProps: { iconName: 'Info' },
            onClick: () => setShowInfo(!showInfo),
            tooltipHostProps: {
                delay: 0,
                content: 'Info and links',
            },
        },
    ]

    return (
        <>
            <CommandBar
                styles={commandbarStyles}
                items={items}
                overflowItems={overflowItems}
                overflowButtonAs={OverflowButton}
                farItems={farItems}
                ariaLabel="Use left and right arrow keys to navigate between commands"
            />
            {showInfo && (
                <InfoCallout
                    onDismiss={() => setShowInfo(false)}
                    target=".commandbar-info-button"
                    showFooter
                />
            )}
        </>
    )
}
export default MyCommandBar
