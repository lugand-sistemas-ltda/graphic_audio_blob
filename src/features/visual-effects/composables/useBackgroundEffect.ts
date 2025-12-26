import { onMounted, onUnmounted } from 'vue'

export const useBackgroundEffect = () => {
    let lastColorUpdate = 0
    const colorUpdateDelay = 500 // 0.5 segundos entre mudanças de cor

    // Cores atuais e alvo para interpolação - inicializa com valores válidos
    const currentColors: number[][] = Array.from({ length: 10 }, () => [0, 0, 0])
    const targetColors: number[][] = Array.from({ length: 10 }, () => [0, 0, 0])
    let animationFrame: number | null = null

    const range = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    // Gera uma cor base aleatória
    const getBaseColor = (): number[] => {
        return [
            range(0, 255),
            range(0, 255),
            range(0, 255)
        ]
    }

    // Gera uma variação da cor base (mais clara ou mais escura)
    const getColorVariation = (baseColor: number[]): number[] => {
        const variation = range(-50, 50) // Variação de -50 a +50 em cada canal
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

    const animateColors = () => {
        const progress = Math.min((Date.now() - lastColorUpdate) / colorUpdateDelay, 1)

        for (let i = 0; i < 10; i++) {
            const current = currentColors[i]
            const target = targetColors[i]

            if (!current || !target) continue

            const interpolated = interpolateColor(current, target, progress)
            document.documentElement.style.setProperty(
                `--random-color-${i}`,
                `rgb(${interpolated[0]}, ${interpolated[1]}, ${interpolated[2]})`
            )
        }

        if (progress < 1) {
            animationFrame = requestAnimationFrame(animateColors)
        } else {
            // Copia as cores alvo para as atuais quando a animação termina
            for (let i = 0; i < 10; i++) {
                const target = targetColors[i]
                if (target) {
                    currentColors[i] = [...target]
                }
            }
        }
    }

    const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth) * 100
        const y = (e.clientY / window.innerHeight) * 100

        document.documentElement.style.setProperty('--mouse-x', `${x}%`)
        document.documentElement.style.setProperty('--mouse-y', `${y}%`)

        // Atualiza cores apenas se passou o tempo do delay
        const now = Date.now()
        if (now - lastColorUpdate > colorUpdateDelay) {
            // Gera uma nova cor base
            const baseColor = getBaseColor()

            // Gera variações da cor base para todas as cores
            for (let i = 0; i < 10; i++) {
                const current = currentColors[i]
                if (current) {
                    targetColors[i] = getRandomColor(baseColor)
                }
            }

            lastColorUpdate = now

            // Cancela animação anterior se existir
            if (animationFrame) {
                cancelAnimationFrame(animationFrame)
            }

            // Inicia nova animação
            animateColors()
        }
    }

    const startEffect = () => {
        // Inicializa com cores aleatórias
        for (let i = 0; i < 10; i++) {
            const color = getRandomColor()
            currentColors[i] = color
            targetColors[i] = [...color]
            document.documentElement.style.setProperty(
                `--random-color-${i}`,
                `rgb(${color[0]}, ${color[1]}, ${color[2]})`
            )
        }

        document.addEventListener('mousemove', handleMouseMove)
    }

    const stopEffect = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
        }
    }

    onMounted(startEffect)
    onUnmounted(stopEffect)

    return {
        startEffect,
        stopEffect
    }
}
