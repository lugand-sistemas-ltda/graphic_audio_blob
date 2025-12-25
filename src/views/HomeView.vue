<script setup lang="ts">
import { inject, computed, watch } from 'vue'
import SoundControl from '../components/SoundControl.vue'
import OrbEffectControl from '../components/OrbEffectControl.vue'
import AudioControls from '../components/AudioControls.vue'
import MatrixCharacter from '../components/MatrixCharacter.vue'
import DebugTerminal from '../components/DebugTerminal.vue'
import FrequencyVisualizer from '../components/FrequencyVisualizer.vue'
import ThemeSelector from '../components/ThemeSelector.vue'
import { useGlobalAudio } from '../core/global'
import { getWindowComponents } from '../core/state'
import type { Track } from '../composables/usePlaylist'

// ========================================
// DEPENDÊNCIAS UNIVERSAIS (Todas as janelas)
// ========================================
const windowId = inject<string>('windowId', 'unknown')

// ========================================
// GLOBAL AUDIO - FONTE ÚNICA DE ÁUDIO
// Todos os componentes consomem daqui (não do inject!)
// ========================================
const globalAudio = useGlobalAudio()

// Computed: Dados de frequência do GlobalAudio (broadcast automático)
const frequencyBands = computed(() => globalAudio.state.value.frequencyData.frequencyBands)
const beatDetected = computed(() => globalAudio.state.value.frequencyData.beat)
const currentVolume = computed(() => globalAudio.state.value.volume)

// Visual Effect (ainda injetado - será refatorado depois se necessário)
const visualEffect = inject<any>('visualEffect', null)
const spherePosition = inject<any>('spherePosition', null)

// Debug
console.log('[HomeView] 🎯 Dependencies:', {
    windowId,
    globalAudio: !!globalAudio,
    visualEffect: !!visualEffect,
    hasFrequencyData: globalAudio.state.value.frequencyData.frequencyBands.length > 0
})

// DEBUG: Monitora dados de áudio
watch(() => globalAudio.state.value.frequencyData, (data) => {
    if (data.overall > 0) {
        console.log('[HomeView] 📊 Receiving audio data:', {
            bass: data.bass.toFixed(0),
            mid: data.mid.toFixed(0),
            treble: data.treble.toFixed(0),
            beat: data.beat
        })
    }
}, { deep: true })

// ========================================
// COMPONENTES DO GLOBALSTATE (Fonte única da verdade)
// ========================================
const globalWindowComponents = computed(() => getWindowComponents(windowId))

watch(globalWindowComponents, (newComps) => {
    console.log('[HomeView] 🎯 GlobalState components changed:', {
        count: newComps.length,
        components: newComps.map(c => ({ id: c.id, visible: c.visible }))
    })
}, { deep: true, immediate: true })

// ========================================
// HANDLERS UNIVERSAIS (Usam GlobalAudio)
// ========================================
const handleTogglePlay = () => {
    if (globalAudio.state.value.isPlaying) {
        globalAudio.pause(windowId)
    } else {
        globalAudio.play(windowId)
    }
}

const handleNext = () => {
    globalAudio.nextTrack(windowId)
}

const handlePrevious = () => {
    globalAudio.previousTrack(windowId)
}

const handleSelectTrack = (index: number) => {
    globalAudio.selectTrack(index, windowId)
}

const handleSeek = (time: number) => {
    globalAudio.seek(time, windowId)
}

const handleVolumeChange = (volume: number) => {
    globalAudio.setVolume(volume, windowId)
}

const handleBeatSensitivityChange = (sensitivity: number) => {
    // TODO: Implementar beat sensitivity no globalAudio
    console.log('[HomeView] Beat sensitivity:', sensitivity)
}

const handleSphereSize = (size: number) => {
    visualEffect?.setSphereSize(size)
}

const handleSphereReactivity = (reactivity: number) => {
    visualEffect?.setSphereReactivity(reactivity)
}

// ========================================
// COMPUTED para Visibilidade dos Componentes (USA GLOBALSTATE)
// ========================================
const showSoundControl = computed(() => {
    const comp = globalWindowComponents.value.find(c => c.id === 'sound-control')
    return comp?.visible ?? false
})

