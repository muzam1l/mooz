import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { Modal, ContextualMenu, IDragOptions } from '@fluentui/react'
import { classes, mediaModalStyles } from './styles'
import VideoBox, { VideoBoxProps } from '../../comps/video'
import { useLocalState, useRemoteState } from '../../state'
import { userLabel } from '../../utils/helpers'
import { useMediaGridSizes } from '../../hooks/use-media-grid-size'

const dragOptions: IDragOptions = {
  keepInBounds: true,
  moveMenuItemText: 'Move',
  closeMenuItemText: 'Close',
  menu: ContextualMenu,
}

export const Media: FC = () => {
  const [userMedia, displayMedia, preferences] = useLocalState(state => [
    state.userStream,
    state.displayStream,
    state.preferences,
  ])
  const connections = useRemoteState(state => state.connections)

  const screenItems: VideoBoxProps[] = connections
    .filter(c => !c.displayStream.empty)
    .map(c => ({
      stream: c.displayStream,
      label: `${userLabel(c)}'s screen`,
      flip: false,
    }))
  const userItems: VideoBoxProps[] = connections
    .filter(c => !c.userStream.empty)
    .map(c => ({
      stream: c.userStream,
      label: userLabel(c),
    }))

  const [pinnedItem, setPinnedItem] = useState<VideoBoxProps>()
  useEffect(() => {
    // Automatic pins
    // TODO forced pins by user
    if (screenItems.length) {
      // Pin remote screen
      if (pinnedItem?.stream.id !== screenItems[0].stream.id) {
        setPinnedItem(screenItems[0])
      }
    } else if (!screenItems.length && !userItems.length) {
      // Pin user media
      if (pinnedItem?.stream.id !== userMedia.id) {
        setPinnedItem({
          muted: true,
          stream: userMedia,
          label: 'You',
          personaText: preferences.userName,
          noContextualMenu: true,
        })
      }
    } else {
      if (pinnedItem) {
        setPinnedItem(undefined)
      }
    }
  }, [
    connections,
    connections.length,
    pinnedItem,
    preferences.userName,
    screenItems,
    userMedia,
    userItems,
  ])
  const gridItems = screenItems
    .concat(userItems)
    .filter(i => i.stream.id !== pinnedItem?.stream.id)

  const renderLocalMediaModal = (hostId: string, children: ReactNode) => (
    <Modal
      isBlocking
      isModeless
      isOpen
      styles={mediaModalStyles}
      allowTouchBodyScroll
      layerProps={{
        eventBubblingEnabled: true,
        hostId,
      }}
      dragOptions={dragOptions}
    >
      {children}
    </Modal>
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const {
    pinnedContainerWidth,
    gridContainerWidth,
    gridItemWidth,
    gridItemHeight,
  } = useMediaGridSizes({
    container: containerRef.current,
    hasPinnedItem: !!pinnedItem,
    gridItems: gridItems.length,
  })

  const alignContent = pinnedItem ? 'flex-start' : 'center'

  console.log('Media render', connections[0])
  return (
    <div ref={containerRef} className={classes.container}>
      {/* Pinned View */}
      {!!pinnedItem && (
        <div
          style={{ width: pinnedContainerWidth }}
          className={classes.pinnedContainer}
        >
          <VideoBox {...pinnedItem} />
        </div>
      )}
      {/* Grid view */}
      {!!gridItems.length && (
        <div
          style={{
            width: gridContainerWidth,
          }}
          className={classes.gridContainer}
        >
          <div style={{ alignContent }} className={classes.gridInner}>
            {gridItems.map(props => (
              <div
                style={{
                  width: gridItemWidth - 10,
                  height: gridItemHeight - 10,
                }}
                key={props.stream.id}
              >
                <VideoBox {...props} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={classes.userMediaContainer} id="user-media-container" />
      <div
        className={classes.displayMediaContainer}
        id="display-media-container"
      />
      {!!displayMedia.getTracks().length &&
        renderLocalMediaModal(
          'display-media-container',
          <VideoBox
            muted
            flip={false}
            stream={displayMedia}
            label="You are sharing your screen"
            noContextualMenu
          />,
        )}
      {pinnedItem?.stream !== userMedia &&
        renderLocalMediaModal(
          'user-media-container',
          <VideoBox
            muted
            stream={userMedia}
            label="You"
            personaText={preferences.userName}
            noContextualMenu
          />,
        )}
    </div>
  )
}
