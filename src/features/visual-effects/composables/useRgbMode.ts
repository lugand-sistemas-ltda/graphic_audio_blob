import { ref, onUnmounted, inject, watch, computed } from 'vue'
import { useGlobalTheme } from '../../../core/global'

const rgbAnimationId = ref<number | null>(null)
const currentHue = ref(0)

export function useRgbMode() {
    // Acessa o gerenciador global de tema
    const globalTheme = useGlobalTheme()
    const windowId = inject<string>('windowId', 'unknown')

    // Computed para o estado do RGB mode (do estado global)
    const isRgbModeActive = computed(() => globalTheme.state.value.rgbMode.enabled)

    // Converte HSL para RGB (DECLARADO ANTES DE SER USADO)
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

    const startRgbAnimation = () => {
        if (rgbAnimationId.value !== null) return

        const animate = () => {
            // Incrementa o hue de 0 a 360 graus (ciclo completo de cores)
            const speed = globalTheme.state.value.rgbMode.speed
            currentHue.value = (currentHue.value + (0.5 * speed)) % 360

            // Usa configurações do global state
            const saturation = globalTheme.state.value.rgbMode.saturation
            const brightness = globalTheme.state.value.rgbMode.brightness

            // Converte HSL para RGB
            const rgb = hslToRgb(currentHue.value, saturation * 0.85, brightness * 0.6)

            // Atualiza a variável CSS customizada
            document.documentElement.style.setProperty(
                '--theme-primary-rgb',
                `${rgb.r}, ${rgb.g}, ${rgb.b}`
            )

            // Atualiza também as cores derivadas para manter consistência
            const brightRgb = hslToRgb(currentHue.value, saturation * 0.9, brightness * 0.7)
            const dimRgb = hslToRgb(currentHue.value, saturation * 0.8, brightness * 0.4)

            document.documentElement.style.setProperty(
                '--theme-primary',
                `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
            )
            document.documentElement.style.setProperty(
                '--theme-primary-bright',
                `rgb(${brightRgb.r}, ${brightRgb.g}, ${brightRgb.b})`
            )
            document.documentElement.style.setProperty(
                '--theme-primary-dim',
                `rgb(${dimRgb.r}, ${dimRgb.g}, ${dimRgb.b})`
            )

            rgbAnimationId.value = requestAnimationFrame(animate)
        }

        animate()
    }

    const stopRgbAnimation = () => {
        if (rgbAnimationId.value !== null) {
            cancelAnimationFrame(rgbAnimationId.value)
            rgbAnimationId.value = null
        }

        // Restaura as cores do tema atual
        const currentTheme = document.documentElement.dataset.theme
        if (currentTheme) {
            // Remove os overrides e força recalculo do tema
            document.documentElement.style.removeProperty('--theme-primary-rgb')
            document.documentElement.style.removeProperty('--theme-primary')
            document.documentElement.style.removeProperty('--theme-primary-bright')
            document.documentElement.style.removeProperty('--theme-primary-dim')

            // Força o navegador a recalcular as variáveis CSS
            document.documentElement.dataset.theme = ''
            setTimeout(() => {
                document.documentElement.dataset.theme = currentTheme
            }, 0)
        }
    }

    const toggleRgbMode = () => {
        globalTheme.toggleRgbMode(windowId)
    }

    // Watch para iniciar/parar animação quando o estado global mudar
    watch(isRgbModeActive, (active) => {
        if (active) {
            startRgbAnimation()
        } else {
            stopRgbAnimation()
        }
    }, { immediate: true })

    // Cleanup ao desmontar
    onUnmounted(() => {
        if (isRgbModeActive.value) {
            stopRgbAnimation()
        }
    })

    return {
        isRgbModeActive,
        toggleRgbMode
    }
}
