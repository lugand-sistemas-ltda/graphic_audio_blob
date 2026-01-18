/**
 * System Commands
 * Comandos de sistema e monitoramento
 */

import type { TerminalCommand } from '../types'
import { useWindowManager } from '../../../core/sync'
import { useGlobalAudio } from '../../../core/global'
import { useGlobalTheme } from '../../../core/global'

// ========================================
// PS (Process Status)
// ========================================

export const psCommand: TerminalCommand = {
    name: 'ps',
    description: 'Show running windows (processes)',
    usage: 'ps [-a]',
    execute: async (args, _context) => {
        const windowManager = useWindowManager({ enableLogging: false })
        const windows = windowManager.getAliveWindows()

        if (windows.length === 0) {
            return {
                type: 'info',
                text: 'No active windows'
            }
        }

        const lines = [
            'PID    ROLE        TITLE',
            '---    ----        -----'
        ]

        windows.forEach(win => {
            const pid = win.id.slice(0, 6)
            const role = (win.role || 'custom').padEnd(11)
            const title = win.title || 'Untitled'

            lines.push(`${pid} ${role} ${title}`)
        })

        return {
            type: 'info',
            text: lines.join('\n')
        }
    }
}

// ========================================
// TOP (System Monitor)
// ========================================

export const topCommand: TerminalCommand = {
    name: 'top',
    description: 'Display system resource usage',
    usage: 'top',
    execute: async (_args, _context) => {
        const audio = useGlobalAudio()
        const windowManager = useWindowManager({ enableLogging: false })
        const theme = useGlobalTheme()

        const windows = windowManager.getAliveWindows()
        const volume = Math.round(audio.state.value.volume * 100)
        const isPlaying = audio.state.value.isPlaying

        return {
            type: 'info',
            text: [
                '╔════════════════════════════════════╗',
                '║   SPECTRAL VISUALIZER - MONITOR   ║',
                '╚════════════════════════════════════╝',
                '',
                `Windows:     ${windows.length} active`,
                `Audio:       ${isPlaying ? '▶️  Playing' : '⏸️  Stopped'}`,
                `Volume:      ${volume}%`,
                `Theme:       ${theme.currentTheme.value}`,
                `RGB Mode:    ${theme.isRgbActive.value ? '✓ Active' : '✗ Inactive'}`,
                '',
                'Press Ctrl+C to stop monitoring',
                'Use "ps" to see window details'
            ].join('\n')
        }
    }
}

// ========================================
// UPTIME
// ========================================

export const uptimeCommand: TerminalCommand = {
    name: 'uptime',
    description: 'Show application uptime',
    usage: 'uptime',
    execute: async (_args, _context) => {
        // TODO: Implementar tracking real de uptime
        return {
            type: 'info',
            text: '⏱️  Uptime: Session started recently'
        }
    }
}

// ========================================
// WHOAMI
// ========================================

export const whoamiCommand: TerminalCommand = {
    name: 'whoami',
    description: 'Show current window role',
    usage: 'whoami',
    execute: async (_args, _context) => {
        const windowManager = useWindowManager({ enableLogging: false })
        const role = windowManager.currentRole.value
        const windowId = windowManager.currentWindowId.value

        return {
            type: 'info',
            text: [
                `Role:      ${role}`,
                `Window ID: ${windowId}`,
                '',
                'Available roles: main, visual, controls, grid, custom'
            ].join('\n')
        }
    }
}

// ========================================
// ENV (Environment)
// ========================================

export const envCommand: TerminalCommand = {
    name: 'env',
    description: 'Show environment variables',
    usage: 'env',
    execute: async (_args, _context) => {
        const audio = useGlobalAudio()
        const theme = useGlobalTheme()
        const windowManager = useWindowManager({ enableLogging: false })

        return {
            type: 'info',
            text: [
                'SPECTRAL_VERSION=0.0.7',
                `WINDOW_ROLE=${windowManager.currentRole.value}`,
                `WINDOW_ID=${windowManager.currentWindowId.value}`,
                `THEME=${theme.currentTheme.value}`,
                `RGB_MODE=${theme.isRgbActive.value ? 'ON' : 'OFF'}`,
                `AUDIO_PLAYING=${audio.state.value.isPlaying ? 'true' : 'false'}`,
                `VOLUME=${Math.round(audio.state.value.volume * 100)}`,
                '',
                'Use "env | grep <key>" to filter'
            ].join('\n')
        }
    }
}
