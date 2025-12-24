import { ref, computed } from 'vue'
import { broadcast, onMessage } from '../sync/useBroadcastSync'

/**
 * Global Audio State Manager
 * 
 * Gerencia estado de áudio compartilhado entre todas as janelas
 * Singleton - uma única instância compartilhada globalmente
 */

// ========================================
// TIPOS
// ========================================

export interface Track {
    name: string
    file: string
    artist?: string
    album?: string
    duration?: number
}

export interface FrequencyData {
    bass: number
    mid: number
    treble: number
    overall: number
    beat: boolean
    frequencyBands: number[]
    raw: Uint8Array
}

export interface GlobalAudioState {
    // Playback state
    isPlaying: boolean
    currentTime: number
    duration: number
    volume: number

    // Playlist
    currentTrackIndex: number
    tracks: Track[]

    // Window ownership
    audioOwner: string | null // windowId que possui o <audio> element

    // Audio analysis data
    frequencyData: FrequencyData
}

// ========================================
// ESTADO GLOBAL (Singleton)
// ========================================

let globalState: ReturnType<typeof createGlobalAudioState> | null = null

const STORAGE_KEY = 'global-audio-state'

/**
 * Cria o estado global de áudio (chamado apenas uma vez)
 */
function createGlobalAudioState() {
    // Estado reativo
    const state = ref<GlobalAudioState>({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.7,
        currentTrackIndex: 0,
        tracks: [],
        audioOwner: null,
        frequencyData: {
            bass: 0,
            mid: 0,
            treble: 0,
            overall: 0,
            beat: false,
            frequencyBands: [0, 0, 0, 0, 0, 0, 0, 0],
            raw: new Uint8Array(0)
        }
    })

    // ========================================
    // PERSISTÊNCIA
    // ========================================

    /**
     * Persiste estado em localStorage
     */
    const persist = () => {
        try {
            const stateToPersist = {
                volume: state.value.volume,
                currentTrackIndex: state.value.currentTrackIndex,
                tracks: state.value.tracks
                // NÃO persiste: isPlaying, currentTime, audioOwner, frequencyData
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist))
        } catch (error) {
            console.error('[GlobalAudio] Failed to persist:', error)
        }
    }

    /**
     * Carrega estado do localStorage
     */
    const load = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                state.value.volume = parsed.volume ?? 0.7
                state.value.currentTrackIndex = parsed.currentTrackIndex ?? 0
                state.value.tracks = parsed.tracks ?? []
            }
        } catch (error) {
            console.error('[GlobalAudio] Failed to load:', error)
        }
    }

    // ========================================
    // MÉTODOS DE CONTROLE
    // ========================================

    /**
     * Inicia playback
     */
    const play = (windowId: string) => {
        state.value.isPlaying = true
        broadcast('GLOBAL_AUDIO_PLAY', { windowId })
        // Não persiste isPlaying (estado volátil)
    }

    /**
     * Pausa playback
     */
    const pause = (windowId: string) => {
        state.value.isPlaying = false
        broadcast('GLOBAL_AUDIO_PAUSE', { windowId })
    }

    /**
     * Seek para tempo específico
     */
    const seek = (time: number, windowId: string) => {
        state.value.currentTime = time
        broadcast('GLOBAL_AUDIO_SEEK', { time, windowId })
    }

    /**
     * Atualiza tempo atual (chamado pelo audio owner)
     */
    const updateTime = (time: number, duration: number) => {
        state.value.currentTime = time
        state.value.duration = duration
        broadcast('GLOBAL_AUDIO_TIME_UPDATE', { time, duration })
    }

    /**
     * Define volume
     */
    const setVolume = (volume: number, windowId: string) => {
        state.value.volume = volume
        broadcast('GLOBAL_AUDIO_VOLUME', { volume, windowId })
        persist()
    }

    /**
     * Próxima faixa
     */
    const nextTrack = (windowId: string) => {
        const nextIndex = (state.value.currentTrackIndex + 1) % state.value.tracks.length
        if (state.value.tracks.length > 0) {
            state.value.currentTrackIndex = nextIndex
            state.value.currentTime = 0
            broadcast('GLOBAL_AUDIO_TRACK_CHANGE', { trackIndex: nextIndex, windowId })
            persist()
        }
    }

    /**
     * Faixa anterior
     */
    const previousTrack = (windowId: string) => {
        if (state.value.tracks.length > 0) {
            const prevIndex = state.value.currentTrackIndex === 0
                ? state.value.tracks.length - 1
                : state.value.currentTrackIndex - 1
            state.value.currentTrackIndex = prevIndex
            state.value.currentTime = 0
            broadcast('GLOBAL_AUDIO_TRACK_CHANGE', { trackIndex: prevIndex, windowId })
            persist()
        }
    }

    /**
     * Seleciona faixa específica
     */
    const selectTrack = (index: number, windowId: string) => {
        if (index >= 0 && index < state.value.tracks.length) {
            state.value.currentTrackIndex = index
            state.value.currentTime = 0
            broadcast('GLOBAL_AUDIO_TRACK_CHANGE', { trackIndex: index, windowId })
            persist()
        }
    }

    /**
     * Define playlist
     */
    const setTracks = (tracks: Track[]) => {
        state.value.tracks = tracks
        persist()
    }

    /**
     * Registra janela como audio owner (possui o <audio> element)
     * Verifica se já existe owner antes de registrar
     */
    const registerAudioOwner = (windowId: string) => {
        // ⚠️ CRÍTICO: Verifica se JÁ existe um owner ativo
        if (state.value.audioOwner && state.value.audioOwner !== windowId) {
            console.warn(`[GlobalAudio] Audio owner already exists: ${state.value.audioOwner}. Rejecting ${windowId}`)
            return false // Rejeita registro
        }

        state.value.audioOwner = windowId
        broadcast('GLOBAL_AUDIO_OWNER', { windowId })
        console.log('[GlobalAudio] Audio owner registered:', windowId)
        return true // Sucesso
    }

    /**
     * Remove audio owner (quando janela fecha)
     */
    const unregisterAudioOwner = (windowId: string) => {
        if (state.value.audioOwner === windowId) {
            state.value.audioOwner = null
            state.value.isPlaying = false // Para playback ao fechar owner
            broadcast('GLOBAL_AUDIO_OWNER_REMOVED', { windowId })
            console.log('[GlobalAudio] Audio owner unregistered:', windowId)
        }
    }

    /**
     * Atualiza dados de frequência (chamado 60x/segundo pelo audio owner)
     */
    const updateFrequencyData = (data: FrequencyData) => {
        state.value.frequencyData = data
        broadcast('GLOBAL_AUDIO_DATA', { data })
        // NÃO persiste (muda 60x/segundo)
    }

    // ========================================
    // SYNC LISTENERS
    // ========================================

    onMessage('GLOBAL_AUDIO_PLAY', () => {
        state.value.isPlaying = true
    })

    onMessage('GLOBAL_AUDIO_PAUSE', () => {
        state.value.isPlaying = false
    })

    onMessage('GLOBAL_AUDIO_SEEK', ({ time }: { time: number }) => {
        state.value.currentTime = time
    })

    onMessage('GLOBAL_AUDIO_TIME_UPDATE', ({ time, duration }: { time: number; duration: number }) => {
        state.value.currentTime = time
        state.value.duration = duration
    })

    onMessage('GLOBAL_AUDIO_VOLUME', ({ volume }: { volume: number }) => {
        state.value.volume = volume
    })

    onMessage('GLOBAL_AUDIO_TRACK_CHANGE', ({ trackIndex }: { trackIndex: number }) => {
        state.value.currentTrackIndex = trackIndex
        state.value.currentTime = 0
    })

    onMessage('GLOBAL_AUDIO_DATA', ({ data }: { data: FrequencyData }) => {
        state.value.frequencyData = data
    })

    onMessage('GLOBAL_AUDIO_OWNER', ({ windowId }: { windowId: string }) => {
        state.value.audioOwner = windowId
    })

    onMessage('GLOBAL_AUDIO_OWNER_REMOVED', ({ windowId }: { windowId: string }) => {
        if (state.value.audioOwner === windowId) {
            state.value.audioOwner = null
            state.value.isPlaying = false
            console.log('[GlobalAudio] Audio owner removed (window closed):', windowId)
        }
    })

    // ========================================
    // COMPUTED
    // ========================================

    const currentTrack = computed(() => {
        return state.value.tracks[state.value.currentTrackIndex] || null
    })

    const isAudioOwner = (windowId: string) => {
        return state.value.audioOwner === windowId
    }

    const hasAudioOwner = computed(() => {
        return state.value.audioOwner !== null
    })

    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    // Carrega estado persistido
    load()

    return {
        // Estado
        state,

        // Controles de playback
        play,
        pause,
        seek,
        updateTime,
        setVolume,
        nextTrack,
        previousTrack,
        selectTrack,

        // Gerenciamento de playlist
        setTracks,

        // Audio ownership
        registerAudioOwner,
        unregisterAudioOwner,
        isAudioOwner,
        hasAudioOwner,

        // Audio analysis
        updateFrequencyData,

        // Computed
        currentTrack
    }
}

// ========================================
// EXPORT PRINCIPAL
// ========================================

/**
 * Hook para acessar estado global de áudio
 * Singleton - retorna sempre a mesma instância
 */
export function useGlobalAudio() {
    globalState ??= createGlobalAudioState()
    return globalState
}
