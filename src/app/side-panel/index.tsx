import { useCallback } from 'react'
import { Panel, Pivot, PivotItem, Stack } from '@fluentui/react'
import type { IRenderFunction, IPanelProps } from '@fluentui/react'
import ChatPanel from './chats'
import PeoplePanel from './people'
import { classes, panelStyles, pivotStyles } from './styles'
import { useLocalState } from '../../state'
import { capitalize } from '../../utils/helpers'

interface SidePanelProps {}

const SidePanel: React.FC<SidePanelProps> = () => {
  const [panel] = useLocalState(state => [state.sidePanelTab])
  const setPanel = (sidePanelTab: typeof panel) =>
    useLocalState.setState({
      sidePanelTab,
    })

  const keys: NonNullable<typeof panel>[] = ['chats', 'people']

  const title = capitalize(panel)
  const onRenderNavigationContent: IRenderFunction<IPanelProps> = useCallback(
    (props, defaultRender) => (
      <Stack
        className={classes.fluid}
        horizontal
        horizontalAlign="space-between"
      >
        <h1 className={classes.heading}>{title}</h1>
        {defaultRender?.(props)}
      </Stack>
    ),
    [title],
  )
  return (
    <div>
      <Panel
        styles={panelStyles}
        onRenderNavigationContent={onRenderNavigationContent}
        isHiddenOnDismiss
        isBlocking={false}
        isOpen={!!panel}
        onDismiss={() => setPanel(undefined)}
        closeButtonAriaLabel="Close"
        isFooterAtBottom // for full height
      >
        <Pivot
          selectedKey={panel || keys[0]}
          onLinkClick={item => {
            const key = item?.props.itemKey as typeof panel
            if (key) {
              setPanel(key)
            }
          }}
          className={classes.pivotContainer}
          styles={pivotStyles}
          aria-label="Switch between Chats and People list"
        >
          <PivotItem
            alwaysRender
            itemKey={keys[0]}
            itemIcon="Chat"
            headerText="Chats"
          >
            <ChatPanel />
          </PivotItem>
          <PivotItem
            alwaysRender
            itemKey={keys[1]}
            itemIcon="People"
            headerText="People"
          >
            <PeoplePanel />
          </PivotItem>
        </Pivot>
      </Panel>
    </div>
  )
}
export default SidePanel
