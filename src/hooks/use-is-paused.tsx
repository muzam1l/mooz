import { useEffect, useState } from 'react'

export const useIsPaused = (
  video?: HTMLVideoElement | null,
): { isPaused: boolean } => {
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!video || !video.srcObject) {
      if (isPaused) {
        setIsPaused(false)
      }
      return
    }

    const onPaused = () => {
      setIsPaused(true)
    }
    const onPlay = () => {
      setIsPaused(false)
    }
    video.addEventListener('pause', onPaused)
    video.addEventListener('play', onPlay)
    return () => { 
      video.removeEventListener('pause', onPaused)
      video.removeEventListener('play', onPlay)
    }
  }, [isPaused, video])

  return { isPaused }
}
