import { TextField, Stack, TooltipHost } from '@fluentui/react'
import { nanoid } from 'nanoid'
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { messages, fluid } from './styles'
import { IChatMessage, sendChat, useLocalState } from '../../state'
import { HoverButton } from '../hover-button'
import { userLabel } from '../../utils/helpers'

const Messages: FC<{ children: ReactNode }> = ({ children }) => {
  const [name, id] = useLocalState(state => [
    state.preferences.userName,
    state.sessionId,
  ])
  const [message, setMessage] = useState('')

  const scrolling = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    const s = scrolling.current
    if (!s) return

    s.scrollBy({ top: s.scrollHeight, behavior: 'smooth' })
  }
  useEffect(() => {
    scrollToBottom()
  }, [children])

  const handleSubmit = useCallback(() => {
    if (!message.trim()) return
    const msg: IChatMessage = {
      id: nanoid(),
      mine: true,
      text: message.trim().replace(/\n\n/g, '\n'),
      userLabel: userLabel({
        userName: name,
        userId: id,
      }),
    }
    sendChat(msg)
    setMessage('')
  }, [id, message, name])
  return (
    <Stack
      verticalFill
      verticalAlign="space-between"
      className={messages.container}
    >
      <div ref={scrolling} className={messages.children}>
        {children}
      </div>
      <Stack.Item disableShrink className={messages.type}>
        <TextField
          className={fluid}
          multiline
          autoAdjustHeight
          placeholder="Type your message"
          value={message}
          onChange={(_, val) => val !== undefined && setMessage(val)}
          onKeyDown={e => {
            if (e.shiftKey && e.key === 'Enter') {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <TooltipHost delay={0} content="shift + enter" id="send-button">
          <HoverButton
            disabled={!message.trim()}
            aria-describedby="send-button"
            onClick={handleSubmit}
            title="Send"
            iconProps={{ iconName: 'Send' }}
          />
        </TooltipHost>
      </Stack.Item>
    </Stack>
  )
}

export default Messages
