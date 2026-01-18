/**
 * Window Command Namespace
 * Comandos para gerenciamento de janelas (window <subcommand>)
 */

import type { TerminalCommand } from '../../types'
import { useWindowManager } from '../../../../core/sync'
import { getAliveWindows } from '../../../../core/sync/useBroadcastSync'
import type { WindowInfo } from '../../../../core/sync/types'
import router from '../../../../app/router'

// ========================================
// WINDOW NAMESPACE
// ========================================

export const windowNamespace: TerminalCommand = {
    name: 'window',
    description: 'Window management',
    usage: 'window <subcommand> [args]',
    execute: async (args, _context) => {
        const subcommand = args[0]?.toLowerCase()

        if (!subcommand) {
            return {
                type: 'info',
                text: [
                    '🪟 Window Commands:',
                    '',
                    '  window open <type>      Open new window',
                    '  window list             List all windows',
                    '  window focus <id>       Focus window',
                    '  window close <id>       Close window',
                    '  window current          Show current window',
                    '  window go <route>       Navigate in current',
                    '',
                    'Window types:',
                    '  visual, audio, spectogram, waveform',
                    '',
                    'Examples:',
                    '  window open visual',
                    '  window list | grep audio',
                    '  window go /visual'
                ].join('\n')
            }
        }

        const subArgs = args.slice(1)

        switch (subcommand) {
            case 'open':
            case 'new':
                return await windowOpen(subArgs)
            case 'list':
            case 'ls':
                return await windowList()
            case 'focus':
                return await windowFocus(subArgs)
            case 'close':
                return await windowClose(subArgs)
            case 'current':
            case 'info':
                return await windowCurrent()
            case 'go':
            case 'navigate':
                return await windowGo(subArgs)
            default:
                return {
                    type: 'error',
                    text: `Unknown window subcommand: ${subcommand}\nUse "window" to see available commands.`
                }
        }
    }
}

// ========================================
// SUBCOMMANDS
// ========================================

async function windowOpen(args: string[]) {
    if (args.length === 0) {
        return {
            type: 'error',
            text: [
                'Missing window type.',
                '',
                'Available types:',
                '  • visual       - Visual effects window',
                '  • audio        - Audio analyzer',
                '  • spectogram   - Spectogram analyzer',
                '  • waveform     - Waveform analyzer',
                '',
                'Usage: window open <type>'
            ].join('\n')
        }
    }

    const windowType = args[0]!.toLowerCase()

    const routeMap: Record<string, string> = {
        'visual': '/visual',
        'audio': '/generic/AudioAnalyzer',
        'spectogram': '/generic/SpectogramAnalyzer',
        'waveform': '/generic/WaveformAnalyzer'
    }

    const route = routeMap[windowType]

    if (!route) {
        return {
            type: 'error',
            text: `Unknown window type: ${windowType}`
        }
    }

    try {
        const width = windowType === 'visual' ? 800 : 600
        const height = windowType === 'visual' ? 600 : 400

        const newWindow = window.open(
            `${window.location.origin}/#${route}`,
            '_blank',
            `width=${width},height=${height}`
        )

        if (!newWindow) {
            return {
                type: 'error',
                text: '❌ Failed to open window (popup blocked?)'
            }
        }

        return {
            type: 'success',
            text: `✓ Opening ${windowType} window...`
        }
    } catch (error) {
        return {
            type: 'error',
            text: `❌ Error opening window: ${error}`
        }
    }
}

async function windowList() {
    const windows = getAliveWindows()

    if (windows.length === 0) {
        return {
            type: 'info',
            text: 'No windows registered'
        }
    }

    const lines = [
        '🪟 Open Windows',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'PID      ROLE        TITLE'
    ]

    windows.forEach((win: WindowInfo) => {
        const pid = win.id.substring(0, 6)
        const role = (win.role || 'unknown').padEnd(11)
        const title = win.title || 'Untitled'

        lines.push(`${pid}   ${role} ${title}`)
    })

    return {
        type: 'info',
        text: lines.join('\n')
    }
}

async function windowFocus(args: string[]) {
    if (args.length === 0) {
        return {
            type: 'error',
            text: 'Missing window identifier. Usage: window focus <id|role>'
        }
    }

    const identifier = args[0]!
    const windows = getAliveWindows()

    const targetWindow = windows.find((win: WindowInfo) =>
        win.id.startsWith(identifier) ||
        win.role?.toLowerCase() === identifier.toLowerCase()
    )

    if (!targetWindow) {
        return {
            type: 'error',
            text: `Window not found: ${identifier}`
        }
    }

    return {
        type: 'info',
        text: [
            `Window found: ${targetWindow.title || 'Untitled'}`,
            `Role: ${targetWindow.role}`,
            `ID: ${targetWindow.id}`,
            '',
            '⚠️  Cannot programmatically focus other windows (browser security)',
            'Please click on the window to focus it.'
        ].join('\n')
    }
}

async function windowClose(args: string[]) {
    if (args.length === 0) {
        return {
            type: 'error',
            text: 'Missing window identifier. Usage: window close <id|role>'
        }
    }

    const identifier = args[0]!
    const windowManager = useWindowManager()
    const currentWindowId = windowManager.currentWindowId.value

    if (identifier === 'self' || (currentWindowId && identifier === currentWindowId.substring(0, 6))) {
        return {
            type: 'warning',
            text: '⚠️  Cannot close current window. Use the close button or type "exit".'
        }
    }

    const windows = getAliveWindows()
    const targetWindow = windows.find((win: WindowInfo) =>
        win.id.startsWith(identifier) ||
        win.role?.toLowerCase() === identifier.toLowerCase()
    )

    if (!targetWindow) {
        return {
            type: 'error',
            text: `Window not found: ${identifier}`
        }
    }

    return {
        type: 'warning',
        text: [
            `Window found: ${targetWindow.title || targetWindow.role}`,
            '',
            '⚠️  Cannot programmatically close other windows (browser security)',
            'Please close the window manually.'
        ].join('\n')
    }
}

async function windowCurrent() {
    const windowManager = useWindowManager()
    const windowId = windowManager.currentWindowId.value
    const role = windowManager.currentRole.value

    return {
        type: 'info',
        text: [
            '🪟 Current Window',
            '━━━━━━━━━━━━━━━━━━━━',
            `Role:      ${role}`,
            `Window ID: ${windowId || 'Not set'}`,
            `Type:      ${windowManager.isMainWindow.value ? 'Main' : 'Secondary'}`,
            `Windows:   ${windowManager.windowCount.value} active`
        ].join('\n')
    }
}

async function windowGo(args: string[]) {
    if (args.length === 0) {
        return {
            type: 'error',
            text: [
                'Missing route.',
                '',
                'Available routes:',
                '  • /              - Home',
                '  • /visual        - Visual effects',
                '  • /generic/...   - Component windows',
                '',
                'Usage: window go <route>'
            ].join('\n')
        }
    }

    const route = args[0]!

    try {
        await router.push(route)
        return {
            type: 'success',
            text: `✓ Navigated to: ${route}`
        }
    } catch (error) {
        return {
            type: 'error',
            text: `❌ Navigation failed: ${error}`
        }
    }
}
