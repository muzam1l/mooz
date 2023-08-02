import {
  FontSizes,
  FontWeights,
  keyframes,
  mergeStyleSets,
} from '@fluentui/react'

export const commonClasses = mergeStyleSets({
  mb2: {
    marginBottom: '.5em',
  },
  mr4: {
    marginRight: '1em',
  },
  message: {
    height: '100%',
    fontSize: FontSizes.xLarge,
    fontWeight: FontWeights.semilight,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '.25em',
    textAlign: 'center',
  },
})

export const fadeIn = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
})

export const blinker = keyframes({
  '50%': {
    opacity: 0,
  },
})
