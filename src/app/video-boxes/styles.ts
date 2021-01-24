import { IModalStyles, mergeStyles } from '@fluentui/react'

const AR = 4 / 3

export const container = mergeStyles({
    height: 'calc(100vh - 40px)',
    display: 'flex',
    overflowY: 'auto',
})
export const containerInner = mergeStyles({
    display: 'flex',
    margin: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
})

export const mediaContainer = mergeStyles({
    position: 'fixed',
    bottom: 0,
    height: 200 / AR,
    width: 200,
})

export const userMediaContainer = mergeStyles(mediaContainer, {
    right: 0,
})

export const displayMediaContainer = mergeStyles(mediaContainer, {
    right: 200,
})

export const modalStyles: Partial<IModalStyles> = {
    main: {
        minHeight: 100,
        minWidth: 100,
        height: '100%',
        maxHeight: '100%',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
    },
}
