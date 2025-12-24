import { reactive, watch } from 'vue'
import { broadcast, onMessage } from '../sync/useBroadcastSync'
import type {
    GlobalState,
    WindowId,
    WindowConfig,
    ComponentId,
    ComponentState,
    StateAction,
    GlobalStateConfig,
    ComponentTransform,
    VisualEffect
} from './types'

/**
 * Global State Manager - Estado compartilhado entre todas as janelas
 * 
 * Gerencia ownership de componentes, configuração de janelas e sincronização
 */

const DEFAULT_CONFIG: Required<GlobalStateConfig> = {
    persistKey: 'spectral-visualizer-global-state',
    enableLogging: false
}

// Estado global reativo (singleton)
const globalState = reactive<GlobalState>({
    windows: {},
    components: {},
    draggedComponent: {
        id: null,
        sourceWindowId: null,
        mousePosition: null
    }
})

let config: Required<GlobalStateConfig> = DEFAULT_CONFIG
let currentWindowId: WindowId | null = null

/**
 * Log condicional
 */
function log(...args: any[]) {
    if (config.enableLogging) {
        console.log('[GlobalState]', ...args)
    }
}

/**
 * Persiste estado no localStorage
 */
function persistState() {
    try {
        const stateToPersist = {
            windows: globalState.windows,
            components: globalState.components
        }
        localStorage.setItem(config.persistKey, JSON.stringify(stateToPersist))
        log('State persisted')
    } catch (error) {
        console.error('[GlobalState] Failed to persist:', error)
    }
}

/**
 * Carrega estado do localStorage
 */
function loadPersistedState() {
    try {
        const stored = localStorage.getItem(config.persistKey)
        if (stored) {
            const parsed = JSON.parse(stored)
            Object.assign(globalState.windows, parsed.windows || {})
            Object.assign(globalState.components, parsed.components || {})
            log('State loaded from localStorage')
        }
    } catch (error) {
        console.error('[GlobalState] Failed to load persisted state:', error)
    }
}

/**
 * Aplica ação no estado
 */
function applyAction(action: StateAction) {
    log('Applying action:', action.type, action.payload)

    switch (action.type) {
        case 'WINDOW_CREATED': {
            const window = action.payload
            globalState.windows[window.id] = window
            break
        }

        case 'WINDOW_UPDATED': {
            const { id, ...updates } = action.payload
            if (globalState.windows[id]) {
                Object.assign(globalState.windows[id], updates)
            }
            break
        }

        case 'WINDOW_REMOVED': {
            const { id } = action.payload
            // Move componentes da janela removida para null (não visíveis)
            Object.values(globalState.components).forEach(component => {
                if (component.windowId === id) {
                    component.windowId = null
                    component.visible = false
                }
            })
            delete globalState.windows[id]
            break
        }

        case 'COMPONENT_MOVED': {
            const { id, windowId, transform } = action.payload
            if (globalState.components[id]) {
                globalState.components[id].windowId = windowId
                globalState.components[id].transform = transform
            } else {
                globalState.components[id] = {
                    id,
                    windowId,
                    transform,
                    visible: true,
                    collapsed: false,
                    zIndex: 1
                }
            }
            break
        }

        case 'COMPONENT_UPDATED': {
            const { id, ...updates } = action.payload
            if (globalState.components[id]) {
                Object.assign(globalState.components[id], updates)
            }
            break
        }

        case 'COMPONENT_TOGGLED': {
            const { id, visible } = action.payload
            if (globalState.components[id]) {
                globalState.components[id].visible = visible
            }
            break
        }

        case 'DRAG_STARTED': {
            globalState.draggedComponent.id = action.payload.id
            globalState.draggedComponent.sourceWindowId = action.payload.windowId
            break
        }

        case 'DRAG_MOVED': {
            globalState.draggedComponent.mousePosition = action.payload.mousePosition
            break
        }

        case 'DRAG_ENDED': {
            const { id, windowId, transform } = action.payload
            if (globalState.components[id]) {
                globalState.components[id].windowId = windowId
                globalState.components[id].transform = transform
            }
            // Reset drag state
            globalState.draggedComponent.id = null
            globalState.draggedComponent.sourceWindowId = null
            globalState.draggedComponent.mousePosition = null
            break
        }

        case 'STATE_SYNC': {
            // Full state sync (usado para inicialização)
            Object.assign(globalState.windows, action.payload.windows)
            Object.assign(globalState.components, action.payload.components)
            break
        }
    }

    persistState()
}

/**
 * Dispatch de ação (local + broadcast)
 */
function dispatch(action: StateAction) {
    applyAction(action)
    broadcast('GLOBAL_STATE_ACTION', action)
}

/**
 * Inicializa sistema de estado global
 */
