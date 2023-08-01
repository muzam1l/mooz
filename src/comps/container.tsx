import { mergeStyles, useTheme } from '@fluentui/react'
import { FC } from 'react'

interface IContainerProps {
    children: React.ReactNode
}

export const Container: FC<IContainerProps> = ({ children }) => {
    const theme = useTheme()
    const root = mergeStyles({
        paddingLeft: theme.spacing.m,
        paddingRight: theme.spacing.m,
        maxWidth: '960px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
    })
    return <div className={root}>{children}</div>
}
