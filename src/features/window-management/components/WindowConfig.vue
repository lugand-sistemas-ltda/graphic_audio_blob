<template>
    <div class="window-config-panel" :class="{ collapsed: isCollapsed }">
        <button class="toggle-button" @click="isCollapsed = !isCollapsed"
            :title="isCollapsed ? 'Show Config' : 'Hide Config'">
            {{ isCollapsed ? '⚙️' : '✕' }}
        </button>

        <div v-if="!isCollapsed" class="config-content">
            <!-- Window Title -->
            <div class="config-section">
                <h4 class="section-title">[ WINDOW CONFIG ]</h4>

                <div class="config-item">
                    <label class="config-label">Window Title:</label>
                    <input v-model="localTitle" @blur="updateTitle" @keyup.enter="updateTitle" class="title-input"
                        placeholder="Window name..." />
                </div>
            </div>

            <!-- Visual Effects -->
            <div class="config-section">
                <h4 class="section-title">[ VISUAL EFFECTS ]</h4>

                <div class="effect-toggle">
                    <label class="effect-label">
                        <input type="checkbox" :checked="hasEffect('gradient')" @change="toggleEffect('gradient')" />
                        <span>Gradient Sphere</span>
                    </label>
                </div>

                <div class="effect-toggle">
                    <label class="effect-label">
                        <input type="checkbox" :checked="hasEffect('particles')" @change="toggleEffect('particles')"
                            disabled />
                        <span>Particles (Coming Soon)</span>
                    </label>
                </div>

                <div class="effect-toggle">
                    <label class="effect-label">
                        <input type="checkbox" :checked="hasEffect('waveform')" @change="toggleEffect('waveform')"
                            disabled />
                        <span>Waveform (Coming Soon)</span>
                    </label>
                </div>
            </div>

            <!-- Components Management -->
            <div class="config-section">
                <h4 class="section-title">[ COMPONENTS ]</h4>

                <button class="add-component-btn" @click="showComponentPicker = !showComponentPicker">
                    {{ showComponentPicker ? '✕ Cancel' : '➕ Add Component' }}
                </button>

                <!-- Component Picker -->
                <div v-if="showComponentPicker" class="component-picker">
                    <div v-for="comp in availableComponents" :key="comp.id" class="picker-item"
                        @click="addComponentToWindow(comp.id)">
                        <span class="picker-icon">{{ getCategoryIcon(comp.category) }}</span>
                        <span class="picker-name">{{ comp.name }}</span>
                    </div>
                    <div v-if="availableComponents.length === 0" class="picker-empty">
                        All components already added
                    </div>
                </div>

                <!-- Active Components List -->
                <div class="components-list">
                    <div v-for="comp in activeComponents" :key="comp.id" class="component-item">
                        <span class="component-icon">{{ getCategoryIcon(comp.category) }}</span>
                        <span class="component-name">{{ comp.name }}</span>
                        <button class="remove-btn" @click="removeComponentFromWindow(comp.id)" title="Remove">
                            🗑️
                        </button>
                    </div>
                    <div v-if="activeComponents.length === 0" class="components-empty">
                        No components yet
                    </div>
                </div>
            </div>

            <!-- Window Info -->
            <div class="config-section">
                <h4 class="section-title">[ INFO ]</h4>

                <div class="info-item">
                    <span class="info-label">Window ID:</span>
                    <span class="info-value">{{ shortWindowId }}</span>
                </div>

                <div class="info-item">
                    <span class="info-label">Role:</span>
                    <span class="info-value">{{ windowConfig?.role || 'secondary' }}</span>
                </div>

                <div class="info-item">
                    <span class="info-label">Components:</span>
                    <span class="info-value">{{ componentCount }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGlobalState, updateWindow, toggleWindowEffect, getWindowComponents, moveComponent } from '../../../core/state'
import { useComponentManager } from '../composables/useComponentManager'
import type { WindowId, VisualEffect } from '../../../core/state/types'

interface Props {
    windowId: WindowId
}

const props = defineProps<Props>()

