import { onUnmounted, watch } from 'vue'
import type { AudioFrequencyData } from '../../audio-player/composables/useAudioAnalyzer'
import { useGlobalState } from '../../../core/state'

interface EffectOptions {
    audioDataProvider?: () => AudioFrequencyData | null
    enableMouseControl?: boolean
    layerCount?: number
    windowId?: string | null
}

export const useSpectralVisualEffect = (options: EffectOptions = {}) => {
    const {
        audioDataProvider,
        enableMouseControl = true,
        layerCount = 8, // 8 camadas para 8 bandas de frequência
        windowId = null
    } = options

    let animationFrame: number | null = null
    let baseSphereSize = 300
    let sphereReactivity = 100
    let currentThemeHue = 120 // Valor padrão (verde Matrix)
    let currentThemeSaturation = 85 // Saturação padrão (colorido)
    let isEffectActive = false

    // Novos controles de comportamento
    let mouseFollowEnabled = true // Mouse follow ativo por padrão
    let autoCenterEnabled = true // Auto center ativo por padrão
    let isMouseInsideWindow = true // Detecta se mouse está na janela

    // Obtém estado global para observar effects
    const { state } = windowId ? useGlobalState() : { state: null }

    // Sistema de camadas espectrais
    interface SpectralLayer {
        frequency: number      // Valor atual da frequência (0-255)
        targetFrequency: number // Valor alvo para interpolação suave
        radius: number         // Raio da camada
        color: { h: number; s: number; l: number } // HSL para transições suaves
        wobble: number         // Distorção senoidal da camada
    }

    const layers: SpectralLayer[] = []

    // Mouse control com efeito 3D
    let mouseX = 50
    let mouseY = 50
    let mouse3DOffset = { x: 0, y: 0 }

    // Atualiza o hue e saturação baseados na cor do tema atual
    const updateThemeHue = () => {
        const root = document.documentElement
        const rgb = getComputedStyle(root).getPropertyValue('--theme-primary-rgb').trim()

        if (rgb) {
            // Converte RGB para HSL para obter o hue e saturação
            const values = rgb.split(',').map(v => Number.parseInt(v.trim()) / 255)
            const r = values[0] ?? 0
            const g = values[1] ?? 0
            const b = values[2] ?? 0

            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            let h = 0
            let s = 0

            // Calcula saturação
            const l = (max + min) / 2
            if (max !== min) {
                const d = max - min
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

                // Calcula hue
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
                    case g: h = ((b - r) / d + 2) / 6; break
                    case b: h = ((r - g) / d + 4) / 6; break
                }
            }

            currentThemeHue = Math.round(h * 360)
            currentThemeSaturation = Math.round(s * 100) // Saturação real do tema (0-100%)
        }
    }

    // Observa mudanças no tema (atributo data-theme)
    const themeObserver = new MutationObserver(() => {
        updateThemeHue()
    })

    // Observa mudanças nas variáveis CSS em tempo real (para modo RGB)
    let lastRgbValue = ''
    let rgbPollingInterval: number | null = null

    const startRgbPolling = () => {
        // Verifica mudanças na variável CSS a cada frame
        rgbPollingInterval = globalThis.setInterval(() => {
            const root = document.documentElement
            const currentRgb = getComputedStyle(root).getPropertyValue('--theme-primary-rgb').trim()

            if (currentRgb !== lastRgbValue) {
                lastRgbValue = currentRgb
                updateThemeHue()
            }
        }, 16) // ~60fps
    }

    const stopRgbPolling = () => {
        if (rgbPollingInterval !== null) {
            clearInterval(rgbPollingInterval)
            rgbPollingInterval = null
        }
    }

    // Mapeamento de frequência para cor baseada no tema atual
    const frequencyToColor = (frequency: number, layerIndex: number, totalLayers: number): { h: number; s: number; l: number } => {
        // Usa o hue do tema atual
        const baseHue = currentThemeHue

        // Intensidade da frequência afeta a luminosidade
        const intensity = frequency / 255

        // Camadas internas = mais claro/brilhante (agudos)
        // Camadas externas = mais escuro (graves)
        const layerBrightness = 1 - (layerIndex / totalLayers) * 0.6 // 1.0 a 0.4

        // Para cores acromáticas (cinza/branco), usa saturação baixa
        // Para cores cromáticas, usa saturação alta
        const baseSaturation = currentThemeSaturation < 20
            ? Math.min(currentThemeSaturation + 5, 15) // Cinza/branco: baixa saturação (max 15%)
            : 85 + intensity * 15 // Cores: alta saturação (85-100%)

        const lightness = (15 + layerBrightness * 50) * (0.5 + intensity * 0.5) // 7.5% a 65%

        return { h: baseHue, s: baseSaturation, l: lightness }
    }    // Calcula distorção senoidal para efeito de "wobble"
    const calculateWobble = (frequency: number, time: number, layerIndex: number): number => {
        const baseWobble = Math.sin(time * 0.001 + layerIndex * 0.5) * 10
        const frequencyWobble = (frequency / 255) * 30
        return baseWobble + frequencyWobble
    }

    // Inicializa as camadas
    const initializeLayers = () => {
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const maxScreenSize = Math.hypot(viewportWidth, viewportHeight) / 2

        layers.length = 0

        for (let i = 0; i < layerCount; i++) {
            // Camadas internas menores, camadas externas maiores
            const radiusRatio = (i + 1) / layerCount
            const baseRadius = maxScreenSize * radiusRatio * 0.8

            layers.push({
                frequency: 0,
                targetFrequency: 0,
                radius: baseRadius,
                color: { h: 360 - (i / layerCount) * 280, s: 70, l: 40 },
                wobble: 0
            })
        }
    }

    // Atualiza camadas com dados de áudio
    const updateLayers = (data: AudioFrequencyData) => {
        const time = Date.now()

        // Atualiza cada camada com sua banda de frequência correspondente
        for (let index = 0; index < Math.min(data.frequencyBands.length, layers.length); index++) {
            const bandValue = data.frequencyBands[index]
            const layer = layers[index]

            if (layer && bandValue !== undefined) {
                // Interpolação suave
                layer.targetFrequency = bandValue
                layer.frequency += (layer.targetFrequency - layer.frequency) * 0.15

                // Atualiza cor baseada na frequência
                layer.color = frequencyToColor(layer.frequency, index, layerCount)

                // Calcula wobble
                layer.wobble = calculateWobble(layer.frequency, time, index)
            }
        }

        // Calcula efeito 3D do mouse
        if (enableMouseControl) {
            let targetX: number
            let targetY: number

            // Se mouse follow está desabilitado, sempre fica no centro
            if (!mouseFollowEnabled) {
                targetX = 0
                targetY = 0
                mouseX = 50
                mouseY = 50
            }
            // Se auto-center está ativo e mouse saiu da janela, volta ao centro gradualmente
            else if (autoCenterEnabled && !isMouseInsideWindow) {
                targetX = 0
                targetY = 0
                // Gradualmente volta mouseX e mouseY para o centro
                mouseX += (50 - mouseX) * 0.02 // Transição mais lenta (2% por frame)
                mouseY += (50 - mouseY) * 0.02
            }
            // Comportamento normal - segue o mouse
            else {
                targetX = (mouseX - 50) * 0.5
                targetY = (mouseY - 50) * 0.5
            }

            // Interpolação suave do offset 3D
            mouse3DOffset.x += (targetX - mouse3DOffset.x) * 0.1
            mouse3DOffset.y += (targetY - mouse3DOffset.y) * 0.1
        }
    }

    // Renderiza as camadas no CSS
    const renderLayers = () => {
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const maxScreenSize = Math.hypot(viewportWidth, viewportHeight) / 2

        const sizePercentage = baseSphereSize / 500
        const reactivityFactor = sphereReactivity / 100

        // Gera string de gradiente com múltiplas camadas
        const gradientStops: string[] = []

        // Verifica se o Chameleon Mode está ativo
        const isChameleonMode = document.documentElement.classList.contains('chameleon-mode')

        for (let index = 0; index < layers.length; index++) {
            const layer = layers[index]
            if (!layer) continue

            const intensity = layer.frequency / 255
            const baseRadius = maxScreenSize * sizePercentage * 0.6 * ((index + 1) / layerCount)
            const expansionFactor = 1 + (intensity * 0.3 * reactivityFactor)
            const finalRadius = baseRadius * expansionFactor + layer.wobble

            // Opacidade baseada diretamente na intensidade da frequência
            // Quando frequency = 0 (sem som) → opacity = 0 (invisível)
            // Quando frequency = 255 (volume máximo) → opacity = 1 (totalmente visível)
            // Aplica uma curva suave (power 0.6) para tornar a mudança mais aparente
            // Valores menores que 1 na potência fazem volumes baixos serem mais visíveis
            const frequencyOpacity = Math.pow(intensity, 0.6) // Curva otimizada para resposta visual dramática

            let color: string

            if (isChameleonMode) {
                // Modo Camaleão: cada camada usa sua própria cor do arco-íris
                const root = document.documentElement
                const chameleonRgb = getComputedStyle(root).getPropertyValue(`--chameleon-layer-${index}`).trim()

                // Opacidade controlada pela intensidade da frequência
                color = `rgba(${chameleonRgb}, ${frequencyOpacity})`
            } else {
                // Modo normal: usa a cor do tema baseada na frequência com opacidade dinâmica
                color = `hsla(${layer.color.h}, ${layer.color.s}%, ${layer.color.l}%, ${frequencyOpacity})`
            }

            // Adiciona color stops (cada camada tem início e fim)
            const percentage = (finalRadius / maxScreenSize) * 100
            gradientStops.push(
                `${color} ${Math.max(0, percentage - 2)}%`,
                `${color} ${percentage}%`
            )
        }

        // Adiciona cor final totalmente preta (sem som = fundo preto)
        gradientStops.push(`rgba(0, 0, 0, 1) 100%`)

        // Aplica gradiente com efeito 3D
        const posX = 50 + mouse3DOffset.x
        const posY = 50 + mouse3DOffset.y

        document.body.style.background = `radial-gradient(circle at ${posX}% ${posY}%, ${gradientStops.join(', ')})`

        // Efeito de pulso no beat
        const beatData = audioDataProvider?.()
        if (beatData?.beat) {
            document.body.style.transform = `scale(1.02)`
            setTimeout(() => {
                document.body.style.transform = `scale(1)`
            }, 100)
        }
    }

    // Loop de animação principal
    const animate = () => {
        // Só renderiza se o efeito estiver ativo
        if (!isEffectActive) {
            return
        }

        if (audioDataProvider) {
            const data = audioDataProvider()
            if (data) {
                updateLayers(data)
                renderLayers()
            }
        }

        animationFrame = requestAnimationFrame(animate)
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
        if (mouseFollowEnabled) {
            mouseX = (e.clientX / window.innerWidth) * 100
            mouseY = (e.clientY / window.innerHeight) * 100
            isMouseInsideWindow = true
        }
    }

    // Mouse enter/leave handlers para auto-center
    const handleMouseEnter = () => {
        isMouseInsideWindow = true
    }

    const handleMouseLeave = () => {
        isMouseInsideWindow = false

        // Se auto-center estiver ativo e mouse follow habilitado, volta gradualmente ao centro
        if (autoCenterEnabled && mouseFollowEnabled) {
            // A transição para o centro será feita no updateLayers
        }
    }

    const startEffect = () => {
        if (isEffectActive) return

        console.log('[SpectralEffect] Starting effect...')
        isEffectActive = true

        // Atualiza hue inicial
        updateThemeHue()

        // Observa mudanças no atributo data-theme
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        })

        // Inicia polling para detectar mudanças nas variáveis CSS (modo RGB)
        startRgbPolling()

        initializeLayers()

        if (enableMouseControl) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseenter', handleMouseEnter)
            document.addEventListener('mouseleave', handleMouseLeave)
        }

        // Adiciona transição suave ao body
        document.body.style.transition = 'background 0.1s ease, transform 0.1s ease'

        console.log('[SpectralEffect] Effect started, starting animation...')
        animate()
    }

    const stopEffect = () => {
        if (!isEffectActive) return

        console.log('[SpectralEffect] Stopping effect...')
        isEffectActive = false

        themeObserver.disconnect()
        stopRgbPolling()

        if (enableMouseControl) {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseenter', handleMouseEnter)
            document.removeEventListener('mouseleave', handleMouseLeave)
        }
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
            animationFrame = null
        }

        // Reseta background para preto
        document.body.style.background = '#000000'
    }

    // Observa mudanças nos effects da janela
    if (state && windowId) {
        watch(
            () => state.windows[windowId]?.effects || [],
            (effects) => {
                const hasGradient = effects.includes('gradient')
                console.log('[SpectralEffect] Effects changed:', effects, 'hasGradient:', hasGradient)

                if (hasGradient && !isEffectActive) {
                    startEffect()
                } else if (!hasGradient && isEffectActive) {
                    stopEffect()
                }
            },
            { immediate: true }
        )
    }
    // Sem windowId: não inicia automaticamente (usuário deve ativar via controles)

    onUnmounted(stopEffect)

    const setSphereSize = (size: number) => {
        baseSphereSize = size
    }

    const setSphereReactivity = (reactivity: number) => {
        sphereReactivity = reactivity
    }

    const setMouseFollow = (enabled: boolean) => {
        mouseFollowEnabled = enabled
        console.log('[SpectralEffect] Mouse Follow:', enabled ? 'ENABLED' : 'DISABLED')

        // Se desabilitar, centraliza imediatamente
        if (!enabled) {
            mouseX = 50
            mouseY = 50
            mouse3DOffset = { x: 0, y: 0 }
        }
    }

    const setAutoCenter = (enabled: boolean) => {
        autoCenterEnabled = enabled
        console.log('[SpectralEffect] Auto Center:', enabled ? 'ENABLED' : 'DISABLED')
    }

    // Expõe a posição do mouse para debug
    const getSpherePosition = () => ({
        x: mouseX,
        y: mouseY
    })

    const getSphereSize = () => baseSphereSize
    const getSphereReactivity = () => sphereReactivity
    const getMouseFollow = () => mouseFollowEnabled
    const getAutoCenter = () => autoCenterEnabled

    return {
        startEffect,
        stopEffect,
        setSphereSize,
        setSphereReactivity,
        setMouseFollow,
        setAutoCenter,
        getSpherePosition,
        getSphereSize,
        getSphereReactivity,
        getMouseFollow,
        getAutoCenter
    }
}
