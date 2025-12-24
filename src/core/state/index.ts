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
    moveComponent,
    updateComponent,
    toggleComponent,
    startDrag,
    updateDragPosition,
    endDrag,
    getWindowComponents,
    getWindows,
    isComponentInWindow,
    addWindowEffect,
    removeWindowEffect,
    toggleWindowEffect
} from './useGlobalState'