export function useGlobalState(customConfig?: Partial<GlobalStateConfig>) {
    // Aplica config
    if (customConfig) {
        config = { ...DEFAULT_CONFIG, ...customConfig }
    }

    // Carrega estado persistido (apenas na primeira chamada)
    if (Object.keys(globalState.windows).length === 0) {
        loadPersistedState()
    }

    // Escuta ações de outras janelas
    onMessage('GLOBAL_STATE_ACTION', (action: StateAction) => {
        applyAction(action)
    })

    // Auto-persist em mudanças
    watch(
        () => [globalState.windows, globalState.components],
        () => persistState(),
        { deep: true }
    )

    return {
        // Estado
        state: globalState,

        // Current window
        setCurrentWindowId: (id: WindowId) => {
            currentWindowId = id
        },
        getCurrentWindowId: () => currentWindowId,

        // Dispatch
        dispatch
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Registra nova janela
 */
export function registerWindow(window: WindowConfig) {
    const { dispatch } = useGlobalState()
    dispatch({ type: 'WINDOW_CREATED', payload: window })
}

/**
 * Atualiza janela
 */
export function updateWindow(id: WindowId, updates: Partial<WindowConfig>) {
    const { dispatch } = useGlobalState()
    dispatch({ type: 'WINDOW_UPDATED', payload: { id, ...updates } })
}

/**
 * Remove janela
 */
export function removeWindow(id: WindowId) {
    const { dispatch } = useGlobalState()
    dispatch({ type: 'WINDOW_REMOVED', payload: { id } })
}

/**
 * Move componente para janela
 */
export function moveComponent(id: ComponentId, windowId: WindowId | null, transform: ComponentTransform) {
    const { dispatch } = useGlobalState()
    dispatch({ type: 'COMPONENT_MOVED', payload: { id, windowId, transform } })
}

/**
 * Atualiza componente
 */
export function updateComponent(id: ComponentId, updates: Partial<ComponentState>) {
    const { dispatch } = useGlobalState()
    dispatch({ type: 'COMPONENT_UPDATED', payload: { id, ...updates } })
}

/**
 * Toggle visibilidade de componente
 */
export function toggleComponent(id: ComponentId, visible: boolean) {
    const { dispatch } = useGlobalState()
    dispatch({ type: 'COMPONENT_TOGGLED', payload: { id, visible } })
}

/**
 * Inicia drag
 */
export function startDrag(id: ComponentId, windowId: WindowId) {
    const { dispatch } = useGlobalState()
    dispatch({ type: 'DRAG_STARTED', payload: { id, windowId } })
}

/**
 * Atualiza posição do mouse durante drag
 */
export function updateDragPosition(mousePosition: { x: number; y: number }) {
    const { dispatch } = useGlobalState()
    dispatch({ type: 'DRAG_MOVED', payload: { mousePosition } })
}

/**
 * Finaliza drag
 */
export function endDrag(id: ComponentId, windowId: WindowId | null, transform: ComponentTransform) {
    const { dispatch } = useGlobalState()
    dispatch({ type: 'DRAG_ENDED', payload: { id, windowId, transform } })
}

/**
 * Obtém componentes de uma janela
 */
export function getWindowComponents(windowId: WindowId): ComponentState[] {
    const { state } = useGlobalState()
    return Object.values(state.components).filter(c => c.windowId === windowId)
}

/**
 * Obtém janelas disponíveis
 */
export function getWindows(): WindowConfig[] {
    const { state } = useGlobalState()
    return Object.values(state.windows)
}

/**
 * Verifica se componente está em janela específica
 */
export function isComponentInWindow(componentId: ComponentId, windowId: WindowId): boolean {
    const { state } = useGlobalState()
    return state.components[componentId]?.windowId === windowId
}

/**
 * Adiciona efeito visual a janela
 */
export function addWindowEffect(windowId: WindowId, effect: VisualEffect) {
    const { state, dispatch } = useGlobalState()
    const window = state.windows[windowId]
    if (window && !window.effects.includes(effect)) {
        dispatch({
            type: 'WINDOW_UPDATED',
            payload: {
                id: windowId,
                effects: [...window.effects, effect]
            }
        })
    }
}

/**
 * Remove efeito visual de janela
 */
export function removeWindowEffect(windowId: WindowId, effect: VisualEffect) {
    const { state, dispatch } = useGlobalState()
    const window = state.windows[windowId]
    if (window) {
        dispatch({
            type: 'WINDOW_UPDATED',
            payload: {
                id: windowId,
                effects: window.effects.filter(e => e !== effect)
            }
        })
    }
}

/**
 * Toggle efeito visual de janela
 */
export function toggleWindowEffect(windowId: WindowId, effect: VisualEffect) {
    const { state } = useGlobalState()
    const window = state.windows[windowId]
    if (window?.effects.includes(effect)) {
        removeWindowEffect(windowId, effect)
    } else {
        addWindowEffect(windowId, effect)
    }
}
