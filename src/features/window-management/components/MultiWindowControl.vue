<template>
    <div class="multi-window-control" v-draggable="{ id: 'multi-window-control', handle: '.mw-header' }">
        <div class="mw-header">
            <span class="mw-title">[ MULTI-WINDOW ]</span>
            <button class="collapse-toggle" @click="toggleExpanded" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
                {{ isExpanded ? '−' : '+' }}
            </button>
        </div>

        <div v-if="isExpanded" class="mw-content">
            <!-- Window Status -->
            <div class="window-status">
                <span class="status-label">Connected Windows:</span>
                <span class="status-value" :class="{ active: windowCount > 1 }">
                    {{ windowCount }} {{ windowCount === 1 ? 'window' : 'windows' }}
                </span>
            </div>

            <!-- New Window Button -->
            <button class="new-window-btn" @click="openNewWindow" :disabled="!canOpenWindow">
                <span class="btn-icon">➕</span>
                <span class="btn-text">Open New Window</span>
                <span class="btn-hint">(Generic)</span>
            </button>

            <!-- Connected Windows List -->
            <div v-if="connectedWindows.length > 0" class="connected-windows-list">
                <div class="list-header">Active Windows:</div>
                <div class="windows-scroll-container">
                    <div v-for="window in connectedWindows" :key="window.id" class="window-item">
                        <span class="window-role">{{ getWindowTitle(window.id) }}</span>
                        <span class="window-status" :class="{ alive: window.isAlive }">
                            {{ window.isAlive ? '🟢' : '🔴' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useCollapsible, useGlobalAlerts } from '../../../shared'
import { useVisibilityReload } from '../composables/useVisibilityReload'
import { useWindowManager } from '../../../core/sync'
import type { WindowId } from '../../../core/state/types'

const { isExpanded, toggle: toggleExpanded, reloadState } = useCollapsible({
    id: 'multi-window-control',
    initialState: true
})

// Detecta quando o componente fica visível e recarrega o estado
useVisibilityReload({
    selector: '.multi-window-control',
    onVisible: reloadState
})

// ========================================
// WINDOW MANAGER (singleton global)
// ========================================
const windowManager = useWindowManager()
const currentWindowId = inject<WindowId>('windowId', 'main')
const alerts = useGlobalAlerts(currentWindowId)

const windowCount = windowManager.windowCount
const connectedWindows = computed(() => windowManager.getAliveWindows())
const canOpenWindow = computed(() => true) // Browser will block if necessary

// ========================================
// ACTIONS
// ========================================
const openNewWindow = () => {
    const newWindow = windowManager.openGenericWindow()
    if (!newWindow) {
        alerts.showAlert({
            type: 'warning',
            title: 'Popup Blocked',
            message: 'Please allow popups for this site to open new windows.',
            icon: '🚫'
        })
    }
}

// ========================================
// UTILS
// ========================================
const getWindowTitle = (windowId: string): string => {
    // Busca diretamente no connectedWindows que agora tem o título sincronizado
    const window = connectedWindows.value.find(w => w.id === windowId)

    if (window) {
        return window.title || formatRole(window.role)
    }

    return 'Unknown Window'
}

const formatRole = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')
}
</script>

<style scoped lang="scss">
@use '../../../style/base/variables' as *;
@use '../../../style/mixins' as *;

.multi-window-control {
    @include draggable-container;
    z-index: var(--z-header);

    .mw-header {
        @include draggable-header;

        .mw-title {
            @include draggable-title;
        }

        .collapse-toggle {
            @include draggable-collapse-toggle;
        }
    }

    .mw-content {
        @include draggable-content;
    }
}

// Window Status Section
.window-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm);
    background: rgba(var(--theme-primary-rgb), 0.1);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    border-radius: 4px;
    margin-bottom: var(--spacing-md);

    .status-label {
        font-size: var(--font-size-xs);
        color: var(--color-text-dim);
    }

    .status-value {
        font-size: var(--font-size-xs);
        color: var(--color-text-dim);
        font-weight: 600;

        &.active {
            color: var(--color-theme-primary);
            text-shadow: 0 0 8px rgba(var(--theme-primary-rgb), 0.6);
        }
    }
}

// New Window Button
.new-window-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: rgba(var(--theme-primary-rgb), 0.2);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.4);
    border-radius: 4px;
    color: var(--color-text);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: var(--font-size-xs);
    font-weight: 600;
    margin-bottom: var(--spacing-md);

    &:hover:not(:disabled) {
        background: rgba(var(--theme-primary-rgb), 0.3);
        box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.3);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-icon {
        font-size: 1.2em;
    }

    .btn-hint {
        font-size: 0.7em;
        opacity: 0.7;
    }
}

// Connected Windows List
.connected-windows-list {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    border-radius: 4px;
    padding: var(--spacing-sm);

    .list-header {
        font-size: var(--font-size-xs);
        color: var(--color-text-dim);
        margin-bottom: var(--spacing-sm);
        padding-bottom: var(--spacing-xs);
        border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    }

    // Scroll container - limita altura para 4 itens
    .windows-scroll-container {
        max-height: 240px; // Aproximadamente 4 itens (35px cada)
        overflow-y: auto;
        overflow-x: hidden;
        @include custom-scrollbar(0.3, 0.15);

        // Espaçamento suave ao fazer scroll
        scroll-behavior: smooth;
    }

    .window-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-xs) var(--spacing-sm);
        margin-bottom: var(--spacing-xs);
        background: rgba(var(--theme-primary-rgb), 0.1);
        border-radius: 4px;

        &:last-child {
            margin-bottom: 0;
        }

        .window-role {
            font-size: var(--font-size-xs);
            color: var(--color-text-dim);
        }

        .window-status {
            font-size: 0.8em;

            &.alive {
                filter: brightness(1.2);
            }
        }
    }
}
</style>
