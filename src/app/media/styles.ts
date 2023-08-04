import { IModalStyles, mergeStyleSets } from '@fluentui/react'
import {
  COMMANDBAR_HEIGHT,
  LOCAL_MEDIA_HEIGHT,
  LOCAL_MEDIA_WIDTH,
  MAX_MEDIA_HEIGHT,
  MAX_MEDIA_WIDTH,
  MIN_MEDIA_GRID_HEIGHT,
  MIN_MEDIA_GRID_WIDTH,
} from '../../state/constants'

const mediaContainerBase = {
  position: 'fixed',
  bottom: 0,
  visibility: 'hidden',
  height: LOCAL_MEDIA_HEIGHT,
  width: LOCAL_MEDIA_WIDTH,
}

export const classes = mergeStyleSets({
  container: {
    height: `calc(100vh - ${COMMANDBAR_HEIGHT}px)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',

    '@media (max-width: 768px)': {
      flexDirection: 'column',
    },
  },
  pinnedContainer: {
    padding: '.5em',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '@media (max-width: 768px)': {
      width: '100%',
      height: '50%',
    },
  },
  gridContainer: {
    position: 'relative',
    height: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflowX: 'auto',
    '@media (max-width: 768px)': {
      height: '50%',
    },
  },
  gridInner: {
    padding: '.5em',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignContent: 'center',
    overflowX: 'auto',
    flexWrap: 'wrap',
    '& > *': {
      minWidth: MIN_MEDIA_GRID_WIDTH,
      minHeight: MIN_MEDIA_GRID_HEIGHT,
      maxWidth: MAX_MEDIA_WIDTH,
      maxHeight: MAX_MEDIA_HEIGHT,
    },
    '@media (max-width: 768px)': {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexWrap: 'nowrap',
      overflowX: 'auto',
    },
  },
  userMediaContainer: {
    ...mediaContainerBase,
    right: 0,
  },
  displayMediaContainer: {
    ...mediaContainerBase,
    right: LOCAL_MEDIA_WIDTH,
  },
})

export const mediaModalStyles: Partial<IModalStyles> = {
  root: {
    position: 'relative',
  },
  main: {
    height: LOCAL_MEDIA_HEIGHT,
    width: LOCAL_MEDIA_WIDTH,
    minWidth: LOCAL_MEDIA_HEIGHT,
    minHeight: LOCAL_MEDIA_HEIGHT,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  scrollableContent: {
    height: '100%',
    width: '100%',
  },
}
