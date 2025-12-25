<template>
    <div class="orb-effect-control" v-draggable="{ id: 'orb-effect-control', handle: '.orb-header' }">
        <div class="orb-header">
            <span class="orb-title">[ ORB EFFECT CONTROL ]</span>
            <button class="collapse-toggle" @click="toggleExpanded" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
                {{ isExpanded ? '−' : '+' }}
            </button>
        </div>

        <div v-if="isExpanded" class="orb-content">
            <!-- Beat Sensitivity Control -->
            <div class="control-group">
                <label for="beat-sensitivity-control">Beat Sensitivity</label>
                <div class="control-with-value">
                    <input id="beat-sensitivity-control" type="range" min="50" max="300" v-model="beatSensitivity"
                        @input="handleBeatSensitivityChange" />
                    <span class="value-display">{{ beatSensitivity }}</span>
                </div>
            </div>

            <!-- Visual Controls -->
            <VisualControls @sphere-size-change="$emit('sphereSizeChange', $event)"
                @sphere-reactivity-change="$emit('sphereReactivityChange', $event)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VisualControls from './VisualControls.vue'
import { useCollapsible } from '../composables/useCollapsible'
import { useVisibilityReload } from '../composables/useVisibilityReload'

const { isExpanded, toggle: toggleExpanded, reloadState } = useCollapsible({ id: 'orb-effect-control', initialState: true })

// Detecta quando o componente fica visível e recarrega o estado
useVisibilityReload({
    selector: '.orb-effect-control',
    onVisible: reloadState
})

const emit = defineEmits<{
    beatSensitivityChange: [sensitivity: number]
    sphereSizeChange: [size: number]
    sphereReactivityChange: [reactivity: number]
}>()

const beatSensitivity = ref(150) // Valor padrão

const handleBeatSensitivityChange = () => {
    emit('beatSensitivityChange', beatSensitivity.value)
}
</script>

<style scoped lang="scss">
@use '../style/base/variables' as *;
@use '../style/mixins' as *;

.orb-effect-control {
    @include draggable-container;
    z-index: var(--z-header);

    .orb-header {
        @include draggable-header;

        .orb-title {
            @include draggable-title;
        }

        .collapse-toggle {
            @include draggable-collapse-toggle;
        }
    }

    .orb-content {
        @include draggable-content;
    }
}

.control-group {
    @include flex-column;
    gap: var(--spacing-sm);

    label {
        color: var(--color-text-dim);
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        letter-spacing: 1px;
        text-shadow: var(--text-shadow-sm);
    }

    .control-with-value {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        input[type="range"] {
            flex: 1;
            height: 6px;
            background: rgba(var(--theme-primary-rgb), 0.2);
            border-radius: 3px;
            outline: none;
            cursor: pointer;

            &::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background: var(--color-accent);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: var(--glow-sm);

                &:hover {
                    box-shadow: var(--glow-md);
                }
            }

            &::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: var(--color-accent);
                border: none;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: var(--glow-sm);

                &:hover {
                    box-shadow: var(--glow-md);
                }
            }
        }

        .value-display {
            min-width: 3rem;
            text-align: right;
            color: var(--color-text);
            font-size: var(--font-size-sm);
            font-weight: bold;
            text-shadow: var(--text-shadow-md);
        }
    }
}
</style>
