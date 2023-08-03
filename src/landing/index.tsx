import { FC, useEffect } from 'react'
import { Stack, Pivot, PivotItem, IPivotStyles } from '@fluentui/react'
import fscreen from 'fscreen'
import VideoPreview from './preview'
import CreateMeeting from './create'
import JoinMeeting from './join'
import { classes } from './styles'
import Header from './header'
import { getLandingDefaults } from '../state'

const pivotStyles: Partial<IPivotStyles> = {
  itemContainer: {
    padding: '.5em',
    width: '300px',
    height: '225px',
  },
}

const Landing: FC = () => {
  useEffect(() => {
    if (fscreen.fullscreenElement) fscreen.exitFullscreen()
  }, [])
  return (
    <>
      <Header />
      <Stack className={classes.app} horizontalAlign="center">
        <Stack.Item className={classes.containerInner}>
          <div className={classes.tagline}>
            Create or join a peer-to-peer meeting instantly
          </div>
          <Stack className={classes.main} horizontalAlign="center" horizontal>
            <Stack.Item className={classes.formContainer}>
              <Pivot
                defaultSelectedKey={getLandingDefaults().key}
                className={classes.options}
                styles={pivotStyles}
                aria-label="Create or join a meeting"
              >
                <PivotItem itemKey="create" headerText="Create new meeting">
                  <CreateMeeting />
                </PivotItem>
                <PivotItem itemKey="join" headerText="Join a meeting">
                  <JoinMeeting />
                </PivotItem>
              </Pivot>
            </Stack.Item>
            <Stack.Item>
              <VideoPreview />
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    </>
  )
}

export default Landing
