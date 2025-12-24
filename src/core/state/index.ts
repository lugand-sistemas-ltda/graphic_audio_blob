/**
 * Core State Module - Global State Management
 */

export type {
    WindowId,
    ComponentId,
    VisualEffect,
    WindowLayout,
    WindowConfig,
    ComponentTransform,
    ComponentState,
    GlobalState,
    StateAction,
    GlobalStateConfig
} from './types'

export {
    useGlobalState,
    registerWindow,
    updateWindow,
    removeWindow,
    // NEW API (per-window component management)
    addComponentToWindow,
    removeComponentFromWindow,
    updateComponentInWindow,
    toggleComponentVisibility,
    hideAllComponents,
    // DEPRECATED (keeping for compatibility)
    moveComponent,
    updateComponent,
    toggleComponent,
    // Drag & Drop
    startDrag,
    updateDragPosition,
    endDrag,
    // Queries
    getWindowComponents,
    getWindows,
    isComponentInWindow,
    // Window Effects
    addWindowEffect,
    removeWindowEffect,
    toggleWindowEffect
} from './useGlobalState'
