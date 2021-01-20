import { useState, useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { Stack, TextField, PrimaryButton, useTheme, Label } from '@fluentui/react'
import type { FormEvent, FunctionComponent } from 'react'
import { mb2, submit } from './styles'
import { socketState } from '../atoms'

const JoinMeeting: FunctionComponent = () => {
    const theme = useTheme()
    const socket = useRecoilValue(socketState)
    const [link, setLink] = useState('')
    const [name, setName] = useState('')
    const [disabled, setDisabled] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // no need for useCallback as set-state functions dont change
    const onError = () => {
        setDisabled(false)
        setError('Invalid link or some error occured ¯\\_(ツ)_/¯')
    }

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            if (disabled) return
            setError(null)
            setDisabled(true)
            socket.emit('join_room', { name, link }, ({ isError }: { isError: boolean }) => {
                // on  should redirect to main app via 'room_joined' event listened in src/index
                if (isError) {
                    onError()
                }
            })
        },
        [disabled, setDisabled, socket, link, name, setError],
    )

    return (
        <Stack>
            <form onSubmit={handleSubmit}>
                <Stack.Item>
                    <TextField
                        className={mb2}
                        value={link}
                        onChange={(_, val) => setLink(val || '')}
                        label="Meeting link or id"
                        required
                    />
                </Stack.Item>
                <Stack.Item>
                    <TextField
                        value={name}
                        onChange={(_, val) => setName(val || '')}
                        placeholder="Your name"
                    />
                </Stack.Item>
                <Label style={{ color: theme.palette.red }}>{error}</Label>
                <Stack.Item>
                    <PrimaryButton
                        type="submit"
                        disabled={disabled}
                        className={submit}
                        text="Join"
                    />
                </Stack.Item>
            </form>
        </Stack>
    )
}

export default JoinMeeting
