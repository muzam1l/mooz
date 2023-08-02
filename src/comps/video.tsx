import {
  Label,
  useTheme,
  IconButton,
  TooltipHost,
  Icon,
  Persona,
  PersonaSize,
  mergeStyleSets,
  mergeStyles,
  PersonaInitialsColor,
} from '@fluentui/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FC, VideoHTMLAttributes } from 'react'
import { fadeIn } from '../utils/theme/common-styles'
import { useIsSpeaking } from '../hooks/use-is-speaking'
import { MAX_MEDIA_HEIGHT, MAX_MEDIA_WIDTH, Stream } from '../state'
import { ConnectionMenu } from './connection-menu'

const classes = mergeStyleSets({
  video: {
    display: 'block',
    width: '100%',
    backgroundColor: 'transparent',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    height: '100%',
    width: '100%',
  },
  fadeIn: {
    animation: `${fadeIn} .5s ease-in`,
  },
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    position: 'relative',
    maxWidth: MAX_MEDIA_WIDTH,
    maxHeight: MAX_MEDIA_HEIGHT,
  },
  label: {
    padding: '.25em .5em',
  },
  bottomRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export interface VideoBoxProps extends VideoHTMLAttributes<HTMLVideoElement> {
  stream: Stream
  label?: string
  flip?: boolean
  personaText?: string
  noContextualMenu?: boolean
  info?: string
}

const VideoBox: FC<VideoBoxProps> = ({
  stream,
  label,
  personaText,
  noContextualMenu,
  info,
  flip = true,
  ...props
}) => {
  const theme = useTheme()
  const videoElem = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const iconRef = useRef<HTMLButtonElement | null>(null)

  const [showPersona, setShowPersona] = useState(false)

  const updateVideo = useCallback(() => {
    const video = videoElem.current
    if (!video) {
      return
    }
    if (stream.empty) {
      video.srcObject = null
    } else {
      video.srcObject = stream
    }
    if (stream.noVideo) {
      setShowPersona(true)
    } else {
      setShowPersona(false)
    }
    video.classList.add(classes.fadeIn)
    setTimeout(() => {
      video.classList.remove(classes.fadeIn)
    }, 500)
    if (!video.oncanplay) {
      video.oncanplay = () => video.play()
    }
  }, [stream])

  useEffect(() => {
    updateVideo()
  }, [updateVideo])

  useEffect(() => {
    const onAddRemoveTrack = () => {
      updateVideo()
    }
    stream.addEventListener('addtrack', onAddRemoveTrack)
    stream.addEventListener('removetrack', onAddRemoveTrack)

    return () => {
      stream.removeEventListener('addtrack', onAddRemoveTrack)
      stream.removeEventListener('removetrack', onAddRemoveTrack)
    }
  }, [stream, updateVideo])

  const { isSpeaking } = useIsSpeaking(stream)
  const borderColor = isSpeaking
    ? theme.semanticColors.errorText
    : theme.palette.neutralLighter
  return (
    <div
      ref={containerRef}
      className={mergeStyles(classes.container, {
        border: `3px solid ${borderColor}`,
      })}
    >
      <div className={classes.videoContainer}>
        <video
          title={label}
          ref={videoElem}
          className={classes.video}
          controls={false}
          playsInline
          autoPlay
          style={{
            transform: flip ? 'scaleX(-1)' : undefined,
          }}
          {...props}
        >
          Seriously, How old are you and your browser!
        </video>
      </div>
      {showPersona && (
        <div className={classes.overlay}>
          <TooltipHost
            delay={0}
            content={stream.empty ? 'No media' : personaText || label}
          >
            <Persona
              styles={{
                details: { display: 'none' },
                root: {
                  cursor: stream.empty ? 'not-allowed' : 'inherit',
                  userSelect: 'none',
                },
              }}
              initialsColor={
                stream.empty ? PersonaInitialsColor.gray : undefined
              }
              text={personaText || label}
              size={PersonaSize.size72}
            />
          </TooltipHost>
        </div>
      )}
      <div className={classes.bottomRow}>
        {label && (
          <>
            <Label
              style={{ backgroundColor: theme.palette.neutralLighter }}
              className={classes.label}
            >
              {label}
            </Label>
            {info && (
              <TooltipHost
                styles={{ root: { marginRight: '.5em' } }}
                content={info}
                calloutProps={{
                  styles: {
                    root: {
                      whiteSpace: 'pre-wrap',
                    },
                  },
                }}
                id="media-info"
                delay={0}
              >
                <Icon
                  iconName="Info"
                  aria-label="Info"
                  aria-describedby="media-info"
                />
              </TooltipHost>
            )}
          </>
        )}
        {!noContextualMenu && (
          <IconButton
            elementRef={iconRef}
            iconProps={{ iconName: 'More' }}
            style={{ backgroundColor: theme.palette.neutralLighter }}
          />
        )}
      </div>
      {!noContextualMenu && (
        <ConnectionMenu
          label={label}
          clickTarget={iconRef.current}
          target={containerRef.current}
        />
      )}
    </div>
  )
}

export default VideoBox
