import { toast as toastify, ToastOptions } from 'react-toastify'
import { getTheme, mergeStyleSets, MessageBar, MessageBarType, Text } from '@fluentui/react'

type IToastOptions = {
    body?: string
    type?: MessageBarType
    onClick?: () => void
} & Omit<ToastOptions, 'type' | 'onClick'>

const toast = (text: string, options?: IToastOptions) => {
    const { type, body, onClick, ...rest } = options || {}
    const theme = getTheme()
    const color =
        type === MessageBarType.error || type === MessageBarType.blocked
            ? theme.semanticColors.errorText
            : type === MessageBarType.success
            ? theme.semanticColors.successIcon
            : type === MessageBarType.warning || type === MessageBarType.severeWarning
            ? theme.semanticColors.warningIcon
            : theme.semanticColors.messageText
    return toastify(
        <MessageBar onClick={onClick} messageBarType={type} truncated isMultiline={true}>
            {text}
            {body && (
                <Text styles={{ root: { color } }} block variant="small">
                    {body}
                </Text>
            )}
        </MessageBar>,
        rest,
    )
}

export default toast
export const dismissToast = toastify.dismiss

export const Timeout = {
    SHORT: 1500,
    MEDIUM: 3000,
    LONG: 5000,
    PERSIST: false,
} as const

export { MessageBarType as ToastType } from '@fluentui/react'

export const toastClasses = mergeStyleSets({
    container: {
        marginBottom: '.25em !important',
        padding: '0 !important',
        minHeight: '0 !important',
    },
    body: {
        padding: '0 !important',
        width: '100%',
    },
})
