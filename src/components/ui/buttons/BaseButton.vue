<template>
    <button :class="buttonClasses" :disabled="disabled" :type="type" :aria-label="ariaLabel" :title="title"
        @click="handleClick">
        <span v-if="icon && iconPosition === 'left'" class="btn-icon">{{ icon }}</span>
        <span v-if="$slots.default" class="btn-content">
            <slot></slot>
        </span>
        <span v-if="icon && iconPosition === 'right'" class="btn-icon">{{ icon }}</span>
        <span v-if="loading" class="btn-loader">⏳</span>
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useComponentValidator } from '../../../composables/useComponentValidator'

/**
 * BaseButton - Micro-componente de botão reutilizável
 * 
 * Sistema de classes compostas:
 * - btn (base) + btn-primary/secondary/danger/etc (variant)
 * - btn-sm/lg (size) + btn-shadow (effect) + btn-glow (effect)
 * - btn-corners (decorative) + btn-icon-only (layout)
 * 
 * Exemplos:
 * <BaseButton variant="primary" shadow glow>Click Me</BaseButton>
 * <BaseButton variant="danger" size="lg" corners>Delete</BaseButton>
 * <BaseButton variant="ghost" icon="➕">Add</BaseButton>
 */

export interface BaseButtonProps {
    /** Variante de cor do botão */
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost'
    /** Tamanho do botão */
    size?: 'sm' | 'md' | 'lg'
    /** Ícone (emoji ou caractere) */
    icon?: string
    /** Posição do ícone */
    iconPosition?: 'left' | 'right'
    /** Se é apenas ícone (sem texto) */
    iconOnly?: boolean
    /** Adiciona sombra */
    shadow?: boolean
    /** Adiciona efeito glow ao hover */
    glow?: boolean
    /** Adiciona cantos decorativos */
    corners?: boolean
    /** Estado desabilitado */
    disabled?: boolean
    /** Estado de loading */
    loading?: boolean
    /** Tipo HTML do botão */
    type?: 'button' | 'submit' | 'reset'
    /** Label para acessibilidade */
    ariaLabel?: string
    /** Tooltip */
    title?: string
    /** Classes CSS adicionais */
    customClass?: string
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
    variant: 'primary',
    size: 'md',
    iconPosition: 'left',
    iconOnly: false,
    shadow: false,
    glow: false,
    corners: false,
    disabled: false,
    loading: false,
    type: 'button'
})

const emit = defineEmits<{
    click: [event: MouseEvent]
}>()

// Validação do componente
const { isValid, validationErrors } = useComponentValidator('BaseButton', {
    variant: props.variant,
    size: props.size
})

// Classes compostas do botão
const buttonClasses = computed(() => {
    const classes = ['btn']

    // Variant (obrigatório)
    if (props.variant) {
        classes.push(`btn-${props.variant}`)
    }

    // Size
    if (props.size && props.size !== 'md') {
        classes.push(`btn-${props.size}`)
    }

    // Icon only
    if (props.iconOnly) {
        classes.push('btn-icon-only')
    }

    // Effects
    if (props.shadow) {
        classes.push('btn-shadow')
    }

    if (props.glow) {
        classes.push('btn-glow')
    }

    if (props.corners) {
        classes.push('btn-corners')
    }

    // Loading state
    if (props.loading) {
        classes.push('btn-loading')
    }

    // Custom classes
    if (props.customClass) {
        classes.push(props.customClass)
    }

    return classes
})

const handleClick = (event: MouseEvent) => {
    if (props.disabled || props.loading) {
        return
    }

    if (!isValid.value) {
        console.error('[BaseButton] Component validation failed:', validationErrors.value)
        return
    }

    emit('click', event)
}
</script>

<style scoped lang="scss">
// Estilos específicos do componente (complementam utilities)
.btn {
    // Estilos base já definidos em _utilities.scss
    // Aqui apenas complementos específicos

    &-loader {
        animation: spin 1s linear infinite;
        margin-left: var(--spacing-sm);
    }

    &-loading {
        pointer-events: none;
        opacity: 0.7;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

// Ajustes para quando há ícone + texto
.btn-content {
    display: inline-flex;
    align-items: center;
}

.btn-icon {
    display: inline-flex;
    align-items: center;
    font-size: 1.1em;
    line-height: 1;
}
</style>
