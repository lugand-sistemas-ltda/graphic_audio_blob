/**
 * Configuração centralizada de componentes disponíveis
 * Esta lista é a mesma para TODAS as janelas
 */

export interface AvailableComponent {
    id: string
    name: string
    category: 'visual' | 'audio' | 'debug' | 'system'
    collapsibleId: string
}

/**
 * Lista de todos os componentes disponíveis no sistema
 * CONSTANTE - mesma para todas as janelas
 */
export const AVAILABLE_COMPONENTS: AvailableComponent[] = [
    {
        id: 'visual-effects-control',
        name: 'Visual Effects',
        category: 'visual',
        collapsibleId: 'visual-effects-control'
    },
    {
        id: 'orb-effect-control',
        name: 'Orb Effect Control',
        category: 'visual',
        collapsibleId: 'orb-effect-control'
    },
    {
        id: 'frequency-visualizer',
        name: 'Frequency Spectrum',
        category: 'visual',
        collapsibleId: 'frequency-visualizer'
    },
    {
        id: 'sound-control',
        name: 'Sound Control',
        category: 'audio',
        collapsibleId: 'sound-control'
    },
    {
        id: 'debug-terminal',
        name: 'System Monitor',
        category: 'debug',
        collapsibleId: 'debug-terminal'
    },
    {
        id: 'theme-selector',
        name: 'Theme Control',
        category: 'system',
        collapsibleId: 'theme-selector'
    },
    {
        id: 'matrix-character',
        name: 'Matrix Character',
        category: 'system',
        collapsibleId: 'matrix-character'
    }
]

/**
 * Obtém componente por ID
 */
export function getComponentById(id: string): AvailableComponent | undefined {
    return AVAILABLE_COMPONENTS.find(c => c.id === id)
}

/**
 * Obtém componentes por categoria
 */
export function getComponentsByCategory(category: AvailableComponent['category']): AvailableComponent[] {
    return AVAILABLE_COMPONENTS.filter(c => c.category === category)
}
