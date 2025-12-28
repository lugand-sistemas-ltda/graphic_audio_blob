/**
 * Visual Effects Manager
 * 
 * Gerencia centralizadamente TODOS os efeitos visuais da aplicação.
 * Cada efeito é isolado e reage automaticamente às mudanças no estado global.
 * 
 * Arquitetura de Atributos:
 * 
 * 1. ATRIBUTOS GLOBAIS (todos os efeitos):
 *    - audioDataProvider: Fonte de dados de áudio
 *    - enableMouseControl: Habilita controle via mouse
 *    - windowId: Identificador da janela
 * 
 * 2. ATRIBUTOS COMPARTILHADOS (alguns efeitos):
 *    - mouseFollow: Efeito segue mouse (gradient, particles)
 *    - autoCenter: Auto-centralização (gradient, particles)
 *    - size/reactivity: Intensidade do efeito (gradient, particles)
 * 
 * 3. ATRIBUTOS ESPECÍFICOS (único efeito):
 *    - layerCount: Número de camadas (gradient only)
 *    - particleCount: Número de partículas (particles only)
 *    - spawnSize: Área de spawn (particles only)
 *    - waveformBars: Número de barras (waveform only)
 */

import { watch, type Ref } from 'vue'
import { useGlobalState } from '../../../core/state'
import type { WindowId, VisualEffect } from '../../../core/state/types'
import type { AudioFrequencyData } from '../../audio-player/composables/useAudioAnalyzer'
import type { BaseEffectOptions } from '../types'
import { useMousePosition } from './useEffectHelpers'

export interface VisualEffectsManagerOptions {
    /**
     * ID da janela onde os efeitos serão renderizados
     */
    windowId: WindowId

    /**
     * Provider de dados de áudio (fonte única para todos os efeitos)
     */
    audioDataProvider: () => AudioFrequencyData

    /**
     * Habilita controle via mouse para todos os efeitos
     * @default true
     */
    enableMouseControl?: boolean
}

export interface ManagedEffect {
    type: VisualEffect
    instance: any | null // Usando any temporariamente até todos efeitos implementarem BaseVisualEffect
    isActive: boolean
}

export interface VisualEffectsManager {
    /**
     * Efeito gradient/orb (sempre disponível)
     */
    gradientEffect: Ref<ManagedEffect>

    /**
     * Efeito de partículas (sempre disponível)
     */
    particlesEffect: Ref<ManagedEffect>

    /**
     * Efeito de waveform (futuro)
     */
    waveformEffect: Ref<ManagedEffect>

    /**
     * Inicializa um efeito específico
     */
    initEffect: (effectType: VisualEffect) => void

    /**
     * Para e destrói um efeito específico
     */
    stopEffect: (effectType: VisualEffect) => void

    /**
     * Obtém instância de um efeito
     */
    getEffect: (effectType: VisualEffect) => any | null

    // ========================================
    // CONTROLES GLOBAIS (afetam todos os efeitos ativos)
    // ========================================

    /**
     * Define tamanho/escala para TODOS os efeitos ativos
     * Gradient: baseSphereSize | Particles: spawnAreaSize
     */
    setGlobalSize: (size: number) => void

    /**
     * Define reatividade ao áudio para TODOS os efeitos ativos
     */
    setGlobalReactivity: (reactivity: number) => void

    /**
     * Define mouse follow para TODOS os efeitos ativos
     */
    setGlobalMouseFollow: (enabled: boolean) => void

    /**
     * Define auto center para TODOS os efeitos ativos
     */
    setGlobalAutoCenter: (enabled: boolean) => void

    // ========================================
    // CONTROLES ESPECÍFICOS POR EFEITO
    // ========================================

    /**
     * Controles específicos do Gradient/Orb
     */
    gradient: {
        setSize: (size: number) => void
        setReactivity: (reactivity: number) => void
        setMouseFollow: (enabled: boolean) => void
        setAutoCenter: (enabled: boolean) => void
    }

    /**
     * Controles específicos do Particles
     */
    particles: {
        setParticleCount: (count: number) => void
        setSpawnSize: (size: number) => void
        setReactivity: (reactivity: number) => void
        setMouseFollow: (enabled: boolean) => void
        setAutoCenter: (enabled: boolean) => void
    }
}

