import { ContextualMenu, ContextualMenuItemType } from '@fluentui/react'
import { FC, useEffect, useState } from 'react'
import toast, { Timeout, ToastType } from './toast'

export const ConnectionMenu: FC<{
  label?: string
  target: HTMLElement | null
  clickTarget?: HTMLElement | null
}> = ({ label, target, clickTarget }) => {
  const [mouseEvent, setMouseEvent] = useState<MouseEvent | null>(null)

  const setEvent = (e: MouseEvent) => {
    e.preventDefault()
    setMouseEvent(e)
  }

  useEffect(() => {
    target?.addEventListener('contextmenu', setEvent)
    return () => {
      target?.removeEventListener('contextmenu', setEvent)
    }
  }, [target])

  useEffect(() => {
    clickTarget?.addEventListener('click', setEvent)
    return () => {
      clickTarget?.removeEventListener('click', setEvent)
    }
  }, [clickTarget])

  const notImplemented = () => {
    toast('Not Implemented yet', {
      autoClose: Timeout.SHORT,
      type: ToastType.severeWarning,
    })
  }
  return (
    <ContextualMenu
      items={[
        {
          key: 'header1',
          itemType: ContextualMenuItemType.Header,
          text: label,
        },
        {
          key: 'mute',
          text: 'Mute',
          iconProps: { iconName: 'MicOff' },
          onClick: notImplemented,
        },
        {
          key: 'hide',
          text: 'Hide',
          iconProps: { iconName: 'VideoOff' },
          onClick: notImplemented,
        },
        {
          key: 'divider1',
          itemType: ContextualMenuItemType.Divider,
        },
        {
          key: 'kick',
          text: 'Kick out',
          iconProps: { iconName: 'SignOut' },
          onClick: notImplemented,
        },
      ]}
      onDismiss={() => {
        setMouseEvent(null)
      }}
      hidden={!mouseEvent}
      target={mouseEvent}
    />
  )
}
