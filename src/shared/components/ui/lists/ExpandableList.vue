<template>
    <div class="expandable-list" ref="containerRef">
        <!-- Trigger button -->
        <button 
            class="expandable-list__trigger"
            @click="toggle"
            :class="{ 'is-open': isOpen }"
            :title="title"
        >
            <slot name="trigger" :is-open="isOpen">
                <span>{{ triggerText }}</span>
                <svg 
                    class="expandable-list__icon" 
                    :class="{ 'is-up': expandDirection === 'up' }"
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                >
                    <path d="M7 10l5 5 5-5z"/>
                </svg>
            </slot>
        </button>

        <!-- Expandable content -->
        <Transition :name="transitionName">
            <div 
                v-if="isOpen" 
                class="expandable-list__content"
                :class="[
                    `expandable-list__content--${expandDirection}`,
                    { 'has-scroll': maxHeight }
                ]"
                :style="contentStyle"
            >
                <div class="expandable-list__inner">
                    <slot :is-open="isOpen" :close="close" />
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Componente genérico de lista expansível
 * 
 * @example
 * ```vue
 * <ExpandableList 
 *   expand-direction="up" 
 *   :max-height="300"
 *   trigger-text="Select Track"
 * >
 *   <div v-for="item in items" :key="item.id">
 *     {{ item.name }}
 *   </div>
 * </ExpandableList>
 * ```
 */

export interface Props {
    /**
     * Direção de expansão
     */
    expandDirection?: 'up' | 'down'
    
    /**
     * Altura máxima do conteúdo (com scroll)
     */
    maxHeight?: number
    
    /**
     * Texto do botão trigger (se não usar slot)
     */
    triggerText?: string
    
    /**
     * Título (tooltip) do botão
     */
    title?: string
    
    /**
     * Nome da transição CSS
     */
    transitionName?: string
    
    /**
     * Inicialmente aberto
     */
    initiallyOpen?: boolean
    
    /**
     * Fecha ao clicar fora
     */
    closeOnClickOutside?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    expandDirection: 'down',
    maxHeight: undefined,
    triggerText: 'Toggle',
    title: '',
    transitionName: 'expand-list',
    initiallyOpen: false,
    closeOnClickOutside: true
})

const emit = defineEmits<{
    open: []
    close: []
    toggle: [isOpen: boolean]
}>()

// ========================================
// ESTADO
// ========================================

const isOpen = ref(props.initiallyOpen)
const containerRef = ref<HTMLElement | null>(null)

// ========================================
// COMPUTED
// ========================================

const contentStyle = computed(() => {
    if (!props.maxHeight) return {}
    
    return {
        maxHeight: `${props.maxHeight}px`,
        overflowY: 'auto' as const
    }
})

// ========================================
// MÉTODOS
// ========================================

function open() {
    isOpen.value = true
    emit('open')
    emit('toggle', true)
}

function close() {
    isOpen.value = false
    emit('close')
    emit('toggle', false)
}

function toggle() {
    if (isOpen.value) {
        close()
    } else {
        open()
    }
}

/**
 * Fecha ao clicar fora
 */
function handleClickOutside(event: MouseEvent) {
    if (!props.closeOnClickOutside || !isOpen.value) return
    
    const target = event.target as Node
    if (containerRef.value && !containerRef.value.contains(target)) {
        close()
    }
}

// ========================================
// LIFECYCLE
// ========================================

onMounted(() => {
    if (props.closeOnClickOutside) {
        document.addEventListener('click', handleClickOutside)
    }
})

onUnmounted(() => {
    if (props.closeOnClickOutside) {
        document.removeEventListener('click', handleClickOutside)
    }
})

// Expose para uso via ref
defineExpose({
    open,
    close,
    toggle,
    isOpen
})
</script>

<style scoped lang="scss">
@use '../../../../style/base/variables' as *;

.expandable-list {
    position: relative;
    display: inline-block;
}

.expandable-list__trigger {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(var(--theme-primary-rgb), 0.05);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-accent);
    cursor: pointer;
    transition: all 0.2s var(--ease-smooth);
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    letter-spacing: 0.5px;

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.15);
        border-color: var(--theme-primary);
        color: var(--theme-primary);
        box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.3);
    }

    &.is-open {
        background: rgba(var(--theme-primary-rgb), 0.2);
        border-color: var(--theme-primary);
        color: var(--theme-primary);
    }
}

.expandable-list__icon {
    transition: transform 0.3s var(--ease-smooth);
    
    &.is-up {
        transform: rotate(180deg);
    }
    
    .expandable-list__trigger.is-open & {
        transform: rotate(180deg);
        
        &.is-up {
            transform: rotate(0deg);
        }
    }
}

.expandable-list__content {
    position: absolute;
    z-index: 1000;
    min-width: 200px;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(15px);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    box-shadow:
        0 0 30px rgba(var(--theme-primary-rgb), 0.2),
        inset 0 0 30px rgba(var(--theme-primary-rgb), 0.05);
    
    // Scanline effect
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(0deg,
                rgba(var(--theme-primary-rgb), 0.03) 0px,
                transparent 1px,
                transparent 2px,
                rgba(var(--theme-primary-rgb), 0.03) 3px);
        pointer-events: none;
        border-radius: var(--radius-sm);
        z-index: 0;
    }

    &--down {
        top: calc(100% + var(--spacing-xs));
        left: 0;
    }

    &--up {
        bottom: calc(100% + var(--spacing-xs));
        left: 0;
    }

    &.has-scroll {
        // Scrollbar personalizado
        ::-webkit-scrollbar {
            width: 6px;
        }

        ::-webkit-scrollbar-track {
            background: rgba(var(--theme-primary-rgb), 0.05);
            border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(var(--theme-primary-rgb), 0.3);
            border-radius: 3px;
            
            &:hover {
                background: rgba(var(--theme-primary-rgb), 0.5);
            }
        }
    }
}

.expandable-list__inner {
    position: relative;
    z-index: 1;
    padding: var(--spacing-xs);
}

// Transições
.expand-list-enter-active,
.expand-list-leave-active {
    transition: all 0.3s var(--ease-smooth);
}

.expand-list-enter-from,
.expand-list-leave-to {
    opacity: 0;
    transform: scaleY(0.8);
}

.expand-list-enter-to,
.expand-list-leave-from {
    opacity: 1;
    transform: scaleY(1);
}
</style>
