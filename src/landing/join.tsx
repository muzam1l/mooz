import { useCallback, useState } from 'react'
import {
  Stack,
  TextField,
  PrimaryButton,
  useTheme,
  Label,
  Spinner,
} from '@fluentui/react'
import type { FormEvent, FC } from 'react'
import { classes } from './styles'
import { useJoinFormState, useLocalState, useRemoteState } from '../state'
import { commonClasses } from '../utils/theme/common-styles'

interface JoinProps {}

const JoinMeeting: FC<JoinProps> = () => {
  const [userNameError, setUserNameError] = useState('')

  const theme = useTheme()
  const [socket] = useRemoteState(state => [state.socket])
  const [preferences] = useLocalState(state => [state.preferences])

  const { loading, error, userName, roomId } = useJoinFormState()
  const setState = useJoinFormState.setState

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!userName.trim()) {
        setUserNameError('Please enter your name')
        return
      }
      if (loading) return

      setState({
        loading: true,
        error: null,
      })
      socket.emit('request:join_room', { userName, roomId }, err => {
        if (err) {
          setState({
            error: err.message,
          })
        }
        setState({
          loading: false,
        })
        // should redirect to room via event listener in Eagle component
      })

      useLocalState.setState({
        preferences: {
          ...preferences,
          userName,
        },
      })
    },
    [loading, preferences, roomId, setState, socket, userName],
  )

  return (
    <Stack>
      <form onSubmit={handleSubmit}>
        <Stack.Item>
          <TextField
            className={commonClasses.mb2}
            value={roomId}
            onChange={(_, roomId = '') => setState({ roomId })}
            label="Meeting link or id"
            required
          />
        </Stack.Item>
        <Stack.Item>
          <TextField
            value={userName}
            onChange={(_, userName = '') => {
              setState({ userName })
              if (userNameError) {
                setUserNameError('')
              }
            }}
            placeholder="Your name"
            errorMessage={userNameError}
            required
          />
        </Stack.Item>
        <Label style={{ color: theme.palette.red }}>{error}</Label>
        <Stack.Item>
          <PrimaryButton type="submit" className={classes.submit}>
            {loading ? <Spinner labelPosition="left" /> : 'Join'}
          </PrimaryButton>
        </Stack.Item>
      </form>
    </Stack>
  )
}

export default JoinMeeting
