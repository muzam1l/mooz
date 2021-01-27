import fscreen from 'fscreen'
import { useEffect, useRef, useState } from 'react'
import type { FunctionComponent, PropsWithChildren } from 'react'

interface Props {
    on?: boolean
    fullbody?: boolean
}

/* eslint-disable react/jsx-props-no-spreading */
const Fullscreen: FunctionComponent<PropsWithChildren<Props>> = ({ on, fullbody, ...props }) => {
    const ref = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        if (!fscreen.fullscreenEnabled) return
        try {
            if (on && !fscreen.fullscreenElement) {
                let elem
                if (!fullbody && ref.current) elem = ref.current
                else elem = document.body

                fscreen.requestFullscreen(elem)
            } else if (!on && fscreen.fullscreenElement) {
                fscreen.exitFullscreen()
            }
        } catch (err) {
            // toast('Fullscreen error', Timeout.SHORT)
        }
    }, [on, fullbody])
    return <div ref={ref} {...props} />
}
export default Fullscreen

export const useFullScreen = (): { isFullscreen: boolean } => {
    const [on, setOn] = useState(!!fscreen.fullscreenElement)

    useEffect(() => {
        const listener = () => {
            if (!!fscreen.fullscreenElement && !on) {
                setOn(true)
            } else if (!fscreen.fullscreenElement && on) {
                setOn(false)
            }
        }
        fscreen.addEventListener('fullscreenchange', listener)
        return () => fscreen.removeEventListener('fullscreenchange', listener)
    }, [on])

    return {
        isFullscreen: on,
    }
}
