<template>
    <div class="effects-control">
        <h4 class="section-title">[ VISUAL EFFECTS ]</h4>

        <div class="effects-list">
            <label class="effect-item" :class="{ active: hasEffect('gradient') }">
                <input type="checkbox" :checked="hasEffect('gradient')" @change="toggleEffect('gradient')" />
                <span class="effect-icon">🌈</span>
                <span class="effect-name">Gradient Reactive</span>
                <span v-if="hasEffect('gradient')" class="effect-status">ON</span>
            </label>

            <label class="effect-item disabled">
                <input type="checkbox" :checked="hasEffect('particles')" disabled />
                <span class="effect-icon">✨</span>
                <span class="effect-name">Particles</span>
                <span class="coming-soon">SOON</span>
            </label>

            <label class="effect-item disabled">
                <input type="checkbox" :checked="hasEffect('waveform')" disabled />
                <span class="effect-icon">〰️</span>
                <span class="effect-name">Waveform</span>
                <span class="coming-soon">SOON</span>
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGlobalState, toggleWindowEffect } from '../../core/state'
import type { WindowId, VisualEffect } from '../../core/state/types'

interface Props {
    windowId: WindowId
}

const props = defineProps<Props>()

const { state } = useGlobalState()

const windowConfig = computed(() => state.windows[props.windowId])

const hasEffect = (effect: VisualEffect): boolean => {
    return windowConfig.value?.effects.includes(effect) || false
}

const toggleEffect = (effect: VisualEffect) => {
    toggleWindowEffect(props.windowId, effect)
}
</script>

<style scoped lang="scss">
@use '../../style/variables' as *;

.effects-control {
    padding: var(--spacing-md);
    border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.2);
}

.section-title {
    font-size: var(--font-size-xs);
    color: var(--color-text);
    margin-bottom: var(--spacing-md);
    text-shadow: var(--text-shadow-md);
    font-weight: 600;
    letter-spacing: 0.05em;
}

.effects-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.effect-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: rgba(var(--theme-primary-rgb), 0.1);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover:not(.disabled) {
        background: rgba(var(--theme-primary-rgb), 0.2);
        border-color: rgba(var(--theme-primary-rgb), 0.4);
    }

    &.active {
        background: rgba(var(--theme-primary-rgb), 0.3);
        border-color: rgba(var(--theme-primary-rgb), 0.5);

        .effect-name {
            color: var(--color-text);
        }
    }

    &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
        accent-color: var(--color-theme-primary);

        &:disabled {
            cursor: not-allowed;
        }
    }
}

.effect-icon {
    font-size: 1.2em;
}

.effect-name {
    flex: 1;
    font-size: var(--font-size-xs);
    color: var(--color-text-dim);
    font-weight: 500;
}

.effect-status {
    font-size: var(--font-size-xs);
    color: var(--color-theme-primary);
    font-weight: 600;
    text-shadow: 0 0 8px rgba(var(--theme-primary-rgb), 0.6);
}

.coming-soon {
    font-size: var(--font-size-xs);
    color: rgba(var(--theme-primary-rgb), 0.6);
    font-weight: 600;
    font-style: italic;
}
</style>
