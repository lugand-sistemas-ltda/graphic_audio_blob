/**
 * Window Management Commands
 * Comandos para gerenciar janelas da aplicação
 */

import type { TerminalCommand } from '../types'
import { useWindowManager } from '../../../core/sync'
import { getAliveWindows, type WindowInfo } from '../../../core/sync/useBroadcastSync'
import router from '../../../app/router'

// ========================================
// WINDOW OPEN
// ========================================

export const windowOpenCommand: TerminalCommand = {
    name: 'open',
    description: 'Open a new window',
    usage: 'open <type>',
    execute: async (args, _context) => {
        if (args.length === 0) {
            return {
                type: 'error',
                text: [
                    'Missing window type.',
                    '',
                    'Available types:',
                    '  • visual       - Open visual effects window',
                    '  • audio        - Open audio analyzer',
                    '  • spectogram   - Open spectogram analyzer',
                    '  • waveform     - Open waveform analyzer',
                    '',
                    'Usage: open <type>'
                ].join('\n')
            }
        }

        const windowType = args[0]!.toLowerCase()

        // Mapear tipos para rotas
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
            // Abrir nova janela
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
}

// ========================================
// WINDOW LIST
// ========================================

export const windowListCommand: TerminalCommand = {
    name: 'windows',
    description: 'List all open windows',
    usage: 'windows',
    execute: async (_args, _context) => {
        const windows = getAliveWindows()

        if (windows.length === 0) {
            return {
                type: 'info',
                text: 'No windows registered'
            }
        }

        const lines = [
            'PID      ROLE        TITLE',
            '---      ----        -----'
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
}

// ========================================
// WINDOW FOCUS
// ========================================

export const windowFocusCommand: TerminalCommand = {
    name: 'focus',
    description: 'Focus a specific window',
    usage: 'focus <window-id|role>',
    execute: async (args, _context) => {
        if (args.length === 0) {
            return {
                type: 'error',
                text: 'Missing window identifier. Usage: focus <window-id|role>'
            }
        }

        const identifier = args[0]!
        const windows = getAliveWindows()

        // Encontrar janela por ID ou role
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

        // Não é possível dar foco programaticamente em outra janela por questões de segurança
        // Apenas podemos notificar
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
}

// ========================================
// WINDOW CLOSE
// ========================================

export const windowCloseCommand: TerminalCommand = {
    name: 'close',
    description: 'Close a window',
    usage: 'close <window-id|role>',
    execute: async (args, _context) => {
        if (args.length === 0) {
            return {
                type: 'error',
                text: 'Missing window identifier. Usage: close <window-id|role>'
            }
        }

        const identifier = args[0]!
        const windowManager = useWindowManager()
        const currentWindowId = windowManager.currentWindowId.value

        // Verificar se está tentando fechar a própria janela
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

        // Por limitações de segurança do browser, não podemos fechar outras janelas
        // Apenas podemos notificar
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
}

// ========================================
// GO COMMAND (Navigate)
// ========================================

export const goCommand: TerminalCommand = {
    name: 'go',
    description: 'Navigate to a route in current window',
    usage: 'go <route>',
    execute: async (args, _context) => {
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
                    'Usage: go <route>'
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
}
