import {
    DefaultButton,
    FontSizes,
    IButtonProps,
    IButtonStyles,
    mergeStyles,
    useTheme,
} from '@fluentui/react'
import { FC } from 'react'
import { blinker } from '../utils/theme/common-styles'

export const HoverButton: FC<IButtonProps> = props => {
    const theme = useTheme()
    const isHot = props?.data?.isHot || false
    const className = mergeStyles({
        backgroundColor: theme.semanticColors.bodyBackground,
        color: theme.semanticColors.bodyText,
        ':hover': {
            backgroundColor: theme.semanticColors.primaryButtonBackground,
            color: theme.semanticColors.primaryButtonText,
        },
        ':active': {
            backgroundColor: theme.semanticColors.primaryButtonBackgroundPressed,
            color: theme.semanticColors.primaryButtonTextPressed,
        },
        ':focus': {
            outline: `1px solid ${theme.semanticColors.buttonBorder}`,
        },
        ':disabled': {
            backgroundColor: theme.semanticColors.primaryButtonBackgroundDisabled,
            color: theme.semanticColors.primaryButtonTextDisabled,
        },
    })
    const primaryButtonStyles: IButtonStyles = {
        icon: {
            fontSize: FontSizes.xLarge,
            animation: isHot ? `${blinker} 2s linear infinite` : undefined,
        },
        root: {
            margin: '0 1px',
            height: 30,
            border: 0,
            padding: '0 .25em',
            minWidth: 44,
            '::after': {
                display: 'none',
            },
        },
        splitButtonContainer: {
            borderRadius: theme.effects.roundedCorner2,
            height: 30,
        },
        splitButtonMenuButton: {
            border: 0,
        },
        menuIcon: {
            color: 'inherit !important',
        },
    }
    return (
        <DefaultButton
            {...props}
            splitButtonMenuProps={{
                className,
                ...props.splitButtonMenuProps,
            }}
            iconProps={{
                styles: {
                    root: {
                        color: isHot ? theme.semanticColors.errorText : 'inherit',
                    },
                },
                ...props.iconProps,
            }}
            className={mergeStyles(className, props.className)}
            styles={{
                ...primaryButtonStyles,
                ...props.styles,
            }}
        />
    )
}
