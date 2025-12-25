<template>
    <div class="window-control">
        <h4 class="section-title">[ MULTI-WINDOW ]</h4>

        <div class="window-status">
            <span class="status-label">Connected Windows:</span>
            <span class="status-value" :class="{ active: windowCount > 1 }">
                {{ windowCount }} {{ windowCount === 1 ? 'window' : 'windows' }}
            </span>
        </div>

        <button class="new-window-btn" @click="openNewWindow" :disabled="!canOpenWindow">
            <span class="btn-icon">➕</span>
            <span class="btn-text">Open New Window</span>
            <span class="btn-hint">(Generic)</span>
        </button>

        <div v-if="connectedWindows.length > 0" class="connected-windows-list">
            <div class="list-header">Active Windows:</div>
            <div v-for="window in connectedWindows" :key="window.id" class="window-item">
                <span class="window-role">{{ formatWindowTitle(window) }}</span>
                <span class="window-status" :class="{ alive: window.isAlive }">
                    {{ window.isAlive ? '🟢' : '🔴' }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowManager } from '../../core/sync'

const windowManager = useWindowManager()
const windowCount = windowManager.windowCount
const connectedWindows = computed(() => windowManager.getAliveWindows())
const canOpenWindow = computed(() => true) // Browser will block if necessary

const openNewWindow = () => {
    const newWindow = windowManager.openGenericWindow()
    if (!newWindow) {
        alert('Popup blocked! Please allow popups for this site.')
    }
}

const formatWindowTitle = (window: any): string => {
    return window.title || formatRole(window.role)
}

const formatRole = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')
}
</script>

<style scoped lang="scss">
@use '../../style/base/variables' as *;

.window-control {
    padding: var(--spacing-md);
}

.section-title {
    font-size: var(--font-size-xs);
    color: var(--color-text);
    margin-bottom: var(--spacing-md);
    text-shadow: var(--text-shadow-md);
    font-weight: 600;
    letter-spacing: 0.05em;
}

.window-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm);
    background: rgba(var(--theme-primary-rgb), 0.1);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    border-radius: 4px;
    margin-bottom: var(--spacing-md);
}

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
}

.btn-hint {
    font-size: 0.7em;
    opacity: 0.7;
}

.connected-windows-list {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    border-radius: 4px;
    padding: var(--spacing-sm);
}

.list-header {
    font-size: var(--font-size-xs);
    color: var(--color-text-dim);
    margin-bottom: var(--spacing-sm);
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.2);
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
</style>
