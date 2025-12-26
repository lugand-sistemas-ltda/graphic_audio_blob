<template>
    <div class="window-titlebar">
        <span class="window-title">{{ windowTitle }}</span>
        <div class="titlebar-buttons">
            <button v-if="canClose" class="titlebar-button close" @click="handleClose" title="Close Window">
                ❌
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGlobalState } from '../../../core/state'
import type { WindowId } from '../../../core/state/types'

interface Props {
    windowId: WindowId
}

const props = defineProps<Props>()

const { state } = useGlobalState()

// Window config
const windowConfig = computed(() => state.windows[props.windowId])
const windowTitle = computed(() => windowConfig.value?.title || 'Window')

// Controles disponíveis (janela main não pode fechar)
const isMainWindow = computed(() => windowConfig.value?.role === 'main')
const canClose = computed(() => !isMainWindow.value && window.opener !== null)

// Handlers
const handleClose = () => {
    if (window.opener && !isMainWindow.value) {
        // Confirmar fechamento
        if (confirm(`Close window "${windowTitle.value}"?`)) {
            window.close()
        }
    }
}
</script>

<style scoped lang="scss">
@use '../../../style/base/variables' as *;

.window-titlebar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    z-index: 10001;
    background: linear-gradient(135deg,
            rgba(var(--theme-primary-rgb), 0.95),
            rgba(var(--theme-secondary-rgb), 0.95));
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    font-family: 'Courier New', monospace;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);

    .window-title {
        font-size: 0.9rem;
        color: var(--matrix-green-bright);
        text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
        letter-spacing: 1px;
        font-weight: bold;
        user-select: none;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .titlebar-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .titlebar-button {
        width: 32px;
        height: 32px;
        border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
        background: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.2);
            border-color: rgba(var(--theme-primary-rgb), 0.6);
            transform: scale(1.05);
            box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.3);
        }

        &:active {
            transform: scale(0.95);
        }

        &.close:hover {
            background: rgba(255, 50, 50, 0.3);
            border-color: rgba(255, 50, 50, 0.6);
            box-shadow: 0 0 10px rgba(255, 50, 50, 0.5);
        }

        &.maximize:hover {
            background: rgba(50, 200, 255, 0.3);
            border-color: rgba(50, 200, 255, 0.6);
        }

        &.minimize:hover {
            background: rgba(255, 200, 50, 0.3);
            border-color: rgba(255, 200, 50, 0.6);
        }
    }
}
</style>
