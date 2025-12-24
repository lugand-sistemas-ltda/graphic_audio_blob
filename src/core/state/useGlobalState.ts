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
    componentsByWindow: {}, // windowId → componentId → ComponentState
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
 * Gera chave de persistência única por janela
 */
function getWindowPersistKey(windowId: WindowId): string {
    return `${config.persistKey}-window-${windowId}`
}

/**
 * Persiste estado no localStorage (isolado por janela)
 */
function persistState() {
    if (!currentWindowId) return

    try {
        // Persiste apenas o estado desta janela
        const windowComponents = globalState.componentsByWindow[currentWindowId] || {}

        const stateToPersist = {
            window: globalState.windows[currentWindowId],
            components: windowComponents
        }

        const key = getWindowPersistKey(currentWindowId)
        localStorage.setItem(key, JSON.stringify(stateToPersist))
        log(`State persisted for window ${currentWindowId}`)
    } catch (error) {
        console.error('[GlobalState] Failed to persist:', error)
    }
}

/**
 * Carrega estado do localStorage (isolado por janela)
 */
function loadPersistedState(windowId: WindowId) {
    try {
        const key = getWindowPersistKey(windowId)
        const stored = localStorage.getItem(key)

        if (stored) {
            const parsed = JSON.parse(stored)

            // Restaura janela
            if (parsed.window) {
                globalState.windows[windowId] = parsed.window
            }

            // Restaura componentes desta janela
            if (parsed.components) {
                globalState.componentsByWindow[windowId] = parsed.components
            }

            log(`State loaded from localStorage for window ${windowId}`)
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
            // Inicializa Map de componentes para esta janela
            if (!globalState.componentsByWindow[window.id]) {
                globalState.componentsByWindow[window.id] = {}
            }
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
            // Remove janela e seus componentes
            delete globalState.windows[id]
            delete globalState.componentsByWindow[id]
            break
        }

        case 'COMPONENT_ADDED_TO_WINDOW': {
            const { windowId, componentId, state } = action.payload
            if (!globalState.componentsByWindow[windowId]) {
                globalState.componentsByWindow[windowId] = {}
            }
            globalState.componentsByWindow[windowId][componentId] = state

            // Adiciona à lista de componentes ativos da janela
            if (globalState.windows[windowId]) {
                if (!globalState.windows[windowId].activeComponents.includes(componentId)) {
                    globalState.windows[windowId].activeComponents.push(componentId)
                }
            }
            break
        }

        case 'COMPONENT_REMOVED_FROM_WINDOW': {
            const { windowId, componentId } = action.payload
            if (globalState.componentsByWindow[windowId]) {
                delete globalState.componentsByWindow[windowId][componentId]
            }

            // Remove da lista de componentes ativos da janela
            if (globalState.windows[windowId]) {
                globalState.windows[windowId].activeComponents =
                    globalState.windows[windowId].activeComponents.filter(id => id !== componentId)
            }
            break
        }

        case 'COMPONENT_UPDATED_IN_WINDOW': {
            const { windowId, componentId, updates } = action.payload
            if (globalState.componentsByWindow[windowId]?.[componentId]) {
                Object.assign(globalState.componentsByWindow[windowId][componentId], updates)
            }
            break
        }

        case 'COMPONENT_VISIBILITY_TOGGLED': {
            const { windowId, componentId, visible } = action.payload
            if (globalState.componentsByWindow[windowId]?.[componentId]) {
                globalState.componentsByWindow[windowId][componentId].visible = visible
            }
            break
        }

        case 'WINDOW_HIDE_ALL_COMPONENTS': {
            const { windowId, hidden } = action.payload
            if (globalState.windows[windowId]) {
                globalState.windows[windowId].allComponentsHidden = hidden
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
            // Reset drag state
            globalState.draggedComponent.id = null
            globalState.draggedComponent.sourceWindowId = null
            globalState.draggedComponent.mousePosition = null
            break
        }

        case 'STATE_SYNC': {
            // Full state sync (usado para inicialização)
            Object.assign(globalState.windows, action.payload.windows)
            Object.assign(globalState.componentsByWindow, action.payload.componentsByWindow)
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

    // Escuta ações de outras janelas
    onMessage('GLOBAL_STATE_ACTION', (action: StateAction) => {
        applyAction(action)
    })

    // Auto-persist em mudanças (apenas para componentes da janela atual)
    watch(
        () => [globalState.windows, globalState.componentsByWindow],
        () => persistState(),
        { deep: true }
    )

    return {
        // Estado
        state: globalState,

        // Current window
        setCurrentWindowId: (id: WindowId) => {
            currentWindowId = id
            // Carrega estado persistido desta janela
            loadPersistedState(id)
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
 * Adiciona componente a uma janela
 */
export function addComponentToWindow(windowId: WindowId, componentId: ComponentId, state: ComponentState) {
    const { dispatch } = useGlobalState()
    dispatch({
        type: 'COMPONENT_ADDED_TO_WINDOW',
        payload: { windowId, componentId, state }
    })
}

/**
 * Remove componente de uma janela
 */
export function removeComponentFromWindow(windowId: WindowId, componentId: ComponentId) {
    const { dispatch } = useGlobalState()
    dispatch({
        type: 'COMPONENT_REMOVED_FROM_WINDOW',
        payload: { windowId, componentId }
    })
}

/**
 * Atualiza componente em uma janela
 */
export function updateComponentInWindow(windowId: WindowId, componentId: ComponentId, updates: Partial<ComponentState>) {
    const { dispatch } = useGlobalState()
    dispatch({
        type: 'COMPONENT_UPDATED_IN_WINDOW',
        payload: { windowId, componentId, updates }
    })
}

/**
 * Toggle visibilidade de componente em uma janela
 */
export function toggleComponentVisibility(windowId: WindowId, componentId: ComponentId, visible: boolean) {
    const { dispatch } = useGlobalState()
    dispatch({
        type: 'COMPONENT_VISIBILITY_TOGGLED',
        payload: { windowId, componentId, visible }
    })
}

/**
 * Esconde/mostra todos os componentes de uma janela
 */
export function hideAllComponents(windowId: WindowId, hidden: boolean) {
    const { dispatch } = useGlobalState()
    dispatch({
        type: 'WINDOW_HIDE_ALL_COMPONENTS',
        payload: { windowId, hidden }
    })
}

/**
 * DEPRECATED: Use addComponentToWindow
 */
export function moveComponent(id: ComponentId, windowId: WindowId | null, transform: ComponentTransform) {
    console.warn('[GlobalState] moveComponent is deprecated, use addComponentToWindow/removeComponentFromWindow')
    if (windowId) {
        addComponentToWindow(windowId, id, {
            id,
            transform,
            visible: true,
            collapsed: false,
            zIndex: 1
        })
    } else {
        // Remove de todas as janelas
        const { state } = useGlobalState()
        Object.keys(state.windows).forEach(winId => {
            if (state.componentsByWindow[winId]?.[id]) {
                removeComponentFromWindow(winId, id)
            }
        })
    }
}

/**
 * DEPRECATED: Use updateComponentInWindow
 */
export function updateComponent(_id: ComponentId, _updates: Partial<ComponentState>) {
    console.warn('[GlobalState] updateComponent is deprecated, use updateComponentInWindow')
}

/**
 * DEPRECATED: Use toggleComponentVisibility
 */
export function toggleComponent(_id: ComponentId, _visible: boolean) {
    console.warn('[GlobalState] toggleComponent is deprecated, use toggleComponentVisibility')
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
 * Obtém componentes ativos de uma janela
 */
export function getWindowComponents(windowId: WindowId): ComponentState[] {
    const { state } = useGlobalState()
    const components = state.componentsByWindow[windowId] || {}
    return Object.values(components)
}

/**
 * Obtém janelas disponíveis
 */
export function getWindows(): WindowConfig[] {
    const { state } = useGlobalState()
    return Object.values(state.windows)
}

/**
 * Verifica se componente está ativo em janela específica
 */
export function isComponentInWindow(componentId: ComponentId, windowId: WindowId): boolean {
    const { state } = useGlobalState()
    return !!state.componentsByWindow[windowId]?.[componentId]
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
