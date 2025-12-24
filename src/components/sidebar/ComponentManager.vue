<template>
    <div class="component-manager">
        <h4 class="section-title">[ COMPONENTS ]</h4>

        <!-- Add Component Button -->
        <button class="add-component-btn" @click="showPicker = !showPicker">
            <span class="btn-icon">{{ showPicker ? '✕' : '➕' }}</span>
            <span class="btn-text">{{ showPicker ? 'Cancel' : 'Add Component' }}</span>
        </button>

        <!-- Component Picker -->
        <Transition name="slide">
            <div v-if="showPicker" class="component-picker">
                <div v-for="category in categories" :key="category.name" class="picker-category">
                    <div class="category-header">{{ category.name }}</div>
                    <div v-for="comp in category.components" :key="comp.id" class="picker-item"
                        @click="addComponent(comp.id)">
                        <span class="picker-icon">{{ getCategoryIcon(comp.category) }}</span>
                        <span class="picker-name">{{ comp.name }}</span>
                    </div>
                </div>
                <div v-if="availableComponents.length === 0" class="picker-empty">
                    <span class="empty-icon">✓</span>
                    <span class="empty-text">All components added</span>
                </div>
            </div>
        </Transition>

        <!-- Active Components -->
        <div class="active-components">
            <div v-for="comp in activeComponents" :key="comp.id" class="component-card"
                :class="{ visible: comp.visible }">
                <div class="card-header">
                    <span class="card-icon">{{ getCategoryIcon(comp.category) }}</span>
                    <span class="card-name">{{ comp.name }}</span>
                </div>
                <div class="card-actions">
                    <button class="action-btn visibility-btn" @click="toggleVisibility(comp.id)"
                        :title="comp.visible ? 'Hide' : 'Show'">
                        {{ comp.visible ? '👁️' : '👁️‍🗨️' }}
                    </button>
                    <button class="action-btn remove-btn" @click="removeComponent(comp.id)" title="Remove">
                        🗑️
                    </button>
                </div>
            </div>
            <div v-if="activeComponents.length === 0" class="components-empty">
                <span class="empty-icon">📦</span>
                <span class="empty-text">No active components</span>
                <span class="empty-hint">Click "Add Component" to start</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGlobalState, getWindowComponents, moveComponent } from '../../core/state'
import { useComponentManager } from '../../composables/useComponentManager'
import type { WindowId } from '../../core/state/types'

interface Props {
    windowId: WindowId
}

const props = defineProps<Props>()

const { state } = useGlobalState()
const componentManager = useComponentManager()
const showPicker = ref(false)

// Window components
const windowComponents = computed(() => getWindowComponents(props.windowId))

const activeComponents = computed(() => {
    return componentManager.getAllComponents().filter(comp =>
        windowComponents.value.some(wc => wc.id === comp.id)
    )
})

const availableComponents = computed(() => {
    return componentManager.getAllComponents().filter(comp =>
        !windowComponents.value.some(wc => wc.id === comp.id)
    )
})

// Group by category
const categories = computed(() => {
    const grouped = new Map<string, any[]>()

    availableComponents.value.forEach(comp => {
        const cat = comp.category || 'other'
        if (!grouped.has(cat)) {
            grouped.set(cat, [])
        }
        grouped.get(cat)!.push(comp)
    })

    return Array.from(grouped.entries()).map(([name, components]) => ({
        name: name.toUpperCase(),
        components
    }))
})

// Category icons
const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
        visual: '🎨',
        audio: '🎵',
        debug: '🔧',
        system: '⚙️',
        control: '🎮'
    }
    return icons[category] || '📦'
}

// Actions
const addComponent = (componentId: string) => {
    moveComponent(componentId, props.windowId, { x: 100, y: 100 })
    componentManager.setVisibility(componentId, true)
    showPicker.value = false
}

const removeComponent = (componentId: string) => {
    moveComponent(componentId, null, { x: 0, y: 0 })
    componentManager.setVisibility(componentId, false)
}

const toggleVisibility = (componentId: string) => {
    componentManager.toggleVisibility(componentId)
}
</script>

<style scoped lang="scss">
@use '../../style/variables' as *;

.component-manager {
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

.add-component-btn {
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

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.3);
        box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.3);
    }
}

.component-picker {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
    border-radius: 4px;
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    max-height: 300px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(var(--theme-primary-rgb), 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(var(--theme-primary-rgb), 0.3);
        border-radius: 3px;

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.5);
        }
    }
}

.picker-category {
    margin-bottom: var(--spacing-md);

    &:last-child {
        margin-bottom: 0;
    }
}

.category-header {
    font-size: var(--font-size-xs);
    color: rgba(var(--theme-primary-rgb), 0.8);
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.2);
}

.picker-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 4px;

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.2);
    }
}

.picker-icon {
    font-size: 1.2em;
}

.picker-name {
    flex: 1;
    font-size: var(--font-size-xs);
    color: var(--color-text-dim);
}

.picker-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    color: var(--color-text-dim);
    font-size: var(--font-size-xs);
}

.active-components {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.component-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm);
    background: rgba(var(--theme-primary-rgb), 0.1);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    border-radius: 4px;
    transition: all 0.3s ease;

    &.visible {
        background: rgba(var(--theme-primary-rgb), 0.2);
        border-color: rgba(var(--theme-primary-rgb), 0.4);
    }
}

.card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex: 1;
}

.card-icon {
    font-size: 1.2em;
}

.card-name {
    font-size: var(--font-size-xs);
    color: var(--color-text-dim);
}

.card-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.action-btn {
    padding: var(--spacing-xs);
    background: transparent;
    border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1em;

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.2);
        border-color: rgba(var(--theme-primary-rgb), 0.5);
    }
}

.components-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-lg);
    color: var(--color-text-dim);
    font-size: var(--font-size-xs);
    text-align: center;
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
