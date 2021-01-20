import { useCallback, useState } from 'react'
import {
    Stack,
    Persona,
    List,
    PersonaPresence,
    SearchBox,
    useTheme,
    PersonaSize,
    IconButton,
    ContextualMenu,
    ContextualMenuItemType,
} from '@fluentui/react'
import type { FunctionComponent } from 'react'
import { vFluid, searchbox, vScroll } from './styles'

const PersonComponent: FunctionComponent<{ item?: Person; index?: number }> = ({ index, item }) => {
    const [mouseEvent, setMouseEvent] = useState<MouseEvent | null>(null)
    const theme = useTheme()
    if (!index || !item) return null
    return (
        <>
            <Stack
                key={index}
                onContextMenu={e => {
                    e.preventDefault()
                    // eslint-disable-next-line
                    setMouseEvent(e as any)
                }}
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
                <Persona
                    presence={PersonaPresence.online}
                    text={item.name}
                    secondaryText="Online"
                    size={PersonaSize.size32}
                />
                <IconButton
                    onClick={e => {
                        // eslint-disable-next-line
                        setMouseEvent(e as any)
                    }}
                    iconProps={{ iconName: 'More' }}
                />
            </Stack>
            <ContextualMenu
                items={[
                    {
                        key: 'header1',
                        itemType: ContextualMenuItemType.Header,
                        text: item.name,
                    },
                    {
                        key: 'mute',
                        text: 'Mute',
                        iconProps: { iconName: 'MicOff' },
                    },
                    {
                        key: 'hide',
                        text: 'Hide',
                        iconProps: { iconName: 'VideoOff' },
                    },
                    {
                        key: 'divider1',
                        itemType: ContextualMenuItemType.Divider,
                    },
                    {
                        key: 'kick',
                        text: 'Kick out',
                        iconProps: { iconName: 'SignOut' },
                    },
                ]}
                onDismiss={() => {
                    setMouseEvent(null)
                }}
                hidden={!mouseEvent}
                target={mouseEvent}
            />
        </>
    )
}

const PeoplePanel: FunctionComponent = () => {
    const onRenderPerson = useCallback(
        (item?: Person, index?: number) => <PersonComponent item={item} index={index} />,
        [],
    )
    return (
        <Stack verticalAlign="center" className={vFluid}>
            <SearchBox
                underlined
                placeholder="Search people..."
                className={searchbox}
                ariaLabel="Search for people in this meeting"
            />
            {/* eslint-disable-next-line */}
            <List className={vScroll} items={people} onRenderCell={onRenderPerson} />
        </Stack>
    )
}

export default PeoplePanel

interface Person {
    name: string
}

const people: Person[] = [
    {
        name: 'Muzamil sofi',
    },
    {
        name: 'Not muzamil',
    },
    {
        name: 'Muzamil sofi',
    },
    {
        name: 'Not muzamil',
    },
    {
        name: 'Muzamil sofi',
    },
    {
        name: 'Not muzamil',
    },
    {
        name: 'Muzamil sofi',
    },
    {
        name: 'Not muzamil',
    },
    {
        name: 'Muzamil sofi',
    },
    {
        name: 'Not muzamil',
    },
    {
        name: 'Muzamil sofi',
    },
    {
        name: 'Not muzamil',
    },
    {
        name: 'Muzamil sofi',
    },
    {
        name: 'Not muzamil',
    },
    {
        name: 'Muzamil sofi',
    },
    {
        name: 'Not muzamil',
    },
    {
        name: 'Muzamil sofi',
    },
    {
        name: 'Not muzamil',
    },
    {
        name: 'Muzamil sofi',
    },
    {
        name: 'Not muzamil',
    },
]
