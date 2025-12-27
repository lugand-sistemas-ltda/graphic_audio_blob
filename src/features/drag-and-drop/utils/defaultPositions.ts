/**
 * Posições iniciais padrão para componentes draggable
 * Usado quando não há posição salva no localStorage
 */

const SPACING = 20 // pixels

export const defaultPositions = {
    'visual-effects-control': () => ({
        x: SPACING,
        y: SPACING
    }),
    'theme-selector': () => ({
        x: SPACING,
        y: SPACING + 200 // Abaixo do visual effects control
    }),
    'debug-terminal': () => ({
        x: SPACING,
        y: SPACING + 500 // Abaixo do theme selector
    }),
    'frequency-visualizer': () => ({
        x: SPACING,
        y: SPACING + 650 // Abaixo do debug terminal
    }),
    'main-control': () => {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
        return {
            x: Math.max(viewportWidth - 420, SPACING),
            y: SPACING
        }
    },
    'sound-control': () => {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
        return {
            x: Math.max(viewportWidth - 420, SPACING),
            y: SPACING + 200 // Abaixo do main control
        }
    },
    'orb-effect-control': () => {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
        return {
            x: Math.max(viewportWidth - 420, SPACING),
            y: SPACING + 550 // Abaixo do sound control
        }
    },
    'matrix-character': () => {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
        return {
            x: Math.max(viewportWidth - 220, SPACING),
            y: Math.max(viewportHeight - 320, SPACING)
        }
    }
}

export function getInitialPosition(id: string): { x: number; y: number } {
    const positionFn = defaultPositions[id as keyof typeof defaultPositions]
    if (positionFn) {
        return positionFn()
    }
    return { x: 0, y: 0 }
}
