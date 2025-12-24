import { ref, onUnmounted } from 'vue'

const isChameleonModeActive = ref(false)
const chameleonAnimationId = ref<number | null>(null)

// Múltiplos offsets de hue para criar gradientes diferentes em cada elemento
const hueOffsets = ref({
    primary: 0,
    secondary: 120,
    tertiary: 240,
    quaternary: 60
})

export function useChameleonMode() {
    const startChameleonAnimation = () => {
        if (chameleonAnimationId.value !== null) return

        const animate = () => {
            // Incrementa cada offset em velocidades ligeiramente diferentes
            // para criar um efeito mais orgânico e "camaleônico"
            hueOffsets.value.primary = (hueOffsets.value.primary + 0.7) % 360
            hueOffsets.value.secondary = (hueOffsets.value.secondary + 0.5) % 360
            hueOffsets.value.tertiary = (hueOffsets.value.tertiary + 0.9) % 360
            hueOffsets.value.quaternary = (hueOffsets.value.quaternary + 0.6) % 360

            // Calcula cores para gradientes
            const color1 = hslToRgb(hueOffsets.value.primary, 85, 60)
            const color2 = hslToRgb(hueOffsets.value.secondary, 85, 60)
            const color3 = hslToRgb(hueOffsets.value.tertiary, 85, 60)
            const color4 = hslToRgb(hueOffsets.value.quaternary, 85, 60)

            // Cria 8 cores diferentes para as 8 camadas da esfera
            // Cada camada terá uma cor única do espectro
            const layerColors = []
            for (let i = 0; i < 8; i++) {
                // Distribui as cores uniformemente pelo espectro (0-360 graus)
                const layerHue = (hueOffsets.value.primary + (i * 45)) % 360
                const layerColor = hslToRgb(layerHue, 85, 60)
                layerColors.push(layerColor)

                // Define variável CSS para cada camada
                document.documentElement.style.setProperty(
                    `--chameleon-layer-${i}`,
                    `${layerColor.r}, ${layerColor.g}, ${layerColor.b}`
                )
            }

            // Define variáveis CSS para gradientes
            document.documentElement.style.setProperty(
                '--chameleon-gradient-1',
                `linear-gradient(135deg, 
                    rgb(${color1.r}, ${color1.g}, ${color1.b}) 0%, 
                    rgb(${color2.r}, ${color2.g}, ${color2.b}) 50%, 
                    rgb(${color3.r}, ${color3.g}, ${color3.b}) 100%)`
            )

            document.documentElement.style.setProperty(
                '--chameleon-gradient-2',
                `linear-gradient(45deg, 
                    rgb(${color2.r}, ${color2.g}, ${color2.b}) 0%, 
                    rgb(${color3.r}, ${color3.g}, ${color3.b}) 50%, 
                    rgb(${color4.r}, ${color4.g}, ${color4.b}) 100%)`
            )

            document.documentElement.style.setProperty(
                '--chameleon-gradient-3',
                `linear-gradient(225deg, 
                    rgb(${color3.r}, ${color3.g}, ${color3.b}) 0%, 
                    rgb(${color4.r}, ${color4.g}, ${color4.b}) 50%, 
                    rgb(${color1.r}, ${color1.g}, ${color1.b}) 100%)`
            )

            // Cores sólidas para textos (média das cores do gradiente)
            const avgColor1 = averageColors(color1, color2)
            const avgColor2 = averageColors(color2, color3)
            const avgColor3 = averageColors(color3, color4)

            document.documentElement.style.setProperty(
                '--chameleon-color-1',
                `rgb(${avgColor1.r}, ${avgColor1.g}, ${avgColor1.b})`
            )

            document.documentElement.style.setProperty(
                '--chameleon-color-2',
                `rgb(${avgColor2.r}, ${avgColor2.g}, ${avgColor2.b})`
            )

            document.documentElement.style.setProperty(
                '--chameleon-color-3',
                `rgb(${avgColor3.r}, ${avgColor3.g}, ${avgColor3.b})`
            )

            // Gradiente animado para bordas (rotação contínua)
            document.documentElement.style.setProperty(
                '--chameleon-border-gradient',
                `conic-gradient(from ${hueOffsets.value.primary}deg,
                    rgb(${color1.r}, ${color1.g}, ${color1.b}),
                    rgb(${color2.r}, ${color2.g}, ${color2.b}),
                    rgb(${color3.r}, ${color3.g}, ${color3.b}),
                    rgb(${color4.r}, ${color4.g}, ${color4.b}),
                    rgb(${color1.r}, ${color1.g}, ${color1.b}))`
            )

            chameleonAnimationId.value = requestAnimationFrame(animate)
        }

        animate()
    }

    const stopChameleonAnimation = () => {
        if (chameleonAnimationId.value !== null) {
            cancelAnimationFrame(chameleonAnimationId.value)
            chameleonAnimationId.value = null
        }

        // Remove todas as variáveis CSS do modo camaleão
        document.documentElement.style.removeProperty('--chameleon-gradient-1')
        document.documentElement.style.removeProperty('--chameleon-gradient-2')
        document.documentElement.style.removeProperty('--chameleon-gradient-3')
        document.documentElement.style.removeProperty('--chameleon-color-1')
        document.documentElement.style.removeProperty('--chameleon-color-2')
        document.documentElement.style.removeProperty('--chameleon-color-3')
        document.documentElement.style.removeProperty('--chameleon-border-gradient')

        // Remove variáveis das camadas da esfera
        for (let i = 0; i < 8; i++) {
            document.documentElement.style.removeProperty(`--chameleon-layer-${i}`)
        }

        // Força o navegador a recalcular as variáveis CSS do tema original
        const currentTheme = document.documentElement.dataset.theme
        if (currentTheme) {
            document.documentElement.dataset.theme = ''
            setTimeout(() => {
                document.documentElement.dataset.theme = currentTheme
            }, 0)
        }
    }

    const toggleChameleonMode = () => {
        isChameleonModeActive.value = !isChameleonModeActive.value

        if (isChameleonModeActive.value) {
            startChameleonAnimation()
            // Adiciona classe ao body para aplicar estilos especiais
            document.documentElement.classList.add('chameleon-mode')
        } else {
            stopChameleonAnimation()
            document.documentElement.classList.remove('chameleon-mode')
        }

        // Persiste no localStorage
        localStorage.setItem('chameleon-mode-active', isChameleonModeActive.value.toString())
    }

    // Converte HSL para RGB
    const hslToRgb = (h: number, s: number, l: number) => {
        s /= 100
        l /= 100

        const c = (1 - Math.abs(2 * l - 1)) * s
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
        const m = l - c / 2

        let r = 0,
            g = 0,
            b = 0

        if (h >= 0 && h < 60) {
            r = c
            g = x
        } else if (h >= 60 && h < 120) {
            r = x
            g = c
        } else if (h >= 120 && h < 180) {
            g = c
            b = x
        } else if (h >= 180 && h < 240) {
            g = x
            b = c
        } else if (h >= 240 && h < 300) {
            r = x
            b = c
        } else if (h >= 300 && h < 360) {
            r = c
            b = x
        }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        }
    }

    // Calcula a média entre duas cores
    const averageColors = (color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }) => {
        return {
            r: Math.round((color1.r + color2.r) / 2),
            g: Math.round((color1.g + color2.g) / 2),
            b: Math.round((color1.b + color2.b) / 2)
        }
    }

    // Carrega estado do localStorage ao inicializar
    const savedState = localStorage.getItem('chameleon-mode-active')
    if (savedState === 'true') {
        isChameleonModeActive.value = true
        startChameleonAnimation()
        document.documentElement.classList.add('chameleon-mode')
    }

    // Cleanup ao desmontar
    onUnmounted(() => {
        if (isChameleonModeActive.value) {
            stopChameleonAnimation()
        }
    })

    return {
        isChameleonModeActive,
        toggleChameleonMode
    }
}
