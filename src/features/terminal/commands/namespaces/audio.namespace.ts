/**
 * Audio Command Namespace
 * Comandos para controle de áudio (audio <subcommand>)
 */

import type { TerminalCommand } from '../../types'
import { useGlobalAudio } from '../../../../core/global'
import { useWindowManager } from '../../../../core/sync'

// ========================================
// AUDIO NAMESPACE
// ========================================

export const audioNamespace: TerminalCommand = {
    name: 'audio',
    description: 'Audio player control',
    usage: 'audio <subcommand> [args]',
    execute: async (args, context) => {
        const subcommand = args[0]?.toLowerCase()

        if (!subcommand) {
            return {
                type: 'info',
                text: [
                    '🎵 Audio Commands:',
                    '',
                    '  audio play [track]      Play/resume audio',
                    '  audio pause             Pause playback',
                    '  audio stop              Stop playback',
                    '  audio volume [0-100]    Get/set volume',
                    '  audio status            Show player status',
                    '  audio freq              Show frequency analysis',
                    '  audio playlist          Show playlist',
                    '  audio next              Next track',
                    '  audio prev              Previous track',
                    '',
                    'Examples:',
                    '  audio play',
                    '  audio volume 75',
                    '  audio freq',
                    '  audio playlist | grep jazz'
                ].join('\n')
            }
        }

        const subArgs = args.slice(1)

        switch (subcommand) {
            case 'play':
                return await audioPlay(subArgs)
            case 'pause':
                return await audioPause()
            case 'stop':
                return await audioStop()
            case 'volume':
                return await audioVolume(subArgs)
            case 'status':
                return await audioStatus()
            case 'freq':
                return await audioFreq()
            case 'playlist':
                return await audioPlaylist()
            case 'next':
                return await audioNext()
            case 'prev':
                return await audioPrev()
            default:
                return {
                    type: 'error',
                    text: `Unknown audio subcommand: ${subcommand}\nUse "audio" to see available commands.`
                }
        }
    }
}

// ========================================
// SUBCOMMANDS
// ========================================

async function audioPlay(args: string[]) {
    const audio = useGlobalAudio()
    const windowManager = useWindowManager()
    const windowId = windowManager.currentWindowId.value || 'terminal'

    if (args.length > 0) {
        // TODO: Buscar e tocar faixa específica
        return {
            type: 'warning',
            text: `⚠️  Playing specific tracks not yet implemented.\nPlaying current track...`
        }
    }

    if (!audio.state.value.isPlaying) {
        audio.play(windowId)
    }

    return {
        type: 'success',
        text: '▶️  Playback started'
    }
}

async function audioPause() {
    const audio = useGlobalAudio()
    const windowManager = useWindowManager()
    const windowId = windowManager.currentWindowId.value || 'terminal'

    if (audio.state.value.isPlaying) {
        audio.pause(windowId)
    }

    return {
        type: 'success',
        text: '⏸️  Playback paused'
    }
}

async function audioStop() {
    const audio = useGlobalAudio()
    const windowManager = useWindowManager()
    const windowId = windowManager.currentWindowId.value || 'terminal'

    if (audio.state.value.isPlaying) {
        audio.pause(windowId)
    }

    // Reset para início
    audio.seek(0, windowId)

    return {
        type: 'success',
        text: '⏹️  Playback stopped'
    }
}

async function audioVolume(args: string[]) {
    const audio = useGlobalAudio()

    if (args.length === 0) {
        const volume = Math.round(audio.state.value.volume * 100)
        return {
            type: 'info',
            text: `🔊 Volume: ${volume}%`
        }
    }

    const level = Number.parseInt(args[0]!, 10)

    if (isNaN(level) || level < 0 || level > 100) {
        return {
            type: 'error',
            text: 'Invalid volume level. Use 0-100.'
        }
    }

    const windowManager = useWindowManager()
    const windowId = windowManager.currentWindowId.value || 'terminal'
    audio.setVolume(level / 100, windowId)

    return {
        type: 'success',
        text: `🔊 Volume set to ${level}%`
    }
}

async function audioStatus() {
    const audio = useGlobalAudio()
    const state = audio.state.value

    const currentTime = formatTime(state.currentTime)
    const duration = formatTime(state.duration)
    const volume = Math.round(state.volume * 100)

    // Obter nome da faixa atual
    const currentTrack = state.tracks[state.currentTrackIndex]
    const trackName = currentTrack?.name || 'No track loaded'

    return {
        type: 'info',
        text: [
            '🎵 Audio Player Status',
            '━━━━━━━━━━━━━━━━━━━━',
            `State:    ${state.isPlaying ? '▶️  Playing' : '⏸️  Paused'}`,
            `Volume:   🔊 ${volume}%`,
            `Time:     ${currentTime} / ${duration}`,
            `Track:    ${trackName}`,
            `Index:    ${state.currentTrackIndex + 1} / ${state.tracks.length}`
        ].join('\n')
    }
}

async function audioFreq() {
    const audio = useGlobalAudio()
    const freqData = audio.state.value.frequencyData

    if (!freqData) {
        return {
            type: 'warning',
            text: '⚠️  No frequency data available. Is audio playing?'
        }
    }

    const bass = Math.round(freqData.bass)
    const mid = Math.round(freqData.mid)
    const treble = Math.round(freqData.treble)

    const bassBar = createBar(bass, 100)
    const midBar = createBar(mid, 100)
    const trebleBar = createBar(treble, 100)

    return {
        type: 'info',
        text: [
            '🎵 Frequency Analysis',
            '━━━━━━━━━━━━━━━━━━━━',
            `Bass:   ${bassBar} ${bass}`,
            `Mid:    ${midBar} ${mid}`,
            `Treble: ${trebleBar} ${treble}`
        ].join('\n')
    }
}

async function audioPlaylist() {
    const audio = useGlobalAudio()
    const tracks = audio.state.value.tracks

    if (tracks.length === 0) {
        return {
            type: 'info',
            text: '📝 Playlist is empty'
        }
    }

    const lines = ['📝 Playlist', '━━━━━━━━━━━━━━━━━━━━']

    tracks.forEach((track, index) => {
        const current = index === audio.state.value.currentTrackIndex ? '▶' : ' '
        lines.push(`${current} ${index + 1}. ${track.name}`)
    })

    lines.push('')
    lines.push('💡 Tip: Use "audio playlist | grep <name>" to search')

    return {
        type: 'info',
        text: lines.join('\n')
    }
}

async function audioNext() {
    const audio = useGlobalAudio()
    const windowManager = useWindowManager()
    const windowId = windowManager.currentWindowId.value || 'terminal'

    audio.nextTrack(windowId)

    const currentTrack = audio.state.value.tracks[audio.state.value.currentTrackIndex]
    const trackName = currentTrack?.name || 'Unknown'

    return {
        type: 'success',
        text: `⏭️  Next track: ${trackName}`
    }
}

async function audioPrev() {
    const audio = useGlobalAudio()
    const windowManager = useWindowManager()
    const windowId = windowManager.currentWindowId.value || 'terminal'

    audio.previousTrack(windowId)

    const currentTrack = audio.state.value.tracks[audio.state.value.currentTrackIndex]
    const trackName = currentTrack?.name || 'Unknown'

    return {
        type: 'success',
        text: `⏮️  Previous track: ${trackName}`
    }
}

// ========================================
// HELPERS
// ========================================

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

function createBar(value: number, max: number, length = 10): string {
    const filled = Math.round((value / max) * length)
    return '█'.repeat(filled) + '░'.repeat(length - filled)
}
