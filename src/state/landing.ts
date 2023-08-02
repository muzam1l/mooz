import { create } from 'zustand'
import { useLocalState } from './local'

export const getLandingDefaults = () => {
  let key: 'create' | 'join' = 'create'
  let id: string | undefined
  const path = window.location.pathname
  const REGEX = /^\/room\/(?<id>[0-9a-zA-Z-_]+)/
  const match = path.match(REGEX)
  if (match) {
    key = 'join'
    id = match.groups?.id
  }
  return {
    key,
    id,
  }
}

export interface JoinFormState {
  roomId: string
  userName: string
  loading: boolean
  error: string | null
}

export const useJoinFormState = create<JoinFormState>()(() => ({
  roomId: getLandingDefaults().id || '',
  userName: useLocalState.getState().preferences.userName || '',
  loading: false,
  error: null,
}))

export interface CreateFormState {
  capacity: string
  meetingName: string
  userName: string
  loading: boolean
  error: string | null
}

export const useCreateFormState = create<CreateFormState>()(() => ({
  capacity: '5',
  meetingName: useLocalState.getState().preferences.meetingName || '',
  userName: useLocalState.getState().preferences.userName || '',
  loading: false,
  error: null,
}))
