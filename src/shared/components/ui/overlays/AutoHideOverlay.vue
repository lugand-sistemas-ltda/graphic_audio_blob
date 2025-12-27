<template>
    <div :class="overlayWrapperClasses" ref="containerRef">
        <Transition :name="transitionName">
            <div v-if="isVisible" :class="overlayClasses">
                <slot :is-visible="isVisible" :is-fixed="isFixed" :toggle-fixed="() => setFixed(!isFixed)" />
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAutoHide } from '../../../composables/useAutoHide'

/**
 * Componente genérico para overlays com auto-hide
 * 
 * @example
 * ```vue
 * <AutoHideOverlay position="top-center" :hide-delay="5000">
 *   <template #default="{ isFixed, toggleFixed }">
 *     <button @click="toggleFixed">Pin</button>
 *     <div>My Content</div>
 *   </template>
 * </AutoHideOverlay>
 * ```
 */

export interface Props {
    /**
     * Posição do overlay
     */
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    
    /**
     * Tempo até esconder (ms)
     */
    hideDelay?: number
    
    /**
     * Inicialmente visível
     */
    initialVisible?: boolean
    
    /**
     * Inicialmente fixo
     */
    initialFixed?: boolean
    
    /**
     * Nome da transição CSS
     */
    transitionName?: string
    
    /**
     * Z-index customizado
     */
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    position: 'top-center',
    hideDelay: 3000,
    initialVisible: true,
    initialFixed: false,
    transitionName: 'overlay-slide',
    zIndex: 1000
})

const containerRef = ref<HTMLElement | null>(null)

const { isVisible, isFixed, setFixed } = useAutoHide({
    hideDelay: props.hideDelay,
    initialVisible: props.initialVisible,
    initialFixed: props.initialFixed,
    containerRef
})

const overlayWrapperClasses = computed(() => [
    'auto-hide-overlay-wrapper',
    `overlay-wrapper-${props.position}`
])

const overlayClasses = computed(() => [
    'auto-hide-overlay',
    {
        'overlay-fixed': isFixed.value
    }
])
</script>

<style scoped lang="scss">
@use '../../../../style/base/variables' as *;

// Wrapper - área de hover invisível que permanece no DOM
.auto-hide-overlay-wrapper {
    position: fixed;
    z-index: v-bind(zIndex);
    pointer-events: auto;
}

// Posições do wrapper (área de hover)
.overlay-wrapper-bottom-center {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 900px;
    height: 120px; // Área de hover
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.overlay-wrapper-top-center {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 900px;
    height: 120px; // Área de hover
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

.overlay-wrapper-bottom-left {
    bottom: 0;
    left: 0;
    width: 300px;
    height: 120px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
}

.overlay-wrapper-bottom-right {
    bottom: 0;
    right: 0;
    width: 300px;
    height: 120px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
}

.overlay-wrapper-top-left {
    top: 0;
    left: 0;
    width: 300px;
    height: 120px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
}

.overlay-wrapper-top-right {
    top: 0;
    right: 0;
    width: 300px;
    height: 120px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
}

// Conteúdo do overlay
.auto-hide-overlay {
    // Remove position fixed pois agora está dentro do wrapper
    pointer-events: auto;
}

// Transições
.overlay-slide-enter-active,
.overlay-slide-leave-active {
    transition: all 0.3s var(--ease-smooth);
}

.overlay-slide-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.overlay-slide-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
</style>
