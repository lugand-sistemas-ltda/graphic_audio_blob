<template>
    <div class="visual-view">
        <!-- Window Configuration Panel -->
        <WindowConfig :window-id="visualWindowId" />

        <!-- Apenas efeitos visuais, sem controles -->
        <!-- A esfera/gradiente é renderizada no body pelo useSpectralVisualEffect -->

        <div class="visual-info" v-if="showInfo">
            <div class="info-content">
                <h2>🎨 Visual Window</h2>
                <p>Connected to main window</p>
                <p class="status" :class="{ connected: isConnected }">
                    {{ isConnected ? '🟢 SYNCED' : '🔴 DISCONNECTED' }}
                </p>
            </div>
        </div>

        <button class="toggle-info-button" @click="showInfo = !showInfo" :title="showInfo ? 'Hide Info' : 'Show Info'">
            {{ showInfo ? '✕' : 'ℹ️' }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useWindowManager } from '../core/sync'
import { useSpectralVisualEffect } from '../features/visual-effects'
import { registerWindow } from '../core/state'
import { WindowConfig } from '../features/window-management'

// ID único para esta janela visual
const visualWindowId = 'visual-' + Date.now()

// Define role da janela como 'visual'
const windowManager = useWindowManager({ enableLogging: false })
windowManager.setWindowRole('visual')

const showInfo = ref(true)
const isConnected = ref(false)

// Provider de dados de áudio sincronizados
let audioDataCache = {
    frequencyBands: [0, 0, 0, 0, 0, 0, 0, 0],
    bass: 0,
    mid: 0,
    treble: 0,
    overall: 0,
    beat: false,
    raw: new Uint8Array(0)
}

// Escuta dados de áudio da janela principal
const unsubscribe = windowManager.onAudioData((data) => {
    audioDataCache = {
        ...data,
        raw: new Uint8Array(0) // raw não é sincronizado, apenas dados processados
    }
    isConnected.value = true
})

// Provider que retorna os dados sincronizados
const audioDataProvider = () => audioDataCache

// Inicializa efeito visual com dados sincronizados
useSpectralVisualEffect({
    audioDataProvider,
    enableMouseControl: true,
    layerCount: 8
})

// Esconde info após 5 segundos
onMounted(() => {
    // Registra esta janela no estado global
    const now = Date.now()
    registerWindow({
        id: visualWindowId,
        title: 'Visual Window',
        role: 'secondary',
        effects: ['gradient'], // Apenas gradient por padrão
        layout: 'fullscreen',
        backgroundColor: '#000000',
        createdAt: now,
        lastActive: now,
        activeComponents: [],
        allComponentsHidden: false
    })

    setTimeout(() => {
        showInfo.value = false
    }, 5000)
})

// Cleanup
onUnmounted(() => {
    unsubscribe()
})
</script>

<style scoped lang="scss">
@use '../style/base/variables' as *;

.visual-view {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

.visual-info {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    pointer-events: none;
    transition: opacity var(--transition-slow);

    .info-content {
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid rgba(var(--theme-primary-rgb), 0.5);
        border-radius: 8px;
        padding: var(--spacing-xl);
        text-align: center;
        box-shadow: 0 0 40px rgba(var(--theme-primary-rgb), 0.3);
        backdrop-filter: blur(10px);

        h2 {
            margin: 0 0 var(--spacing-md) 0;
            font-size: var(--font-size-xl);
            color: var(--color-accent);
            text-shadow: var(--text-shadow-lg);
        }

        p {
            margin: var(--spacing-xs) 0;
            font-size: var(--font-size-md);
            color: var(--color-text);
        }

        .status {
            font-weight: bold;
            font-size: var(--font-size-lg);
            padding: var(--spacing-sm);
            border-radius: 4px;
            margin-top: var(--spacing-md);

            &.connected {
                color: var(--color-accent);
                box-shadow: var(--glow-md);
            }
        }
    }
}

.toggle-info-button {
    position: fixed;
    top: var(--spacing-md);
    right: var(--spacing-md);
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.5);
    border-radius: 50%;
    color: var(--color-text);
    font-size: 1.2rem;
    cursor: pointer;
    transition: all var(--transition-base);
    z-index: 1001;

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.2);
        border-color: rgba(var(--theme-primary-rgb), 0.7);
        box-shadow: var(--glow-sm);
        transform: scale(1.1);
    }
}
</style>
