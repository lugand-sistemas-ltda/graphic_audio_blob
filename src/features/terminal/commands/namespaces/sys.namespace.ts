/**
 * System Command Namespace
 * Comandos de sistema e monitoramento (sys <subcommand>)
 */

import type { TerminalCommand } from '../../types'
import { useWindowManager } from '../../../../core/sync'
import { useGlobalAudio } from '../../../../core/global'
import { useGlobalTheme } from '../../../../core/global'
import { getAliveWindows } from '../../../../core/sync/useBroadcastSync'
import type { WindowInfo } from '../../../../core/sync/types'

// ========================================
// SYS NAMESPACE
// ========================================

export const sysNamespace: TerminalCommand = {
    name: 'sys',
    description: 'System information and monitoring',
    usage: 'sys <subcommand> [args]',
    execute: async (args, _context) => {
        const subcommand = args[0]?.toLowerCase()

        if (!subcommand) {
            return {
                type: 'info',
                text: [
                    '⚙️  System Commands:',
                    '',
                    '  sys info          System information',
                    '  sys monitor       System monitor dashboard',
                    '  sys uptime        Session uptime',
                    '  sys env           Environment variables',
                    '  sys processes     Running processes (windows)',
                    '',
                    'Examples:',
                    '  sys monitor',
                    '  sys env | grep THEME',
                    '  sys processes | grep visual'
                ].join('\n')
            }
        }

        const subArgs = args.slice(1)

        switch (subcommand) {
            case 'info':
                return await sysInfo()
            case 'monitor':
            case 'top':
                return await sysMonitor()
            case 'uptime':
                return await sysUptime()
            case 'env':
            case 'environment':
                return await sysEnv()
            case 'processes':
            case 'ps':
                return await sysProcesses(subArgs)
            default:
                return {
                    type: 'error',
                    text: `Unknown sys subcommand: ${subcommand}\nUse "sys" to see available commands.`
                }
        }
    }
}

// ========================================
// SUBCOMMANDS
// ========================================

async function sysInfo() {
    return {
        type: 'info',
        text: [
            '⚙️  Spectral Visualizer',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            'Version:     0.0.7+',
            'Platform:    Web',
            'Renderer:    WebGL + Canvas',
            'Audio API:   Web Audio API',
            'Storage:     LocalStorage',
            '',
            'Features:',
            '  ✓ Multi-window support',
            '  ✓ Real-time audio analysis',
            '  ✓ Visual effects system',
            '  ✓ Theme customization',
            '  ✓ Terminal commands'
        ].join('\n')
    }
}

async function sysMonitor() {
    const windowManager = useWindowManager()
    const audio = useGlobalAudio()
    const theme = useGlobalTheme()

    const windowCount = windowManager.windowCount.value
    const audioState = audio.state.value
    const themeState = theme.state.value

    return {
        type: 'info',
        text: [
            '╔════════════════════════════════════╗',
            '║   SPECTRAL VISUALIZER - MONITOR   ║',
            '╚════════════════════════════════════╝',
            '',
            '🪟 Windows',
            `   Active:     ${windowCount}`,
            `   Type:       ${windowManager.isMainWindow.value ? 'Main' : 'Secondary'}`,
            '',
            '🎵 Audio',
            `   State:      ${audioState.isPlaying ? '▶️  Playing' : '⏸️  Paused'}`,
            `   Volume:     ${Math.round(audioState.volume * 100)}%`,
            `   Track:      ${audioState.currentTrackIndex + 1}/${audioState.tracks.length}`,
            '',
            '🎨 Theme',
            `   Current:    ${themeState.currentTheme}`,
            `   RGB Mode:   ${themeState.rgbMode.enabled ? '✓' : '✗'}`,
            `   Chameleon:  ${themeState.chameleonMode.enabled ? '✓' : '✗'}`,
            '',
            '💡 Tip: Press Ctrl+C to refresh'
        ].join('\n')
    }
}

async function sysUptime() {
    // TODO: Implementar tracking real de tempo
    return {
        type: 'info',
        text: '⏱️  Uptime: Session started recently'
    }
}

async function sysEnv() {
    const windowManager = useWindowManager()
    const audio = useGlobalAudio()
    const theme = useGlobalTheme()

    const env = {
        'SPECTRAL_VERSION': '0.0.7+',
        'WINDOW_ROLE': windowManager.currentRole.value,
        'WINDOW_ID': windowManager.currentWindowId.value?.substring(0, 8) || 'unknown',
        'WINDOW_COUNT': windowManager.windowCount.value.toString(),
        'THEME': theme.state.value.currentTheme,
        'RGB_MODE': theme.state.value.rgbMode.enabled ? 'ON' : 'OFF',
        'CHAMELEON_MODE': theme.state.value.chameleonMode.enabled ? 'ON' : 'OFF',
        'AUDIO_PLAYING': audio.state.value.isPlaying ? 'true' : 'false',
        'AUDIO_VOLUME': Math.round(audio.state.value.volume * 100).toString(),
        'AUDIO_TRACKS': audio.state.value.tracks.length.toString()
    }

    const lines = ['⚙️  Environment Variables', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━']

    Object.entries(env).forEach(([key, value]) => {
        lines.push(`${key}=${value}`)
    })

    return {
        type: 'info',
        text: lines.join('\n')
    }
}

async function sysProcesses(args: string[]) {
    const windows = getAliveWindows()

    if (windows.length === 0) {
        return {
            type: 'info',
            text: 'No processes running'
        }
    }

    const showAll = args.includes('-a') || args.includes('--all')

    const lines = [
        '⚙️  Running Processes',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'PID      ROLE        TITLE'
    ]

    windows.forEach((win: WindowInfo) => {
        const pid = win.id.substring(0, 6)
        const role = (win.role || 'unknown').padEnd(11)
        const title = win.title || 'Untitled'

        lines.push(`${pid}   ${role} ${title}`)
    })

    if (showAll) {
        lines.push('')
        lines.push(`Total: ${windows.length} processes`)
    }

    return {
        type: 'info',
        text: lines.join('\n')
    }
}
