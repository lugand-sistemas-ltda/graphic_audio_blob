/**
 * Tipos para o sistema de estado global compartilhado
 */

// ID único de janela
export type WindowId = string

// ID único de componente
export type ComponentId = string

// Efeitos visuais disponíveis
export type VisualEffect = 'gradient' | 'particles' | 'waveform' | 'tunnel' | 'fractals'

// Layout de janela
export type WindowLayout = 'free' | 'grid' | 'fullscreen'

// Configuração de uma janela
export interface WindowConfig {
    id: WindowId
    title: string // Editável pelo usuário
    role: 'main' | 'secondary'
    effects: VisualEffect[] // Quais efeitos renderizar
    layout: WindowLayout
    backgroundColor: string
    createdAt: number
    lastActive: number
    activeComponents: ComponentId[] // Lista de componentes ativos nesta janela
    allComponentsHidden: boolean // Flag para hide/show all
}

// Posição e tamanho de um componente
export interface ComponentTransform {
    x: number
    y: number
    width?: number
    height?: number
}

// Estado de um componente (por janela)
export interface ComponentState {
    id: ComponentId
    transform: ComponentTransform // Posição relativa nesta janela
    visible: boolean // Visível nesta janela?
    collapsed: boolean // Colapsado nesta janela?
    zIndex: number // Z-index nesta janela
}

// Estado global completo
export interface GlobalState {
    windows: Record<WindowId, WindowConfig>
    // Agora: windowId → componentId → state
    componentsByWindow: Record<WindowId, Record<ComponentId, ComponentState>>
    draggedComponent: {
        id: ComponentId | null
        sourceWindowId: WindowId | null
        mousePosition: { x: number; y: number } | null
    }
}

// Ações de sincronização
export type StateAction =
    | { type: 'WINDOW_CREATED'; payload: WindowConfig }
    | { type: 'WINDOW_UPDATED'; payload: Partial<WindowConfig> & { id: WindowId } }
    | { type: 'WINDOW_REMOVED'; payload: { id: WindowId } }
    | { type: 'COMPONENT_ADDED_TO_WINDOW'; payload: { windowId: WindowId; componentId: ComponentId; state: ComponentState } }
    | { type: 'COMPONENT_REMOVED_FROM_WINDOW'; payload: { windowId: WindowId; componentId: ComponentId } }
    | { type: 'COMPONENT_UPDATED_IN_WINDOW'; payload: { windowId: WindowId; componentId: ComponentId; updates: Partial<ComponentState> } }
    | { type: 'COMPONENT_VISIBILITY_TOGGLED'; payload: { windowId: WindowId; componentId: ComponentId; visible: boolean } }
    | { type: 'WINDOW_HIDE_ALL_COMPONENTS'; payload: { windowId: WindowId; hidden: boolean } }
    | { type: 'DRAG_STARTED'; payload: { id: ComponentId; windowId: WindowId } }
    | { type: 'DRAG_MOVED'; payload: { mousePosition: { x: number; y: number } } }
    | { type: 'DRAG_ENDED'; payload: { id: ComponentId; windowId: WindowId | null; transform: ComponentTransform } }
    | { type: 'STATE_SYNC'; payload: GlobalState }

// Configuração inicial
export interface GlobalStateConfig {
    persistKey?: string
    enableLogging?: boolean
}
