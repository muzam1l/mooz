import { CommandBar, DefaultButton, ThemeProvider } from '@fluentui/react'
import type { ICommandBarItemProps, IButtonProps } from '@fluentui/react'
import type { FunctionComponent } from 'react'
import { LeaveButtonStyles, buttonStyles, containerStyles, lightOption, darkOption } from './styles'
import { darkPaletteAlt, lightPaletteAlt } from '../../utils/themes'
import { useTheme, useSetTheme } from '../../utils/theme-context'

interface MyCommandBarProps {
    onClickPeople?: () => void
    onClickChat?: () => void
}

const MyCommandBar: FunctionComponent<MyCommandBarProps> = ({ onClickPeople, onClickChat }) => {
    const theme = useTheme()
    const setTheme = useSetTheme()
    const items: ICommandBarItemProps[] = [
        {
            buttonStyles,
            key: 'audioToggle',
            // iconOnly: true,
            text: 'Audio',
            tooltipHostProps: {
                content: 'Toggle audio',
                delay: 0,
            },
            iconProps: { iconName: 'Microphone' },
        },
        {
            buttonStyles,
            key: 'videoToggle',
            // iconOnly: true,
            text: 'Video',
            iconProps: { iconName: 'Video' },
            tooltipHostProps: {
                content: 'Toggle video',
                delay: 0,
            },
        },
        {
            onClick: onClickChat,
            buttonStyles,
            key: 'chat',
            // iconOnly: true,
            text: 'Chat',
            iconProps: {
                iconName: 'Chat',
            },
            tooltipHostProps: {
                content: 'Open chat',
                delay: 0,
            },
        },
        {
            onClick: onClickPeople,
            buttonStyles,
            key: 'people',
            // iconOnly: true,
            text: 'People',
            iconProps: {
                iconName: 'People',
            },
            tooltipHostProps: {
                content: 'Show participants',
                delay: 0,
            },
        },
    ]
    const overflowProps: IButtonProps = { ariaLabel: 'More commands' }
    const overflowItems: ICommandBarItemProps[] = [
        {
            key: 'theme',
            text: 'Choose theme',
            secondaryText: theme,
            iconProps: { iconName: 'Contrast' },
            subMenuProps: {
                items: [
                    {
                        key: 'light',
                        text: 'Light',
                        className: lightOption,
                        onClick: () => theme === 'dark' && setTheme?.('light'),
                    },
                    {
                        key: 'dark',
                        text: 'Dark',
                        className: darkOption,
                        onClick: () => theme === 'light' && setTheme?.('dark'),
                    },
                ],
            },
        },
    ]
    const farItems: ICommandBarItemProps[] = [
        {
            // eslint-disable-next-line
            commandBarButtonAs: ({ text, key }) => (
                <DefaultButton text={text} key={key} styles={LeaveButtonStyles} />
            ),
            key: 'leave',
            text: 'Leave',
        },
        {
            buttonStyles,
            key: 'info',
            text: 'Info',
            // This needs an ariaLabel since it's icon-only
            ariaLabel: 'Info',
            iconOnly: true,
            iconProps: { iconName: 'Info' },
        },
    ]
    const palette = theme === 'dark' ? darkPaletteAlt : lightPaletteAlt
    return (
        <ThemeProvider theme={{ ...palette }}>
            <CommandBar
                styles={containerStyles}
                items={items}
                overflowItems={overflowItems}
                overflowButtonProps={overflowProps}
                farItems={farItems}
                ariaLabel="Use left and right arrow keys to navigate between commands"
            />
        </ThemeProvider>
    )
}
export default MyCommandBar
