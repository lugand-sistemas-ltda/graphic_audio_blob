<template>
    <div class="debug-terminal" v-draggable="{ id: 'debug-terminal', handle: '.terminal-header' }">
        <div class="terminal-header">
            <span class="terminal-title">[ SYSTEM MONITOR ]</span>
            <button class="collapse-toggle" @click="toggleExpanded" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
                {{ isExpanded ? '−' : '+' }}
            </button>
        </div>
        <div v-if="isExpanded" class="terminal-content">
            <!-- AUDIO GLOBAL -->
            <div class="terminal-section">
                <div class="section-label">[ AUDIO ]</div>
                <div class="terminal-line">
                    <span class="var-name">playing:</span>
                    <span class="var-value" :class="{ active: isPlaying }">{{ isPlaying ? 'TRUE' : 'FALSE' }}</span>
                </div>
                <div class="terminal-line">
                    <span class="var-name">time:</span>
                    <span class="var-value">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
                </div>
                <div class="terminal-line">
                    <span class="var-name">volume:</span>
                    <span class="var-value">{{ Math.round(volume * 100) }}%</span>
                </div>
                <div class="terminal-line">
                    <span class="var-name">beat.detected:</span>
                    <span class="var-value beat-indicator" :class="{ pulse: beatDetected }">{{ beatDetected ? '■' : '□'
                        }}</span>
                </div>
            </div>

            <!-- THEME GLOBAL -->
            <div class="terminal-section">
                <div class="section-label">[ THEME ]</div>
                <div class="terminal-line">
                    <span class="var-name">current:</span>
                    <span class="var-value">{{ currentTheme || 'matrix-green' }}</span>
                </div>
            </div>

            <!-- SYSTEM -->
            <div class="terminal-section">
                <div class="section-label">[ SYSTEM ]</div>
                <div class="terminal-line">
                    <span class="var-name">fps:</span>
                    <span class="var-value">{{ fps }}</span>
                </div>
                <div class="terminal-line">
                    <span class="var-name">window.id:</span>
                    <span class="var-value">{{ windowId }}</span>
                </div>
            </div>

            <div class="terminal-footer">
                <span class="timestamp">{{ timestamp }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { useCollapsible } from '../../../shared'
import { useVisibilityReload } from '../../window-management'
import { useGlobalAudio, useGlobalTheme } from '../../../core/global'

const { isExpanded, toggle: toggleExpanded, reloadState } = useCollapsible({ id: 'debug-terminal', initialState: true })

// Detecta quando o componente fica visível e recarrega o estado
useVisibilityReload({
    selector: '.debug-terminal',
    onVisible: reloadState
})

// ========================================
// GLOBAL STATE (apenas dados globais)
// ========================================
const globalAudio = useGlobalAudio()
const globalTheme = useGlobalTheme()
const windowId = inject<string>('windowId', 'unknown')

// Computed: Dados de áudio
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0)
const beatDetected = ref(false)

// Computed: Tema atual
const currentTheme = ref('')

// System metrics
const fps = ref(60)
const timestamp = ref('')

// ========================================
// WATCHERS - Sincroniza com GlobalAudio/Theme
// ========================================
let unwatchAudio: (() => void) | null = null
let unwatchTheme: (() => void) | null = null

const syncFromGlobal = () => {
    // Audio
    isPlaying.value = globalAudio.state.value.isPlaying
    currentTime.value = globalAudio.state.value.currentTime
    duration.value = globalAudio.state.value.duration
    volume.value = globalAudio.state.value.volume
    beatDetected.value = globalAudio.state.value.frequencyData.beat

    // Theme
    currentTheme.value = globalTheme.state.value.currentTheme
}

// ========================================
// UTILS
// ========================================
let timeInterval: number | null = null

const updateTimestamp = () => {
    const now = new Date()
    timestamp.value = now.toLocaleTimeString('en-US', { hour12: false })
}

// Calcula FPS
let lastTime = performance.now()
let frames = 0
const calculateFPS = () => {
    frames++
    const currentTimeNow = performance.now()
    if (currentTimeNow >= lastTime + 1000) {
        fps.value = Math.round((frames * 1000) / (currentTimeNow - lastTime))
        frames = 0
        lastTime = currentTimeNow
    }
    requestAnimationFrame(calculateFPS)
}

const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ========================================
// LIFECYCLE
// ========================================
onMounted(() => {
    // Sincroniza inicial
    syncFromGlobal()

    // Watch global state changes
    import('vue').then(({ watch }) => {
        unwatchAudio = watch(() => globalAudio.state.value, syncFromGlobal, { deep: true })
        unwatchTheme = watch(() => globalTheme.state.value, syncFromGlobal, { deep: true })
    })

    // Timestamp
    updateTimestamp()
    timeInterval = globalThis.setInterval(updateTimestamp, 1000)

    // FPS
    calculateFPS()
})

onUnmounted(() => {
    if (timeInterval) clearInterval(timeInterval)
    if (unwatchAudio) unwatchAudio()
    if (unwatchTheme) unwatchTheme()
})
</script>

<style scoped lang="scss">
@use '../../../style/base/variables' as *;
@use '../../../style/mixins' as *;
@use '../../../style/animations' as *;

.debug-terminal {
    @include draggable-container;
    font-size: var(--font-size-xs);
    z-index: var(--z-debug);
}

.terminal-header {
    @include draggable-header;

    .terminal-title {
        @include draggable-title;
    }

    .collapse-toggle {
        @include draggable-collapse-toggle;
    }
}

.terminal-content {
    @include draggable-content;
    gap: 0;
}

.terminal-line {
    @include flex-between;
    padding: 0.35rem 0;
    line-height: var(--line-height-base);

    &.separator {
        border-top: 1px solid rgba(var(--theme-primary-rgb), 0.1);
        margin-top: var(--spacing-sm);
        padding-top: var(--spacing-md);
    }

    .var-name {
        color: var(--color-text-dim);
        text-shadow: var(--text-shadow-sm);
    }

    .var-value {
        color: var(--color-text);
        font-weight: bold;
        text-shadow: var(--text-shadow-md);
        font-family: var(--font-family-mono);

        &.active {
            color: var(--color-accent);
            animation: pulse 1s infinite;
        }

        &.beat-indicator {
            font-size: var(--font-size-lg);
            line-height: 1;

            &.pulse {
                animation: beat-pulse 0.3s ease-out;
                color: var(--color-text);
                text-shadow: var(--text-shadow-lg);
            }
        }
    }
}

.terminal-footer {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    background: rgba(var(--theme-primary-rgb), 0.03);
    text-align: center;

    .timestamp {
        color: var(--color-text-dim);
        font-size: var(--font-size-xs);
        text-shadow: var(--text-shadow-sm);
    }
}

@keyframes beat-pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.3);
    }

    100% {
        transform: scale(1);
    }
}
</style>
