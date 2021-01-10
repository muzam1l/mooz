import { useEffect, useRef, useState } from 'react'
import type { FunctionComponent } from 'react'
import { mergeStyles, Stack, useTheme } from '@fluentui/react'

const container = mergeStyles({
    height: 'calc(100vh - 40px)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    overflowY: 'auto'
})

const AR = 4 / 3
const N = 8

const VideoBoxes: FunctionComponent = () => {
    const theme = useTheme()
    const root = useRef<HTMLDivElement | null>(null)
    const [size, setSize] = useState<{ X?: number; Y?: number }>({})
    const isMobile = window.matchMedia('(max-width: 480px)').matches

    useEffect(() => {
        window.onresize = () => {
            // on mobiles, dont listen to change
            if (isMobile) {
                return
            }
            const Y = window.innerHeight - 40
            const X = window.innerWidth
            if (X !== size.X || Y !== size.Y) setSize({ X, Y })
        }
        const Y = window.innerHeight - 40
        const X = window.innerWidth
        setSize({ X, Y })
        // eslint-disable-next-line
    }, [])

    const { X = 500, Y = 800 } = size // very bad defaults
    const { x, y } = getSize(X, Y, N, AR) // eslint-disable-line

    return (
        <div ref={root} className={container}>
            {Array(N)
                .fill(null)
                .map((_, i) => (
                    <Stack
                        key={i} // eslint-disable-line
                        style={{
                            maxHeight: '90vh',
                            maxWidth: `calc( 90vh * ${AR} )`,
                            height: !isMobile ? y : (X / AR),
                            width: !isMobile ? x : X,
                            backgroundColor: theme.palette.neutralLight,
                            border: `1px solid ${theme.palette.white}`,
                        }}
                    />
                ))}
        </div>
    )
}

/* eslint-disable @typescript-eslint/naming-convention, no-plusplus */
/* 
Returns max videobox size
Responsive but slow to render TODO replace with faster soulution
Taken from stackoverflow for squares,modified for rect with aspect ratio 
*/
function getSize(X: number, Y: number, n: number, aspect_ratio = 1): { x: number; y: number } {
    // total number of tiles
    const tile_count: number = n
    // height of rectangle
    const b: number = Y
    // width of rectanlge
    const a: number = X

    // divide the area but the number of tiles to get the max area a tile could cover
    // this optimal size for a tile will more often than not make the tiles overlap, but
    // a tile can never be bigger than this size
    let sizeX: number = Math.sqrt((b * a * aspect_ratio) / tile_count)
    // find the number of whole tiles that can fit into the height
    let numberOfPossibleWholeTilesH: number = Math.floor((b * aspect_ratio) / sizeX)
    // find the number of whole tiles that can fit into the width
    let numberOfPossibleWholeTilesW: number = Math.floor(a / sizeX)
    // works out how many whole tiles this configuration can hold
    let total: number = numberOfPossibleWholeTilesH * numberOfPossibleWholeTilesW

    // if the number of number of whole tiles that the max size tile ends up with is less than the require number of
    // tiles, make the maxSize smaller and recaluate
    while (total < tile_count) {
        sizeX--
        numberOfPossibleWholeTilesH = Math.floor((b * aspect_ratio) / sizeX)
        numberOfPossibleWholeTilesW = Math.floor(a / sizeX)
        total = numberOfPossibleWholeTilesH * numberOfPossibleWholeTilesW
    }

    return {
        x: sizeX,
        y: sizeX / aspect_ratio,
    }
}

export default VideoBoxes