/**
 * Hook para gerenciar todos os efeitos visuais de forma centralizada
 */
export function useVisualEffectsManager(options: VisualEffectsManagerOptions): VisualEffectsManager {
    const { windowId, audioDataProvider, enableMouseControl = true } = options
    const { state } = useGlobalState()

    // 🎯 MOUSE POSITION CENTRALIZADO - Calculado UMA VEZ pelo manager
    const managerMousePos = useMousePosition()

    // Inicia tracking de mouse se enabled
    if (enableMouseControl) {
        managerMousePos.start()
    }

    // Registry de efeitos gerenciados
    const effects = new Map<VisualEffect, ManagedEffect>()

    // Inicializa registry
    effects.set('gradient', {
        type: 'gradient',
        instance: null,
        isActive: false
    })

    effects.set('particles', {
        type: 'particles',
        instance: null,
        isActive: false
    })

    effects.set('waveform', {
        type: 'waveform',
        instance: null,
        isActive: false
    })

    /**
     * Opções base compartilhadas por todos os efeitos
     */
    const getBaseOptions = (): BaseEffectOptions => ({
        audioDataProvider,
        enableMouseControl,
        windowId
    })

    /**
     * Inicializa efeito gradient/orb
     */
    const initGradientEffect = async () => {
        const effect = effects.get('gradient')
        if (effect && !effect.instance) {
            const { useSpectralVisualEffect } = await import('./useSpectralVisualEffect')
            effect.instance = useSpectralVisualEffect({
                ...getBaseOptions(),
                layerCount: 8, // Atributo específico do gradient
                mousePositionProvider: managerMousePos // 🎯 Passa posição centralizada
            })
            if (effect.instance) {
                effect.instance.startEffect()
                effect.isActive = true
                console.log('[VisualEffectsManager] Gradient effect initialized')
            }
        }
    }

    /**
     * Inicializa efeito de partículas
     */
    const initParticlesEffect = async () => {
        const effect = effects.get('particles')
        if (effect && !effect.instance) {
            const { useParticlesEffect } = await import('./useParticlesEffect')
            effect.instance = useParticlesEffect({
                ...getBaseOptions(),
                mousePositionProvider: managerMousePos // 🎯 Passa posição centralizada
                // Atributos específicos gerenciados pelo control component
            })
            if (effect.instance) {
                effect.instance.startEffect()
                effect.isActive = true
                console.log('[VisualEffectsManager] Particles effect initialized')
            }
        }
    }

    /**
     * Inicializa efeito waveform (futuro)
     */
    const initWaveformEffect = async () => {
        console.warn('[VisualEffectsManager] Waveform effect not yet implemented')
        // TODO: Implementar quando criar useWaveformEffect
    }

    /**
     * Inicializa efeito específico com logging detalhado
     */
    const initEffect = (effectType: VisualEffect) => {
        console.log(`[VisualEffectsManager] 🎬 Iniciando efeito: ${effectType}`)
        console.log(`[VisualEffectsManager] 📊 Estado atual dos efeitos:`, {
            gradient: effects.get('gradient')?.isActive,
            particles: effects.get('particles')?.isActive,
            waveform: effects.get('waveform')?.isActive
        })

        switch (effectType) {
            case 'gradient':
                initGradientEffect()
                break
            case 'particles':
                initParticlesEffect()
                break
            case 'waveform':
                initWaveformEffect()
                break
        }

        console.log(`[VisualEffectsManager] ✅ Efeito ${effectType} inicializado`)
    }

    /**
     * Para e destrói efeito específico com logging
     */
    const stopEffect = (effectType: VisualEffect) => {
        console.log(`[VisualEffectsManager] 🛑 Parando efeito: ${effectType}`)

        const effect = effects.get(effectType)
        if (effect && effect.instance) {
            effect.instance.stopEffect()
            effect.instance = null
            effect.isActive = false
            console.log(`[VisualEffectsManager] ✅ Efeito ${effectType} parado e removido`)
        } else {
            console.warn(`[VisualEffectsManager] ⚠️ Tentativa de parar efeito ${effectType} que não existe`)
        }

        console.log(`[VisualEffectsManager] 📊 Estado após parar:`, {
            gradient: effects.get('gradient')?.isActive,
            particles: effects.get('particles')?.isActive,
            waveform: effects.get('waveform')?.isActive
        })
    }

    /**
     * Obtém instância de um efeito
     */
    const getEffect = (effectType: VisualEffect): any | null => {
        const effect = effects.get(effectType)
        return effect?.instance || null
    }

    // ========================================
    // CONTROLES GLOBAIS COMPARTILHADOS
    // ========================================

    /**
     * Define tamanho/escala para TODOS os efeitos ativos
     * 
     * @param effectSize - Valor normalizado 0-1
     * 
     * Conversão interna:
     * - Gradient: 0-1 → 100-500px (baseSphereSize)
     * - Particles: 0-1 → 100-500px (spawnAreaSize)
     * - Waveform: 0-1 → escala específica futura
     */
    const setGlobalSize = (effectSize: number) => {
        // Normaliza para 0-1 se vier valor fora do range
        const normalized = Math.max(0, Math.min(1, effectSize))

        // Converte para pixel range: 100-500px
        const sizeInPx = 100 + (normalized * 400)

        effects.forEach((effect) => {
            if (effect.instance && effect.isActive) {
                if (effect.instance.setSize) {
                    effect.instance.setSize(sizeInPx)
                } else if (effect.instance.setSphereSize) {
                    effect.instance.setSphereSize(sizeInPx)
                }
            }
        })
    }

    /**
     * Define reatividade ao áudio para TODOS os efeitos ativos
     * 
     * @param effectSensitivity - Valor normalizado 0-1
     * 
     * Conversão interna:
     * - Gradient: 0-1 → 0-200% (audioReactivity)
     * - Particles: 0-1 → 0-200% (audioReactivity)
     * - Waveform: 0-1 → sensibilidade específica futura
     */
    const setGlobalReactivity = (effectSensitivity: number) => {
        // Normaliza para 0-1 se vier valor fora do range
        const normalized = Math.max(0, Math.min(1, effectSensitivity))

        // Converte para percentage range: 0-200%
        const reactivityPercent = normalized * 200

        effects.forEach((effect) => {
            if (effect.instance && effect.isActive) {
                if (effect.instance.setReactivity) {
                    effect.instance.setReactivity(reactivityPercent)
                } else if (effect.instance.setSphereReactivity) {
                    effect.instance.setSphereReactivity(reactivityPercent)
                }
            }
        })
    }

    /**
     * Define mouse follow para TODOS os efeitos ativos
     */
    const setGlobalMouseFollow = (enabled: boolean) => {
        effects.forEach((effect) => {
            if (effect.instance && effect.isActive && effect.instance.setMouseFollow) {
                effect.instance.setMouseFollow(enabled)
            }
        })
    }

    /**
     * Define auto center para TODOS os efeitos ativos
     */
    const setGlobalAutoCenter = (enabled: boolean) => {
        effects.forEach((effect) => {
            if (effect.instance && effect.isActive && effect.instance.setAutoCenter) {
                effect.instance.setAutoCenter(enabled)
            }
        })
    }

    // ========================================
    // CONTROLES ESPECÍFICOS POR EFEITO
    // ========================================

    /**
     * Controles específicos do Gradient
     * 
     * Aceita valores normalizados (0-1) e converte internamente
     */
    const gradientControls = {
        /**
         * @param effectSize - Valor normalizado 0-1 → 100-500px
         */
        setSize: (effectSize: number) => {
            const normalized = Math.max(0, Math.min(1, effectSize))
            const sizeInPx = 100 + (normalized * 400)

            const gradient = getEffect('gradient')
            if (gradient?.setSphereSize) gradient.setSphereSize(sizeInPx)
        },

        /**
         * @param effectSensitivity - Valor normalizado 0-1 → 0-200%
         */
        setReactivity: (effectSensitivity: number) => {
            const normalized = Math.max(0, Math.min(1, effectSensitivity))
            const reactivityPercent = normalized * 200

            const gradient = getEffect('gradient')
            if (gradient?.setSphereReactivity) gradient.setSphereReactivity(reactivityPercent)
        },

        setMouseFollow: (enabled: boolean) => {
            const gradient = getEffect('gradient')
            if (gradient?.setMouseFollow) gradient.setMouseFollow(enabled)
        },

        setAutoCenter: (enabled: boolean) => {
            const gradient = getEffect('gradient')
            if (gradient?.setAutoCenter) gradient.setAutoCenter(enabled)
        }
    }

    /**
     * Controles específicos do Particles
     * 
     * Aceita valores normalizados (0-1) e converte internamente
     */
    const particlesControls = {
        setParticleCount: (_count: number) => {
            // TODO: Implementar setParticleCount no useParticlesEffect
            console.warn('[Manager] setParticleCount not yet implemented')
        },

        /**
         * @param effectSize - Valor normalizado 0-1 → 100-500px
         */
        setSpawnSize: (effectSize: number) => {
            const normalized = Math.max(0, Math.min(1, effectSize))
            const sizeInPx = 100 + (normalized * 400)

            const particles = getEffect('particles')
            if (particles?.setSize) particles.setSize(sizeInPx)
        },

        /**
         * @param effectSensitivity - Valor normalizado 0-1 → 0-200%
         */
        setReactivity: (effectSensitivity: number) => {
            const normalized = Math.max(0, Math.min(1, effectSensitivity))
            const reactivityPercent = normalized * 200

            const particles = getEffect('particles')
            if (particles?.setReactivity) particles.setReactivity(reactivityPercent)
        },

        setMouseFollow: (enabled: boolean) => {
            const particles = getEffect('particles')
            if (particles?.setMouseFollow) particles.setMouseFollow(enabled)
        },

        setAutoCenter: (enabled: boolean) => {
            const particles = getEffect('particles')
            if (particles?.setAutoCenter) particles.setAutoCenter(enabled)
        }
    }

    /**
     * Watch centralizado que reage a mudanças no estado global
     * Quando um efeito é adicionado/removido do window.effects, automaticamente inicia/para
     * 
     * ⚠️ CRITICAL: Este é o único ponto de entrada para inicialização de efeitos
     */
    watch(
        () => state.windows[windowId]?.effects || [],
        (newEffects, oldEffects = []) => {
            console.log('[VisualEffectsManager] 🔄 Watch triggered!')
            console.log('[VisualEffectsManager] 📊 Comparação de efeitos:', {
                oldEffects,
                newEffects,
                windowId
            })

            // Detecta efeitos adicionados
            const addedEffects = newEffects.filter(e => !oldEffects.includes(e))
            if (addedEffects.length > 0) {
                console.log(`[VisualEffectsManager] ➕ Efeitos adicionados:`, addedEffects)
                addedEffects.forEach(effect => {
                    initEffect(effect)
                })
            }

            // Detecta efeitos removidos
            const removedEffects = oldEffects.filter(e => !newEffects.includes(e))
            if (removedEffects.length > 0) {
                console.log(`[VisualEffectsManager] ➖ Efeitos removidos:`, removedEffects)
                removedEffects.forEach(effect => {
                    stopEffect(effect)
                })
            }

            if (addedEffects.length === 0 && removedEffects.length === 0) {
                console.log('[VisualEffectsManager] 🔵 Nenhuma mudança detectada')
            }
        },
        { immediate: true } // Processa efeitos já ativos no mount
    )

    return {
        // Referências aos efeitos (backward compatibility)
        gradientEffect: { value: effects.get('gradient')! } as any,
        particlesEffect: { value: effects.get('particles')! } as any,
        waveformEffect: { value: effects.get('waveform')! } as any,

        // Controle direto de efeitos
        initEffect,
        stopEffect,
        getEffect,

        // Controles GLOBAIS (afetam todos os efeitos ativos)
        setGlobalSize,
        setGlobalReactivity,
        setGlobalMouseFollow,
        setGlobalAutoCenter,

        // Controles ESPECÍFICOS por efeito
        gradient: gradientControls,
        particles: particlesControls
    }
}
