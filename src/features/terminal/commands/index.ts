/**
 * Terminal Commands - Entry Point
 * Exporta todos os comandos disponíveis e gerencia registro
 */

import { registerCommand } from './registry'
import { helpCommand, clearCommand, infoCommand, exitCommand } from './basic'

// Import namespaced commands
import {
    audioNamespace,
    effectNamespace,
    windowNamespace,
    themeNamespace,
    sysNamespace,
    configNamespace
} from './namespaces'

// ========================================
// AUTO-REGISTER ALL COMMANDS
// ========================================

export function registerBasicCommands() {
    // Basic commands
    registerCommand(helpCommand)
    registerCommand(clearCommand)
    registerCommand(infoCommand)
    registerCommand(exitCommand)
}

export function registerNamespaceCommands() {
    // Namespaced commands
    registerCommand(audioNamespace)
    registerCommand(effectNamespace)
    registerCommand(windowNamespace)
    registerCommand(themeNamespace)
    registerCommand(sysNamespace)
    registerCommand(configNamespace)
}

export function registerAllCommands() {
    registerBasicCommands()
    registerNamespaceCommands()
}

// ========================================
// EXPORTS
// ========================================

export { registerCommand, unregisterCommand, getCommand, getAllCommands, executeCommand } from './registry'

export const terminalCommands = {
    // Basic
    help: helpCommand,
    clear: clearCommand,
    info: infoCommand,
    exit: exitCommand,

    // Namespaces
    audio: audioNamespace,
    effect: effectNamespace,
    window: windowNamespace,
    theme: themeNamespace,
    sys: sysNamespace
}

