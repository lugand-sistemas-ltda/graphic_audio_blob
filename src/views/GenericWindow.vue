<template>
    <div class="generic-window">
        <!-- Window Titlebar -->
        <WindowTitlebar :window-id="genericWindowId" />

        <!-- Window Configuration Panel -->
        <WindowConfig :window-id="genericWindowId" />

        <!-- Visual Effects (conditional) -->
        <div v-if="shouldRenderGradient" class="visual-effects">
            <!-- Gradient renderizado no body pelo composable -->
        </div>

        <!-- Components (filtered by windowId) -->
        <div class="window-components">
            <!-- Componentes serão renderizados aqui baseados no windowId -->
            <div class="empty-state" v-if="!hasComponents">
                <div class="empty-content">
                    <h2>✨ Empty Window</h2>
                    <p>Click on ⚙️ to configure this window</p>
                    <ul class="instructions">
                        <li>📝 Rename your window</li>
                        <li>🎨 Enable visual effects</li>
                        <li>➕ Add components</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Connection Status -->
        <div class="connection-status" v-if="showStatus">
            <div class="status-content" :class="{ connected: isConnected }">
                {{ isConnected ? '🟢 SYNCED' : '🔴 DISCONNECTED' }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { setWindowId, setWindowTitle, announceConnection } from '../core/sync'
import { useGlobalState, registerWindow, getWindowComponents } from '../core/state'
import { useGlobalAudio } from '../core/global'
import { useSpectralVisualEffect } from '../features/visual-effects'
import { WindowTitlebar, WindowConfig } from '../features/window-management'

// ========================================
// WINDOW ID STRATEGY - Consistente com arquitetura global
// ========================================
// Gera ID sequencial genérico (generic-window-1, generic-window-2, etc)
// Este ID será compartilhado entre GlobalState e BroadcastSync
let windowCounter = 0
const getNextWindowId = (() => {
    return () => {
        windowCounter++
        return `generic-window-${windowCounter}`
    }
})()

const genericWindowId = ref(getNextWindowId())

// Global State
const { state } = useGlobalState()

// Global Audio (para sincronização de dados de áudio)
const globalAudio = useGlobalAudio()

// Connection status
const isConnected = ref(false)
const showStatus = ref(true)

// Window config
const windowConfig = computed(() => state.windows[genericWindowId.value])

// Renderização condicional de efeitos
const shouldRenderGradient = computed(() => {
    return windowConfig.value?.effects?.includes('gradient') ?? false
})

// Componentes desta janela
const windowComponents = computed(() => {
    return getWindowComponents(genericWindowId.value)
})

const hasComponents = computed(() => {
    return windowComponents.value.length > 0
})

// Provider de dados de áudio - usa GlobalAudio diretamente
const audioDataProvider = () => {
    const data = globalAudio.state.value.frequencyData
    return {
        frequencyBands: data.frequencyBands || [0, 0, 0, 0, 0, 0, 0, 0],
        bass: data.bass || 0,
        mid: data.mid || 0,
        treble: data.treble || 0,
        overall: data.overall || 0,
        beat: data.beat || false,
        raw: data.raw || new Uint8Array(0)
    }
}

// Inicializa efeito visual APENAS se gradient estiver ativo
let visualEffect: any = null

const initVisualEffect = () => {
    if (shouldRenderGradient.value && !visualEffect) {
        console.log('[GenericWindow] Initializing gradient effect...')
        visualEffect = useSpectralVisualEffect({
            audioDataProvider,
            enableMouseControl: true,
            layerCount: 8
        })
    }
}

const stopVisualEffect = () => {
    if (visualEffect) {
        console.log('[GenericWindow] Stopping gradient effect...')
        visualEffect.stopEffect()
        visualEffect = null
    }
}

// Watch para mudanças no config de efeitos
watch(shouldRenderGradient, (newValue, oldValue) => {
    if (newValue && !oldValue) {
        initVisualEffect()
    } else if (!newValue && oldValue) {
        stopVisualEffect()
    }
})

// Esconde status após 5 segundos
onMounted(() => {
    // ========================================
    // PASSO 1: Define o ID único da janela (CRITICAL FIRST!)
    // ========================================
    // Sincroniza ID com BroadcastSync antes de qualquer comunicação
    setWindowId(genericWindowId.value)

    // ========================================
    // PASSO 2: Registra esta janela no estado global
    // ========================================
    const now = Date.now()
    const windowTitle = `Generic Window ${windowCounter}`

    registerWindow({
        id: genericWindowId.value,
        title: windowTitle,
        role: 'secondary',
        effects: [], // Vazia por padrão
        layout: 'free',
        backgroundColor: '#000000',
        createdAt: now,
        lastActive: now,
        activeComponents: [],
        allComponentsHidden: false
    })

    // ========================================
    // PASSO 3: Sincroniza título com BroadcastSync
    // ========================================
    setWindowTitle(windowTitle)

    // ========================================
    // PASSO 4: Anuncia conexão (APÓS configurar ID, role e title!)
    // ========================================
    announceConnection()

    console.log('[GenericWindow] Window setup complete:', {
        genericWindowId: genericWindowId.value,
        windowTitle
    })

    // Inicializa efeitos se necessário
    initVisualEffect()

    setTimeout(() => {
        showStatus.value = false
    }, 5000)
})

// Cleanup
onUnmounted(() => {
    stopVisualEffect()
})
</script>

<style scoped lang="scss">
@use '../style/base/variables' as *;

.generic-window {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    overflow: hidden;
}

.visual-effects {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}

.window-components {
    position: relative;
    z-index: 100;
    padding-top: 50px; // Space for titlebar
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 50px);
    padding: 2rem;

    .empty-content {
        text-align: center;
        font-family: 'Courier New', monospace;
        color: var(--matrix-green-dim);

        h2 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: var(--matrix-green-bright);
            text-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
        }

        p {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            opacity: 0.7;
        }

        .instructions {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 1rem;

            li {
                font-size: 1rem;
                padding: 0.5rem 1rem;
                border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
                border-radius: 4px;
                background: rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;

                &:hover {
                    border-color: rgba(var(--theme-primary-rgb), 0.6);
                    background: rgba(var(--theme-primary-rgb), 0.1);
                    transform: translateX(5px);
                }
            }
        }
    }
}

.connection-status {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;

    .status-content {
        padding: 0.75rem 1.5rem;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid rgba(255, 0, 0, 0.5);
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        color: #ff4444;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        animation: pulse 2s infinite;

        &.connected {
            border-color: rgba(0, 255, 65, 0.5);
            color: var(--matrix-green-bright);
            animation: none;
        }
    }
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}
</style>
