import { useEffect, useState, createContext } from 'react'
import type { FC } from 'react'
import { ThemeProvider, ThemeProviderProps } from '@fluentui/react'
import { darkTheme, lightTheme } from './themes'

type ColorScheme = 'light' | 'dark'
type SetColorScheme = (arg0: ColorScheme) => void

export const ColorSchemeContext = createContext<{
    colorScheme: ColorScheme
    setColorScheme: SetColorScheme
}>({ colorScheme: 'dark', setColorScheme: () => {} }) // default shouldn't matter here

const Provider: FC<ThemeProviderProps> = props => {
    // default preference - changed to dark
    const prefersDark = true
    // window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

    const [colorScheme, setColorScheme] = useState<ColorScheme>(prefersDark ? 'dark' : 'light')
    // set listener fot theme change
    useEffect(() => {
        const listener = (ev: MediaQueryListEvent) => {
            const newTheme = ev.matches ? 'dark' : 'light'
            setColorScheme(newTheme)
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener)
        return () =>
            window
                .matchMedia('(prefers-color-scheme: dark)')
                .removeEventListener('change', listener)
    }, [])

    const palette = colorScheme === 'dark' ? darkTheme : lightTheme
    return (
        <ColorSchemeContext.Provider value={{ setColorScheme, colorScheme }}>
            <ThemeProvider applyTo="body" theme={palette} {...props} />
        </ColorSchemeContext.Provider>
    )
}

export default Provider
