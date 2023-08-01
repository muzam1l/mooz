import { PartialTheme, createTheme } from '@fluentui/react'

const common: PartialTheme = {
    disableGlobalClassNames: true,
}

export const lightTheme = createTheme({
    ...common,
    palette: {
        themePrimary: '#0078d4',
        themeLighterAlt: '#eff6fc',
        themeLighter: '#deecf9',
        themeLight: '#c7e0f4',
        themeTertiary: '#71afe5',
        themeSecondary: '#2b88d8',
        themeDarkAlt: '#106ebe',
        themeDark: '#005a9e',
        themeDarker: '#004578',
        neutralLighterAlt: '#faf9f8',
        neutralLighter: '#f3f2f1',
        neutralLight: '#edebe9',
        neutralQuaternaryAlt: '#e1dfdd',
        neutralQuaternary: '#d0d0d0',
        neutralTertiaryAlt: '#c8c6c4',
        neutralTertiary: '#8b92ac',
        neutralSecondary: '#6c7491',
        neutralSecondaryAlt: '#6c7491',
        neutralPrimaryAlt: '#515876',
        neutralPrimary: '#040509',
        neutralDark: '#242a40',
        black: '#131625',
        white: '#ffffff',
    },
});

export const darkTheme = createTheme({
    ...common,
    palette: {
        themePrimary: '#529efe',
        themeLighterAlt: '#03060a',
        themeLighter: '#0d1a29',
        themeLight: '#18304d',
        themeTertiary: '#316099',
        themeSecondary: '#488ce0',
        themeDarkAlt: '#63a9ff',
        themeDark: '#7bb7ff',
        themeDarker: '#9ecaff',
        neutralLighterAlt: '#25272b',
        neutralLighter: '#2d2f33',
        neutralLight: '#3a3c41',
        neutralQuaternaryAlt: '#42444a',
        neutralQuaternary: '#494b51',
        neutralTertiaryAlt: '#65686f',
        neutralTertiary: '#f3f4f6',
        neutralSecondary: '#f5f6f8',
        neutralSecondaryAlt: '#f5f6f8',
        neutralPrimaryAlt: '#f7f8f9',
        neutralPrimary: '#eceef1',
        neutralDark: '#fbfbfc',
        black: '#fdfdfd',
        white: '#1c1d20',
    }
})