<template>
    <div class="visual-controls">
        <h4 class="control-title">Controles Visuais</h4>

        <div class="control-group">
            <label for="sphere-size-control">Tamanho da Esfera</label>
            <div class="control-with-value">
                <input id="sphere-size-control" type="range" min="100" max="500" v-model="sphereSize"
                    @input="handleSphereSizeChange" />
                <span class="value-display">{{ Math.round((sphereSize / 500) * 100) }}%</span>
            </div>
        </div>

        <div class="control-group">
            <label for="sphere-reactivity-control">Reatividade ao Áudio</label>
            <div class="control-with-value">
                <input id="sphere-reactivity-control" type="range" min="0" max="200" v-model="sphereReactivity"
                    @input="handleSphereReactivityChange" />
                <span class="value-display">{{ sphereReactivity }}%</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
    sphereSizeChange: [size: number]
    sphereReactivityChange: [reactivity: number]
}>()

const sphereSize = ref(300) // Valor inicial 300px
const sphereReactivity = ref(100) // Valor inicial 100% (comportamento padrão)

const handleSphereSizeChange = () => {
    emit('sphereSizeChange', sphereSize.value)
}

const handleSphereReactivityChange = () => {
    emit('sphereReactivityChange', sphereReactivity.value)
}
</script>

<style scoped lang="scss">
.visual-controls {
    padding: var(--spacing-lg);
    padding-top: var(--spacing-md);
    border-top: 1px solid rgba(var(--theme-primary-rgb), 0.2);
}

.control-title {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    color: var(--color-text);
    font-weight: 500;
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.5);
}

.control-group {
    margin-bottom: 1rem;

    &:last-child {
        margin-bottom: 0;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.85rem;
        color: var(--color-accent);
        font-family: 'Courier New', monospace;
        text-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.3);
    }

    .control-with-value {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    input[type='range'] {
        flex: 1;
        -webkit-appearance: none;
        appearance: none;
        height: 6px;
        border-radius: 3px;
        background: rgba(var(--theme-primary-rgb), 0.1);
        outline: none;
        box-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.2);

        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--color-text);
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.6);
            border: 1px solid var(--color-accent);

            &:hover {
                transform: scale(1.2);
                box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.8);
            }
        }

        &::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--color-text);
            cursor: pointer;
            border: 1px solid var(--color-accent);
            transition: all 0.2s ease;
            box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.6);

            &:hover {
                transform: scale(1.2);
                box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.8);
            }
        }
    }

    .value-display {
        min-width: 60px;
        text-align: right;
        font-size: 0.85rem;
        color: var(--color-text);
        font-weight: 500;
        font-family: 'Courier New', monospace;
        text-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.3);
    }
}
</style>
