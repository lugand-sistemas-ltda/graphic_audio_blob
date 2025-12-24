<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onUnmounted, watch, ref, provide, inject } from 'vue'
import { useAudioAnalyzer } from './composables/useAudioAnalyzer'
import { useSpectralVisualEffect } from './composables/useSpectralVisualEffect'
import { usePlaylist } from './composables/usePlaylist'
import { useComponentManager } from './composables/useComponentManager'
import { useRgbMode } from './composables/useRgbMode'
import { useChameleonMode } from './composables/useChameleonMode'
import { useGlobalState, registerWindow, addComponentToWindow } from './core/state'
import { useGlobalAudio } from './core/global'
import { AVAILABLE_COMPONENTS } from './config/availableComponents'
import LoadingScreen from './components/LoadingScreen.vue'

// Detecta se é janela main ou filha (MainLayout já fez provide)
const isMainWindow = inject<boolean>('isMainWindow', true)
const injectedWindowId = inject<string | null>('windowId', null)

// ID da janela (usa injected se disponível, senão gera novo)
const windowId = injectedWindowId || 'main-' + Date.now()

// ========================================
// GLOBAL AUDIO (Todas as janelas)
// ========================================
const globalAudio = useGlobalAudio()

// Flag para indicar se esta janela é o audio owner
const isAudioOwner = ref(false)

// Instâncias locais (apenas para audio owner)
let audio: ReturnType<typeof useAudioAnalyzer> | null = null

// Gerenciador de componentes
const componentManager = useComponentManager()

// Inicializa RGB mode globalmente (independente de ThemeSelector estar visível)
useRgbMode()

// Inicializa Chameleon mode globalmente
useChameleonMode()

// Inicializa o estado global
useGlobalState()

// Inicializa o efeito visual espectral com dados de áudio GLOBAL
// TODAS as janelas podem ter efeitos visuais usando frequencyData do globalAudio
const visualEffect = useSpectralVisualEffect({
    audioDataProvider: () => globalAudio.state.value.frequencyData,
    enableMouseControl: true,
    layerCount: 8,
    windowId: windowId
})

// Estados para os componentes de debug
const spherePosition = ref({ x: 50, y: 50 })
const currentVolume = ref(0.7)
const frequencyBands = ref([0, 0, 0, 0, 0, 0, 0, 0])
const beatDetected = ref(false)

// Handlers - Usam globalAudio para sincronização entre janelas
const handleTogglePlay = async () => {
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
    currentVolume.value = volume
}

const handleBeatSensitivityChange = (sensitivity: number) => {
    if (audio) {
        audio.setBeatSensitivity(sensitivity)
    }
}

const handleSphereSize = (size: number) => {
    visualEffect.setSphereSize(size)
}

const handleSphereReactivity = (reactivity: number) => {
    visualEffect.setSphereReactivity(reactivity)
}

// ⚠️ PROVIDE DEVE VIR ANTES DE QUALQUER RENDER ⚠️
console.log('[App.vue] Providing dependencies:', {
    windowId,
    isMainWindow,
    componentManager: !!componentManager,
    audio: !!audio,
    globalAudio: !!globalAudio,
    visualEffect: !!visualEffect
})

// Só faz provide se não houver inject (evita override do MainLayout)
if (!injectedWindowId) {
    provide('windowId', windowId)
    provide('isMainWindow', isMainWindow)
}
provide('componentManager', componentManager)
provide('audio', audio)
provide('globalAudio', globalAudio)
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

    // Atualiza dados de frequência do globalAudio
    const data = globalAudio.state.value.frequencyData
    if (data) {
        // Cria novo array para garantir reatividade
        frequencyBands.value = [...(data.frequencyBands || [0, 0, 0, 0, 0, 0, 0, 0])]
        beatDetected.value = data.beat || false
    }

    requestAnimationFrame(updateDebugData)
}

