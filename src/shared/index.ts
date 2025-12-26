/**
 * @fileoverview Shared Module
 * @module shared
 * 
 * Generic, reusable code across features:
 * - Composables: Generic logic (collapsible, validation, alerts, drag)
 * - Components: Generic UI components (buttons, feedback, etc)
 */

// Composables
export { useCollapsible } from './composables/useCollapsible'
export { useComponentValidator } from './composables/useComponentValidator'
export { useDraggable } from './composables/useDraggable'
export { useGlobalAlerts } from './composables/useGlobalAlerts'

// Components (re-export from ui)
export * from './components/ui'