const { state } = useGlobalState()
const componentManager = useComponentManager()
const isCollapsed = ref(true)
const showComponentPicker = ref(false)

// Título local (editável)
const localTitle = ref('')

// Window config reativa
const windowConfig = computed(() => state.windows[props.windowId])

// Atualiza título local quando window config mudar
watch(() => windowConfig.value?.title, (newTitle) => {
    if (newTitle) {
        localTitle.value = newTitle
    }
}, { immediate: true })

// ID curto para display
const shortWindowId = computed(() => {
    return props.windowId.slice(-8)
})

// Contagem de componentes
const componentCount = computed(() => {
    return getWindowComponents(props.windowId).length
})

// Componentes ativos nesta janela
const activeComponents = computed(() => {
    const windowComps = getWindowComponents(props.windowId)
    return componentManager.getAllComponents().filter(comp =>
        windowComps.some(wc => wc.id === comp.id)
    )
})

// Componentes disponíveis para adicionar
const availableComponents = computed(() => {
    const windowComps = getWindowComponents(props.windowId)
    return componentManager.getAllComponents().filter(comp =>
        !windowComps.some(wc => wc.id === comp.id)
    )
})

/**
 * Atualiza título da janela
 */
const updateTitle = () => {
    if (localTitle.value.trim()) {
        updateWindow(props.windowId, { title: localTitle.value.trim() })
    }
}

/**
 * Verifica se efeito está ativo
 */
const hasEffect = (effect: VisualEffect): boolean => {
    return windowConfig.value?.effects.includes(effect) || false
}

/**
 * Toggle efeito visual
 */
const toggleEffect = (effect: VisualEffect) => {
    toggleWindowEffect(props.windowId, effect)
}

/**
 * Adiciona componente à janela
 */
const addComponentToWindow = (componentId: string) => {
    moveComponent(componentId, props.windowId, { x: 100, y: 100 })
    componentManager.setVisibility(componentId, true)
    showComponentPicker.value = false
}

/**
 * Remove componente da janela
 */
const removeComponentFromWindow = (componentId: string) => {
    moveComponent(componentId, null, { x: 0, y: 0 })
    componentManager.setVisibility(componentId, false)
}

/**
 * Ícone por categoria
 */
const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
        'visual': '🎨',
        'audio': '🎵',
        'debug': '🐛',
        'system': '⚙️'
    }
    return icons[category] || '📦'
}
</script>

<style scoped lang="scss">
@use '../../../style/base/variables' as *;
@use '../../../style/mixins' as *;

.window-config-panel {
    position: fixed;
    top: var(--spacing-md);
    right: var(--spacing-md);
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.5);
    border-radius: 8px;
    padding: var(--spacing-sm);
    z-index: 10000;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    transition: all var(--transition-base);
    max-width: 300px;

    &.collapsed {
        width: 50px;
        height: 50px;
        padding: 0;
        border-radius: 50%;

        .toggle-button {
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }
    }

    .toggle-button {
        position: absolute;
        top: var(--spacing-xs);
        right: var(--spacing-xs);
        width: 32px;
        height: 32px;
        background: rgba(var(--theme-primary-rgb), 0.2);
        border: 1px solid rgba(var(--theme-primary-rgb), 0.5);
        border-radius: 50%;
        color: var(--color-text);
        font-size: 1rem;
        cursor: pointer;
        transition: all var(--transition-base);
        @include flex-center;

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.3);
            box-shadow: var(--glow-sm);
            transform: scale(1.1);
        }
    }

    .config-content {
        padding-top: var(--spacing-lg);
        @include flex-column;
        gap: var(--spacing-md);
    }
}

.config-section {
    @include flex-column;
    gap: var(--spacing-sm);

    .section-title {
        margin: 0;
        font-size: var(--font-size-xs);
        color: var(--color-accent);
        font-weight: bold;
        letter-spacing: 1px;
        text-shadow: var(--text-shadow-sm);
        padding-bottom: var(--spacing-xs);
        border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.3);
    }
}

