/**
 * Theme Command Namespace
 * Comandos para controle de temas (theme <subcommand>)
 */

import type { TerminalCommand } from '../../types'
import { useGlobalTheme } from '../../../../core/global'
import { useWindowManager } from '../../../../core/sync'

// ========================================
// THEME NAMESPACE
// ========================================

export const themeNamespace: TerminalCommand = {
    name: 'theme',
    description: 'Theme and appearance control',
    usage: 'theme <subcommand> [args]',
    execute: async (args, _context) => {
        const subcommand = args[0]?.toLowerCase()

        if (!subcommand) {
            return {
                type: 'info',
                text: [
                    '🎨 Theme Commands:',
                    '',
                    '  theme set <name>        Set theme',
                    '  theme list              List available themes',
                    '  theme current           Show current theme',
                    '  theme rgb <on|off>      Toggle RGB mode',
                    '  theme chameleon <on|off> Toggle chameleon mode',
                    '',
                    'Available themes:',
                    '  • light',
                    '  • dark',
                    '  • cyberpunk',
                    '',
                    'Examples:',
                    '  theme set cyberpunk',
                    '  theme rgb on',
                    '  theme chameleon off'
                ].join('\n')
            }
        }

        const subArgs = args.slice(1)

        switch (subcommand) {
            case 'set':
                return await themeSet(subArgs)
            case 'list':
            case 'ls':
                return await themeList()
            case 'current':
            case 'get':
                return await themeCurrent()
            case 'rgb':
                return await themeRgb(subArgs)
            case 'chameleon':
                return await themeChameleon(subArgs)
            default:
                return {
                    type: 'error',
                    text: `Unknown theme subcommand: ${subcommand}\nUse "theme" to see available commands.`
                }
        }
    }
}

// ========================================
// SUBCOMMANDS
// ========================================

async function themeSet(args: string[]) {
    if (args.length === 0) {
        return {
            type: 'error',
            text: 'Missing theme name. Usage: theme set <name>'
        }
    }

    const themeName = args[0]!
    const theme = useGlobalTheme()
    const windowManager = useWindowManager()
    const windowId = windowManager.currentWindowId.value || 'terminal'

    // Usa a API correta: setTheme(theme, windowId)
    theme.setTheme(themeName, windowId)

    return {
        type: 'success',
        text: `🎨 Theme changed to: ${themeName}`
    }
}

async function themeList() {
    const themes = [
        { name: 'light', description: 'Light theme' },
        { name: 'dark', description: 'Dark theme' },
        { name: 'cyberpunk', description: 'Cyberpunk neon theme' }
    ]

    const lines = [
        '🎨 Available Themes',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    ]

    themes.forEach(theme => {
        lines.push(`  ${theme.name.padEnd(12)} ${theme.description}`)
    })

    return {
        type: 'info',
        text: lines.join('\n')
    }
}

async function themeCurrent() {
    const theme = useGlobalTheme()
    const state = theme.state.value

    return {
        type: 'info',
        text: [
            '🎨 Current Theme Configuration',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            `Theme:      ${state.currentTheme}`,
            `RGB Mode:   ${state.rgbMode.enabled ? '✓ enabled' : '✗ disabled'}`,
            `Chameleon:  ${state.chameleonMode.enabled ? '✓ enabled' : '✗ disabled'}`
        ].join('\n')
    }
}

async function themeRgb(args: string[]) {
    const theme = useGlobalTheme()
    const windowManager = useWindowManager()
    const windowId = windowManager.currentWindowId.value || 'terminal'

    if (args.length === 0) {
        // Toggle usando a API correta
        theme.toggleRgbMode(windowId)
        const newState = theme.isRgbModeEnabled.value
        return {
            type: 'success',
            text: `🌈 RGB Mode: ${newState ? 'ON' : 'OFF'}`
        }
    }

    const action = args[0]!.toLowerCase()

    if (action === 'on' || action === 'enable' || action === '1' || action === 'true') {
        theme.setRgbConfig({ enabled: true }, windowId)
        return {
            type: 'success',
            text: '🌈 RGB Mode: ON'
        }
    } else if (action === 'off' || action === 'disable' || action === '0' || action === 'false') {
        theme.setRgbConfig({ enabled: false }, windowId)
        return {
            type: 'success',
            text: '🌈 RGB Mode: OFF'
        }
    }

    return {
        type: 'error',
        text: 'Invalid argument. Use: theme rgb <on|off>'
    }
}

async function themeChameleon(args: string[]) {
    const theme = useGlobalTheme()
    const windowManager = useWindowManager()
    const windowId = windowManager.currentWindowId.value || 'terminal'

    if (args.length === 0) {
        // Toggle usando a API correta
        theme.toggleChameleonMode(windowId)
        const newState = theme.isChameleonModeEnabled.value
        return {
            type: 'success',
            text: `🦎 Chameleon Mode: ${newState ? 'ON' : 'OFF'}`
        }
    }

    const action = args[0]!.toLowerCase()

    if (action === 'on' || action === 'enable' || action === '1' || action === 'true') {
        theme.setChameleonConfig({ enabled: true }, windowId)
        return {
            type: 'success',
            text: '🦎 Chameleon Mode: ON'
        }
    } else if (action === 'off' || action === 'disable' || action === '0' || action === 'false') {
        theme.setChameleonConfig({ enabled: false }, windowId)
        return {
            type: 'success',
            text: '🦎 Chameleon Mode: OFF'
        }
    }

    return {
        type: 'error',
        text: 'Invalid argument. Use: theme chameleon <on|off>'
    }
}
