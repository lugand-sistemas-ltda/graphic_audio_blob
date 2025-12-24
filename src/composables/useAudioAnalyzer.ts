import { ref, onUnmounted } from 'vue'

export interface AudioFrequencyData {
    bass: number       // Graves (0-255)
    mid: number        // Médios (0-255)
    treble: number     // Agudos (0-255)
    overall: number    // Volume geral (0-255)
    beat: boolean      // Detecta batida
    raw: Uint8Array    // Dados brutos
    frequencyBands: number[] // Bandas de frequência detalhadas (para visualização espectral)
}

export const useAudioAnalyzer = () => {
    const audioContext = ref<AudioContext | null>(null)
    const analyser = ref<AnalyserNode | null>(null)
    const dataArray = ref<Uint8Array<ArrayBuffer> | null>(null)
    const audioElement = ref<HTMLAudioElement | null>(null)
    const isPlaying = ref(false)
    const currentTime = ref(0)
    const duration = ref(0)

    // Beat detection
    let lastBeatTime = 0
    let beatThreshold = 200 // Limiar para detectar batida
    let lastVolume = 0
    let timeUpdateInterval: number | null = null

    const getFrequencyData = (): AudioFrequencyData | null => {
        if (!analyser.value || !dataArray.value) return null

        analyser.value.getByteFrequencyData(dataArray.value)

        const bufferLength = dataArray.value.length
        const bass = dataArray.value.slice(0, bufferLength / 4)
        const mid = dataArray.value.slice(bufferLength / 4, bufferLength / 2)
        const treble = dataArray.value.slice(bufferLength / 2)

        // Calcula médias
        const avgBass = bass.reduce((a, b) => a + b, 0) / bass.length
        const avgMid = mid.reduce((a, b) => a + b, 0) / mid.length
        const avgTreble = treble.reduce((a, b) => a + b, 0) / treble.length
        const overall = dataArray.value.reduce((a, b) => a + b, 0) / bufferLength

        // Beat detection - detecta aumento súbito de volume
        const now = Date.now()
        const volumeIncrease = overall - lastVolume
        const timeSinceLastBeat = now - lastBeatTime

        let beat = false
        if (volumeIncrease > beatThreshold && timeSinceLastBeat > 300) {
            beat = true
            lastBeatTime = now
        }

        lastVolume = overall

        // Cria bandas de frequência detalhadas para visualização espectral
        // Divide o espectro em 8 bandas logarítmicas (mais detalhes nos graves)
        const numBands = 8
        const frequencyBands: number[] = []

        for (let i = 0; i < numBands; i++) {
            const startIndex = Math.floor((i / numBands) * bufferLength)
            const endIndex = Math.floor(((i + 1) / numBands) * bufferLength)
            const bandSlice = dataArray.value.slice(startIndex, endIndex)
            const bandAvg = bandSlice.reduce((a, b) => a + b, 0) / bandSlice.length
            frequencyBands.push(bandAvg)
        }

        return {
            bass: avgBass,
            mid: avgMid,
            treble: avgTreble,
            overall,
            beat,
            raw: dataArray.value,
            frequencyBands
        }
    }

    const initAudio = async (audioFile: string): Promise<boolean> => {
        try {
            // Limpa áudio anterior se existir
            if (audioElement.value) {
                audioElement.value.pause()
                audioElement.value.src = ''
            }

            if (!audioContext.value) {
                audioContext.value = new AudioContext()
                analyser.value = audioContext.value.createAnalyser()
                analyser.value.fftSize = 512
                analyser.value.smoothingTimeConstant = 0.8

                const bufferLength = analyser.value.frequencyBinCount
                dataArray.value = new Uint8Array(bufferLength)
            }

            audioElement.value = new Audio(audioFile)
            audioElement.value.crossOrigin = 'anonymous'

            // Event listeners
            audioElement.value.addEventListener('loadedmetadata', () => {
                if (audioElement.value) {
                    duration.value = audioElement.value.duration
                }
            })

            audioElement.value.addEventListener('ended', () => {
                isPlaying.value = false
            })

            // Verifica se analyser foi criado
            if (!analyser.value) {
                throw new Error('Analyser não foi inicializado')
            }

            const source = audioContext.value.createMediaElementSource(audioElement.value)
            source.connect(analyser.value)
            analyser.value.connect(audioContext.value.destination)

            return true
        } catch (error) {
            console.error('Erro ao inicializar áudio:', error)
            return false
        }
    }

    const play = async () => {
        if (audioElement.value && audioContext.value) {
            try {
                await audioContext.value.resume()
                await audioElement.value.play()
                isPlaying.value = true

                // Atualiza currentTime periodicamente
                startTimeUpdate()
            } catch (error) {
                console.error('Erro ao reproduzir áudio:', error)
            }
        }
    }

    const pause = () => {
        if (audioElement.value) {
            audioElement.value.pause()
            isPlaying.value = false
            stopTimeUpdate()
        }
    }

    const seek = (time: number) => {
        if (audioElement.value) {
            audioElement.value.currentTime = time
            currentTime.value = time
        }
    }

    const startTimeUpdate = () => {
        stopTimeUpdate()
        timeUpdateInterval = globalThis.setInterval(() => {
            if (audioElement.value) {
                currentTime.value = audioElement.value.currentTime
            }
        }, 100) // Atualiza a cada 100ms
    }

    const stopTimeUpdate = () => {
        if (timeUpdateInterval) {
            clearInterval(timeUpdateInterval)
            timeUpdateInterval = null
        }
    }

    const setVolume = (volume: number) => {
        if (audioElement.value) {
            audioElement.value.volume = Math.max(0, Math.min(1, volume))
        }
    }

    const setBeatSensitivity = (sensitivity: number) => {
        beatThreshold = sensitivity
    }

    const cleanup = () => {
        pause()
        stopTimeUpdate()
        if (audioContext.value) {
            audioContext.value.close()
        }
    }

    onUnmounted(cleanup)

    return {
        initAudio,
        play,
        pause,
        seek,
        setVolume,
        setBeatSensitivity,
        getFrequencyData,
        isPlaying,
        currentTime,
        duration,
        audioElement
    }
}