// Add Component Button
.add-component-btn {
    width: 100%;
    padding: var(--spacing-sm);
    background: rgba(var(--theme-primary-rgb), 0.1);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
    border-radius: 4px;
    color: var(--color-text);
    font-family: 'Courier New', monospace;
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: all var(--transition-base);

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.2);
        border-color: rgba(var(--theme-primary-rgb), 0.5);
        box-shadow: var(--glow-sm);
    }
}

// Component Picker
.component-picker {
    @include flex-column;
    gap: var(--spacing-xs);
    max-height: 200px;
    overflow-y: auto;
    padding: var(--spacing-xs);
    background: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    margin-top: var(--spacing-xs);

    .picker-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: rgba(var(--theme-primary-rgb), 0.05);
        border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
        border-radius: 4px;
        cursor: pointer;
        transition: all var(--transition-base);

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.15);
            border-color: rgba(var(--theme-primary-rgb), 0.4);
            transform: translateX(4px);
        }

        .picker-icon {
            font-size: 1.2rem;
        }

        .picker-name {
            font-size: var(--font-size-xs);
            color: var(--color-text);
        }
    }

    .picker-empty {
        text-align: center;
        padding: var(--spacing-md);
        font-size: var(--font-size-xs);
        color: var(--matrix-green-dim);
        opacity: 0.5;
    }
}

// Components List
.components-list {
    @include flex-column;
    gap: var(--spacing-xs);
    max-height: 200px;
    overflow-y: auto;

    .component-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: rgba(var(--theme-primary-rgb), 0.1);
        border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
        border-radius: 4px;

        .component-icon {
            font-size: 1rem;
        }

        .component-name {
            flex: 1;
            font-size: var(--font-size-xs);
            color: var(--color-text);
        }

        .remove-btn {
            padding: 0.25rem 0.5rem;
            background: transparent;
            border: 1px solid rgba(255, 50, 50, 0.3);
            border-radius: 4px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all var(--transition-base);

            &:hover {
                background: rgba(255, 50, 50, 0.2);
                border-color: rgba(255, 50, 50, 0.6);
                box-shadow: 0 0 10px rgba(255, 50, 50, 0.3);
            }
        }
    }

    .components-empty {
        text-align: center;
        padding: var(--spacing-md);
        font-size: var(--font-size-xs);
        color: var(--matrix-green-dim);
        opacity: 0.5;
    }
}

.config-item {
    @include flex-column;
    gap: var(--spacing-xs);

    .config-label {
        font-size: var(--font-size-xs);
        color: var(--color-text-dim);
        font-weight: bold;
    }

    .title-input {
        padding: var(--spacing-xs) var(--spacing-sm);
        background: rgba(var(--theme-primary-rgb), 0.1);
        border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
        border-radius: 4px;
        color: var(--color-text);
        font-size: var(--font-size-sm);
        font-family: 'Courier New', monospace;
        outline: none;
        transition: all var(--transition-base);

        &:focus {
            background: rgba(var(--theme-primary-rgb), 0.2);
            border-color: rgba(var(--theme-primary-rgb), 0.5);
            box-shadow: var(--glow-sm);
        }

        &::placeholder {
            color: var(--color-text-dim);
            opacity: 0.5;
        }
    }
}

.effect-toggle {
    .effect-label {
        @include flex-center;
        gap: var(--spacing-sm);
        padding: var(--spacing-xs);
        cursor: pointer;
        transition: all var(--transition-base);
        border-radius: 4px;

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.1);
        }

        input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--color-accent);

            &:disabled {
                cursor: not-allowed;
                opacity: 0.5;
            }
        }

        span {
            font-size: var(--font-size-xs);
            color: var(--color-text);
            flex: 1;
            text-align: left;
        }

        &:has(input:disabled) span {
            color: var(--color-text-dim);
            font-style: italic;
        }
    }
}

.info-item {
    @include flex-between;
    padding: var(--spacing-xs) 0;
    font-size: var(--font-size-xs);

    .info-label {
        color: var(--color-text-dim);
    }

    .info-value {
        color: var(--color-accent);
        font-weight: bold;
        font-family: 'Courier New', monospace;
    }
}
</style>
