<template>
    <div class="control-group">
        <label :for="controlId">{{ label }}</label>
        <div class="control-with-value">
            <input :id="controlId" type="range" min="0" max="100" :value="Math.round(modelValue * 100)"
                @input="handleInput" />
            <span class="value-display">{{ Math.round(modelValue * 100) }}%</span>
        </div>
        <p class="control-description" v-if="description">{{ description }}</p>
    </div>
</template>

<script setup lang="ts">
/**
 * EffectSizeControl - Controle de tamanho/escala normalizado compartilhado
 * 
 * Todos os efeitos visuais usam valores normalizados (0-1) para tamanho.
 * O manager converte para valores específicos:
 * - Gradient: 0-1 → 100-500px (baseSphereSize)
 * - Particles: 0-1 → 100-500px (spawnAreaSize)
 * - Waveform: 0-1 → escala específica futura
 */

interface Props {
    /** Valor normalizado 0-1 */
    modelValue: number
    /** Label do controle */
    label?: string
    /** ID único para o input */
    controlId?: string
    /** Descrição opcional */
    description?: string
}

const emit = defineEmits<{
    'update:modelValue': [value: number]
}>()

withDefaults(defineProps<Props>(), {
    label: 'Effect Size',
    controlId: 'effect-size-control',
    description: ''
})

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const normalizedValue = parseInt(target.value) / 100
    emit('update:modelValue', normalizedValue)
}
</script>

<style scoped lang="scss">
@use '../../../../style/base/variables' as *;

.control-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);

    label {
        font-size: var(--font-size-xs);
        color: var(--color-text);
        text-shadow: var(--text-shadow-sm);
        font-weight: 500;
    }

    .control-with-value {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        input[type="range"] {
            flex: 1;
            height: 4px;
            background: rgba(var(--theme-primary-rgb), 0.2);
            border-radius: 2px;
            outline: none;
            cursor: pointer;

            &::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background: var(--color-accent);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.5);
                transition: all var(--transition-base);

                &:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.8);
                }
            }

            &::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: var(--color-accent);
                border: none;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.5);
                transition: all var(--transition-base);

                &:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.8);
                }
            }
        }

        .value-display {
            min-width: 48px;
            text-align: right;
            font-size: var(--font-size-sm);
            color: var(--color-accent);
            font-weight: bold;
            text-shadow: var(--text-shadow-sm);
        }
    }

    .control-description {
        font-size: var(--font-size-xs);
        color: rgba(var(--theme-primary-rgb), 0.6);
        margin: 0;
        font-style: italic;
    }
}
</style>
