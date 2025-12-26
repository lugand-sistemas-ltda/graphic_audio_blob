import { ref } from 'vue'
import { broadcast, onMessage } from '../../../core/sync/useBroadcastSync'

/**
 * Composable para sincronizar controles do player entre janelas
 * Gerencia play/pause/seek/volume/next/previous
 */

export interface PlayerState {
    isPlaying: boolean
    currentTime: number
    volume: number
    trackIndex: number
}

export const usePlayerSync = () => {
    // Estado compartilhado
    const syncState = ref<PlayerState>({
        isPlaying: false,
        currentTime: 0,
        volume: 0.7,
        trackIndex: 0
    })

    /**
     * Sincroniza ação de play
     */
    const syncPlay = () => {
        broadcast('PLAYBACK_STATE', {
            action: 'play',
            isPlaying: true,
            timestamp: Date.now()
        })
    }

    /**
     * Sincroniza ação de pause
     */
    const syncPause = () => {
        broadcast('PLAYBACK_STATE', {
            action: 'pause',
            isPlaying: false,
            timestamp: Date.now()
        })
    }

    /**
     * Sincroniza seek (mudança de posição na música)
     */
    const syncSeek = (time: number) => {
        broadcast('AUDIO_CONTROL', {
            action: 'seek',
            value: time,
            timestamp: Date.now()
        })
    }

    /**
     * Sincroniza volume
     */
    const syncVolume = (volume: number) => {
        syncState.value.volume = volume
        broadcast('VOLUME_CHANGE', {
            volume,
            timestamp: Date.now()
        })
    }

    /**
     * Sincroniza próxima música
     */
    const syncNext = () => {
        broadcast('AUDIO_CONTROL', {
            action: 'next',
            timestamp: Date.now()
        })
    }

    /**
     * Sincroniza música anterior
     */
    const syncPrevious = () => {
        broadcast('AUDIO_CONTROL', {
            action: 'previous',
            timestamp: Date.now()
        })
    }

    // Listeners para sincronização
    onMessage('PLAYBACK_STATE', (data: any) => {
        syncState.value.isPlaying = data.isPlaying
    })

    onMessage('AUDIO_CONTROL', () => {
        // Janelas filhas recebem comandos mas não executam ações físicas
        // O estado é atualizado via outros listeners
    })

    onMessage('VOLUME_CHANGE', (data: any) => {
        syncState.value.volume = data.volume
    })

    return {
        syncState,
        syncPlay,
        syncPause,
        syncSeek,
        syncVolume,
        syncNext,
        syncPrevious
    }
}
