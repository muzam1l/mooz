import { Stream } from '../state'

export class VolumeMeter {
  stream: Stream

  track?: MediaStreamTrack

  audioContext?: AudioContext

  node?: AudioWorkletNode

  microphone?: MediaStreamAudioSourceNode

  stopped = false

  cb: (v: number) => void

  constructor(stream: Stream, cb: (v: number) => void) {
    this.stream = stream
    this.cb = cb
    this.track = this.stream.getAudioTracks()[0]

    this.stream.addEventListener('removetrack', e => {
      if (e.track === this.track) {
        this.stop()
      }
    })
    this.stream.addEventListener('addtrack', e => {
      if (e.track.kind !== 'audio') {
        return
      }
      this.stop()
      this.start()
    })
  }

  async start() {
    if (this.stream.noAudio) {
      return
    }
    const audioContext = new AudioContext()
    this.audioContext = audioContext
    this.track = this.stream.getAudioTracks()[0]
    this.stopped = false
    audioContext.audioWorklet.addModule('/scripts/volume-meter.js').then(() => {
      const microphone = audioContext.createMediaStreamSource(this.stream)
      const node = new AudioWorkletNode(audioContext, 'volume-meter')
      node.port.onmessage = event => {
        const { volume } = event.data
        if (volume) {
          this.cb(volume)
        }
      }
      microphone.connect(node).connect(audioContext.destination)
      this.node = node
      this.microphone = microphone
    })
  }

  stop() {
    if (this.stopped) {
      return
    }
    this.stopped = true
    this.audioContext?.close()
    this.node?.disconnect()
    this.microphone?.disconnect()
  }
}

export const blankVideo = ({ width = 640, height = 480 } = {}) => {
  const canvas = Object.assign(document.createElement('canvas'), {
    width,
    height,
  })
  canvas.getContext('2d')?.fillRect(0, 0, width, height)
  const stream = canvas.captureStream()
  return Object.assign(stream.getVideoTracks()[0], { enabled: false })
}

export const silence = () => {
  const ctx = new AudioContext()
  const oscillator = ctx.createOscillator()
  const dst = ctx.createMediaStreamDestination()
  oscillator.connect(dst)
  oscillator.start()
  const track = dst.stream.getAudioTracks()[0]
  track.stop()
  return Object.assign(track, { enabled: false })
}
