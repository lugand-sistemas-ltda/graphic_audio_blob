/**
 * @fileoverview Visual Effects Feature Module
 * @module features/visual-effects
 * 
 * Self-contained feature for visual effects and animations:
 * - Gradient/Orb effects (spectral visualization)
 * - Particles effects (audio-reactive particles)
 * - Background effects
 * - Audio visualization
 * 
 * Note: RGB/Chameleon modes moved to theme-system feature
 */

// Components
export { default as OrbEffectControl } from './components/gradient-effect/OrbEffectControl.vue'
export { default as ParticlesEffectControl } from './components/particles-effect/ParticlesEffectControl.vue'
// Shared Controls (normalized 0-1 parameters)
export { default as EffectSizeControl } from './components/shared/EffectSizeControl.vue'
export { default as EffectReactivityControl } from './components/shared/EffectReactivityControl.vue'

// Composables
export { useAudioVisualEffect } from './composables/useAudioVisualEffect'
export { useBackgroundEffect } from './composables/useBackgroundEffect'
export { useSpectralVisualEffect } from './composables/gradient-effect/useSpectralVisualEffect'
export { useParticlesEffect } from './composables/particles-effect/useParticlesEffect'
export { useMousePosition, useEffectTheme } from './composables/shared/useEffectHelpers'
export { useVisualEffectsManager } from './composables/shared/useVisualEffectsManager'

// Types
export type { BaseEffectOptions, BaseVisualEffect, EffectBehaviorControls, AudioReactivityControls, VisualEffectType, EffectThemeConfig } from './types'
