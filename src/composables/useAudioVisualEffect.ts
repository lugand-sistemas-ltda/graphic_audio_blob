import { onMounted, onUnmounted } from 'vue'
import type { AudioFrequencyData } from './useAudioAnalyzer'

interface EffectOptions {
    audioDataProvider?: () => AudioFrequencyData | null
    enableMouseControl?: boolean
    circleCount?: number
}

export const useAudioVisualEffect = (options: EffectOptions = {}) => {
    const {
        audioDataProvider,
        enableMouseControl = true,
        circleCount = 3
    } = options

    let lastColorUpdate = 0
    const colorUpdateDelay = 500
    const currentColors: number[][] = Array.from({ length: 10 }, () => [0, 0, 0])
    const targetColors: number[][] = Array.from({ length: 10 }, () => [0, 0, 0])
    let animationFrame: number | null = null
    let baseSphereSize = 300 // Tamanho base da esfera (controlável) - valor inicial 300px
    let sphereReactivity = 100 // Reatividade ao áudio (0-200%) - valor inicial 100%

    // Múltiplos círculos
    const circles: Array<{ x: number; y: number; size: number }> = []

    const range = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    const getBaseColor = (): number[] => {
        if (audioDataProvider) {
            const data = audioDataProvider()
            if (data) {
                // Mapeia frequências para cores RGB
                return [
                    Math.floor((data.bass / 255) * 255),
                    Math.floor((data.mid / 255) * 255),
                    Math.floor((data.treble / 255) * 255)
                ]
            }
        }

        return [range(0, 255), range(0, 255), range(0, 255)]
    }

    const getColorVariation = (baseColor: number[]): number[] => {
        const variation = range(-50, 50)
        return [
            Math.max(0, Math.min(255, (baseColor[0] ?? 0) + variation)),
            Math.max(0, Math.min(255, (baseColor[1] ?? 0) + variation)),
            Math.max(0, Math.min(255, (baseColor[2] ?? 0) + variation))
        ]
    }

    const getRandomColor = (baseColor?: number[]): number[] => {
        if (baseColor) {
            return getColorVariation(baseColor)
        }
        return getBaseColor()
    }

    const interpolateColor = (current: number[], target: number[], progress: number): number[] => {
        const safeProgress = Math.max(0, Math.min(1, progress))
        return [
            Math.round((current[0] ?? 0) + ((target[0] ?? 0) - (current[0] ?? 0)) * safeProgress),
            Math.round((current[1] ?? 0) + ((target[1] ?? 0) - (current[1] ?? 0)) * safeProgress),
            Math.round((current[2] ?? 0) + ((target[2] ?? 0) - (current[2] ?? 0)) * safeProgress)
        ]
    }

    const updateCircles = (data: AudioFrequencyData) => {
        // Círculo 1 - reage aos graves
        if (circles[0]) {
            circles[0].size = 100 + (data.bass / 255) * 500
            document.documentElement.style.setProperty('--circle-1-size', `${circles[0].size}px`)
        }

        // Círculo 2 - reage aos médios
        if (circles[1]) {
            circles[1].size = 100 + (data.mid / 255) * 500
            document.documentElement.style.setProperty('--circle-2-size', `${circles[1].size}px`)
        }

        // Círculo 3 - reage aos agudos
        if (circles[2]) {
            circles[2].size = 100 + (data.treble / 255) * 500
            document.documentElement.style.setProperty('--circle-3-size', `${circles[2].size}px`)
        }

        // Efeito de "pulso" na batida
        if (data.beat) {
            document.documentElement.style.setProperty('--beat-pulse', '1.2')
            setTimeout(() => {
                document.documentElement.style.setProperty('--beat-pulse', '1')
            }, 100)
        }
    }

    const animateColors = () => {
        const progress = Math.min((Date.now() - lastColorUpdate) / colorUpdateDelay, 1)

        // Atualiza dados de áudio
        if (audioDataProvider) {
            const data = audioDataProvider()
            if (data) {
                updateCircles(data)

                // Calcula o tamanho máximo baseado na viewport (diagonal da tela)
                const viewportWidth = window.innerWidth
                const viewportHeight = window.innerHeight
                const maxScreenSize = Math.hypot(viewportWidth, viewportHeight) / 2

                // O slider controla a porcentagem do tamanho máximo (20% a 100%)
                const sizePercentage = baseSphereSize / 500 // 100px=0.2, 500px=1.0
                const baseSize = maxScreenSize * sizePercentage * 0.6 // até 60% da diagonal

                // Reatividade controla a intensidade da expansão (0% a 200%)
                // 0% = sem expansão, 100% = padrão (30%), 200% = máxima expansão (60%)
                const reactivityFactor = sphereReactivity / 100 // 0 a 2
                const volumeRatio = data.overall / 255 // 0 a 1
                const volumeVariation = baseSize * 0.3 * reactivityFactor * volumeRatio

                // Com reatividade alta, permite ultrapassar o tamanho da tela
                const finalSize = reactivityFactor <= 1
                    ? Math.min(baseSize + volumeVariation, maxScreenSize)
                    : baseSize + volumeVariation // Sem limite!

                document.documentElement.style.setProperty('--gradient-size', `${finalSize}px`)
            }
        }

        // Verifica se o Chameleon Mode está ativo
        const isChameleonMode = document.documentElement.classList.contains('chameleon-mode')

        // Atualiza cores
        for (let i = 0; i < 10; i++) {
            let colorValue: string

            if (isChameleonMode && i < 8) {
                // Modo Camaleão: usa as cores das camadas (0-7)
                const root = document.documentElement
                const chameleonRgb = getComputedStyle(root).getPropertyValue(`--chameleon-layer-${i}`).trim()
                colorValue = `rgb(${chameleonRgb})`
            } else {
                // Modo normal: interpola as cores aleatórias
                const current = currentColors[i]
                const target = targetColors[i]

                if (!current || !target) continue

                const interpolated = interpolateColor(current, target, progress)
                colorValue = `rgb(${interpolated[0]}, ${interpolated[1]}, ${interpolated[2]})`
            }

            document.documentElement.style.setProperty(
                `--random-color-${i}`,
                colorValue
            )
        }

        if (progress < 1) {
            animationFrame = requestAnimationFrame(animateColors)
        } else {
            for (let i = 0; i < 10; i++) {
                const target = targetColors[i]
                if (target) {
                    currentColors[i] = [...target]
                }
            }

            // Continua animando se houver áudio
            if (audioDataProvider) {
                animationFrame = requestAnimationFrame(animateColors)
            }
        }
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!enableMouseControl) return

        const x = (e.clientX / window.innerWidth) * 100
        const y = (e.clientY / window.innerHeight) * 100

        document.documentElement.style.setProperty('--mouse-x', `${x}%`)
        document.documentElement.style.setProperty('--mouse-y', `${y}%`)

        const now = Date.now()
        if (now - lastColorUpdate > colorUpdateDelay) {
            const baseColor = getBaseColor()

            for (let i = 0; i < 10; i++) {
                const current = currentColors[i]
                if (current) {
                    targetColors[i] = getRandomColor(baseColor)
                }
            }

            lastColorUpdate = now

            if (animationFrame) {
                cancelAnimationFrame(animationFrame)
            }

            animateColors()
        }
    }

    const startEffect = () => {
        // Inicializa círculos
        for (let i = 0; i < circleCount; i++) {
            circles.push({
                x: 50,
                y: 50,
                size: 500
            })
        }

        // Inicializa cores
        for (let i = 0; i < 10; i++) {
            const color = getRandomColor()
            currentColors[i] = color
            targetColors[i] = [...color]
            document.documentElement.style.setProperty(
                `--random-color-${i}`,
                `rgb(${color[0]}, ${color[1]}, ${color[2]})`
            )
        }

        if (enableMouseControl) {
            document.addEventListener('mousemove', handleMouseMove)
        }

        // Inicia animação contínua se houver áudio
        if (audioDataProvider) {
            animateColors()
        }
    }

    const stopEffect = () => {
        if (enableMouseControl) {
            document.removeEventListener('mousemove', handleMouseMove)
        }
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
        }
    }

    onMounted(startEffect)
    onUnmounted(stopEffect)

    const setSphereSize = (size: number) => {
        baseSphereSize = size
    }

    const setSphereReactivity = (reactivity: number) => {
        sphereReactivity = reactivity
    }

    return {
        startEffect,
        stopEffect,
        setSphereSize,
        setSphereReactivity
    }
}
