<template>
    <div class="global-controls">
        <h4 class="section-title">[ GLOBAL CONTROLS ]</h4>

        <div class="control-item">
            <span class="control-label">Show/Hide All</span>
            <button class="toggle-button" :class="{ active: !allHidden }" @click="handleToggleAllVisibility">
                <span class="toggle-label">{{ allHidden ? 'HIDDEN' : 'VISIBLE' }}</span>
                <span class="toggle-switch">
                    <span class="toggle-indicator" :class="{ active: !allHidden }"></span>
                </span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { getWindowComponents, updateComponentInWindow } from '../../../core/state/useGlobalState'

const windowId = inject<string>('windowId', '')

// Obtém componentes ativos desta janela do GlobalState (fonte única da verdade)
const activeComponents = computed(() => getWindowComponents(windowId))

// Verifica se TODOS os componentes estão ocultos
const allHidden = computed(() => {
    if (activeComponents.value.length === 0) return false
    return activeComponents.value.every(comp => !comp.visible)
})

const handleToggleAllVisibility = () => {
    const shouldBeVisible = allHidden.value // Se estão escondidos, vamos mostrar

    console.log('[GlobalControls] 🔄 Toggle All Visibility:', {
        windowId,
        currentAllHidden: allHidden.value,
        newVisible: shouldBeVisible,
        componentsCount: activeComponents.value.length,
        components: activeComponents.value.map(c => ({ id: c.id, visible: c.visible }))
    })

    // Atualiza visibilidade de TODOS os componentes desta janela no GlobalState
    activeComponents.value.forEach(comp => {
        updateComponentInWindow(windowId, comp.id, { visible: shouldBeVisible })
    })
}
</script>

<style scoped lang="scss">
@use '../../../style/base/variables' as *;

.global-controls {
    padding: var(--spacing-md);
    border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.2);
}

.section-title {
    font-size: var(--font-size-xs);
    color: var(--color-text);
    margin-bottom: var(--spacing-md);
    text-shadow: var(--text-shadow-md);
    font-weight: 600;
    letter-spacing: 0.05em;
}

.control-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);

    &:last-child {
        margin-bottom: 0;
    }
}

.control-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-dim);
    flex: 1;
}

.toggle-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(var(--theme-primary-rgb), 0.1);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
    border-radius: 4px;
    color: var(--color-text-dim);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: var(--font-size-xs);

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.2);
        border-color: rgba(var(--theme-primary-rgb), 0.5);
    }

    &.active {
        background: rgba(var(--theme-primary-rgb), 0.3);
        border-color: rgba(var(--theme-primary-rgb), 0.6);
        color: var(--color-text);

        .toggle-indicator {
            background: var(--color-theme-primary);
            box-shadow: 0 0 8px rgba(var(--theme-primary-rgb), 0.8);
        }
    }
}

.toggle-label {
    font-weight: 600;
    min-width: 80px;
    text-align: left;
}

.toggle-switch {
    width: 36px;
    height: 18px;
    background: rgba(var(--theme-primary-rgb), 0.2);
    border-radius: 12px;
    position: relative;
    transition: all 0.3s ease;
}

.toggle-indicator {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    background: rgba(var(--theme-primary-rgb), 0.5);
    border-radius: 50%;
    transition: all 0.3s ease;

    &.active {
        transform: translateX(18px);
    }
}
</style>
