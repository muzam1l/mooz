const SMOOTHING_FACTOR = 0.95
const UPDATE_INTERVAL = 500

registerProcessor(
    'volume-meter',
    class extends AudioWorkletProcessor {
        volume = 0

        lastUpdateAt = 0

        process(inputs) {
            const input = inputs[0]
            if (!input.length) {
                return true
            }

            const samples = input[0]
            let sum = 0

            for (let i = 0; i < samples.length; ++i) {
                sum += Math.abs(samples[i])
            }

            const curr = sum / samples.length
            this.volume = Math.max(curr, this.volume * SMOOTHING_FACTOR)

            this.lastUpdateAt = this.lastUpdateAt || Date.now()
            if (Date.now() - this.lastUpdateAt > UPDATE_INTERVAL) {
                this.port.postMessage({ volume: this.volume })
                this.lastUpdateAt = Date.now()
            }

            return true
        }
    },
)
