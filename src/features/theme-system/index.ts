/**
 * @fileoverview Theme System Feature Module
 * @module features/theme-system
 * 
 * Self-contained feature for theme management:
 * - Theme selection and switching
 * - Theme persistence
 * - Available themes catalog
 * - Theme information and metadata
 */

// Components
export { default as ThemeSelector } from './components/ThemeSelector.vue'

// Composables
export { useTheme } from './composables/useTheme'
