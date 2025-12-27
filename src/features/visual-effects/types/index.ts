/**
 * @fileoverview Tipos compartilhados para efeitos visuais
 * Define interfaces base que todos os efeitos visuais seguem
 */

import type { AudioFrequencyData } from '../../audio-player/composables/useAudioAnalyzer'

/**
 * Opções base para inicialização de efeitos visuais
 * Todos os efeitos devem aceitar pelo menos estas opções
 */
export interface BaseEffectOptions {
    /** Provider de dados de áudio para reatividade */
    audioDataProvider?: () => AudioFrequencyData | null
    /** Habilita controle via mouse */
    enableMouseControl?: boolean
    /** ID da janela para integração com GlobalState */
    windowId?: string | null
}

/**
 * Controles de comportamento comuns a todos os efeitos
 */
export interface EffectBehaviorControls {
    /** Efeito segue o cursor do mouse */
    mouseFollow: boolean
    /** Efeito volta ao centro quando mouse sai da tela */
    autoCenter: boolean
}

/**
 * Controles de reatividade ao áudio comuns
 */
export interface AudioReactivityControls {
    /** Tamanho/escala base do efeito (0-500) */
    size: number
    /** Intensidade da reação ao áudio (0-200%) */
    reactivity: number
    /** Sensibilidade à detecção de beat (50-300) */
    beatSensitivity?: number
}

/**
 * Interface base que todos os composables de efeito devem retornar
 */
export interface BaseVisualEffect {
    /** Inicia o efeito visual */
    startEffect: () => void
    /** Para o efeito visual */
    stopEffect: () => void

    // Controles de comportamento
    /** Define se efeito segue mouse */
    setMouseFollow: (enabled: boolean) => void
    /** Define se auto-centraliza */
    setAutoCenter: (enabled: boolean) => void

    // Controles de reatividade ao áudio
    /** Define tamanho/escala do efeito */
    setSize: (size: number) => void
    /** Define intensidade de reação ao áudio */
    setReactivity: (reactivity: number) => void

    // Getters
    /** Retorna estado do mouse follow */
    getMouseFollow: () => boolean
    /** Retorna estado do auto center */
    getAutoCenter: () => boolean
    /** Retorna tamanho atual */
    getSize: () => number
    /** Retorna reatividade atual */
    getReactivity: () => number
}

/**
 * Tipos de efeitos visuais disponíveis
 */
export type VisualEffectType = 'gradient' | 'particles' | 'waveform'

/**
 * Configuração de tema/cor para efeitos
 */
export interface EffectThemeConfig {
    /** Hue do tema (0-360) */
    hue: number
    /** Saturação do tema (0-100) */
    saturation: number
    /** Valores RGB do tema */
    rgb: { r: number; g: number; b: number }
}
