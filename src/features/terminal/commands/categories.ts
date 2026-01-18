/**
 * Command Categories Registry
 * Central export de todos os comandos organizados por categoria
 */

// Audio Commands
export {
    audioPlayCommand,
    audioPauseCommand,
    audioVolumeCommand,
    audioStatusCommand,
    playlistCommand
} from './audio'

// System Commands
export {
    psCommand,
    topCommand,
    uptimeCommand,
    whoamiCommand,
    envCommand
} from './system'

// Theme Commands
export {
    themeCommand,
    rgbCommand,
    chameleonCommand
} from './theme'

// Window Commands
export {
    windowOpenCommand,
    windowListCommand,
    windowFocusCommand,
    windowCloseCommand,
    goCommand
} from './window'

// Parser Utilities
export {
    parseCommand,
    grep,
    sort,
    head,
    tail,
    wc
} from './parser'

// Type exports
export type { ParsedCommand } from './parser'
