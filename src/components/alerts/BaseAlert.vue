<template>
    <div class="base-alert" :class="[`alert-${type}`, { closing }]" @click.self="handleBackdropClick">
        <div class="alert-content" :class="{ shake: shouldShake }">
            <!-- Decorative Corners -->
            <div class="corner corner-top-left" :class="`corner-${type}`"></div>
            <div class="corner corner-top-right" :class="`corner-${type}`">
                <!-- Close Button (integrated in corner) -->
                <button v-if="closable" class="alert-close" @click="handleClose" title="Close">
                    ✕
                </button>
            </div>
            <div class="corner corner-bottom-left" :class="`corner-${type}`"></div>
            <div class="corner corner-bottom-right" :class="`corner-${type}`"></div>

            <!-- Top Border -->
            <div class="alert-border alert-border-top" :class="`border-${type}`"></div>

            <!-- Bottom Border -->
            <div class="alert-border alert-border-bottom" :class="`border-${type}`"></div>

            <!-- Header: Icon + Type Label (unified) -->
            <div class="alert-header">
                <div class="alert-type-badge" :class="`badge-${type}`">
                    <span v-if="icon" class="badge-icon">{{ icon }}</span>
                    <span class="badge-label">{{ typeLabel }}</span>
                </div>
            </div>

            <!-- Title -->
            <div v-if="title" class="alert-title">{{ title }}</div>

            <!-- Message -->
            <div class="alert-message">
                <p v-if="typeof message === 'string'" v-html="message"></p>
                <p v-else v-for="(paragraph, index) in message" :key="index" v-html="paragraph"></p>
            </div>

            <!-- Buttons -->
            <div class="alert-actions">
                <BaseButton v-for="button in buttons" :key="button.id" :variant="(button.variant as any) || 'primary'"
                    :custom-class="`alert-button`" corners @click="handleButtonClick(button.id)">
                    {{ button.label }}
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseButton } from '../ui'
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

// Cores específicas para cada tipo de alert (usando paleta centralizada)
$alert-colors: (
    warning: var(--color-warning),
    success: var(--color-success),
    error: var(--color-error),
    attention: var(--color-info),
    default: var(--color-text)
);

// ===================================
// BACKDROP
// ===================================
.base-alert {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-alert, 10000);
    animation: fadeIn 0.3s ease;
    padding: var(--spacing-lg);
    overflow: hidden;

    &.closing {
        animation: fadeOut 0.3s ease forwards;
    }
}

// ===================================
// ALERT CONTENT (container principal)
// ===================================
.alert-content {
    position: relative;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.98);
    border: 1px solid var(--color-text);
    border-radius: 4px;
    padding: 0;
    min-width: 420px;
    max-width: min(700px, 90vw);
    max-height: min(85vh, calc(100vh - 60px));
    width: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8),
        0 0 0 1px rgba(var(--theme-primary-rgb), 0.2);
    animation: slideIn 0.3s ease;
    overflow: hidden;

    &.shake {
        animation: shake 0.5s ease;
    }
}

// ===================================
// DECORATIVE CORNERS (fixos)
// ===================================
.corner {
    position: absolute;
    width: 40px;
    height: 40px;
    background: rgba(var(--theme-primary-rgb), 0.08);
    border: 1px solid;
    z-index: 10;
    border-radius: 4px;
    transition: all 0.2s ease;

    &.corner-top-left {
        top: -1px;
        left: -1px;
    }

    &.corner-top-right {
        top: -1px;
        right: -1px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &.corner-bottom-left {
        bottom: -1px;
        left: -1px;
    }

    &.corner-bottom-right {
        bottom: -1px;
        right: -1px;
    }

    // Cores por tipo
    @each $type, $color in $alert-colors {
        &.corner-#{$type} {
            border-color: rgba($color, 0.5);
            background: rgba($color, 0.08);
            box-shadow: 0 0 12px rgba($color, 0.4);
        }
    }
}

// ===================================
// CLOSE BUTTON (inside corner)
// ===================================
.alert-close {
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 40px;
    background: rgba(255, 0, 0, 0.15);
    border: none;
    color: var(--color-text);
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
    border-radius: 4px;

    &:hover {
        background: rgba(255, 0, 0, 0.3);
        transform: scale(1.05);
        text-shadow: 0 0 10px currentColor;
    }

    &:active {
        transform: scale(0.95);
    }
}

// ===================================
// HORIZONTAL BORDERS (fixos)
// ===================================
.alert-border {
    position: absolute;
    left: 40px;
    right: 40px;
    height: 3px;
    z-index: 5;

    &.alert-border-top {
        top: 0;
    }

    &.alert-border-bottom {
        bottom: 0;
    }

    // Cores por tipo
    @each $type, $color in $alert-colors {
        &.border-#{$type} {
            background: linear-gradient(90deg,
                    transparent 0%,
                    $color 15%,
                    $color 85%,
                    transparent 100%);
            box-shadow: 0 0 15px rgba($color, 0.8),
                0 0 10px rgba($color, 0.6),
                0 0 5px rgba($color, 0.4);
        }
    }
}

