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
    DefaultButton,
} from '@fluentui/react'
import { useRecoilValue } from 'recoil'
import type { FunctionComponent } from 'react'
import { vFluid, searchbox, vScroll, message } from './styles'
import { Connection, connectionsState } from '../../atoms'
import InfoCallout from '../../comps/info-callout'

const PersonComponent: FunctionComponent<{ item?: Connection; index?: number }> = ({
    index,
    item,
}) => {
    const [mouseEvent, setMouseEvent] = useState<MouseEvent | null>(null)
    const theme = useTheme()
    if (!item || index === undefined) return null
    return (
        <>
            <Stack
                key={item.remoteSocketId}
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
                    text={item.partnerName || `<${item.remoteSocketId}>`}
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
                        text: item.partnerName,
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
    const connections = useRecoilValue(connectionsState)
    const onRenderPerson = useCallback(
        (item?: Connection, index?: number) => <PersonComponent item={item} index={index} />,
        [],
    )
    const [showInfo, setShowInfo] = useState(false)
    return (
        <Stack verticalAlign="center" className={vFluid}>
            {!connections.length ? (
                <div className={message}>
                    <span>You are currently alone right now, invite some people to join</span>
                    <DefaultButton
                        onClick={() => setShowInfo(!showInfo)}
                        text="Info"
                        className="info-button-in-person-list"
                        style={{ marginTop: '.5em' }}
                    />
                </div>
            ) : (
                <Stack className={vFluid} horizontalAlign="center">
                    {/* <SearchBox
                        underlined
                        placeholder="Search people..."
                        className={searchbox}
                        ariaLabel="Search for people in this meeting"
                    /> */}
                    <DefaultButton
                        onClick={() => setShowInfo(!showInfo)}
                        text="Info"
                        className="info-button-in-person-list"
                        style={{ marginBottom: '.5em' }}
                    />
                    <List
                        style={{ width: '100%' }}
                        className={vScroll}
                        items={connections}
                        onRenderCell={onRenderPerson}
                    />
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
