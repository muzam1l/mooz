import { FontSizes, FontWeights, mergeStyleSets } from '@fluentui/react'
import { fadeIn } from '../utils/theme/common-styles'
import { LOCAL_MEDIA_HEIGHT, NAVBAR_HEIGHT } from '../state/constants'

export const classes = mergeStyleSets({
  app: {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    overflowY: 'auto',
  },
  containerInner: {
    margin: 'auto',
    "@media (max-width: 768px)": {
      paddingBottom: '6em',
    }
  },
  tagline: {
    padding: '.25em',
    textAlign: 'center',
    display: 'block',
    fontSize: FontSizes.xxLargePlus,
    fontWeight: FontWeights.semilight,
  },
  submit: {
    padding: '1.5em 2em',
    margin: '.25em auto',
    minWidth: '50%',
  },
  preview: {
    padding: '.5em 1em',
    width: 300,
    position: 'relative',
  },
  mediaContainer: {
    height: LOCAL_MEDIA_HEIGHT,
    position: 'relative',
  },
  options: {
    maxWidth: '300px',
    margin: '0 auto',
  },
  placeholder: {
    minHeight: '150px',
    animation: `${fadeIn} .75s ease`,
  },
  main: {
    height: '255px',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      height: '500px',
    },
  },
  header: {
    height: NAVBAR_HEIGHT,
    position: 'sticky',
    top: 0,
    left: 0,
    width: '100%',
    padding: '0 1em',
  },
  title: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    userSelect: 'none',
  },
  formContainer: {
    padding: '0 1em',
  },
})
