<script setup lang="ts">
import { inject, computed, watch, onMounted } from 'vue'
import { SoundControl } from '../features/audio-player'
import { OrbEffectControl, MatrixCharacter, FrequencyVisualizer, ParticlesEffectControl } from '../features/visual-effects'
import { VisualEffectsControl } from '../features/window-management'
import { DebugTerminal } from '../features/debug-tools'
import { ThemeSelector } from '../features/theme-system'
import AlertContainer from '../components/alerts/AlertContainer.vue'
import { useGlobalAudio } from '../core/global'
import { getWindowComponents } from '../core/state'
import { useGlobalAlerts } from '../shared'
import type { Track } from '../features/audio-player/composables/usePlaylist'

// ========================================
// DEPENDÊNCIAS UNIVERSAIS (Todas as janelas)
// ========================================
const windowId = inject<string>('windowId', 'unknown')
const alerts = useGlobalAlerts(windowId)

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

// 🎨 Visual Effects Manager (controles centralizados)
const visualEffectsManager = inject<any>('visualEffectsManager', null)

// Debug
console.log('[HomeView] 🎯 Dependencies:', {
    windowId,
    globalAudio: !!globalAudio,
    visualEffect: !!visualEffect,
    visualEffectsManager: !!visualEffectsManager,
    hasFrequencyData: globalAudio.state.value.frequencyData.frequencyBands.length > 0
})

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

// ========================================
// WELCOME ALERT (apenas para janela principal)
// ========================================
onMounted(() => {
    console.log('[HomeView] 🎉 Mounted! WindowId:', windowId)

    // Verifica se é janela principal (windowId começa com 'main-')
    if (windowId.startsWith('main-')) {
        console.log('[HomeView] 👋 Showing welcome alert for main window')

        setTimeout(() => {
            alerts.showAlert({
                type: 'default',
                title: 'Welcome to Graphic Audio Blob',
                message: `
                    <strong>Welcome to the ultimate audio visualization experience!</strong>
                    <br><br>
                    <strong>🎵 What is Graphic Audio Blob?</strong><br>
                    A cutting-edge, real-time audio visualization system built with Vue 3 and TypeScript. 
                    This application transforms your music into mesmerizing visual effects, creating an 
                    immersive audiovisual experience that responds dynamically to every beat, frequency, 
                    and rhythm of your favorite tracks.
                    <br><br>
                    <strong>✨ Key Features:</strong><br>
                    • <strong>Multi-Window Architecture:</strong> Open multiple synchronized visualization windows<br>
                    • <strong>Global Audio Sync:</strong> Perfect synchronization across all windows using BroadcastChannel<br>
                    • <strong>Real-time Analysis:</strong> Advanced FFT frequency analysis with beat detection<br>
                    • <strong>Dynamic Components:</strong> Drag & drop components between windows<br>
                    • <strong>Theme System:</strong> Multiple color themes with Chameleon mode (animated RGB gradients)<br>
                    • <strong>Visual Effects:</strong> Orb effects, frequency visualizers, matrix characters, and more<br>
                    • <strong>Playlist Management:</strong> Full music player with playlist control<br>
                    <br>
                    <strong>🎯 Purpose:</strong><br>
                    This system is designed for music lovers, VJs, streamers, and anyone who wants to add 
                    a visual dimension to their audio experience. Whether you're hosting a party, creating 
                    content, or just enjoying your music collection, Graphic Audio Blob brings your audio to life.
                    <br><br>
                    <strong>🚀 Getting Started:</strong><br>
                    1. Load your music using the playlist controls<br>
                    2. Adjust visual effects using the control panels<br>
                    3. Open new windows via Window Config for multi-screen setups<br>
                    4. Customize themes to match your style<br>
                    5. Drag components between windows to create your perfect layout<br>
                    <br>
                    <strong>💡 Pro Tips:</strong><br>
                    • Use <strong>Chameleon Mode</strong> for dynamic color-shifting effects<br>
                    • Adjust <strong>Beat Sensitivity</strong> to fine-tune visual reactivity<br>
                    • Create <strong>multiple windows</strong> for multi-monitor setups<br>
                    • All windows stay perfectly synchronized automatically<br>
                    <br>
                    <em>Built with ❤️ using Vue 3, TypeScript, and modern web technologies.</em>
                `,
                icon: '👋',
                buttons: [
                    { id: 'got-it', label: 'Got It!', variant: 'primary' }
                ],
                closable: true
            })

            console.log('[HomeView] ✅ Welcome alert dispatched!')
        }, 1000) // 1 segundo de delay para garantir que tudo está carregado
    } else {
        console.log('[HomeView] ℹ️ Not main window, skipping welcome alert')
    }
})

