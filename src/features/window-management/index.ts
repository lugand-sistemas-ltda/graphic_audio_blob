/**
 * @fileoverview Window Management Feature Module
 * @module features/window-management
 * 
 * Self-contained feature for window management:
 * - Window configuration and settings
 * - Window titlebar and controls
 * - Component lifecycle management
 * - Window visibility and reload
 * - Window type detection
 * - Z-index management
 */

// Components
export { default as WindowConfig } from './components/WindowConfig.vue'
export { default as WindowTitlebar } from './components/WindowTitlebar.vue'

// Composables
export { useComponentManager } from './composables/useComponentManager'
export { useVisibilityReload } from './composables/useVisibilityReload'
export { useWindowType } from './composables/useWindowType'
export { useZIndex } from './composables/useZIndex'
