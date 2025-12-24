<script setup lang="ts">
import { inject, computed } from 'vue'
import SoundControl from '../components/SoundControl.vue'
import OrbEffectControl from '../components/OrbEffectControl.vue'
import AudioControls from '../components/AudioControls.vue'
import MatrixCharacter from '../components/MatrixCharacter.vue'
import DebugTerminal from '../components/DebugTerminal.vue'
import FrequencyVisualizer from '../components/FrequencyVisualizer.vue'
import ThemeSelector from '../components/ThemeSelector.vue'

// Injetar dependências do App.vue (através do provide)
const componentManager = inject<any>('componentManager', null)
const audio = inject<any>('audio', null)
const playlist = inject<any>('playlist', null)
const visualEffect = inject<any>('visualEffect', null)
const spherePosition = inject<any>('spherePosition', null)
const currentVolume = inject<any>('currentVolume', null)
const frequencyBands = inject<any>('frequencyBands', null)
const beatDetected = inject<any>('beatDetected', null)
const handlers = inject<any>('handlers', null)

// Debug - verificar se as dependências foram injetadas
console.log('[HomeView] Dependencies:', {
    componentManager: !!componentManager,
    audio: !!audio,
    playlist: !!playlist,
    visualEffect: !!visualEffect,
    handlers: !!handlers,
    frequencyBands: !!frequencyBands,
    spherePosition: !!spherePosition
})

// Debug específico para frequencyBands
if (frequencyBands) {
    console.log('[HomeView] frequencyBands ref:', frequencyBands)
    console.log('[HomeView] frequencyBands.value:', frequencyBands.value)
}

// Computed para controlar visibilidade (removido showMainControl)
const showSoundControl = computed(() => componentManager?.isVisible('sound-control') || false)
const showOrbEffectControl = computed(() => componentManager?.isVisible('orb-effect-control') || false)
const showThemeSelector = computed(() => componentManager?.isVisible('theme-selector') || false)
const showMatrixCharacter = computed(() => componentManager?.isVisible('matrix-character') || false)
const showDebugTerminal = computed(() => componentManager?.isVisible('debug-terminal') || false)
const showFrequencyVisualizer = computed(() => componentManager?.isVisible('frequency-visualizer') || false)
</script>

<template>
    <div class="home-view">
        <!-- Sound Control -->
        <SoundControl
            v-if="showSoundControl && audio && playlist && handlers && audio.isPlaying && audio.currentTime && audio.duration"
            :tracks="playlist.tracks.value || []" :current-track="playlist.currentTrack.value"
            :current-track-index="playlist.currentTrackIndex.value || 0" :is-playing="audio.isPlaying.value"
            :current-time="audio.currentTime.value || 0" :duration="audio.duration.value || 0"
            :has-next="playlist.hasNext.value || false" :has-previous="playlist.hasPrevious.value || false"
            @toggle-play="handlers.handleTogglePlay" @next="handlers.handleNext" @previous="handlers.handlePrevious"
            @select-track="handlers.handleSelectTrack" @seek="handlers.handleSeek"
            @volume-change="handlers.handleVolumeChange" />

        <!-- Orb Effect Control -->
        <OrbEffectControl v-if="showOrbEffectControl && handlers"
            @beat-sensitivity-change="handlers.handleBeatSensitivityChange"
            @sphere-size-change="handlers.handleSphereSize"
            @sphere-reactivity-change="handlers.handleSphereReactivity" />

        <AudioControls v-if="audio" />

        <!-- Theme Selector (top-left) -->
        <ThemeSelector v-if="showThemeSelector" />

        <!-- Matrix Character (bottom-right) -->
        <MatrixCharacter v-if="showMatrixCharacter" />

        <!-- Debug Terminal (below theme selector) -->
        <DebugTerminal v-if="showDebugTerminal && visualEffect && audio"
            :sphere-position="spherePosition || { x: 50, y: 50 }" :sphere-size="visualEffect.getSphereSize()"
            :sphere-reactivity="visualEffect.getSphereReactivity()" :is-playing="audio.isPlaying?.value || false"
            :current-time="audio.currentTime?.value || 0" :duration="audio.duration?.value || 0"
            :volume="currentVolume?.value || 0.7" :beat-detected="beatDetected?.value || false" :layer-count="8" />

        <!-- Frequency Visualizer (below debug terminal) -->
        <FrequencyVisualizer v-if="showFrequencyVisualizer" :frequency-bands="frequencyBands || []" />
    </div>
</template>

<style scoped lang="scss">
.home-view {
    background: transparent;
    min-height: 100%;
    position: relative;
}
</style>
