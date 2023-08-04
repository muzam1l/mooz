import { useRef, useState } from 'react'
import {
  Stack,
  Persona,
  useTheme,
  PersonaSize,
  IconButton,
} from '@fluentui/react'
import type { FC } from 'react'
import InfoCallout from '../../comps/info-overlay'
import { IConnection, useRemoteState } from '../../state'
import { HoverButton } from '../../comps/hover-button'
import { commonClasses } from '../../utils/theme/common-styles'
import { userLabel } from '../../utils/helpers'
import { ConnectionMenu } from '../../comps/connection-menu'
import { classes } from './styles'

const PersonComponent: FC<{ item: IConnection }> = ({ item }) => {
  const theme = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLButtonElement | null>(null)

  const label = userLabel(item)
  return (
    <div ref={ref} className={classes.personContainer}>
      <Stack
        key={item.userId}
        styles={{
          root: {
            padding: '.5em .75em',
            cursor: 'default',
            ':hover': {
              backgroundColor: theme.semanticColors.listItemBackgroundHovered,
            },
          },
        }}
        horizontal
        horizontalAlign="space-between"
      >
        <Persona text={label} size={PersonaSize.size32} />
        <IconButton elementRef={iconRef} iconProps={{ iconName: 'More' }} />
      </Stack>
      <ConnectionMenu
        label={label}
        clickTarget={iconRef.current}
        target={ref.current}
      />
    </div>
  )
}

const PeoplePanel: FC = () => {
  const connections = useRemoteState(state => state.connections)
  const [showInfo, setShowInfo] = useState(false)
  return (
    <Stack verticalAlign="center" verticalFill>
      {!connections.length ? (
        <div className={commonClasses.message}>
          <span>
            You are currently alone right now, invite some people to join
          </span>
          <HoverButton
            onClick={() => setShowInfo(!showInfo)}
            text="Info"
            className="info-button-in-person-list"
            style={{ marginTop: '.5em' }}
          />
        </div>
      ) : (
        <Stack verticalFill horizontalAlign="center">
          {connections.map(conn => (
            <PersonComponent item={conn} key={conn.userId} />
          ))}
        </Stack>
      )}
      {showInfo && (
        <InfoCallout
          onDismiss={() => setShowInfo(false)}
          target=".info-button-in-person-list"
        />
      )}
    </Stack>
  )
}

export default PeoplePanel
