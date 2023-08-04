import { FontSizes, FontWeights, mergeStyles } from '@fluentui/react'
import type { ICommandBarStyles } from '@fluentui/react'
import { darkTheme, lightTheme } from '../../utils/theme/themes'
import { COMMANDBAR_HEIGHT } from '../../state'

export const lightOption = mergeStyles({
  '&, & button': {
    color: lightTheme.semanticColors.bodyText,
    backgroundColor: lightTheme.semanticColors.bodyBackground,
  },
  '& button:hover, & button:focus': {
    color: lightTheme.semanticColors.bodyText,
    backgroundColor: `${lightTheme.semanticColors.bodyBackgroundHovered} !important`,
  },
})
export const darkOption = mergeStyles({
  '&, & button': {
    color: darkTheme.semanticColors.bodyText,
    backgroundColor: darkTheme.semanticColors.bodyBackground,
  },
  '& button:hover, & button:focus': {
    color: darkTheme.semanticColors.bodyText,
    backgroundColor: `${darkTheme.semanticColors.bodyBackgroundHovered} !important`,
  },
})

export const commandbarStyles: ICommandBarStyles = {
  root: {
    padding: '0 .5em',
    margin: '.25em 0',
    height: COMMANDBAR_HEIGHT,
    borderRadius: 0,
  },
}

export const leaveButtonStyles = {
  root: {
    margin: 'auto .5em',
    transition: 'all .1s ease',
    height: '100%',
  },
  rootHovered: {
    backgroundColor: '#CE0B1B',
    color: 'white',
  },
  label: {
    fontSize: FontSizes.mediumPlus,
    fontWeight: FontWeights.regular,
  },
}
export const copyButtonStyles = {
  root: {
    fontWeight: FontWeights.bold,
    margin: 'auto .5em',
    transition: 'all .1s ease',
    height: '100%',
  },
  label: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
  },
}