// Registra todos os componentes gerenciáveis E inicia audio
onMounted(async () => {
    // Inicializa o estado global para esta janela específica
    const { setCurrentWindowId } = useGlobalState()
    setCurrentWindowId(windowId)

    // Primeiro, registra a janela no estado global
    const now = Date.now()
    const windowRole = isMainWindow ? 'main' : 'secondary'

    registerWindow({
        id: windowId,
        title: isMainWindow ? 'Spectral Audio Visualizer' : 'Child Window',
        role: windowRole,
        effects: [], // Inicializa sem efeitos - usuário ativa pelo menu
        layout: 'free',
        backgroundColor: '#000000',
        createdAt: now,
        lastActive: now,
        activeComponents: [], // Lista de componentes ativos nesta janela
        allComponentsHidden: false // Flag para hide/show all
    })

    // ========================================
    // AUDIO OWNER LOGIC
    // ========================================
    // Verifica se já existe um audio owner
    if (globalAudio.hasAudioOwner.value) {
        console.log('[App.vue] This window is a CONSUMER (not audio owner):', windowId)
    } else {
        // Tenta registrar como audio owner
        const registered = globalAudio.registerAudioOwner(windowId)

        if (!registered) {
            console.warn('[App.vue] Failed to register as audio owner (already exists):', windowId)
        } else {
            // Sucesso! Esta janela é o audio owner
            isAudioOwner.value = true
            console.log('[App.vue] This window is the AUDIO OWNER:', windowId)

            // Inicializa <audio> element físico e playlist
            audio = useAudioAnalyzer()
            const playlist = usePlaylist()

            // Carrega tracks no globalAudio
            globalAudio.setTracks(playlist.tracks.value.map(t => ({
                name: t.title,
                file: t.file
            })))

            // Carrega track atual se houver
            const currentTrack = globalAudio.currentTrack.value
            if (currentTrack) {
                await audio.initAudio(currentTrack.file)
            }

            // ========================================
            // SYNC LOOP: Audio Data → GlobalAudio
            // ========================================
            const syncAudioData = () => {
                if (!audio) return

                const data = audio.getFrequencyData()
                if (data) {
                    globalAudio.updateFrequencyData({
                        bass: data.bass || 0,
                        mid: data.mid || 0,
                        treble: data.treble || 0,
                        overall: data.overall || 0,
                        beat: data.beat || false,
                        frequencyBands: data.frequencyBands || [0, 0, 0, 0, 0, 0, 0, 0],
                        raw: data.raw || new Uint8Array(0)
                    })
                }

                // Atualiza tempo de playback
                if (audio.audioElement.value) {
                    globalAudio.updateTime(
                        audio.audioElement.value.currentTime,
                        audio.audioElement.value.duration
                    )
                }

                requestAnimationFrame(syncAudioData)
            }
            syncAudioData()

            // ========================================
            // WATCH: GlobalAudio Commands → Physical Audio
            // ========================================

            // Play/Pause
            watch(() => globalAudio.state.value.isPlaying, async (playing) => {
                if (!audio) return
                if (playing && !audio.isPlaying.value) {
                    await audio.play()
                } else if (!playing && audio.isPlaying.value) {
                    audio.pause()
                }
            })

            // Seek
            watch(() => globalAudio.state.value.currentTime, (time) => {
                if (!audio || !audio.audioElement.value) return
                // Evita loop infinito: só atualiza se diferença > 1s
                const diff = Math.abs(audio.audioElement.value.currentTime - time)
                if (diff > 1) {
                    audio.seek(time)
                }
            })

            // Volume
            watch(() => globalAudio.state.value.volume, (vol) => {
                if (!audio) return
                audio.setVolume(vol)
            })

            // Track Change
            watch(() => globalAudio.state.value.currentTrackIndex, async () => {
                const track = globalAudio.currentTrack.value
                if (track && audio) {
                    await audio.initAudio(track.file)
                    if (globalAudio.state.value.isPlaying) {
                        await audio.play()
                    }
                }
            })
        }
    }

    // ========================================
    // COMPONENT REGISTRATION (All windows)
    // ========================================

    // Registra cada componente DISPONÍVEL no componentManager desta janela
    // ComponentManager controla visibilidade local (UI)
    // GlobalState controla ownership e posição (cross-window)
    AVAILABLE_COMPONENTS.forEach(comp => {
        // Registra no componentManager (controle de visibilidade UI)
        componentManager.registerComponent({
            ...comp,
            visible: false // Todos iniciam invisíveis
        })
    })

    // 3. Após registrar todos, sincroniza estado inicial do localStorage
    // Se algum componente foi salvo como visível, restaura no GlobalState também
    AVAILABLE_COMPONENTS.forEach(comp => {
        if (componentManager.isVisible(comp.id)) {
            // Adiciona ao GlobalState (ownership)
            addComponentToWindow(windowId, comp.id, {
                id: comp.id,
                transform: { x: 100, y: 100 },
                visible: true,
                collapsed: false,
                zIndex: 1
            })
        }
    })

    // Inicia atualização dos dados de debug (todas as janelas)
    updateDebugData()
})

// Cleanup ao fechar janela
onUnmounted(() => {
    if (isAudioOwner.value) {
        globalAudio.unregisterAudioOwner(windowId)
        console.log('[App.vue] Audio owner unregistered:', windowId)
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