// ===================================
// HEADER: TYPE BADGE (fixo)
// ===================================
.alert-header {
    display: flex;
    justify-content: center;
    padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-md);
    flex-shrink: 0;
}

.alert-type-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: 4px;
    font-family: var(--font-family-mono);
    font-weight: bold;
    font-size: var(--font-size-sm);
    letter-spacing: 2px;
    border: 1px solid;
    position: relative;

    .badge-icon {
        font-size: var(--font-size-xl);
        line-height: 1;
        filter: drop-shadow(0 0 6px currentColor);
        animation: iconPulse 0.6s ease;
    }

    .badge-label {
        line-height: 1;
    }

    // Cores por tipo
    @each $type, $color in $alert-colors {
        &.badge-#{$type} {
            color: $color;
            border-color: $color;
            background: rgba($color, 0.1);
            box-shadow: 0 0 20px rgba($color, 0.3),
                inset 0 0 20px rgba($color, 0.05);

            &::before,
            &::after {
                content: '';
                position: absolute;
                width: 4px;
                height: 4px;
                background: $color;
                box-shadow: 0 0 4px $color;
                border-radius: 1px;
            }

            &::before {
                top: -2px;
                left: -2px;
            }

            &::after {
                top: -2px;
                right: -2px;
            }
        }
    }
}

// ===================================
// TITLE (fixo)
// ===================================
.alert-title {
    font-size: var(--font-size-xl);
    font-weight: bold;
    color: var(--color-text);
    text-align: center;
    font-family: var(--font-family-mono);
    padding: 0 var(--spacing-lg) var(--spacing-md);
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.5);
    flex-shrink: 0;
    word-wrap: break-word;
}

// ===================================
// MESSAGE (scrollable area)
// ===================================
.alert-message {
    color: var(--color-text);
    font-size: var(--font-size-md);
    line-height: 1.8;
    text-align: center;
    opacity: 0.9;
    padding: 0 var(--spacing-xl);
    margin: 0;
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1 1 auto;
    min-height: 0;
    word-wrap: break-word;
    word-break: break-word;

    p {
        margin: var(--spacing-md) 0;

        &:first-child {
            margin-top: 0;
        }

        &:last-child {
            margin-bottom: 0;
        }
    }

    // Scroll customizado (tema)
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(var(--theme-primary-rgb), 0.05);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(var(--theme-primary-rgb), 0.6);
        border-radius: 3px;
        transition: background 0.2s ease;

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.8);
        }
    }
}

// ===================================
// BUTTONS (usando BaseButton + custom styles)
// ===================================
.alert-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
    flex-shrink: 0;
    flex-wrap: wrap;
}

// Customizações específicas para botões dentro de alerts
.alert-button {
    // BaseButton já fornece a base
    // Aqui apenas ajustes específicos de alert se necessário
    min-width: 110px;
}

// ===================================
// ANIMATIONS
// ===================================
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
        transform: translateY(-30px) scale(0.95);
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
        transform: translateX(-8px);
    }

    20%,
    40%,
    60%,
    80% {
        transform: translateX(8px);
    }
}

@keyframes iconPulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2);
    }
}

// ===================================
// RESPONSIVE
// ===================================
@media (max-width: 768px) {
    .base-alert {
        padding: var(--spacing-md);
    }

    .alert-content {
        min-width: 90vw;
        max-width: 90vw;
        max-height: calc(100vh - 40px);
    }

    .alert-header {
        padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
    }

    .alert-type-badge {
        font-size: var(--font-size-xs);
        padding: var(--spacing-xs) var(--spacing-md);

        .badge-icon {
            font-size: var(--font-size-lg);
        }
    }

    .alert-title {
        font-size: var(--font-size-lg);
        padding: 0 var(--spacing-md) var(--spacing-sm);
    }

    .alert-message {
        font-size: var(--font-size-sm);
        padding: 0 var(--spacing-md);
    }

    .alert-actions {
        flex-direction: column;
        padding: var(--spacing-md);

        .alert-button {
            width: 100%;
            min-width: auto;
        }
    }

    .corner {
        width: 36px;
        height: 36px;
    }

    .alert-close {
        width: 36px;
        height: 36px;
        font-size: 1.1rem;
    }

    .alert-border {
        left: 36px;
        right: 36px;
    }
}

@media (max-width: 480px) {
    .alert-content {
        min-width: 95vw;
        max-width: 95vw;
    }

    .alert-type-badge {
        gap: var(--spacing-xs);
        padding: var(--spacing-xs) var(--spacing-sm);

        .badge-icon {
            font-size: var(--font-size-md);
        }
    }
}
</style>
