/**
 * Theme Commands
 * Comandos para controle de temas e cores
 */

import type { TerminalCommand } from '../types'
import { useGlobalTheme } from '../../../core/global'

// ========================================
// THEME SET
// ========================================

export const themeCommand: TerminalCommand = {
    name: 'theme',
    description: 'Get or set application theme',
    usage: 'theme [name] [--rgb] [--chameleon]',
    execute: async (args, _context) => {
        const theme = useGlobalTheme()

        if (args.length === 0) {
            // Mostrar tema atual
            return {
                type: 'info',
                text: [
                    `Current theme: ${theme.currentTheme.value}`,
                    `RGB Mode: ${theme.isRgbActive.value ? '✓ Active' : '✗ Inactive'}`,
                    `Chameleon Mode: ${theme.isChameleonActive.value ? '✓ Active' : '✗ Inactive'}`,
                    '',
                    'Available themes:',
                    '  • light',
                    '  • dark',
                    '  • cyberpunk',
                    '',
                    'Usage: theme <name> [--rgb] [--chameleon]'
                ].join('\n')
            }
        }

        const themeName = args[0]
        theme.setTheme(themeName)

        return {
            type: 'success',
            text: `🎨 Theme changed to: ${themeName}`
        }
    }
}

// ========================================
// RGB COMMAND
// ========================================

export const rgbCommand: TerminalCommand = {
    name: 'rgb',
    description: 'Toggle RGB mode on/off',
    usage: 'rgb [on|off]',
    execute: async (args, _context) => {
        const theme = useGlobalTheme()

        if (args.length === 0) {
            // Toggle
            theme.toggleRgbMode()
            const newState = theme.isRgbActive.value
            return {
                type: 'success',
                text: `🌈 RGB Mode: ${newState ? 'ON' : 'OFF'}`
            }
        }

        const action = args[0].toLowerCase()

        if (action === 'on') {
            if (!theme.isRgbActive.value) {
                theme.toggleRgbMode()
            }
            return {
                type: 'success',
                text: '🌈 RGB Mode: ON'
            }
        } else if (action === 'off') {
            if (theme.isRgbActive.value) {
                theme.toggleRgbMode()
            }
            return {
                type: 'success',
                text: '🌈 RGB Mode: OFF'
            }
        }

        return {
            type: 'error',
            text: 'Invalid argument. Use: rgb [on|off]'
        }
    }
}

// ========================================
// CHAMELEON COMMAND
// ========================================

export const chameleonCommand: TerminalCommand = {
    name: 'chameleon',
    description: 'Toggle chameleon mode (dynamic colors from audio)',
    usage: 'chameleon [on|off]',
    execute: async (args, _context) => {
        const theme = useGlobalTheme()

        if (args.length === 0) {
            // Toggle
            theme.toggleChameleonMode()
            const newState = theme.isChameleonActive.value
            return {
                type: 'success',
                text: `🦎 Chameleon Mode: ${newState ? 'ON' : 'OFF'}`
            }
        }

        const action = args[0].toLowerCase()

        if (action === 'on') {
            if (!theme.isChameleonActive.value) {
                theme.toggleChameleonMode()
            }
            return {
                type: 'success',
                text: '🦎 Chameleon Mode: ON'
            }
        } else if (action === 'off') {
            if (theme.isChameleonActive.value) {
                theme.toggleChameleonMode()
            }
            return {
                type: 'success',
                text: '🦎 Chameleon Mode: OFF'
            }
        }

        return {
            type: 'error',
            text: 'Invalid argument. Use: chameleon [on|off]'
        }
    }
}
