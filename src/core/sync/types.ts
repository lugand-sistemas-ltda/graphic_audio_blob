/**
 * Tipos para sistema de sincronização multi-window
 */

// Tipos de mensagens que podem ser sincronizadas entre janelas
export type SyncMessageType =
    | 'WINDOW_CONNECTED'
    | 'WINDOW_DISCONNECTED'
    | 'AUDIO_DATA'
    | 'AUDIO_CONTROL'
    | 'THEME_CHANGE'
    | 'RGB_MODE_TOGGLE'
    | 'CHAMELEON_MODE_TOGGLE'
    | 'COMPONENT_STATE'
    | 'TRACK_CHANGE'
    | 'PLAYBACK_STATE'
    | 'VOLUME_CHANGE'
    | 'SPHERE_CONFIG'
    | 'BEAT_DETECTED'
    | 'HEARTBEAT'
    | 'GLOBAL_STATE_ACTION' // Para sincronização do estado global
    | 'WINDOW_ROLE_CHANGE'

// Roles que uma janela pode assumir
export type WindowRole = 'main' | 'visual' | 'controls' | 'grid' | 'custom'

// Estrutura de uma mensagem sincronizada
export interface SyncMessage<T = any> {
    type: SyncMessageType
    data: T
    timestamp: number
    windowId: string
    role?: WindowRole
}

// Dados de áudio sincronizados
export interface AudioSyncData {
    frequencyBands: number[]
    bass: number
    mid: number
    treble: number
    overall: number
    beat: boolean
}

// Controles de áudio sincronizados
export interface AudioControlData {
    action: 'play' | 'pause' | 'next' | 'previous' | 'seek' | 'volume'
    value?: number
    trackIndex?: number
}

// Estado de playback sincronizado
export interface PlaybackStateData {
    isPlaying: boolean
    currentTrack: {
        title: string
        artist: string
        duration: number
        currentTime: number
    } | null
    volume: number
}

// Configuração da esfera sincronizada
export interface SphereConfigData {
    size: number
    reactivity: number
}

// Mudança de tema sincronizada
export interface ThemeChangeData {
    theme: string
}

// Estado de componente sincronizado
export interface ComponentStateData {
    componentId: string
    visible: boolean
    collapsed?: boolean
    position?: { x: number; y: number }
}

// Informações de uma janela conectada
export interface WindowInfo {
    id: string
    role: WindowRole
    connectedAt: number
    lastHeartbeat: number
    isAlive: boolean
}

// Handler para mensagens recebidas
export type MessageHandler<T = any> = (data: T, message: SyncMessage<T>) => void

// Configuração do sistema de sync
export interface SyncConfig {
    channelName?: string
    heartbeatInterval?: number
    heartbeatTimeout?: number
    enableLogging?: boolean
}
