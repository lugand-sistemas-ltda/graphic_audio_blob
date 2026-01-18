/**
 * Terminal Commands - Entry Point
 * Exporta todos os comandos disponíveis e gerencia registro
 */

import { registerCommand } from './registry'
import { helpCommand, clearCommand, infoCommand, exitCommand } from './basic'

// ========================================
// AUTO-REGISTER BASIC COMMANDS
// ========================================

export function registerBasicCommands() {
    registerCommand(helpCommand)
    registerCommand(clearCommand)
    registerCommand(infoCommand)
    registerCommand(exitCommand)
}

// ========================================
// EXPORTS
// ========================================

export { registerCommand, unregisterCommand, getCommand, getAllCommands, executeCommand } from './registry'

export const terminalCommands = {
    help: helpCommand,
    clear: clearCommand,
    info: infoCommand,
    exit: exitCommand
}
