/**
 * Terminal Types
 * Tipos compartilhados para o sistema de terminal
 */

export type TerminalLineType = 'command' | 'success' | 'error' | 'warning' | 'info' | 'separator'

export interface TerminalLine {
    type: TerminalLineType
    text: string
    timestamp?: number
}

export interface TerminalCommand {
    name: string
    description: string
    aliases?: string[]
    usage?: string
    execute: (args: string[], context: TerminalContext) => TerminalResponse | Promise<TerminalResponse>
}

export interface TerminalResponse {
    type: TerminalLineType
    text: string
}

export interface TerminalContext {
    clearTerminal: () => void
    closeTerminal: () => void
    addOutput: (line: TerminalLine) => void
    getHistory: () => string[]
}

export interface TerminalState {
    isExpanded: boolean
    isFullscreen: boolean
    outputLines: TerminalLine[]
    commandHistory: string[]
    currentInput: string
}
