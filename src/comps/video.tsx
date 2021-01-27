import { keyframes, mergeStyles } from '@fluentui/react'
import { useEffect, useRef } from 'react'
import type { FunctionComponent, VideoHTMLAttributes } from 'react'

const fadeInAnim = keyframes({
    from: {
        opacity: 0,
    },
    to: {
        opacity: 1,
    },
})

const fadeIn = mergeStyles({
    animation: `${fadeInAnim} .5s ease-in`,
})

const videoCLassname = mergeStyles({
    display: 'block',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
})
interface VideoBoxProps extends VideoHTMLAttributes<HTMLVideoElement> {
    stream: MediaStream
}
/* eslint-disable jsx-a11y/media-has-caption */
const VideoBox: FunctionComponent<VideoBoxProps> = ({ stream, ...props }) => {
    const videoElem = useRef<HTMLVideoElement | null>(null)
    useEffect(() => {
        const video = videoElem.current
        if (video) {
            video.classList.add(fadeIn)
            setTimeout(() => {
                video.classList.remove(fadeIn)
            }, 500)
            video.srcObject = stream
            video.oncanplay = () => video.play()
        }
    }, [stream, videoElem])

    return (
        <video
            ref={videoElem}
            className={videoCLassname}
            controls={false}
            playsInline
            autoPlay
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            Seriously, How old are you and your browser!
        </video>
    )
}

export default VideoBox
