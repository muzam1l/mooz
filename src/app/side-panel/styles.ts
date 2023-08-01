import {
    FontSizes,
    FontWeights,
    IModalStyles,
    IPanelStyles,
    IPivotStyles,
    makeStyles,
    mergeStyleSets,
} from '@fluentui/react'

export const classes = mergeStyleSets({
    heading: {
        margin: '.15em .5em',
        fontWeight: FontWeights.semilight,
    },
    fluid: {
        width: '100%',
    },
    pivotContainer: {
        display: 'flex',
        flexDirection: 'column-reverse',
        height: '100%',
    },
    personContainer: {
        width: "100%"
    },
    vScroll: {
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    searchbox: {
        margin: '.5em auto',
        width: '100%',
    }
})
export const pivotStyles: Partial<IPivotStyles> = {
    root: {
        height: '44px',
        display: 'flex',
        justifyContent: 'center',
        margin: '.25em',
    },
    itemContainer: {
        height: 'calc(100% - 44px) ',
        '& > div': {
            height: '100%',
        },
    },
}
export const panelStyles: Partial<IPanelStyles> = {
    scrollableContent: {
        display: 'flex',
        flexDirection: 'column',
        // will use pivot body scroll
        height: '100%',
        overflow: 'hidden',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '.25em',
    },
}

export const useModalClassnames = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch',
        width: '500px',
        maxHeight: '500px',
    },
    header: [
        {
            flex: '1 1 auto',
            borderTop: `4px solid ${theme.palette.themePrimary}`,
            background: theme.palette.neutralLighterAlt,
            color: theme.palette.neutralPrimary,
            display: 'flex',
            alignItems: 'center',
            padding: '.25em .75em',
            cursor: 'move',
            fontWeight: FontWeights.semilight,
            fontSize: FontSizes.xxLarge,
        },
    ],
    body: {
        flex: '4 4 auto',
        padding: '0 1em',
        overflowY: 'auto',
        height: '300px',
        width: '500px',
    },
}))
export const modalStyles: Partial<IModalStyles> = {
    main: {
        minWidth: 500,
    },
    scrollableContent: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
}
export const useCloseButtonStyles = makeStyles(theme => ({
    root: {
        color: theme.palette.neutralPrimary,
        marginLeft: 'auto',
        marginTop: '4px',
        marginRight: '2px',
    },
    rootHovered: {
        color: theme.palette.neutralDark,
    },
}))