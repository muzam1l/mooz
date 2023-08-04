import { ILinkProps, Link, Panel, PanelType, Stack } from '@fluentui/react'
import { useLocalState, useRemoteState } from '../../state'
import { commonClasses } from '../../utils/theme/common-styles'
import { FC } from 'react'

const InlineLink: FC<ILinkProps> = props => {
  return <Link styles={{ root: { display: 'contents' } }} {...props} />
}

export const MediaPanel: React.FC = () => {
  const connections = useRemoteState(state => state.connections)

  const [
    showEmptyMediaPanel,
    currentCameraId,
    currentMicId,
    displayMediaActive,
    screenShareButtonRef,
    cameraButtonRef,
    micButtonRef,
    chatsButtonRef,
  ] = useLocalState(state => [
    state.showEmptyMediaPanel,
    state.currentCameraId,
    state.currentMicId,
    state.screenMediaActive,
    state.screenShareButtonRef,
    state.cameraButtonRef,
    state.micButtonRef,
    state.chatsButtonRef,
  ])

  const showMediaPanel =
    showEmptyMediaPanel &&
    !connections.length &&
    !currentCameraId &&
    !currentMicId &&
    !displayMediaActive

  const handleClick = (ref?: React.RefObject<HTMLButtonElement>) => () => {
    ref?.current?.focus()
    ref?.current?.click()
  }

  return (
    <Panel
      isFooterAtBottom
      type={PanelType.custom}
      customWidth="100%"
      layerProps={{
        eventBubblingEnabled: true,
        styles: {
          root: {
            zIndex: 100,
          },
        },
      }}
      onDismiss={() => {
        useLocalState.setState({
          showEmptyMediaPanel: false,
        })
      }}
      styles={{
        main: {
          bottom: 0,
          height: '35vh',
          top: 'auto',
        },
        content: {
          paddingBottom: '3em',
        },
      }}
      isHiddenOnDismiss
      isBlocking={false}
      isOpen={showMediaPanel}
      closeButtonAriaLabel="Close"
    >
      <Stack verticalFill horizontalAlign="center" verticalAlign="center">
        <div className={commonClasses.message}>
          You can join using your{' '}
          <InlineLink onClick={handleClick(cameraButtonRef)}>camera</InlineLink>
          ,{' '}
          <InlineLink onClick={handleClick(micButtonRef)}>
            microphone
          </InlineLink>{' '}
          and{' '}
          <InlineLink onClick={handleClick(screenShareButtonRef)}>
            screen sharing
          </InlineLink>{' '}
          or just head over to the{' '}
          <InlineLink onClick={handleClick(chatsButtonRef)}>chats</InlineLink>{' '}
          and start chatting.
        </div>
      </Stack>
    </Panel>
  )
}
