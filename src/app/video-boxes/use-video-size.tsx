import { useEffect, useState } from 'react'
import { getVideoBoxSize } from '../../utils/helpers'

const TOP_BAR_HEIGHT = 40
const useVideoSize = (N = 1, AR = 1): { x: number; y: number } => {
    const [size, setSize] = useState<{ X?: number; Y?: number }>({})
    const isMobile = window.matchMedia('(max-width: 480px)').matches

    useEffect(() => {
        const listener = () => {
            // on mobiles, dont listen to change
            if (isMobile) {
                return
            }
            const Y = window.innerHeight - TOP_BAR_HEIGHT
            const X = window.innerWidth
            if (X !== size.X || Y !== size.Y) setSize({ X, Y })
        }
        // initial values
        const Y = window.innerHeight - TOP_BAR_HEIGHT
        const X = window.innerWidth
        setSize({ X, Y })
        window.addEventListener('resize', listener)
        return () => {
            window.removeEventListener('resize', listener)
        }
        // eslint-disable-next-line
    }, [isMobile])

    const { X = 500, Y = 800 } = size // bad defaults
    let { x, y } = getVideoBoxSize(X, Y, N, AR)

    x = isMobile ? X : x
    y = isMobile ? X / AR : y

    return { x, y }
}

export default useVideoSize
