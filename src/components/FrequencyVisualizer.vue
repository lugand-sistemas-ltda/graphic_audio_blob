<template>
    <div class="frequency-visualizer" v-draggable="{ id: 'frequency-visualizer', handle: '.visualizer-header' }">
        <div class="visualizer-header">
            <span class="visualizer-title">[ FREQUENCY SPECTRUM ]</span>
            <button class="collapse-toggle" @click="toggleExpanded" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
                {{ isExpanded ? '−' : '+' }}
            </button>
        </div>
        <div v-if="isExpanded" class="visualizer-content">
            <div class="frequency-bars">
                <div v-for="(value, index) in bands" :key="index" class="frequency-bar-container">
                    <div class="frequency-bar">
                        <div class="frequency-fill" :style="{
                            height: `${(value / 255) * 100}%`,
                            backgroundColor: getBarColor(value)
                        }"></div>
                    </div>
                    <div class="frequency-label">{{ getFrequencyLabel(index) }}</div>
                </div>
            </div>
            <div class="visualizer-info">
                <div class="info-item">
                    <span class="info-label">Peak:</span>
                    <span class="info-value">{{ peakFrequency }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Avg:</span>
                    <span class="info-value">{{ averageLevel }}%</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, unref } from 'vue'
import { useCollapsible } from '../composables/useCollapsible'
import { useVisibilityReload } from '../composables/useVisibilityReload'

const { isExpanded, toggle: toggleExpanded, reloadState } = useCollapsible({ id: 'frequency-visualizer', initialState: true })

// Detecta quando o componente fica visível e recarrega o estado
useVisibilityReload({
    selector: '.frequency-visualizer',
    onVisible: reloadState
})

interface Props {
    frequencyBands: number[] | { value: number[] }
}

const props = defineProps<Props>()

// Unwrap frequencyBands se for um ref
const bands = computed(() => {
    const rawBands = unref(props.frequencyBands)
    return Array.isArray(rawBands) ? rawBands : []
})

// DEBUG: Monitora mudanças nas frequências
watch(bands, (newBands) => {
    if (newBands.some(v => v > 0)) {
        console.log('[FrequencyVisualizer] Recebendo bandas:', newBands)
    }
}, { immediate: true })

const frequencyLabels = ['20Hz', '60Hz', '250Hz', '1kHz', '4kHz', '8kHz', '16kHz', '22kHz']

// Força atualização quando o tema muda
const themeRgb = ref('')

// Observa mudanças no tema através da variável CSS
const updateThemeRgb = () => {
    const root = document.documentElement
    themeRgb.value = getComputedStyle(root).getPropertyValue('--theme-primary-rgb').trim()
}

// Atualiza inicialmente e observa mudanças
updateThemeRgb()

// Observa mudanças no DOM para atualizar a cor
const observer = new MutationObserver(() => {
    updateThemeRgb()
})

// Observa mudanças no atributo data-theme
observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
})

const getFrequencyLabel = (index: number): string => {
    return frequencyLabels[index] || `${index}`
}

const getBarColor = (value: number): string => {
    const intensity = value / 255

    // Usa as variáveis CSS do tema atual via computed style
    const root = document.documentElement
    const rgb = getComputedStyle(root).getPropertyValue('--theme-primary-rgb').trim()

    if (intensity > 0.8) {
        return `rgba(${rgb}, ${0.8 + intensity * 0.2})` // Brilhante
    } else if (intensity > 0.5) {
        return `rgba(${rgb}, ${0.6 + intensity * 0.4})` // Médio
    } else if (intensity > 0.2) {
        return `rgba(${rgb}, ${0.4 + intensity * 0.6})` // Escuro
    } else {
        return `rgba(${rgb}, ${0.2 + intensity * 0.8})` // Muito escuro
    }
}

const peakFrequency = computed(() => {
    if (!bands.value || bands.value.length === 0) return 'N/A'
    const maxValue = Math.max(...bands.value)
    const maxIndex = bands.value.indexOf(maxValue)
    return frequencyLabels[maxIndex] || 'N/A'
})

const averageLevel = computed(() => {
    if (!bands.value || bands.value.length === 0) return 0
    const sum = bands.value.reduce((acc: number, val: number) => acc + val, 0)
    const avg = sum / bands.value.length
    return Math.round((avg / 255) * 100)
})
</script>

<style scoped lang="scss">
@use '../style/base/variables' as *;
@use '../style/mixins' as *;

.frequency-visualizer {
    @include draggable-container;
    font-size: var(--font-size-xs);
    z-index: var(--z-debug);
}

.visualizer-header {
    @include draggable-header;

    .visualizer-title {
        @include draggable-title;
    }

    .collapse-toggle {
        @include draggable-collapse-toggle;
    }
}

.visualizer-content {
    @include draggable-content;
}

.frequency-bars {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 150px;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
}

.frequency-bar-container {
    flex: 1;
    @include flex-column;
    align-items: center;
    gap: var(--spacing-sm);
}

.frequency-bar {
    width: 100%;
    height: 120px;
    background: rgba(var(--theme-primary-rgb), 0.1);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    border-radius: 2px;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 0 10px rgba(var(--theme-primary-rgb), 0.1);
    display: flex;
    align-items: flex-end;
}

.frequency-fill {
    width: 100%;
    transition: height 0.05s ease-out;
    box-shadow:
        0 0 10px currentColor,
        inset 0 0 10px rgba(255, 255, 255, 0.2);
    border-radius: 2px 2px 0 0;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.6);
        box-shadow: var(--glow-sm);
    }
}

.frequency-label {
    color: var(--color-text-dim);
    font-size: 0.65rem;
    text-align: center;
    text-shadow: var(--text-shadow-sm);
    white-space: nowrap;
}

.visualizer-info {
    display: flex;
    justify-content: space-around;
    padding-top: var(--spacing-md);
    border-top: 1px solid rgba(var(--theme-primary-rgb), 0.2);
}

.info-item {
    @include flex-column;
    align-items: center;
    gap: var(--spacing-xs);

    .info-label {
        color: var(--color-text-dim);
        font-size: 0.65rem;
        text-shadow: var(--text-shadow-sm);
    }

    .info-value {
        color: var(--color-text);
        font-size: var(--font-size-sm);
        font-weight: bold;
        text-shadow: var(--text-shadow-md);
    }
}
</style>
