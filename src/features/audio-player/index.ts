// ==============================================
// AUDIO PLAYER FEATURE - BARREL EXPORT
// ==============================================
// Exporta todos os componentes e composables da feature
// Use: import { MusicPlayer, usePlaylist } from '@/features/audio-player'

// Components
export { default as MusicPlayer } from './components/MusicPlayer.vue'
export { default as Playlist } from './components/Playlist.vue'
export { default as AudioControls } from './components/AudioControls.vue'
export { default as SoundControl } from './components/SoundControl.vue'

// Composables
export { useAudioAnalyzer } from './composables/useAudioAnalyzer'
export { usePlayerSync } from './composables/usePlayerSync'
export { usePlaylist } from './composables/usePlaylist'
