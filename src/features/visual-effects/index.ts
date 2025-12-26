/**
 * @fileoverview Visual Effects Feature Module
 * @module features/visual-effects
 * 
 * Self-contained feature for visual effects and animations:
 * - Frequency visualization
 * - Matrix character effects
 * - Orb effects
 * - RGB/Chameleon modes
 * - Spectral visualizations
 */

// Components
export { default as FrequencyVisualizer } from './components/FrequencyVisualizer.vue'
export { default as MatrixCharacter } from './components/MatrixCharacter.vue'
export { default as OrbEffectControl } from './components/OrbEffectControl.vue'
export { default as VisualControls } from './components/VisualControls.vue'

// Composables
export { useAudioVisualEffect } from './composables/useAudioVisualEffect'
export { useBackgroundEffect } from './composables/useBackgroundEffect'
export { useChameleonMode } from './composables/useChameleonMode'
export { useRgbMode } from './composables/useRgbMode'
export { useSpectralVisualEffect } from './composables/useSpectralVisualEffect'
