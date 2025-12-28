/**
 * @fileoverview Theme System Feature Module
 * @module features/theme-system
 * 
 * Self-contained feature for theme management:
 * - Theme selection and switching
 * - Theme persistence
 * - Available themes catalog
 * - Theme information and metadata
 * - Special theme modes (RGB, Chameleon)
 */

// Components
export { default as ThemeSelector } from './components/ThemeSelector.vue'

// Composables
export { useTheme } from './composables/useTheme'

// Special Theme Modes (Global effects that modify entire app theme)
export { useRgbMode } from './composables/special-modes/useRgbMode'
export { useChameleonMode } from './composables/special-modes/useChameleonMode'
