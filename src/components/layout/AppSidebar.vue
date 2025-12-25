<template>
    <aside class="app-sidebar" :class="{ collapsed }" aria-label="Control Panel Sidebar">
        <!-- Collapse Toggle Button (sempre visível) -->
        <button class="collapse-btn" @click="toggleCollapse" :title="collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'">
            <span class="collapse-icon">{{ collapsed ? '▶' : '◀' }}</span>
        </button>

        <transition name="sidebar-content">
            <div v-show="!collapsed" class="sidebar-content">
                <!-- Sidebar Header -->
                <div class="sidebar-header">
                    <span class="header-icon">⚙️</span>
                    <span class="header-title">CONTROL PANEL</span>
                </div>

                <!-- Global Controls -->
                <GlobalControls />

                <!-- Component Manager -->
                <ComponentManager :window-id="windowId" />

                <!-- Effects Control -->
                <EffectsControl :window-id="windowId" />

                <!-- Window Control (Multi-Window) -->
                <WindowControl />
            </div>
        </transition>
    </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import GlobalControls from '../sidebar/GlobalControls.vue'
import ComponentManager from '../sidebar/ComponentManager.vue'
import EffectsControl from '../sidebar/EffectsControl.vue'
import WindowControl from '../sidebar/WindowControl.vue'
import type { WindowId } from '../../core/state/types'

interface Props {
    windowId: WindowId
}

const props = defineProps<Props>()

const collapsed = ref(false)

const toggleCollapse = () => {
    collapsed.value = !collapsed.value
    // Adiciona classe no body para ajustar layout global
    document.body.classList.toggle('sidebar-collapsed', collapsed.value)
}

// Cleanup ao desmontar
import { onUnmounted } from 'vue'
onUnmounted(() => {
    document.body.classList.remove('sidebar-collapsed')
})
</script>

<style scoped lang="scss">
@use '../style/variables' as *;

.app-sidebar {
    position: fixed;
    top: var(--header-height);
    left: 0;
    bottom: 0;
    width: var(--sidebar-width);
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    border-right: 1px solid rgba(var(--theme-primary-rgb), 0.3);
    transition: width var(--transition-base);
    z-index: var(--z-sidebar);
    overflow: hidden;

    &.collapsed {
        width: var(--sidebar-collapsed-width);
    }
}

.collapse-btn {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-sm);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--theme-primary-rgb), 0.2);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.4);
    border-radius: 4px;
    cursor: pointer;
    transition: all var(--transition-base);
    z-index: 10;
    color: var(--color-theme-primary);

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.3);
        box-shadow: var(--glow-sm);
    }

    .collapse-icon {
        font-size: 0.8em;
    }
}

.sidebar-content {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(var(--theme-primary-rgb), 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(var(--theme-primary-rgb), 0.3);
        border-radius: 4px;

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.5);
        }
    }
}

.sidebar-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg) var(--spacing-md);
    border-bottom: 2px solid rgba(var(--theme-primary-rgb), 0.4);
    background: rgba(var(--theme-primary-rgb), 0.1);
}

.header-icon {
    font-size: 1.5em;
}

.header-title {
    font-size: var(--font-size-md);
    font-family: var(--font-family-mono);
    color: var(--color-text);
    font-weight: 700;
    text-shadow: var(--text-shadow-lg);
    letter-spacing: 0.1em;
}

// Transições
.sidebar-content-enter-active,
.sidebar-content-leave-active {
    transition: opacity var(--transition-base);
}

.sidebar-content-enter-from,
.sidebar-content-leave-to {
    opacity: 0;
}
</style>
