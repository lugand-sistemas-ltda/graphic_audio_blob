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
}

// Posição e tamanho de um componente
export interface ComponentTransform {
    x: number
    y: number
    width?: number
    height?: number
}

// Estado de um componente
export interface ComponentState {
    id: ComponentId
    windowId: WindowId | null // null = não visível em nenhuma janela
    transform: ComponentTransform
    visible: boolean
    collapsed: boolean
    zIndex: number
}

// Estado global completo
export interface GlobalState {
    windows: Record<WindowId, WindowConfig>
    components: Record<ComponentId, ComponentState>
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
    | { type: 'COMPONENT_MOVED'; payload: { id: ComponentId; windowId: WindowId | null; transform: ComponentTransform } }
    | { type: 'COMPONENT_UPDATED'; payload: Partial<ComponentState> & { id: ComponentId } }
    | { type: 'COMPONENT_TOGGLED'; payload: { id: ComponentId; visible: boolean } }
    | { type: 'DRAG_STARTED'; payload: { id: ComponentId; windowId: WindowId } }
    | { type: 'DRAG_MOVED'; payload: { mousePosition: { x: number; y: number } } }
    | { type: 'DRAG_ENDED'; payload: { id: ComponentId; windowId: WindowId | null; transform: ComponentTransform } }
    | { type: 'STATE_SYNC'; payload: GlobalState }

// Configuração inicial
export interface GlobalStateConfig {
    persistKey?: string
    enableLogging?: boolean
}