// ========================================
// VISUAL EFFECTS HANDLERS (Valores Normalizados 0-1)
// ========================================
// Gradient/Orb
const handleEffectSizeChange = (normalizedSize: number) => {
    if (visualEffectsManager) {
        visualEffectsManager.gradient.setSize(normalizedSize)
    }
}

const handleEffectSensitivityChange = (normalizedSensitivity: number) => {
    if (visualEffectsManager) {
        visualEffectsManager.gradient.setReactivity(normalizedSensitivity)
    }
}

const handleMouseFollowChange = (enabled: boolean) => {
    if (visualEffectsManager) {
        visualEffectsManager.gradient.setMouseFollow(enabled)
    }
}

const handleAutoCenterChange = (enabled: boolean) => {
    if (visualEffectsManager) {
        visualEffectsManager.gradient.setAutoCenter(enabled)
    }
}

// Particles (controles compartilhados + específicos)
const handleParticleCountChange = (count: number) => {
    if (visualEffectsManager) {
        visualEffectsManager.particles.setParticleCount(count)
    }
}

const handleParticlesEffectSizeChange = (normalizedSize: number) => {
    if (visualEffectsManager) {
        visualEffectsManager.particles.setSpawnSize(normalizedSize)
    }
}

const handleParticlesEffectSensitivityChange = (normalizedSensitivity: number) => {
    if (visualEffectsManager) {
        visualEffectsManager.particles.setReactivity(normalizedSensitivity)
    }
}

const handleParticlesMouseFollowChange = (enabled: boolean) => {
    if (visualEffectsManager) {
        visualEffectsManager.particles.setMouseFollow(enabled)
    }
}

const handleParticlesAutoCenterChange = (enabled: boolean) => {
    if (visualEffectsManager) {
        visualEffectsManager.particles.setAutoCenter(enabled)
    }
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

const showVisualEffectsControl = computed(() => {
    const comp = globalWindowComponents.value.find(c => c.id === 'visual-effects-control')
    return comp?.visible ?? false
})

const showParticlesEffectControl = computed(() => {
    const comp = globalWindowComponents.value.find(c => c.id === 'particles-effect-control')
    return comp?.visible ?? false
})

// Debug: Monitora mudanças nos computeds
watch([showSoundControl, showOrbEffectControl, showThemeSelector, showDebugTerminal, showFrequencyVisualizer, showVisualEffectsControl, showParticlesEffectControl], (values) => {
    console.log('[HomeView] 🎨 Visibility computeds updated:', {
        soundControl: values[0],
        orbEffect: values[1],
        themeSelector: values[2],
        debug: values[3],
        frequency: values[4],
        visualEffects: values[5],
        particles: values[6]
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
        <!-- Alert System (UNIVERSAL - gerencia alerts desta janela) -->
        <AlertContainer :window-id="windowId" />

        <!-- Sound Control (UNIVERSAL - funciona em todas as janelas) -->
        <SoundControl v-if="showSoundControl" :tracks="tracks" :current-track="currentTrack"
            :current-track-index="currentTrackIndex" :is-playing="isPlaying" :current-time="currentTime"
            :duration="duration" :has-next="hasNext" :has-previous="hasPrevious" @toggle-play="handleTogglePlay"
            @next="handleNext" @previous="handlePrevious" @select-track="handleSelectTrack" @seek="handleSeek"
            @volume-change="handleVolumeChange" />

        <!-- Visual Effects Control -->
        <VisualEffectsControl v-if="showVisualEffectsControl" />

        <!-- Orb Effect Control (Valores Normalizados 0-1) -->
        <OrbEffectControl v-if="showOrbEffectControl" @beat-sensitivity-change="handleBeatSensitivityChange"
            @effect-size-change="handleEffectSizeChange" @effect-sensitivity-change="handleEffectSensitivityChange"
            @mouse-follow-change="handleMouseFollowChange" @auto-center-change="handleAutoCenterChange" />

        <!-- Particles Effect Control (Valores Normalizados 0-1) -->
        <ParticlesEffectControl v-if="showParticlesEffectControl" @particle-count-change="handleParticleCountChange"
            @effect-size-change="handleParticlesEffectSizeChange"
            @effect-sensitivity-change="handleParticlesEffectSensitivityChange"
            @mouse-follow-change="handleParticlesMouseFollowChange"
            @auto-center-change="handleParticlesAutoCenterChange" />

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
