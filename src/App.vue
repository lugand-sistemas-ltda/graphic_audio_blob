<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, watch, ref, provide } from 'vue'
import { useAudioAnalyzer } from './composables/useAudioAnalyzer'
import { useSpectralVisualEffect } from './composables/useSpectralVisualEffect'
import { usePlaylist } from './composables/usePlaylist'
import { useComponentManager } from './composables/useComponentManager'
import { useRgbMode } from './composables/useRgbMode'
import { useChameleonMode } from './composables/useChameleonMode'
import { useWindowManager } from './core/sync'
import { useGlobalState, registerWindow } from './core/state'
import LoadingScreen from './components/LoadingScreen.vue'

const audio = useAudioAnalyzer()
const playlist = usePlaylist()

// Gerenciador de componentes
const componentManager = useComponentManager()

// Inicializa RGB mode globalmente (independente de ThemeSelector estar visível)
useRgbMode()

// Inicializa Chameleon mode globalmente
useChameleonMode()

// Inicializa sistema multi-window
const windowManager = useWindowManager({ enableLogging: false })

// ID da janela principal (gerado baseado em timestamp ou use window.name)
const mainWindowId = 'main-' + Date.now()

// Inicializa o estado global
useGlobalState()

// Inicializa o efeito visual espectral com dados de áudio
const visualEffect = useSpectralVisualEffect({
    audioDataProvider: audio.getFrequencyData,
    enableMouseControl: true,
    layerCount: 8,
    windowId: mainWindowId
})

// Estados para os componentes de debug
const spherePosition = ref({ x: 50, y: 50 })
const currentVolume = ref(0.7)
const frequencyBands = ref([0, 0, 0, 0, 0, 0, 0, 0])
const beatDetected = ref(false)

// Handlers
const handleTogglePlay = async () => {
    if (audio.isPlaying.value) {
        audio.pause()
    } else {
        await audio.play()
    }
}

const handleNext = () => {
    playlist.nextTrack()
}

const handlePrevious = () => {
    playlist.previousTrack()
}

const handleSelectTrack = (index: number) => {
    playlist.selectTrack(index)
}

const handleSeek = (time: number) => {
    audio.seek(time)
}

const handleVolumeChange = (volume: number) => {
    audio.setVolume(volume)
    currentVolume.value = volume
}

const handleBeatSensitivityChange = (sensitivity: number) => {
    audio.setBeatSensitivity(sensitivity)
}

const handleSphereSize = (size: number) => {
    visualEffect.setSphereSize(size)
}

const handleSphereReactivity = (reactivity: number) => {
    visualEffect.setSphereReactivity(reactivity)
}

// ⚠️ PROVIDE DEVE VIR ANTES DE QUALQUER RENDER ⚠️
console.log('[App.vue] Providing dependencies:', {
    mainWindowId,
    componentManager: !!componentManager,
    audio: !!audio,
    playlist: !!playlist,
    visualEffect: !!visualEffect
})

provide('windowId', mainWindowId)
provide('componentManager', componentManager)
provide('audio', audio)
provide('playlist', playlist)
provide('visualEffect', visualEffect)
provide('spherePosition', spherePosition)
provide('currentVolume', currentVolume)
provide('frequencyBands', frequencyBands)
provide('beatDetected', beatDetected)
provide('handlers', {
    handleTogglePlay,
    handleNext,
    handlePrevious,
    handleSelectTrack,
    handleSeek,
    handleVolumeChange,
    handleBeatSensitivityChange,
    handleSphereSize,
    handleSphereReactivity
})

// Atualiza posição da esfera e dados de áudio em tempo real
const updateDebugData = () => {
    // Atualiza posição da esfera (precisa criar novo objeto para reatividade)
    const newPosition = visualEffect.getSpherePosition()
    spherePosition.value = { ...newPosition }

    // Atualiza dados de frequência
    const data = audio.getFrequencyData()
    if (data) {
        // Cria novo array para garantir reatividade
        frequencyBands.value = [...(data.frequencyBands || [0, 0, 0, 0, 0, 0, 0, 0])]
        beatDetected.value = data.beat || false

        // DEBUG: Log apenas se houver dados não-zero
        const hasData = data.frequencyBands.some(v => v > 0)
        if (hasData) {
            console.log('[App] Frequency data:', data.frequencyBands)
        }

        // Sincroniza dados de áudio para outras janelas
        windowManager.syncAudioData({
            frequencyBands: data.frequencyBands || [0, 0, 0, 0, 0, 0, 0, 0],
            bass: data.bass || 0,
            mid: data.mid || 0,
            treble: data.treble || 0,
            overall: data.overall || 0,
            beat: data.beat || false
        })
    }

    requestAnimationFrame(updateDebugData)
}

const loadTrack = async (trackFile: string) => {
    const wasPlaying = audio.isPlaying.value
    await audio.initAudio(trackFile)
    if (wasPlaying) {
        await audio.play()
    }
}

// Registra todos os componentes gerenciáveis E inicia audio
onMounted(async () => {
    // Primeiro, registra a janela principal no estado global
    const now = Date.now()
    registerWindow({
        id: mainWindowId,
        title: 'Spectral Audio Visualizer',
        role: 'main',
        effects: [], // Inicializa sem efeitos - usuário ativa pelo menu
        layout: 'free',
        backgroundColor: '#000000',
        createdAt: now,
        lastActive: now
    })

    // Registra componentes mas todos INVISÍVEIS inicialmente
    // Usuário adiciona componentes pelo Sidebar
    // REMOVIDO: main-control (agora integrado ao sidebar)

    componentManager.registerComponent({
        id: 'orb-effect-control',
        name: 'Orb Effect Control',
        category: 'visual',
        visible: false,
        collapsibleId: 'orb-effect-control'
    })

    componentManager.registerComponent({
        id: 'frequency-visualizer',
        name: 'Frequency Spectrum',
        category: 'visual',
        visible: false,
        collapsibleId: 'frequency-visualizer'
    })

    componentManager.registerComponent({
        id: 'sound-control',
        name: 'Sound Control',
        category: 'audio',
        visible: false,
        collapsibleId: 'sound-control'
    })

    componentManager.registerComponent({
        id: 'debug-terminal',
        name: 'System Monitor',
        category: 'debug',
        visible: false,
        collapsibleId: 'debug-terminal'
    })

    componentManager.registerComponent({
        id: 'theme-selector',
        name: 'Theme Control',
        category: 'system',
        visible: false,
        collapsibleId: 'theme-selector'
    })

    componentManager.registerComponent({
        id: 'matrix-character',
        name: 'Matrix Character',
        category: 'system',
        visible: false,
        collapsibleId: 'matrix-character'
    })

    // Carrega track atual e inicia debug data
    const currentTrack = playlist.currentTrack.value
    if (currentTrack) {
        await loadTrack(currentTrack.file)
    }
    // Inicia atualização dos dados de debug
    updateDebugData()
})

// Watch para mudanças de track
watch(() => playlist.currentTrack.value, async (newTrack) => {
    if (newTrack) {
        await loadTrack(newTrack.file)
    }
})
</script>

<template>
    <!-- Loading Screen -->
    <LoadingScreen />

    <!-- Router View com MainLayout -->
    <RouterView />
</template>

<style scoped lang="scss">
// Styles removed - now using cleaner component-based approach</style>
