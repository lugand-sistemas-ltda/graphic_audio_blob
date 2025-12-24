<template>
    <header class="app-header">
        <div class="header-content">
            <div class="header-left">
                <div class="app-title">
                    <span class="title-text">{{ windowTitle }}</span>
                    <span class="title-subtitle">SPECTRAL VISUALIZER</span>
                </div>
            </div>

            <div class="header-right">
                <div class="window-info">
                    <span class="info-label">ID:</span>
                    <span class="info-value">{{ shortWindowId }}</span>
                </div>

                <button v-if="canClose" class="close-button" @click="handleClose" title="Close Window">
                    ✕
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGlobalState } from '../core/state'
import type { WindowId } from '../core/state/types'

interface Props {
    windowId: WindowId
}

const props = defineProps<Props>()

const { state } = useGlobalState()

// Window config
const windowConfig = computed(() => state.windows[props.windowId])
const windowTitle = computed(() => windowConfig.value?.title || 'Spectral Visualizer')
const shortWindowId = computed(() => props.windowId ? props.windowId.slice(-8) : 'N/A')

// Não pode fechar janela principal
const canClose = computed(() => {
    return windowConfig.value?.role !== 'main'
})

const handleClose = () => {
    if (!canClose.value) return

    const confirmed = confirm('Close this window?')
    if (confirmed) {
        window.close()
    }
}
</script>

<style scoped lang="scss">
@use '../style/variables' as *;

.app-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--header-height);
    background: rgba(0, 0, 0, 0.95);
    border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.3);
    backdrop-filter: blur(10px);
    z-index: var(--z-header);
    box-shadow: 0 2px 20px rgba(var(--theme-primary-rgb), 0.1);
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 var(--spacing-lg);
}

.header-left {
    display: flex;
    align-items: center;
}

.app-title {
    display: flex;
    flex-direction: column;
    font-family: var(--font-family-mono);

    .title-text {
        font-size: var(--font-size-md);
        font-weight: bold;
        color: var(--color-theme-primary);
        text-shadow: var(--text-shadow-md);
        letter-spacing: 1px;
    }

    .title-subtitle {
        font-size: var(--font-size-xs);
        color: var(--color-text-dim);
        letter-spacing: 2px;
        opacity: 0.7;
    }
}

.header-right {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
}

.window-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(var(--theme-primary-rgb), 0.05);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    border-radius: 4px;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);

    .info-label {
        color: var(--color-text-dim);
        opacity: 0.7;
    }

    .info-value {
        color: var(--color-theme-primary);
        font-weight: bold;
    }
}

.close-button {
    width: 40px;
    height: 40px;
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid rgba(255, 0, 0, 0.3);
    border-radius: 4px;
    color: #ff3333;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: all var(--transition-base);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: rgba(255, 0, 0, 0.2);
        border-color: #ff3333;
        box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
        transform: translateY(-2px);
    }

    &:active {
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .header-content {
        padding: 0 var(--spacing-md);
    }

    .app-title .title-text {
        font-size: var(--font-size-sm);
    }

    .app-title .title-subtitle {
        display: none;
    }

    .window-info {
        display: none;
    }

    .close-button {
        width: 36px;
        height: 36px;
    }
}
</style>
