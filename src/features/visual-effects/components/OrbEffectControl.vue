<template>
    <div class="orb-effect-control" v-draggable="{ id: 'orb-effect-control', handle: '.orb-header' }">
        <div class="orb-header">
            <span class="orb-title">[ ORB EFFECT CONTROL ]</span>
            <button class="collapse-toggle" @click="toggleExpanded" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
                {{ isExpanded ? '−' : '+' }}
            </button>
        </div>

        <div v-if="isExpanded" class="orb-content">
            <!-- Effect Behavior Controls -->
            <div class="control-section">
                <h5 class="section-title">Effect Behavior</h5>

                <div class="toggle-group">
                    <label class="toggle-item">
                        <input type="checkbox" v-model="mouseFollow" @change="handleMouseFollowChange" />
                        <span class="toggle-label">Mouse Follow</span>
                        <span class="toggle-status" :class="{ active: mouseFollow }">
                            {{ mouseFollow ? 'ON' : 'OFF' }}
                        </span>
                    </label>

                    <label class="toggle-item" :class="{ disabled: !mouseFollow }">
                        <input type="checkbox" v-model="autoCenter" @change="handleAutoCenterChange"
                            :disabled="!mouseFollow" />
                        <span class="toggle-label">Auto Center</span>
                        <span class="toggle-status" :class="{ active: autoCenter }">
                            {{ autoCenter ? 'ON' : 'OFF' }}
                        </span>
                    </label>
                </div>

                <p class="control-hint" v-if="!mouseFollow">
                    💡 Effect fixed at center position
                </p>
                <p class="control-hint" v-else-if="autoCenter">
                    💡 Effect follows mouse, centers when cursor leaves screen
                </p>
                <p class="control-hint" v-else>
                    💡 Effect follows mouse freely
                </p>
            </div>

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
import { useCollapsible } from '../../../shared'
import { useVisibilityReload } from '../../window-management/composables/useVisibilityReload'

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
    mouseFollowChange: [enabled: boolean]
    autoCenterChange: [enabled: boolean]
}>()

const beatSensitivity = ref(150) // Valor padrão
const mouseFollow = ref(true) // Mouse follow ativo por padrão
const autoCenter = ref(true) // Auto center ativo por padrão

const handleBeatSensitivityChange = () => {
    emit('beatSensitivityChange', beatSensitivity.value)
}

const handleMouseFollowChange = () => {
    emit('mouseFollowChange', mouseFollow.value)
    // Se desativar mouse follow, desativa auto center também
    if (!mouseFollow.value) {
        autoCenter.value = false
        emit('autoCenterChange', false)
    }
}

const handleAutoCenterChange = () => {
    emit('autoCenterChange', autoCenter.value)
}
</script>

<style scoped lang="scss">
@use '../../../style/base/variables' as *;
@use '../../../style/mixins' as *;

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

.control-section {
    padding-bottom: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.2);

    .section-title {
        font-size: var(--font-size-xs);
        color: var(--color-accent);
        margin-bottom: var(--spacing-sm);
        text-transform: uppercase;
        letter-spacing: 1px;
        text-shadow: var(--text-shadow-sm);
    }
}

.toggle-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
}

.toggle-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: rgba(var(--theme-primary-rgb), 0.1);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(.disabled) {
        background: rgba(var(--theme-primary-rgb), 0.15);
        border-color: rgba(var(--theme-primary-rgb), 0.3);
    }

    &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: var(--color-theme-primary);

        &:disabled {
            cursor: not-allowed;
        }
    }

    .toggle-label {
        flex: 1;
        font-size: var(--font-size-xs);
        color: var(--color-text-dim);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .toggle-status {
        font-size: var(--font-size-xs);
        color: rgba(var(--theme-primary-rgb), 0.6);
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 3px;
        background: rgba(var(--theme-primary-rgb), 0.1);
        transition: all 0.3s ease;

        &.active {
            color: var(--color-theme-primary);
            background: rgba(var(--theme-primary-rgb), 0.2);
            text-shadow: 0 0 8px rgba(var(--theme-primary-rgb), 0.6);
        }
    }
}

.control-hint {
    font-size: var(--font-size-xs);
    color: var(--color-text-dim);
    font-style: italic;
    margin: var(--spacing-xs) 0 0 0;
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(var(--theme-primary-rgb), 0.05);
    border-left: 2px solid rgba(var(--theme-primary-rgb), 0.3);
    border-radius: 2px;
}
</style>
