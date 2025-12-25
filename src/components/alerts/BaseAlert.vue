<template>
    <div class="base-alert" :class="[`alert-${type}`, { closing }]" @click.self="handleBackdropClick">
        <div class="alert-content" :class="{ shake: shouldShake }">
            <!-- Close Button -->
            <button v-if="closable" class="alert-close" @click="handleClose" title="Close">
                ✕
            </button>

            <!-- Icon -->
            <div v-if="icon" class="alert-icon" :class="`icon-${type}`">
                {{ icon }}
            </div>

            <!-- Title with Type Label -->
            <div class="alert-header">
                <span v-if="title" class="alert-title">{{ title }}</span>
                <span class="alert-type-label" :class="`label-${type}`">{{ typeLabel }}</span>
            </div>

            <!-- Message -->
            <div class="alert-message">
                <p v-if="typeof message === 'string'" v-html="message"></p>
                <p v-else v-for="(paragraph, index) in message" :key="index" v-html="paragraph"></p>
            </div>

            <!-- Buttons -->
            <div class="alert-actions">
                <button v-for="button in buttons" :key="button.id" :class="['alert-button', `btn-${button.variant || 'primary'
                    }`]" @click="handleButtonClick(button.id)">
                    {{ button.label }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AlertType, AlertButton } from '../../core/state/types'

interface Props {
    id: string
    type: AlertType
    title?: string
    message: string | string[]
    icon?: string
    buttons?: AlertButton[]
    closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    closable: true,
    buttons: () => [{ id: 'ok', label: 'OK', variant: 'primary' }]
})

const emit = defineEmits<{
    close: []
    buttonClick: [buttonId: string]
}>()

const closing = ref(false)
const shouldShake = ref(false)

// Label do tipo de alert (exibido colorido)
const typeLabel = computed(() => {
    const labels: Record<AlertType, string> = {
        warning: 'WARNING',
        success: 'SUCCESS',
        error: 'ERROR',
        attention: 'ATTENTION',
        default: 'ALERT'
    }
    return labels[props.type]
})

function handleClose() {
    if (!props.closable) return

    closing.value = true
    setTimeout(() => {
        emit('close')
    }, 300)
}

function handleBackdropClick() {
    // Shake animation quando clicar fora
    if (props.closable) {
        handleClose()
    } else {
        shouldShake.value = true
        setTimeout(() => {
            shouldShake.value = false
        }, 500)
    }
}

function handleButtonClick(buttonId: string) {
    closing.value = true
    setTimeout(() => {
        emit('buttonClick', buttonId)
    }, 200)
}
</script>

<style scoped lang="scss">
@use '../../style/variables' as *;

// Cores específicas para cada tipo de alert
$alert-colors: (
    warning: #ff9800,
    // Laranja
    success: #4caf50,
    // Verde
    error: #f44336,
    // Vermelho
    attention: #2196f3,
    // Azul
    default: var(--color-text) // Cor do tema
);

.base-alert {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-alert, 10000);
    animation: fadeIn 0.3s ease;

    &.closing {
        animation: fadeOut 0.3s ease forwards;
    }
}

.alert-content {
    position: relative;
    background: rgba(0, 0, 0, 0.95);
    border: 2px solid var(--color-text);
    border-radius: 8px;
    padding: var(--spacing-xl);
    min-width: 400px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(var(--theme-primary-rgb), 0.3);
    animation: slideIn 0.3s ease;

    &.shake {
        animation: shake 0.5s ease;
    }
}

.alert-close {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.2rem;
    color: var(--color-text);
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 0, 0, 0.2);
        border-color: #ff0000;
        color: #ff0000;
        transform: scale(1.1);
    }
}

.alert-icon {
    font-size: 3rem;
    text-align: center;
    margin-bottom: var(--spacing-lg);
    animation: iconPulse 0.6s ease;

    @each $type,
    $color in $alert-colors {
        &.icon-#{$type} {
            color: $color;
            filter: drop-shadow(0 0 10px $color);
        }
    }
}

.alert-header {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
    align-items: center;
}

.alert-title {
    font-size: var(--font-size-xl);
    font-weight: bold;
    color: var(--color-text);
    text-align: center;
    font-family: var(--font-family-mono);
}

.alert-type-label {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: 4px;
    font-size: var(--font-size-sm);
    font-weight: bold;
    font-family: var(--font-family-mono);
    letter-spacing: 2px;
    text-align: center;

    @each $type,
    $color in $alert-colors {
        &.label-#{$type} {
            color: $color;
            border: 1px solid $color;
            background: rgba($color, 0.1);
            box-shadow: 0 0 10px rgba($color, 0.3);
        }
    }
}

.alert-message {
    color: var(--color-text);
    font-size: var(--font-size-md);
    line-height: 1.6;
    margin-bottom: var(--spacing-xl);
    text-align: center;

    p {
        margin: var(--spacing-md) 0;

        &:first-child {
            margin-top: 0;
        }

        &:last-child {
            margin-bottom: 0;
        }
    }
}

.alert-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
}

.alert-button {
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: 4px;
    font-size: var(--font-size-md);
    font-weight: bold;
    font-family: var(--font-family-mono);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 100px;

    &.btn-primary {
        background: rgba(var(--theme-primary-rgb), 0.2);
        border: 2px solid var(--color-text);
        color: var(--color-text);

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.4);
            box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.5);
            transform: translateY(-2px);
        }
    }

    &.btn-secondary {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: var(--color-text);

        &:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--color-text);
            transform: translateY(-2px);
        }
    }

    &.btn-danger {
        background: rgba(255, 0, 0, 0.2);
        border: 2px solid #ff0000;
        color: #ff0000;

        &:hover {
            background: rgba(255, 0, 0, 0.3);
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
            transform: translateY(-2px);
        }
    }

    &:active {
        transform: translateY(0);
    }
}

// Animations
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

@keyframes slideIn {
    from {
        transform: translateY(-50px) scale(0.9);
        opacity: 0;
    }

    to {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    10%,
    30%,
    50%,
    70%,
    90% {
        transform: translateX(-10px);
    }

    20%,
    40%,
    60%,
    80% {
        transform: translateX(10px);
    }
}

@keyframes iconPulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }
}

// Responsive
@media (max-width: 768px) {
    .alert-content {
        min-width: 90vw;
        padding: var(--spacing-lg);
    }

    .alert-actions {
        flex-direction: column;

        .alert-button {
            width: 100%;
        }
    }
}
</style>
