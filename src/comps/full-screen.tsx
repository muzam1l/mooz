import fscreen from 'fscreen'
import { useEffect, useRef } from 'react'
import type { FC, PropsWithChildren } from 'react'
import toast, { Timeout, ToastType } from './toast'
import { useLocalState } from '../state'

interface Props {
  fullbody?: boolean
  dblclick?: boolean
}

const Fullscreen: FC<PropsWithChildren<Props>> = ({
  fullbody = true,
  dblclick = true,
  ...props
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [enabled] = useLocalState(state => [state.fullscreenEnabled])

  useEffect(() => {
    if (!fscreen.fullscreenEnabled) return undefined
    let elem: Element
    if (!fullbody && ref.current) elem = ref.current
    else elem = window.document.body
    try {
      if (enabled && !fscreen.fullscreenElement) {
        fscreen.requestFullscreen(elem)
      } else if (!enabled && fscreen.fullscreenElement) {
        fscreen.exitFullscreen()
      }
    } catch (err) {
      toast('Fullscreen error', {
        autoClose: Timeout.SHORT,
        type: ToastType.error,
      })
    }
    const handleDblClick = () => {
      if (!dblclick) return
      try {
        const isFullscreen = !!fscreen.fullscreenElement
        if (isFullscreen) fscreen.exitFullscreen()
        else {
          fscreen.requestFullscreen(elem)
          toast('Entered into fullscreen mode, double click to toggle', {
            type: ToastType.info,
          })
        }
      } catch (err) {
        toast('Fullscreen error', {
          autoClose: Timeout.SHORT,
          type: ToastType.error,
        })
      }
    }
    elem.addEventListener('doubleclick', handleDblClick)
    return () => elem.removeEventListener('doubleclick', handleDblClick)
  }, [fullbody, dblclick, enabled])
  return <div ref={ref} {...props} />
}
export default Fullscreen
