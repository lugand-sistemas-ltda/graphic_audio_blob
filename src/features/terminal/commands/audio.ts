/**
 * Audio Commands
 * Comandos para controle e informação de áudio
 */

import type { TerminalCommand } from '../types'
import { useGlobalAudio } from '../../../core/global'

// ========================================
// AUDIO PLAY
// ========================================

export const audioPlayCommand: TerminalCommand = {
    name: 'play',
    description: 'Play current track or specific track by name',
    usage: 'play [track-name]',
    execute: async (args, _context) => {
        const audio = useGlobalAudio()

        if (args.length > 0) {
            // TODO: Implementar busca por nome
            return {
                type: 'warning',
                text: 'Playing specific track not yet implemented.\nUse "play" to resume current track.'
            }
        }

        audio.play()

        return {
            type: 'success',
            text: '▶️  Playback started'
        }
    }
}

// ========================================
// AUDIO PAUSE
// ========================================

export const audioPauseCommand: TerminalCommand = {
    name: 'pause',
    description: 'Pause current track',
    usage: 'pause',
    execute: async (_args, _context) => {
        const audio = useGlobalAudio()
        audio.pause()

        return {
            type: 'success',
            text: '⏸️  Playback paused'
        }
    }
}

// ========================================
// AUDIO VOLUME
// ========================================

export const audioVolumeCommand: TerminalCommand = {
    name: 'volume',
    description: 'Get or set volume (0-100)',
    usage: 'volume [level]',
    execute: async (args, _context) => {
        const audio = useGlobalAudio()

        if (args.length === 0) {
            // Mostrar volume atual
            const currentVolume = Math.round(audio.state.value.volume * 100)
            return {
                type: 'info',
                text: `🔊 Volume: ${currentVolume}%`
            }
        }

        const level = parseInt(args[0])

        if (isNaN(level) || level < 0 || level > 100) {
            return {
                type: 'error',
                text: 'Invalid volume level. Use 0-100.'
            }
        }

        audio.setVolume(level / 100)

        return {
            type: 'success',
            text: `🔊 Volume set to ${level}%`
        }
    }
}

// ========================================
// AUDIO STATUS
// ========================================

export const audioStatusCommand: TerminalCommand = {
    name: 'audio',
    description: 'Show audio player status and information',
    aliases: ['status'],
    usage: 'audio [info|freq]',
    execute: async (args, _context) => {
        const audio = useGlobalAudio()
        const state = audio.state.value

        const subcommand = args[0] || 'info'

        if (subcommand === 'freq' || subcommand === 'frequencies') {
            // Mostrar frequências em tempo real
            const freqData = state.frequencyData

            if (!freqData || freqData.length === 0) {
                return {
                    type: 'warning',
                    text: 'No audio playing. Start playback to see frequency data.'
                }
            }

            const bass = Math.round(freqData[0] || 0)
            const mid = Math.round(freqData[1] || 0)
            const treble = Math.round(freqData[2] || 0)

            return {
                type: 'info',
                text: [
                    '🎵 Frequency Analysis',
                    '',
                    `Bass:   ${'█'.repeat(Math.floor(bass / 10))} ${bass}`,
                    `Mid:    ${'█'.repeat(Math.floor(mid / 10))} ${mid}`,
                    `Treble: ${'█'.repeat(Math.floor(treble / 10))} ${treble}`,
                    '',
                    'Tip: Use "watch audio freq" for live monitoring'
                ].join('\n')
            }
        }

        // Info padrão
        const volume = Math.round(state.volume * 100)
        const isPlaying = state.isPlaying
        const currentTime = Math.round(state.currentTime)
        const duration = Math.round(state.duration)

        return {
            type: 'info',
            text: [
                '🎵 Audio Player Status',
                '',
                `State:    ${isPlaying ? '▶️  Playing' : '⏸️  Paused'}`,
                `Volume:   🔊 ${volume}%`,
                `Time:     ${formatTime(currentTime)} / ${formatTime(duration)}`,
                `Track:    ${state.currentTrack || 'No track loaded'}`,
                '',
                'Commands: play, pause, volume <0-100>',
                'See frequencies: audio freq'
            ].join('\n')
        }
    }
}

// ========================================
// PLAYLIST
// ========================================

export const playlistCommand: TerminalCommand = {
    name: 'playlist',
    description: 'Show current playlist',
    usage: 'playlist',
    execute: async (_args, _context) => {
        // TODO: Integrar com sistema real de playlist
        return {
            type: 'info',
            text: [
                '📝 Playlist',
                '',
                '1. Track One.mp3',
                '2. Track Two.mp3',
                '3. Track Three.mp3',
                '',
                'Tip: Use "playlist | grep <name>" to search'
            ].join('\n')
        }
    }
}

// ========================================
// HELPER
// ========================================

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}
