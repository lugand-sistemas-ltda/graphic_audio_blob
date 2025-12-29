<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { onMounted, onUnmounted, watch, ref, provide, inject } from 'vue'
import { useAudioAnalyzer } from './features/audio-player/composables/useAudioAnalyzer'
import { useVisualEffectsManager } from './features/visual-effects'
import { useRgbMode, useChameleonMode } from './features/theme-system'
import { usePlaylist } from './features/audio-player/composables/usePlaylist'
import { useComponentManager } from './features/window-management'
import { useGlobalState, registerWindow, addComponentToWindow } from './core/state'
import { useGlobalAudio, useGlobalTheme } from './core/global'
import { setWindowId, setWindowTitle, announceConnection } from './core/sync'
import { AVAILABLE_COMPONENTS } from './app/config/availableComponents'
import LoadingScreen from './shared/components/ui/feedback/LoadingScreen.vue'

// ========================================
// DETECÇÃO DE WINDOW TYPE (DIRETO - SEM INJECT!)
// ========================================
const route = useRoute()

/**
 * ⚠️ CRITICAL: Detecção síncrona e direta
 * NÃO usa inject porque App.vue executa ANTES do MainLayout
 */
const detectIsMainWindow = (): boolean => {
    // 1. Verifica query param do VueRouter
    const hasChildParamRouter = route.query.childWindow === 'true'

    // 2. Parseia hash manualmente (VueRouter usa hash mode)
    const hash = window.location.hash
    const hashQueryString = hash.includes('?') ? hash.split('?')[1] : ''
    const hashParams = new URLSearchParams(hashQueryString)
    const hasChildParamHash = hashParams.get('childWindow') === 'true'

    // 3. Verifica window.opener
    const hasOpener = !!window.opener

    // 4. Verifica se é rota de child window
    const isChildRoute = route.path.startsWith('/window') || route.path.startsWith('/visual')

    const hasChildParam = hasChildParamRouter || hasChildParamHash
    const isMain = !hasChildParam && !hasOpener && !isChildRoute

    console.log('[App.vue] 🔍 Detecting isMainWindow DIRECTLY:', {
        path: route.path,
        hasChildParamRouter,
        hasChildParamHash,
        hasOpener,
        isChildRoute,
        isMain,
        fullUrl: window.location.href
    })

    return isMain
}

const isMainWindow = detectIsMainWindow()
const injectedWindowId = inject<string | null>('windowId', null)

// ID da janela
const windowId = injectedWindowId || (isMainWindow ? 'main-' : 'child-') + Date.now()

// ========================================
// GLOBAL AUDIO (Todas as janelas)
// ========================================
const globalAudio = useGlobalAudio()

// ========================================
// GLOBAL THEME (Todas as janelas)
// ========================================
const globalTheme = useGlobalTheme()

// Watch tema global e aplica automaticamente (TODAS as janelas)
watch(() => globalTheme.state.value.currentTheme, (theme) => {
    console.log('[App.vue] 🎨 Applying theme globally:', theme)

    // Aplica tema no DOM
    if (theme === 'matrix') {
        delete document.documentElement.dataset.theme
    } else {
        document.documentElement.dataset.theme = theme
    }
}, { immediate: true })

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
useGlobalState({ enableLogging: true }) // Habilitado para debug

// ========================================
// VISUAL EFFECTS MANAGER (Fonte Única)
// ========================================
// Gerencia TODOS os efeitos visuais de forma centralizada e isolada
// Cada efeito reage automaticamente ao estado global (window.effects)
const visualEffectsManager = useVisualEffectsManager({
    windowId: windowId,
    audioDataProvider: () => globalAudio.state.value.frequencyData,
    enableMouseControl: true
})

// Mantém referências para backward compatibility com componentes
const visualEffect = { value: null as any }
const particlesEffect = { value: null as any }

// Watch para atualizar referências quando efeitos forem inicializados
watch(
    () => [visualEffectsManager.gradientEffect.value.instance, visualEffectsManager.particlesEffect.value.instance],
    ([gradient, particles]) => {
        visualEffect.value = gradient
        particlesEffect.value = particles
    },
    { immediate: true }
)

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
    if (visualEffect.value) {
        visualEffect.value.setSphereSize(size)
    }
}

