/**
 * Command Parser
 * Parse comandos estilo Unix/Linux com suporte a pipes, flags e argumentos
 */

export interface ParsedCommand {
    command: string
    args: string[]
    flags: Record<string, string | boolean>
    pipes: ParsedCommand[]
    raw: string
}

/**
 * Parse um comando completo com suporte a:
 * - Flags: --flag, -f, --key=value
 * - Pipes: command1 | command2
 * - Argumentos com espaços: "nome com espaço"
 * - Aspas simples e duplas
 */
export function parseCommand(input: string): ParsedCommand {
    const trimmed = input.trim()

    // Split por pipes
    const pipeParts = splitByPipe(trimmed)

    if (pipeParts.length > 1) {
        // Comando com pipes
        const mainCommand = parseSimpleCommand(pipeParts[0])
        const pipeCommands = pipeParts.slice(1).map(parseSimpleCommand)

        return {
            ...mainCommand,
            pipes: pipeCommands
        }
    }

    return parseSimpleCommand(trimmed)
}

function parseSimpleCommand(input: string): ParsedCommand {
    const tokens = tokenize(input)

    if (tokens.length === 0) {
        return {
            command: '',
            args: [],
            flags: {},
            pipes: [],
            raw: input
        }
    }

    const command = tokens[0]
    const args: string[] = []
    const flags: Record<string, string | boolean> = {}

    for (let i = 1; i < tokens.length; i++) {
        const token = tokens[i]

        if (token.startsWith('--')) {
            // Long flag: --key=value ou --flag
            const [key, value] = token.slice(2).split('=')
            flags[key] = value !== undefined ? value : true
        } else if (token.startsWith('-') && token.length === 2) {
            // Short flag: -f
            flags[token.slice(1)] = true
        } else if (token.startsWith('-') && token.length > 2) {
            // Multiple short flags: -abc = -a -b -c
            for (const char of token.slice(1)) {
                flags[char] = true
            }
        } else {
            // Argumento normal
            args.push(token)
        }
    }

    return {
        command,
        args,
        flags,
        pipes: [],
        raw: input
    }
}

/**
 * Tokeniza string respeitando aspas
 */
function tokenize(input: string): string[] {
    const tokens: string[] = []
    let current = ''
    let inQuotes = false
    let quoteChar = ''

    for (let i = 0; i < input.length; i++) {
        const char = input[i]
        const nextChar = input[i + 1]

        if ((char === '"' || char === "'") && !inQuotes) {
            inQuotes = true
            quoteChar = char
            continue
        }

        if (char === quoteChar && inQuotes) {
            inQuotes = false
            quoteChar = ''
            continue
        }

        if (char === ' ' && !inQuotes) {
            if (current) {
                tokens.push(current)
                current = ''
            }
            continue
        }

        current += char
    }

    if (current) {
        tokens.push(current)
    }

    return tokens
}

/**
 * Split por pipes respeitando aspas
 */
function splitByPipe(input: string): string[] {
    const parts: string[] = []
    let current = ''
    let inQuotes = false
    let quoteChar = ''

    for (let i = 0; i < input.length; i++) {
        const char = input[i]

        if ((char === '"' || char === "'") && !inQuotes) {
            inQuotes = true
            quoteChar = char
            current += char
            continue
        }

        if (char === quoteChar && inQuotes) {
            inQuotes = false
            quoteChar = ''
            current += char
            continue
        }

        if (char === '|' && !inQuotes) {
            parts.push(current.trim())
            current = ''
            continue
        }

        current += char
    }

    if (current) {
        parts.push(current.trim())
    }

    return parts
}

/**
 * Grep simulation - filtra linhas que contêm pattern
 */
export function grep(input: string, pattern: string, flags: Record<string, boolean> = {}): string {
    const lines = input.split('\n')
    const ignoreCase = flags['i'] || false
    const invert = flags['v'] || false

    const regex = new RegExp(pattern, ignoreCase ? 'i' : '')

    const filtered = lines.filter(line => {
        const matches = regex.test(line)
        return invert ? !matches : matches
    })

    return filtered.join('\n')
}

/**
 * Sort simulation
 */
export function sort(input: string, flags: Record<string, boolean> = {}): string {
    const lines = input.split('\n')
    const reverse = flags['r'] || false

    const sorted = [...lines].sort()

    return (reverse ? sorted.reverse() : sorted).join('\n')
}

/**
 * Head simulation - primeiras N linhas
 */
export function head(input: string, n: number = 10): string {
    const lines = input.split('\n')
    return lines.slice(0, n).join('\n')
}

/**
 * Tail simulation - últimas N linhas
 */
export function tail(input: string, n: number = 10): string {
    const lines = input.split('\n')
    return lines.slice(-n).join('\n')
}

/**
 * Wc simulation - conta linhas, palavras, caracteres
 */
export function wc(input: string, flags: Record<string, boolean> = {}): string {
    const lines = input.split('\n')
    const words = input.split(/\s+/).filter(w => w.length > 0)
    const chars = input.length

    const showLines = flags['l'] || (!flags['w'] && !flags['c'])
    const showWords = flags['w'] || (!flags['l'] && !flags['c'])
    const showChars = flags['c'] || (!flags['l'] && !flags['w'])

    const parts: string[] = []
    if (showLines) parts.push(`${lines.length} lines`)
    if (showWords) parts.push(`${words.length} words`)
    if (showChars) parts.push(`${chars} chars`)

    return parts.join(', ')
}
