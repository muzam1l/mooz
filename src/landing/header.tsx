import {
  ActionButton,
  Image,
  Link,
  Stack,
  TooltipHost,
  useTheme,
} from '@fluentui/react'
import { useContext, type FC } from 'react'
import { classes } from './styles'
import { Container } from '../comps/container'
import { ColorSchemeContext } from '../utils/theme/theme-context'

const Header: FC = ({}) => {
  const theme = useTheme()
  const links = [
    {
      text: 'GitHub',
      href: 'https://github.com/muzam1l/mooz',
    },
    {
      text: 'muzam1l',
      href: 'https://muzam1l.com',
    },
  ]

  const { setColorScheme, colorScheme } = useContext(ColorSchemeContext)
  return (
    <Stack
      className={classes.header}
      horizontal
      verticalAlign="center"
      horizontalAlign="center"
    >
      <Container>
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
            <Link href="/">
              <Image width={30} height={30} src="/logo-192.png" />
            </Link>
            <div className={classes.title}>Mooz</div>
          </Stack>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 0 }}>
            {links.map(({ text, href }) => (
              <ActionButton
                href={href}
                key={text}
                text={text}
                rel="noopener noreferrer"
                target="_blank"
                iconProps={{
                  iconName: 'NavigateExternalInline',
                  styles: {
                    root: {
                      marginTop: -2,
                    },
                  },
                }}
              />
            ))}
            <TooltipHost
              content={`Switch to ${
                colorScheme === 'dark' ? 'light' : 'dark'
              } theme`}
              delay={0}
              id={'theme-toggle-tooltip'}
              calloutProps={{ gapSpace: 0 }}
            >
              <ActionButton
                aria-describedby={'theme-toggle-tooltip'}
                iconProps={{
                  iconName: colorScheme === 'dark' ? 'Sunny' : 'ClearNight',
                }}
                styles={{
                  root: {
                    ':hover': {
                      color: 'red !important',
                    },
                  },
                  icon: {
                    color: theme.semanticColors.bodyText,
                    fontWeight: 'bold',
                    fontSize: theme.fonts.xLarge.fontSize,
                  },
                }}
                onClick={() => {
                  setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')
                }}
                ariaLabel="Toggle color scheme"
              />
            </TooltipHost>
          </Stack>
        </Stack>
      </Container>
    </Stack>
  )
}

export default Header