const handleSphereReactivity = (reactivity: number) => {
    if (visualEffect.value) {
        visualEffect.value.setSphereReactivity(reactivity)
    }
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
provide('particlesEffect', particlesEffect)
provide('spherePosition', spherePosition)
// 🎨 Provide do Visual Effects Manager (controles centralizados)
provide('visualEffectsManager', visualEffectsManager)

// ⚠️ DEPRECATED: Esses provides não são mais necessários
// Componentes devem usar GlobalAudio diretamente:
// const globalAudio = useGlobalAudio()
// const volume = computed(() => globalAudio.state.value.volume)
// const frequencyBands = computed(() => globalAudio.state.value.frequencyData.frequencyBands)
// const beatDetected = computed(() => globalAudio.state.value.frequencyData.beat)
//
// Mantidos apenas para backward compatibility temporária:
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
    if (visualEffect.value && visualEffect.value.getSpherePosition) {
        const newPosition = visualEffect.value.getSpherePosition()
        spherePosition.value = { ...newPosition }
    }

    // Atualiza dados de frequência do globalAudio (TODAS as janelas consomem daqui)
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
    // ========================================
    // PASSO 1: Define o ID único da janela (CRITICAL FIRST!)
    // ========================================
    // Este ID será usado tanto pelo GlobalState quanto pelo BroadcastSync
    // garantindo consistência em todo o sistema
    setWindowId(windowId)

    // ========================================
    // PASSO 2: Inicializa o estado global para esta janela específica
    // ========================================
    const { setCurrentWindowId } = useGlobalState()
    setCurrentWindowId(windowId)

    // ========================================
    // PASSO 3: Registra a janela no estado global
    // ========================================
    const now = Date.now()
    const windowRole = isMainWindow ? 'main' : 'secondary'
    const windowTitle = isMainWindow ? 'Spectral Audio Visualizer' : 'Child Window'

    registerWindow({
        id: windowId,
        title: windowTitle,
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
    // PASSO 4: Sincroniza título com BroadcastSync para outras janelas verem
    // ========================================
    setWindowTitle(windowTitle)

    // ========================================
    // PASSO 5: Anuncia conexão (APÓS configurar ID, role e title!)
    // ========================================
    announceConnection()

    console.log('[App.vue] Window setup complete:', {
        windowId,
        windowRole,
        windowTitle
    })

    // ========================================
    // AUDIO OWNER LOGIC - APENAS MAIN WINDOW
    // ========================================

    console.log('[App.vue] 🎵 Audio initialization check:', {
        windowId,
        isMainWindow,
        hasOwner: globalAudio.hasAudioOwner.value,
        currentOwner: globalAudio.state.value.audioOwner,
        windowOpener: !!window.opener,
        queryParam: window.location.href
    })

    // ⚠️ CRITICAL: Verificação de segurança adicional
    if (!isMainWindow) {
        console.log('[App.vue] ⚠️ NOT MAIN WINDOW - Skipping audio owner registration')
        console.log('[App.vue] 📡 This window will be a CONSUMER only')
    }

    if (isMainWindow) {
        // ========================================
        // MAIN WINDOW: Audio Provider (Owner)
        // ========================================
        console.log('[App.vue] 🎯 MAIN WINDOW - Attempting to register as audio owner...')

        // Verificação dupla: só registra se NÃO há owner OU se o owner somos nós
        const existingOwner = globalAudio.state.value.audioOwner
        if (existingOwner && existingOwner !== windowId) {
            console.error('[App.vue] ❌ CONFLICT: Another window is already audio owner:', existingOwner)
            console.error('[App.vue] 🚫 This window will NOT create audio element')
            console.error('[App.vue] 📡 Falling back to CONSUMER mode')
        } else {
            const registered = globalAudio.registerAudioOwner(windowId)

            if (registered) {
                isAudioOwner.value = true
                console.log('[App.vue] ✅ MAIN window registered as AUDIO OWNER')
                console.log('[App.vue] 🎧 Creating physical <audio> element...')

                // Cria elemento <audio> físico (APENAS aqui!)
                audio = useAudioAnalyzer()
                const playlist = usePlaylist()

                console.log('[App.vue] 📻 <audio> element created successfully')

                // Carrega tracks no GlobalAudio (estado compartilhado)
                globalAudio.setTracks(playlist.tracks.value.map(t => ({
                    name: t.title,
                    file: t.file
                })))

                console.log('[App.vue] 🎶 Tracks loaded into GlobalAudio:', playlist.tracks.value.length)

                // Carrega track inicial
                const currentTrack = globalAudio.currentTrack.value
                if (currentTrack) {
                    console.log('[App.vue] 🎼 Loading initial track:', currentTrack.name)
                    await audio.initAudio(currentTrack.file)
                }

                // ========================================
                // SYNC LOOP: Physical Audio → GlobalAudio
                // Envia dados de frequência via broadcast 60x/segundo
                // ========================================
                let syncFrameId: number | null = null

                const syncAudioData = () => {
                    if (!audio) return

                    const data = audio.getFrequencyData()
                    if (data) {
                        // Atualiza GlobalAudio (que faz broadcast automático)
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

                    syncFrameId = requestAnimationFrame(syncAudioData)
                }

                console.log('[App.vue] 📡 Starting audio data broadcast loop (60fps)...')
                syncAudioData()

                // Cleanup ao desmontar
                onUnmounted(() => {
                    if (syncFrameId) {
                        cancelAnimationFrame(syncFrameId)
                    }
                    globalAudio.unregisterAudioOwner(windowId)
                    console.log('[App.vue] 🧹 MAIN window unmounted - audio owner unregistered')
                })

                // ========================================
                // WATCH: GlobalAudio Commands → Physical Audio
                // Controles podem vir de QUALQUER janela
                // ========================================

                // Play/Pause
                watch(() => globalAudio.state.value.isPlaying, async (playing) => {
                    if (!audio) return

                    if (playing && !audio.isPlaying.value) {
                        console.log('[App.vue] ▶️ Playing audio (command from any window)')
                        await audio.play()
                    } else if (!playing && audio.isPlaying.value) {
                        console.log('[App.vue] ⏸️ Pausing audio (command from any window)')
                        audio.pause()
                    }
                })

                // Volume
                watch(() => globalAudio.state.value.volume, (vol) => {
                    if (!audio) return
                    console.log('[App.vue] 🔊 Volume changed:', vol)
                    audio.setVolume(vol)
                })

                // Seek
                watch(() => globalAudio.state.value.currentTime, (time) => {
                    if (!audio || !audio.audioElement.value) return

                    // Evita loop: só atualiza se diferença > 1s
                    const diff = Math.abs(audio.audioElement.value.currentTime - time)
                    if (diff > 1) {
                        console.log('[App.vue] ⏭️ Seeking to:', time)
                        audio.seek(time)
                    }
                })

                // Track Change
                watch(() => globalAudio.state.value.currentTrackIndex, async () => {
                    const track = globalAudio.currentTrack.value
                    if (track && audio) {
                        console.log('[App.vue] 🎵 Loading new track:', track.name)
                        await audio.initAudio(track.file)
                        if (globalAudio.state.value.isPlaying) {
                            await audio.play()
                        }
                    }
                })

                console.log('[App.vue] ✅ MAIN window audio setup complete')
            } else {
                console.error('[App.vue] ❌ MAIN window failed to register as audio owner!')
                console.error('[App.vue] ⚠️ Another window is already the owner:', globalAudio.state.value.audioOwner)
                console.error('[App.vue] 📡 Falling back to CONSUMER mode')
            }
        } // Fecha bloco verificação de existingOwner

    } else {
        // ========================================
        // SECONDARY WINDOW: Audio Consumer
        // ========================================
        console.log('[App.vue] 📱 SECONDARY window - CONSUMER mode')
        console.log('[App.vue] ⏳ Waiting for GlobalAudio to be ready...')

        // ⚠️ CRITICAL: Aguarda GlobalAudio ter um owner antes de prosseguir
        // Isso evita race conditions onde múltiplas janelas tentam ser owner
        const waitForAudioOwner = async () => {
            let attempts = 0
            const maxAttempts = 50 // 5 segundos max

            while (!globalAudio.hasAudioOwner.value && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100))
                attempts++
            }

            if (globalAudio.hasAudioOwner.value) {
                console.log('[App.vue] ✅ GlobalAudio ready - Owner:', globalAudio.state.value.audioOwner)
                console.log('[App.vue] 📡 Subscribing to audio data from MAIN window')
            } else {
                console.warn('[App.vue] ⚠️ Timeout waiting for audio owner')
                console.warn('[App.vue] 📡 Will still listen for broadcasts')
            }
        }

        waitForAudioOwner()

        // NÃO cria <audio> element
        // Apenas consome globalAudio.state.value via BroadcastChannel
        // Componentes lerão diretamente de globalAudio.state.value.frequencyData

        console.log('[App.vue] ✅ CONSUMER window ready - listening to broadcasts')
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
