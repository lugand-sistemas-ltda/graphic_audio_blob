<template>
    <div class="debug-terminal" v-draggable="{ id: 'debug-terminal', handle: '.terminal-header' }">
        <div class="terminal-header">
            <span class="terminal-title">[ SYSTEM MONITOR ]</span>
            <button class="collapse-toggle" @click="toggleExpanded" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
                {{ isExpanded ? '−' : '+' }}
            </button>
        </div>
        <div v-if="isExpanded" class="terminal-content">
            <div class="terminal-line">
                <span class="var-name">sphere.position.x:</span>
                <span class="var-value">{{ position.x.toFixed(2) }}%</span>
            </div>
            <div class="terminal-line">
                <span class="var-name">sphere.position.y:</span>
                <span class="var-value">{{ position.y.toFixed(2) }}%</span>
            </div>
            <div class="terminal-line separator">
                <span class="var-name">sphere.size:</span>
                <span class="var-value">{{ sphereSize }}px</span>
            </div>
            <div class="terminal-line">
                <span class="var-name">sphere.reactivity:</span>
                <span class="var-value">{{ sphereReactivity }}%</span>
            </div>
            <div class="terminal-line separator">
                <span class="var-name">audio.playing:</span>
                <span class="var-value" :class="{ active: isPlaying }">{{ isPlaying ? 'TRUE' : 'FALSE' }}</span>
            </div>
            <div class="terminal-line">
                <span class="var-name">audio.time:</span>
                <span class="var-value">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
            </div>
            <div class="terminal-line">
                <span class="var-name">audio.volume:</span>
                <span class="var-value">{{ Math.round(volume * 100) }}%</span>
            </div>
            <div class="terminal-line separator">
                <span class="var-name">beat.detected:</span>
                <span class="var-value beat-indicator" :class="{ pulse: beatDetected }">{{ beatDetected ? '■' : '□'
                }}</span>
            </div>
            <div class="terminal-line">
                <span class="var-name">layers.active:</span>
                <span class="var-value">{{ layerCount }} / 8</span>
            </div>
            <div class="terminal-line">
                <span class="var-name">fps:</span>
                <span class="var-value">{{ fps }}</span>
            </div>
            <div class="terminal-footer">
                <span class="timestamp">{{ timestamp }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, unref, computed } from 'vue'
import { useCollapsible } from '../composables/useCollapsible'
import { useVisibilityReload } from '../composables/useVisibilityReload'

const { isExpanded, toggle: toggleExpanded, reloadState } = useCollapsible({ id: 'debug-terminal', initialState: true })

// Detecta quando o componente fica visível e recarrega o estado
useVisibilityReload({
    selector: '.debug-terminal',
    onVisible: reloadState
})

interface Props {
    spherePosition: { x: number; y: number } | { value: { x: number; y: number } }
    sphereSize: number
    sphereReactivity: number
    isPlaying: boolean
    currentTime: number
    duration: number
    volume: number
    beatDetected: boolean
    layerCount: number
}

const props = defineProps<Props>()

// Unwrap spherePosition se for um ref
const position = computed(() => {
    const pos = unref(props.spherePosition)
    return pos || { x: 50, y: 50 }
})

const fps = ref(60)
const timestamp = ref('')
let timeInterval: number | null = null

// Atualiza timestamp
const updateTimestamp = () => {
    const now = new Date()
    timestamp.value = now.toLocaleTimeString('en-US', { hour12: false })
}

// Calcula FPS
let lastTime = performance.now()
let frames = 0
const calculateFPS = () => {
    frames++
    const currentTime = performance.now()
    if (currentTime >= lastTime + 1000) {
        fps.value = Math.round((frames * 1000) / (currentTime - lastTime))
        frames = 0
        lastTime = currentTime
    }
    requestAnimationFrame(calculateFPS)
}

const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
    updateTimestamp()
    timeInterval = globalThis.setInterval(updateTimestamp, 1000)
    calculateFPS()
})

onUnmounted(() => {
    if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped lang="scss">
@use '../style/variables' as *;
@use '../style/mixins' as *;
@use '../style/animations' as *;

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
