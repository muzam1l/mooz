import { create } from 'zustand'
import toast, { Timeout, ToastType } from '../comps/toast'
import { IChatState, IChatMessage, IPeerData } from './types'
import { useRemoteState } from './remote'
import { useLocalState } from './local'
import { truncate } from '../utils/helpers'

export const useChatState = create<IChatState>()(() => ({
  messages: [],
}))

const chatAudio = new Audio('/sounds/chat-received.mp3')

export const onChatReceived = (chat: IChatMessage) => {
  const { userLabel, text } = chat
  const isInChats = useLocalState.getState().sidePanelTab === 'chats'
  if (!isInChats) {
    toast(`${userLabel} sent a message: ${truncate(text, 45)}`, {
      type: ToastType.info,
      autoClose: Timeout.MEDIUM,
      body: 'Click to open chats',
      onClick: () => {
        useLocalState.setState({
          sidePanelTab: 'chats',
        })
      },
    })
  }
  chatAudio.play()

  useChatState.setState(state => {
    return {
      messages: [
        ...state.messages,
        {
          ...chat,
          mine: false,
        },
      ],
    }
  })
}

export const sendChat = (chat: IChatMessage) => {
  useChatState.setState(state => {
    return {
      messages: [
        ...state.messages,
        {
          ...chat,
          mine: true,
        },
      ],
    }
  })

  const connections = useRemoteState.getState().connections
  connections
    .map(c => c.peerInstance)
    .filter(Boolean)
    .forEach(peer => {
      try {
        const data: IPeerData = {
          chat: {
            ...chat,
            mine: false,
          },
        }
        peer!.send(JSON.stringify(data))
      } catch (err) {
        toast('Message could not be sent, try again', { type: ToastType.error })
        useChatState.setState(state => {
          return {
            messages: state.messages.filter(m => m.id !== chat.id),
          }
        })
      }
    })
}