const showOrbEffectControl = computed(() => {
    const comp = globalWindowComponents.value.find(c => c.id === 'orb-effect-control')
    return comp?.visible ?? false
})

const showThemeSelector = computed(() => {
    const comp = globalWindowComponents.value.find(c => c.id === 'theme-selector')
    return comp?.visible ?? false
})

const showMatrixCharacter = computed(() => {
    const comp = globalWindowComponents.value.find(c => c.id === 'matrix-character')
    return comp?.visible ?? false
})

const showDebugTerminal = computed(() => {
    const comp = globalWindowComponents.value.find(c => c.id === 'debug-terminal')
    return comp?.visible ?? false
})

const showFrequencyVisualizer = computed(() => {
    const comp = globalWindowComponents.value.find(c => c.id === 'frequency-visualizer')
    return comp?.visible ?? false
})

// Debug: Monitora mudanças nos computeds
watch([showSoundControl, showOrbEffectControl, showThemeSelector, showDebugTerminal, showFrequencyVisualizer], (values) => {
    console.log('[HomeView] 🎨 Visibility computeds updated:', {
        soundControl: values[0],
        orbEffect: values[1],
        themeSelector: values[2],
        debug: values[3],
        frequency: values[4]
    })
}, { immediate: true })

// ========================================
// DADOS para SoundControl (via GlobalAudio)
// ========================================
const tracks = computed<Track[]>(() => {
    return globalAudio.state.value.tracks.map((t, index) => ({
        id: String(index),
        title: t.name,
        file: t.file
    }))
})

const currentTrack = computed<Track | null>(() => {
    const track = globalAudio.currentTrack.value
    if (!track) return null

    return {
        id: String(globalAudio.state.value.currentTrackIndex),
        title: track.name,
        file: track.file
    }
})

const currentTrackIndex = computed(() => globalAudio.state.value.currentTrackIndex)
const isPlaying = computed(() => globalAudio.state.value.isPlaying)
const currentTime = computed(() => globalAudio.state.value.currentTime)
const duration = computed(() => globalAudio.state.value.duration)

const hasNext = computed(() => {
    return currentTrackIndex.value < tracks.value.length - 1
})

const hasPrevious = computed(() => {
    return currentTrackIndex.value > 0
})
</script>

<template>
    <div class="home-view">
        <!-- Sound Control (UNIVERSAL - funciona em todas as janelas) -->
        <SoundControl v-if="showSoundControl" :tracks="tracks" :current-track="currentTrack"
            :current-track-index="currentTrackIndex" :is-playing="isPlaying" :current-time="currentTime"
            :duration="duration" :has-next="hasNext" :has-previous="hasPrevious" @toggle-play="handleTogglePlay"
            @next="handleNext" @previous="handlePrevious" @select-track="handleSelectTrack" @seek="handleSeek"
            @volume-change="handleVolumeChange" />

        <!-- Orb Effect Control -->
        <OrbEffectControl v-if="showOrbEffectControl" @beat-sensitivity-change="handleBeatSensitivityChange"
            @sphere-size-change="handleSphereSize" @sphere-reactivity-change="handleSphereReactivity" />

        <AudioControls />

        <!-- Theme Selector (UNIVERSAL - funciona em todas as janelas) -->
        <ThemeSelector v-if="showThemeSelector" />

        <!-- Matrix Character -->
        <MatrixCharacter v-if="showMatrixCharacter" />

        <!-- Debug Terminal -->
        <DebugTerminal v-if="showDebugTerminal && visualEffect" :sphere-position="spherePosition || { x: 50, y: 50 }"
            :sphere-size="visualEffect.getSphereSize()" :sphere-reactivity="visualEffect.getSphereReactivity()"
            :is-playing="isPlaying" :current-time="currentTime" :duration="duration" :volume="currentVolume"
            :beat-detected="beatDetected" :layer-count="8" />

        <!-- Frequency Visualizer - GLOBAL AUDIO SOURCE -->
        <FrequencyVisualizer v-if="showFrequencyVisualizer" :frequency-bands="frequencyBands" />
    </div>
</template>

<style scoped lang="scss">
.home-view {
    background: transparent;
    min-height: 100%;
    position: relative;
}
</style>
