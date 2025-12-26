<template>
    <div class="matrix-character-wrapper" v-draggable="{ id: 'matrix-character', handle: '.character-title' }">
        <div class="character-title">
            <span>[ CURRENT_USER ]</span>
            <button class="collapse-toggle" @click="toggleExpanded" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
                {{ isExpanded ? '−' : '+' }}
            </button>
        </div>
        <div v-if="isExpanded" class="character-content">
            <div class="matrix-character">
                <div class="character-container">
                    <div class="character-spinner">
                        <div class="character-front">
                            <img src="../../../assets/images/character.jpeg" alt="Character" class="character-image" />
                        </div>
                        <div class="character-back">
                            <img src="../../../assets/images/character.jpeg" alt="Character" class="character-image" />
                        </div>
                    </div>
                </div>
                <div class="character-glow"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useCollapsible } from '../../../shared'
import { useVisibilityReload } from '../../window-management/composables/useVisibilityReload'

const { isExpanded, toggle: toggleExpanded, reloadState } = useCollapsible({ id: 'matrix-character', initialState: true })

// Detecta quando o componente fica visível e recarrega o estado
useVisibilityReload({
    selector: '.matrix-character',
    onVisible: reloadState
})
</script>

<style scoped lang="scss">
@use '../../../style/base/variables' as *;
@use '../../../style/mixins' as *;
@use '../../../style/animations' as *;

.matrix-character-wrapper {
    @include draggable-container;
    z-index: var(--z-controls);
}

.character-title {
    @include draggable-header;

    span {
        @include draggable-title;
    }

    .collapse-toggle {
        @include draggable-collapse-toggle;
    }
}

.character-content {
    @include draggable-content;
    align-items: center;
}

.matrix-character {
    position: relative;
    width: 160px;
    height: 160px;
    perspective: 1000px;
}

.character-container {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
}

.character-spinner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    animation: spinCoin 4s linear infinite;
}

.character-front,
.character-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid var(--color-accent);
    box-shadow: var(--glow-md), var(--shadow-inset);
    background-color: var(--color-bg);

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg,
                rgba(var(--theme-primary-rgb), 0.6) 0%,
                rgba(var(--theme-primary-rgb), 0.5) 50%,
                rgba(var(--theme-primary-rgb), 0.6) 100%);
        mix-blend-mode: screen;
        pointer-events: none;
        z-index: 1;
    }
}

.character-back {
    transform: rotateY(180deg);
}

.character-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
    z-index: 0;
    filter: grayscale(100%) contrast(1.4) brightness(0.9);
}

.character-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    height: 120%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle,
            rgba(var(--theme-primary-rgb), 0.2) 0%,
            rgba(var(--theme-primary-rgb), 0.1) 30%,
            transparent 70%);
    animation: pulse-glow 3s ease-in-out infinite;
    pointer-events: none;
    z-index: -1;
}

@keyframes spinCoin {
    0% {
        transform: rotateY(0deg);
    }

    100% {
        transform: rotateY(360deg);
    }
}

@keyframes pulse-glow {

    0%,
    100% {
        opacity: 0.6;
        transform: translate(-50%, -50%) scale(1);
    }

    50% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.1);
    }
}

.matrix-character:hover {
    .character-spinner {
        animation-duration: 2s;
    }

    .character-front,
    .character-back {
        box-shadow: var(--glow-xl), inset 0 0 30px rgba(var(--theme-primary-rgb), 0.4);
    }
}
</style>
