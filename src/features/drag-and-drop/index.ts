/**
 * @fileoverview Drag and Drop Feature Module
 * @module features/drag-and-drop
 * 
 * Self-contained feature for drag and drop functionality:
 * - Cross-window drag and drop
 * - Draggable directive for components
 * - Position persistence
 * - Z-index management integration
 */

// Composables
export { useCrossWindowDrag } from './composables/useCrossWindowDrag'

// Directives
export { vDraggable } from './directives/vDraggable'
