/**
 * Config Command Namespace
 * Comandos para configuração do sistema (config <subcommand>)
 */

import type { TerminalCommand } from '../../types'

// ========================================
// CONFIG NAMESPACE
// ========================================

export const configNamespace: TerminalCommand = {
    name: 'config',
    description: 'System configuration management',
    usage: 'config <subcommand> [args]',
    execute: async (args, _context) => {
        const subcommand = args[0]?.toLowerCase()

        if (!subcommand) {
            return {
                type: 'info',
                text: [
                    '⚙️  Config Commands:',
                    '',
                    '  config get <key>         Get configuration value',
                    '  config set <key> <value> Set configuration value',
                    '  config list              List all configurations',
                    '  config reset [key]       Reset config (or specific key)',
                    '',
                    'Examples:',
                    '  config set autoplay true',
                    '  config get volume',
                    '  config list',
                    '  config reset autoplay'
                ].join('\n')
            }
        }

        const subArgs = args.slice(1)

        switch (subcommand) {
            case 'get':
                return await configGet(subArgs)
            case 'set':
                return await configSet(subArgs)
            case 'list':
            case 'ls':
                return await configList()
            case 'reset':
                return await configReset(subArgs)
            default:
                return {
                    type: 'error',
                    text: `Unknown config subcommand: ${subcommand}\nUse "config" to see available commands.`
                }
        }
    }
}

// ========================================
// CONFIGURATION STORAGE
// ========================================

// 🔧 Configurações do sistema (persiste em localStorage)
const CONFIG_KEY = 'spectral_config'

interface SystemConfig {
    autoplay: boolean
    defaultVolume: number
    defaultTheme: string
    terminalHistory: number
    enableNotifications: boolean
    debugMode: boolean
}

const DEFAULT_CONFIG: SystemConfig = {
    autoplay: false,
    defaultVolume: 75,
    defaultTheme: 'dark',
    terminalHistory: 100,
    enableNotifications: true,
    debugMode: false
}

// Carrega configuração do localStorage
function loadConfig(): SystemConfig {
    const stored = localStorage.getItem(CONFIG_KEY)
    if (!stored) return { ...DEFAULT_CONFIG }

    try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
    } catch (error) {
        console.error('[Config] Failed to parse config:', error)
        return { ...DEFAULT_CONFIG }
    }
}

// Salva configuração no localStorage
function saveConfig(config: SystemConfig): void {
    try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
    } catch (error) {
        console.error('[Config] Failed to save config:', error)
    }
}

// ========================================
// SUBCOMMANDS
// ========================================

async function configGet(args: string[]) {
    if (args.length === 0) {
        return {
            type: 'error',
            text: 'Missing config key. Usage: config get <key>'
        }
    }

    const key = args[0]!
    const config = loadConfig()

    if (!(key in config)) {
        return {
            type: 'error',
            text: `Unknown config key: ${key}\n\nUse "config list" to see available keys.`
        }
    }

    const value = config[key as keyof SystemConfig]

    return {
        type: 'info',
        text: `${key} = ${value}`
    }
}

async function configSet(args: string[]) {
    if (args.length < 2) {
        return {
            type: 'error',
            text: 'Missing arguments. Usage: config set <key> <value>'
        }
    }

    const key = args[0]!
    const rawValue = args.slice(1).join(' ')

    const config = loadConfig()

    if (!(key in config)) {
        return {
            type: 'error',
            text: `Unknown config key: ${key}\n\nUse "config list" to see available keys.`
        }
    }

    // Parse value baseado no tipo esperado
    let value: string | number | boolean = rawValue
    const expectedType = typeof config[key as keyof SystemConfig]

    try {
        if (expectedType === 'boolean') {
            value = rawValue.toLowerCase() === 'true' || rawValue === '1'
        } else if (expectedType === 'number') {
            value = Number.parseFloat(rawValue)
            if (isNaN(value)) {
                throw new Error('Invalid number')
            }
        }

        // Atualiza configuração
        ; (config as Record<string, unknown>)[key] = value
        saveConfig(config)

        return {
            type: 'success',
            text: `✅ Config updated: ${key} = ${value}`
        }
    } catch (error) {
        return {
            type: 'error',
            text: `❌ Failed to parse value. Expected ${expectedType}, got: ${rawValue}`
        }
    }
}

async function configList() {
    const config = loadConfig()

    const lines = [
        '⚙️  System Configuration',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    ]

    Object.entries(config).forEach(([key, value]) => {
        const formattedKey = key.padEnd(20)
        lines.push(`  ${formattedKey} = ${value}`)
    })

    lines.push('')
    lines.push('💡 Use "config get <key>" or "config set <key> <value>"')

    return {
        type: 'info',
        text: lines.join('\n')
    }
}

async function configReset(args: string[]) {
    if (args.length === 0) {
        // Reset tudo
        saveConfig(DEFAULT_CONFIG)

        return {
            type: 'success',
            text: '✅ All configuration reset to defaults'
        }
    }

    const key = args[0]!
    const config = loadConfig()

    if (!(key in config)) {
        return {
            type: 'error',
            text: `Unknown config key: ${key}\n\nUse "config list" to see available keys.`
        }
    }

    // Reset apenas essa chave
    ; (config as Record<string, unknown>)[key] = DEFAULT_CONFIG[key as keyof SystemConfig]
    saveConfig(config)

    return {
        type: 'success',
        text: `✅ Config reset: ${key} = ${DEFAULT_CONFIG[key as keyof SystemConfig]}`
    }
}
