/**
 * Terminal Commands Registry
 * Sistema modular para registro e gerenciamento de comandos
 */

import type { TerminalCommand, TerminalContext, TerminalResponse } from '../types'

// ========================================
// COMMAND REGISTRY
// ========================================

const commandRegistry = new Map<string, TerminalCommand>()

// ========================================
// COMMAND REGISTRATION
// ========================================

export function registerCommand(command: TerminalCommand) {
    commandRegistry.set(command.name, command)

    // Registra aliases
    if (command.aliases) {
        command.aliases.forEach(alias => {
            commandRegistry.set(alias, command)
        })
    }
}

export function unregisterCommand(name: string) {
    const command = commandRegistry.get(name)
    if (command) {
        commandRegistry.delete(name)
        // Remove aliases
        if (command.aliases) {
            command.aliases.forEach(alias => commandRegistry.delete(alias))
        }
    }
}

export function getCommand(name: string): TerminalCommand | undefined {
    return commandRegistry.get(name)
}

export function getAllCommands(): TerminalCommand[] {
    const commands = new Map<string, TerminalCommand>()

    // Remove duplicatas (aliases apontam para o mesmo comando)
    commandRegistry.forEach((command) => {
        commands.set(command.name, command)
    })

    return Array.from(commands.values())
}

// ========================================
// COMMAND EXECUTOR
// ========================================

export async function executeCommand(
    input: string,
    context: TerminalContext
): Promise<TerminalResponse> {
    const trimmed = input.trim()

    if (!trimmed) {
        return { type: 'error', text: '' }
    }

    // Parse comando e argumentos
    const parts = trimmed.split(/\s+/)
    const commandName = parts[0] || ''
    const args = parts.slice(1)

    // Busca comando
    const command = getCommand(commandName)

    if (!command) {
        return {
            type: 'error',
            text: `Command not found: ${commandName}\nType "help" for available commands`
        }
    }

    // Executa comando
    try {
        return await command.execute(args, context)
    } catch (error) {
        return {
            type: 'error',
            text: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }
}
