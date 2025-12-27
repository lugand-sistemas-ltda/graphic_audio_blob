/**
 * @fileoverview Composable para efeito de partículas reativas ao áudio
 * Sistema de partículas que reage à música com controles globais
 */

import { onUnmounted } from 'vue'
import type { AudioFrequencyData } from '../../audio-player/composables/useAudioAnalyzer'
import { useMousePosition, useEffectTheme } from './useEffectHelpers'
import type { BaseEffectOptions, BaseVisualEffect } from '../types'

interface ParticlesEffectOptions extends BaseEffectOptions {
    /** Número de partículas a renderizar (padrão: 150) */
    particleCount?: number
}

interface Particle {
    x: number              // Posição X em pixels
    y: number              // Posição Y em pixels
    vx: number             // Velocidade X
    vy: number             // Velocidade Y
    size: number           // Tamanho da partícula
    baseSize: number       // Tamanho base (sem reatividade)
    life: number           // Vida restante (0-1)
    maxLife: number        // Vida máxima
    frequency: number      // Índice da banda de frequência (0-7)
    hue: number            // Matiz da cor
    brightness: number     // Brilho base
}

export const useParticlesEffect = (options: ParticlesEffectOptions = {}): BaseVisualEffect => {
    const {
        audioDataProvider,
        enableMouseControl = true,
        particleCount = 150
    } = options

    let animationFrame: number | null = null
    let canvas: HTMLCanvasElement | null = null
    let ctx: CanvasRenderingContext2D | null = null
    let particles: Particle[] = []
    let isEffectActive = false

    // Controles de reatividade
    let baseSize = 300 // Tamanho base do sistema (área de spawn)
    let reactivity = 100 // Intensidade de reação (0-200%)

    // Helpers compartilhados
    const mousePos = useMousePosition()
    const theme = useEffectTheme()

    /**
     * Cria uma nova partícula
     */
    const createParticle = (): Particle => {
        const angle = Math.random() * Math.PI * 2
        const distance = Math.random() * (baseSize / 2)
        const speed = 0.5 + Math.random() * 1.5

        return {
            x: window.innerWidth / 2 + Math.cos(angle) * distance,
            y: window.innerHeight / 2 + Math.sin(angle) * distance,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 4,
            baseSize: 2 + Math.random() * 4,
            life: 1,
            maxLife: 0.5 + Math.random() * 0.5,
            frequency: Math.floor(Math.random() * 8), // Uma das 8 bandas
            hue: theme.theme.hue + (Math.random() * 60 - 30), // Variação de cor
            brightness: 50 + Math.random() * 50
        }
    }

    /**
     * Inicializa partículas
     */
    const initializeParticles = () => {
        particles = []
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle())
        }
    }

    /**
     * Atualiza partículas baseado nos dados de áudio
     */
    const updateParticles = (audioData: AudioFrequencyData) => {
        const { frequencyBands, beat } = audioData

        // Atualiza posição do mouse
        mousePos.updateMousePosition()

        // Calcula centro considerando mouse
        const centerX = window.innerWidth / 2 + mousePos.mouse3DOffset.x * 5
        const centerY = window.innerHeight / 2 + mousePos.mouse3DOffset.y * 5

        // Spawn de novas partículas no beat
        if (beat && particles.length < particleCount * 1.5) {
            for (let i = 0; i < 5; i++) {
                particles.push(createParticle())
            }
        }

        // Atualiza cada partícula
        particles.forEach((particle, index) => {
            // Obtém intensidade da frequência correspondente
            const freqIntensity = frequencyBands[particle.frequency] || 0
            const normalizedIntensity = freqIntensity / 255

            // 🎵 ÁUDIO-REATIVIDADE APRIMORADA
            // A velocidade agora é diretamente modulada pela frequência
            const reactivityFactor = reactivity / 100

            // Tamanho reativo (mais dramático)
            particle.size = particle.baseSize * (1 + normalizedIntensity * reactivityFactor * 1.2)

            // 🎯 MOVIMENTO BASEADO EM ÁUDIO (não mais loop fixo)
            // Intensidade alta = movimento mais rápido e errático
            // Intensidade baixa = movimento lento e suave
            const audioSpeed = normalizedIntensity * reactivityFactor * 2
            const baseSpeed = 0.3 // Velocidade mínima para manter movimento

            // Atualiza velocidade com influência do áudio
            particle.vx *= (0.95 + audioSpeed * 0.1) // Damping variável
            particle.vy *= (0.95 + audioSpeed * 0.1)

            // Movimento baseado na intensidade
            particle.x += particle.vx * (baseSpeed + audioSpeed)
            particle.y += particle.vy * (baseSpeed + audioSpeed)

            // 🌀 ATRAÇÃO/REPULSÃO DINÂMICA baseada em frequência
            const dx = centerX - particle.x
            const dy = centerY - particle.y
            const distance = Math.hypot(dx, dy)

            if (distance > 0) {
                // Som ALTO = repulsão do centro (explosão)
                // Som BAIXO = atração ao centro (implosão)
                const forceDirection = normalizedIntensity > 0.5 ? -1 : 1
                const forceMagnitude = Math.abs(normalizedIntensity - 0.5) * reactivityFactor * 0.15
                const force = (forceMagnitude * forceDirection) / (distance * 0.1)

                particle.vx += (dx / distance) * force
                particle.vy += (dy / distance) * force
            }

            // 🎶 TURBULÊNCIA baseada em beat
            if (beat) {
                // Adiciona um "empurrão" aleatório no beat
                particle.vx += (Math.random() - 0.5) * normalizedIntensity * 3
                particle.vy += (Math.random() - 0.5) * normalizedIntensity * 3
            }

            // Decaimento de vida (mais lento quando há som)
            const lifeLoss = 0.01 * (1 - normalizedIntensity * 0.5)
            particle.life -= lifeLoss

            // Remove partículas mortas ou fora da tela
            const margin = 200
            if (particle.life <= 0 ||
                particle.x < -margin || particle.x > window.innerWidth + margin ||
                particle.y < -margin || particle.y > window.innerHeight + margin) {
                particles[index] = createParticle()
            }
        })

        // Mantém número mínimo de partículas
        while (particles.length < particleCount) {
            particles.push(createParticle())
        }
    }

    /**
     * Renderiza partículas no canvas
     */
    const renderParticles = (audioData: AudioFrequencyData) => {
        if (!ctx || !canvas) {
            console.error('[ParticlesEffect] ❌ Canvas ou contexto não disponível!')
            return
        }

        // Limpa canvas completamente (transparente total - sem fundo)
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Renderiza cada partícula
        particles.forEach(particle => {
            if (!ctx) return // TypeScript null safety

            const freqIntensity = audioData.frequencyBands[particle.frequency] || 0
            const normalizedIntensity = freqIntensity / 255

            // Cor HSL com alpha baseado na vida e intensidade
            const alpha = particle.life * (0.3 + normalizedIntensity * 0.7)
            const lightness = particle.brightness + normalizedIntensity * 30

            ctx.fillStyle = `hsla(${particle.hue}, ${theme.theme.saturation}%, ${lightness}%, ${alpha})`
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fill()

            // Glow effect para partículas brilhantes
            if (normalizedIntensity > 0.7) {
                ctx.shadowBlur = 20
                ctx.shadowColor = `hsl(${particle.hue}, ${theme.theme.saturation}%, ${lightness}%)`
            } else {
                ctx.shadowBlur = 0
            }
        })
    }

    /**
     * Loop de animação
     */
    const animate = () => {
        if (!isEffectActive) {
            return
        }

        // Tenta obter dados de áudio
        let audioData: AudioFrequencyData | null = null
        if (audioDataProvider) {
            audioData = audioDataProvider()
        }

        // Se não houver dados de áudio, usa valores padrão para manter animação
        if (!audioData) {
            // Cria array de frequências com valores baixos (silêncio)
            const defaultFrequencies = new Array(32).fill(20) // 32 bandas com valor 20 (baixo)

            audioData = {
                bass: 20,
                mid: 15,
                treble: 10,
                overall: 15,
                beat: false,
                raw: new Uint8Array(32).fill(20),
                frequencyBands: defaultFrequencies
            }
        }

        // Sempre renderiza (com dados reais ou padrão)
        updateParticles(audioData)
        renderParticles(audioData)

        animationFrame = requestAnimationFrame(animate)
    }

    /**
     * Cria e configura canvas
     */
    const setupCanvas = () => {
        canvas = document.createElement('canvas')
        canvas.id = 'particles-effect-canvas'
        canvas.style.position = 'fixed'
        canvas.style.top = '0'
        canvas.style.left = '0'
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        canvas.style.pointerEvents = 'none'
        canvas.style.zIndex = '-1' // Particles na frente do gradient (-2)
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        ctx = canvas.getContext('2d')
        document.body.appendChild(canvas)

        console.log('[ParticlesEffect] 🎨 Canvas criado:', canvas.id)

        // Resize handler
        const handleResize = () => {
            if (canvas) {
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
            }
        }
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }

    /**
     * Remove canvas
     */
    const cleanupCanvas = () => {
        if (canvas) {
            canvas.remove()
            canvas = null
            ctx = null
        }
    }

    // ========================================
    // API Pública
    // ========================================

    const startEffect = () => {
        if (isEffectActive) {
            console.warn('[ParticlesEffect] ⚠️ Tentativa de iniciar efeito já ativo - ignorando')
            return
        }

        console.log('[ParticlesEffect] 🎬 Iniciando efeito de partículas...')
        console.log('[ParticlesEffect] 📊 Configuração:', {
            particleCount,
            baseSize,
            reactivity,
            enableMouseControl,
            audioDataProvider: !!audioDataProvider
        })

        isEffectActive = true

        theme.startThemeObserver()
        setupCanvas()
        initializeParticles()

        if (enableMouseControl) {
            document.addEventListener('mousemove', mousePos.handleMouseMove)
            document.addEventListener('mouseenter', mousePos.handleMouseEnter)
            document.addEventListener('mouseleave', mousePos.handleMouseLeave)
        }

        console.log('[ParticlesEffect] ✅ Efeito iniciado, começando loop de animação...')
        animate()
    }

    const stopEffect = () => {
        if (!isEffectActive) {
            console.warn('[ParticlesEffect] ⚠️ Tentativa de parar efeito já inativo - ignorando')
            return
        }

        console.log('[ParticlesEffect] 🛑 Parando efeito de partículas...')
        isEffectActive = false

        theme.stopThemeObserver()
        cleanupCanvas()

        if (enableMouseControl) {
            document.removeEventListener('mousemove', mousePos.handleMouseMove)
            document.removeEventListener('mouseenter', mousePos.handleMouseEnter)
            document.removeEventListener('mouseleave', mousePos.handleMouseLeave)
        }

        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
            animationFrame = null
        }

        console.log('[ParticlesEffect] ✅ Efeito parado completamente')
    }

    // ⚠️ WATCH REMOVIDO - Manager controla start/stop
    // O useVisualEffectsManager é responsável por iniciar/parar baseado no estado global
    // Manter watch aqui causava conflito duplo de inicialização

    onUnmounted(stopEffect)

    // Implementação da interface BaseVisualEffect
    return {
        startEffect,
        stopEffect,
        setMouseFollow: (enabled: boolean) => {
            mousePos.setMouseFollow(enabled)
            console.log('[ParticlesEffect] Mouse Follow:', enabled ? 'ENABLED' : 'DISABLED')
        },
        setAutoCenter: (enabled: boolean) => {
            mousePos.setAutoCenter(enabled)
            console.log('[ParticlesEffect] Auto Center:', enabled ? 'ENABLED' : 'DISABLED')
        },
        setSize: (size: number) => {
            baseSize = size
            console.log('[ParticlesEffect] Size:', size)
        },
        setReactivity: (value: number) => {
            reactivity = value
            console.log('[ParticlesEffect] Reactivity:', value)
        },
        getMouseFollow: () => mousePos.mouseFollowEnabled,
        getAutoCenter: () => mousePos.autoCenterEnabled,
        getSize: () => baseSize,
        getReactivity: () => reactivity
    }
}
