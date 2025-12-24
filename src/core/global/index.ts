/**
 * Core Global State Managers
 * 
 * Gerenciadores globais centralizados que sincronizam estado
 * entre todas as janelas do aplicativo
 */

export { useGlobalAudio } from './useGlobalAudio'
export type { Track, FrequencyData, GlobalAudioState } from './useGlobalAudio'

export { useGlobalTheme } from './useGlobalTheme'
export type { RgbModeConfig, ChameleonModeConfig, GlobalThemeState } from './useGlobalTheme'
