import type { FunctionComponent } from 'react'
import { Stack, Text, Pivot, PivotItem, IPivotStyles } from '@fluentui/react'
import VideoPreview from './preview'
import CreateMeeting from './create'
import JoinMeeting from './join'
import { container, containerInner, heading, mr4, options } from './styles'

const pivotStyles: Partial<IPivotStyles> = {
    root: {
        // display: 'flex',
        // justifyContent: 'center'
    },
    itemContainer: {
        padding: '.5em',
        width: '300px',
        height: '225px',
    },
}

const Landing: FunctionComponent = () => {
    const one = 1
    return (
        <Stack className={container} horizontalAlign="center">
            <Stack.Item className={containerInner}>
                <Text className={heading} variant="superLarge">
                    Welcome to mooz
                </Text>
                <Stack horizontalAlign="center" horizontal wrap>
                    <Stack.Item className={mr4} grow>
                        <Pivot
                            className={options}
                            styles={pivotStyles}
                            aria-label="Create or join a meeting"
                        >
                            <PivotItem headerText="Create new meeting">
                                <CreateMeeting />
                            </PivotItem>
                            <PivotItem headerText="Join a meeting">
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
    )
}

export default Landing
