import { useEffect, useRef, useState } from 'react'
import { VolumeMeter } from '../utils/audio'
import { Stream } from '../state'

export const useIsSpeaking = (stream: Stream): { isSpeaking: boolean } => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const volumeMeterRef = useRef<VolumeMeter>()

  useEffect(() => {
    if (!volumeMeterRef.current) {
      volumeMeterRef.current = new VolumeMeter(stream, (volume: number) => {
        // TODO improve render performance
        if (volume > 0.01) {
          setIsSpeaking(true)
        } else {
          setIsSpeaking(false)
        }
      })
      volumeMeterRef.current.start()
    }
  }, [stream])

  return { isSpeaking }
}
