import {
  Stack,
  Modal,
  ContextualMenu,
  IconButton,
  TooltipHost,
} from '@fluentui/react'
import { useCallback } from 'react'
import type { FC } from 'react'
import {
  useCloseButtonStyles,
  useModalClassnames,
  modalStyles,
  classes,
} from './styles'
import { Message, Messages } from '../../comps/chat'
import { useChatState, useLocalState } from '../../state'
import { HoverButton } from '../../comps/hover-button'
import { commonClasses } from '../../utils/theme/common-styles'

const ChatPanel: FC = () => {
  const [messages] = useChatState(state => [state.messages])
  const [modalEnabled] = useLocalState(state => [state.floatingChatEnabled])
  const setModalEnabled = (floatingChatEnabled: boolean) =>
    useLocalState.setState({
      floatingChatEnabled,
    })
  const setPanel = (sidePanelTab: 'chats' | 'people' | undefined) =>
    useLocalState.setState({
      sidePanelTab,
    })

  const modalClassnames = useModalClassnames()
  const closeButtonStyles = useCloseButtonStyles()
  const isMobile = window.matchMedia('(max-width: 480px)').matches
  const onRenderChatContent = useCallback(
    () => (
      <Messages>
        {messages.map(msg => (
          <Message
            key={msg.id}
            title={msg.userLabel}
            text={msg.text}
            mine={msg.mine}
          />
        ))}
        {!messages.length && (
          <div className={commonClasses.message}>Chat is empty</div>
        )}
      </Messages>
    ),
    [messages],
  )
  return (
    <Stack verticalAlign="center" verticalFill>
      {/* Un-dock button */}
      {!modalEnabled && !isMobile && (
        <Stack horizontal horizontalAlign="center">
          <TooltipHost
            delay={0}
            content="Open in floating window"
            id="un-dock-button"
          >
            <HoverButton
              ariaLabel="Un-dock panel"
              onClick={() => {
                setModalEnabled(true)
                setPanel(undefined)
              }}
              iconProps={{ iconName: 'MiniExpandMirrored' }}
              style={{ margin: '.25em auto' }}
            />
          </TooltipHost>
        </Stack>
      )}

      {!modalEnabled ? (
        <Stack.Item className={classes.vScroll}>
          {onRenderChatContent()}
        </Stack.Item>
      ) : (
        <Stack
          verticalAlign="center"
          horizontalAlign="center"
          className={commonClasses.message}
        >
          Chats are open in floating Modal
          <HoverButton
            onClick={() => setModalEnabled(false)}
            text="Open chats here"
            style={{ marginTop: '.5em' }}
          />
        </Stack>
      )}
      <Modal
        styles={modalStyles}
        allowTouchBodyScroll
        titleAriaId="chats-modal-title"
        isOpen={modalEnabled}
        onDismiss={() => setModalEnabled(false)}
        isModeless
        containerClassName={modalClassnames.container}
        layerProps={{
          eventBubblingEnabled: true,
        }}
        dragOptions={{
          moveMenuItemText: 'Move',
          closeMenuItemText: 'Close',
          menu: ContextualMenu,
        }}
      >
        <div id="chats-modal-header" className={modalClassnames.header}>
          <span id="chats-modal-title">Chats</span>
          <IconButton
            title="Minimize"
            styles={closeButtonStyles}
            iconProps={{ iconName: 'Cancel' }}
            ariaLabel="Minimize chats modal"
            onClick={() => setModalEnabled(false)}
          />
        </div>

        <div className={modalClassnames.body}>{onRenderChatContent()}</div>
      </Modal>
    </Stack>
  )
}

export default ChatPanel
