<template>
    <div class="main-control" v-draggable="{ id: 'main-control', handle: '.main-control-header' }">
        <!-- Header -->
        <div class="main-control-header">
            <span class="main-control-title">[ MAIN CONTROL ]</span>
            <button class="collapse-toggle" @click="toggleExpanded" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
                {{ isExpanded ? '−' : '+' }}
            </button>
        </div>

        <div v-if="isExpanded" class="main-control-content">
            <!-- Global Controls -->
            <div class="control-section">
                <h4 class="section-title">[ GLOBAL CONTROLS ]</h4>
                <div class="control-item">
                    <label class="control-label">Show/Hide All Components</label>
                    <button class="toggle-button" :class="{ active: !allHidden }" @click="handleToggleAllVisibility">
                        <span class="toggle-label">{{ allHidden ? 'ALL HIDDEN' : 'ALL VISIBLE' }}</span>
                        <span class="toggle-switch">
                            <span class="toggle-indicator" :class="{ active: !allHidden }"></span>
                        </span>
                    </button>
                </div>
            </div>

            <!-- Visual Controls Category -->
            <div class="control-section">
                <h4 class="section-title">[ VISUAL CONTROL & MONITORING ]</h4>
                <div v-for="component in visualComponents" :key="component.id" class="control-item">
                    <label class="control-label">{{ component.name }}</label>
                    <button class="toggle-button" :class="{ active: component.visible }"
                        @click="toggleVisibility(component.id)">
                        <span class="toggle-label">{{ component.visible ? 'VISIBLE' : 'HIDDEN' }}</span>
                        <span class="toggle-switch">
                            <span class="toggle-indicator" :class="{ active: component.visible }"></span>
                        </span>
                    </button>
                </div>
            </div>

            <!-- Audio Controls Category -->
            <div class="control-section">
                <h4 class="section-title">[ AUDIO CONTROLS ]</h4>
                <div v-for="component in audioComponents" :key="component.id" class="control-item">
                    <label class="control-label">{{ component.name }}</label>
                    <button class="toggle-button" :class="{ active: component.visible }"
                        @click="toggleVisibility(component.id)">
                        <span class="toggle-label">{{ component.visible ? 'VISIBLE' : 'HIDDEN' }}</span>
                        <span class="toggle-switch">
                            <span class="toggle-indicator" :class="{ active: component.visible }"></span>
                        </span>
                    </button>
                </div>
            </div>

            <!-- Debug Category -->
            <div class="control-section">
                <h4 class="section-title">[ DEBUG ]</h4>
                <div v-for="component in debugComponents" :key="component.id" class="control-item">
                    <label class="control-label">{{ component.name }}</label>
                    <button class="toggle-button" :class="{ active: component.visible }"
                        @click="toggleVisibility(component.id)">
                        <span class="toggle-label">{{ component.visible ? 'VISIBLE' : 'HIDDEN' }}</span>
                        <span class="toggle-switch">
                            <span class="toggle-indicator" :class="{ active: component.visible }"></span>
                        </span>
                    </button>
                </div>
            </div>

            <!-- System Category -->
            <div class="control-section">
                <h4 class="section-title">[ SYSTEM ]</h4>
                <div v-for="component in systemComponents" :key="component.id" class="control-item">
                    <label class="control-label">{{ component.name }}</label>
                    <button class="toggle-button" :class="{ active: component.visible }"
                        @click="toggleVisibility(component.id)">
                        <span class="toggle-label">{{ component.visible ? 'VISIBLE' : 'HIDDEN' }}</span>
                        <span class="toggle-switch">
                            <span class="toggle-indicator" :class="{ active: component.visible }"></span>
                        </span>
                    </button>
                </div>
            </div>

            <!-- Multi-Window Controls -->
            <div class="control-section multi-window-section">
                <h4 class="section-title">[ MULTI-WINDOW SETUP ]</h4>

                <div class="window-status">
                    <span class="status-label">Connected Windows:</span>
                    <span class="status-value" :class="{ active: windowCount > 1 }">
                        {{ windowCount }} {{ windowCount === 1 ? 'window' : 'windows' }}
                    </span>
                </div>

                <div class="window-buttons">
                    <button class="window-button primary" @click="openNewWindow" :disabled="!canOpenWindow">
                        <span class="button-icon">➕</span>
                        <span class="button-text">New Window</span>
                        <span class="button-hint">(Generic)</span>
                    </button>
                </div>

                <div v-if="connectedWindows.length > 0" class="connected-windows-list">
                    <div class="list-header">Active Windows:</div>
                    <div v-for="window in connectedWindows" :key="window.id" class="window-item">
                        <span class="window-role">{{ formatWindowTitle(window) }}</span>
                        <span class="window-status" :class="{ alive: window.isAlive }">
                            {{ window.isAlive ? '🟢 ACTIVE' : '🔴 TIMEOUT' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useCollapsible } from '../composables/useCollapsible'
import { useComponentManager } from '../composables/useComponentManager'
import { useWindowManager } from '../core/sync'
import { getWindowComponents } from '../core/state/useGlobalState'

const { isExpanded, toggle: toggleExpanded } = useCollapsible({ id: 'main-control', initialState: true })

const componentManager = useComponentManager()
const {
    allHidden,
    getComponentsByCategory
} = componentManager

const windowId = inject<string>('windowId', '')

// Obtém apenas os componentes ativos (que estão na janela atual)
const activeComponents = computed(() => {
    const windowComponents = getWindowComponents(windowId)
    return windowComponents.map(wc => wc.id)
})

// Wrapper para toggleVisibility (NÃO passa windowId - apenas alterna visibilidade)
const toggleVisibility = (componentId: string) => {
    componentManager.toggleVisibility(componentId)
}

// Wrapper para toggleAllVisibility (apenas componentes ativos)
const handleToggleAllVisibility = () => {
    componentManager.toggleAllVisibility(activeComponents.value)
}

// Multi-Window Manager
const windowManager = useWindowManager()
const windowCount = windowManager.windowCount
const connectedWindows = computed(() => windowManager.getAliveWindows())
const canOpenWindow = computed(() => true) // Sempre pode abrir, browser bloqueia se necessário

// Componentes por categoria
const visualComponents = computed(() => getComponentsByCategory('visual'))
const audioComponents = computed(() => getComponentsByCategory('audio'))
const debugComponents = computed(() => getComponentsByCategory('debug'))
const systemComponents = computed(() => getComponentsByCategory('system'))

// Multi-Window Functions
const openNewWindow = () => {
    const newWindow = windowManager.openGenericWindow()
    if (!newWindow) {
        alert('Popup blocked! Please allow popups for this site.')
    }
}

const formatWindowTitle = (window: any): string => {
    // Pega o título da janela do global state
    return window.title || formatRole(window.role)
}

const formatRole = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')
}
</script>

<style scoped lang="scss">
@use '../style/variables' as *;
@use '../style/mixins' as *;

.main-control {
    @include draggable-container;
    z-index: var(--z-header);

    .main-control-header {
        @include draggable-header;

        .main-control-title {
            @include draggable-title;
        }

        .collapse-toggle {
            @include draggable-collapse-toggle;
        }
    }

    .main-control-content {
        @include draggable-content;
        gap: var(--spacing-md);
    }
}

.control-section {
    @include flex-column;
    gap: var(--spacing-sm);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.1);

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .section-title {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--font-size-xs);
        color: var(--color-accent);
        font-weight: bold;
        letter-spacing: 1px;
        text-shadow: var(--text-shadow-sm);
    }
}

.control-item {
    @include flex-between;
    padding: var(--spacing-sm) 0;

    .control-label {
        font-size: var(--font-size-xs);
        color: var(--color-text);
        text-shadow: var(--text-shadow-sm);
        flex: 1;
    }

    .toggle-button {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-xs) var(--spacing-sm);
        background: rgba(var(--theme-primary-rgb), 0.05);
        border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
        border-radius: 4px;
        cursor: pointer;
        transition: all var(--transition-base);

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.1);
            border-color: rgba(var(--theme-primary-rgb), 0.4);
        }

        &.active {
            background: rgba(var(--theme-primary-rgb), 0.15);
            border-color: rgba(var(--theme-primary-rgb), 0.5);
            box-shadow: var(--glow-sm);
        }

        .toggle-label {
            font-size: var(--font-size-xs);
            color: var(--color-text-dim);
            font-weight: bold;
            letter-spacing: 0.5px;
            min-width: 70px;
            text-align: right;
        }

        &.active .toggle-label {
            color: var(--color-accent);
        }

        .toggle-switch {
            position: relative;
            width: 40px;
            height: 20px;
            background: rgba(var(--theme-primary-rgb), 0.2);
            border-radius: 10px;
            transition: all var(--transition-base);

            .toggle-indicator {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 16px;
                height: 16px;
                background: var(--color-text-dim);
                border-radius: 50%;
                transition: all var(--transition-base);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

                &.active {
                    left: 22px;
                    background: var(--color-accent);
                    box-shadow: var(--glow-sm);
                }
            }
        }

        &.active .toggle-switch {
            background: rgba(var(--theme-primary-rgb), 0.4);
        }
    }
}

// Multi-Window Section Styles
.multi-window-section {
    border-top: 2px solid rgba(var(--theme-primary-rgb), 0.3);
    padding-top: var(--spacing-md);
    margin-top: var(--spacing-md);

    .window-status {
        @include flex-between;
        padding: var(--spacing-sm);
        background: rgba(var(--theme-primary-rgb), 0.05);
        border-radius: 4px;
        margin-bottom: var(--spacing-md);
        border: 1px solid rgba(var(--theme-primary-rgb), 0.2);

        .status-label {
            font-size: var(--font-size-xs);
            color: var(--color-text-dim);
            font-weight: bold;
        }

        .status-value {
            font-size: var(--font-size-sm);
            color: var(--color-text);
            font-weight: bold;
            font-family: 'Courier New', monospace;
            padding: 2px var(--spacing-xs);
            background: rgba(0, 0, 0, 0.3);
            border-radius: 3px;
            transition: all var(--transition-base);

            &.active {
                color: var(--color-accent);
                box-shadow: var(--glow-sm);
            }
        }
    }

    .window-buttons {
        @include flex-column;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);

        .window-button {
            @include flex-center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) var(--spacing-md);
            background: rgba(var(--theme-primary-rgb), 0.1);
            border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
            border-radius: 4px;
            cursor: pointer;
            transition: all var(--transition-base);
            position: relative;
            overflow: hidden;

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg,
                        transparent,
                        rgba(var(--theme-primary-rgb), 0.2),
                        transparent);
                transition: left 0.5s;
            }

            &:hover {
                background: rgba(var(--theme-primary-rgb), 0.2);
                border-color: rgba(var(--theme-primary-rgb), 0.5);
                box-shadow: var(--glow-sm);
                transform: translateY(-2px);

                &::before {
                    left: 100%;
                }
            }

            &:active {
                transform: translateY(0);
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;

                &:hover {
                    background: rgba(var(--theme-primary-rgb), 0.1);
                    border-color: rgba(var(--theme-primary-rgb), 0.3);
                    box-shadow: none;
                    transform: none;
                }
            }

            .button-icon {
                font-size: 1.2rem;
            }

            .button-text {
                flex: 1;
                font-size: var(--font-size-xs);
                color: var(--color-text);
                font-weight: bold;
                text-align: left;
                letter-spacing: 0.5px;
            }

            .button-hint {
                font-size: var(--font-size-xs);
                color: var(--color-text-dim);
                font-style: italic;
            }
        }
    }

    .connected-windows-list {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
        border-radius: 4px;
        padding: var(--spacing-sm);

        .list-header {
            font-size: var(--font-size-xs);
            color: var(--color-accent);
            font-weight: bold;
            margin-bottom: var(--spacing-xs);
            padding-bottom: var(--spacing-xs);
            border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.2);
        }

        .window-item {
            @include flex-between;
            padding: var(--spacing-xs) 0;
            font-size: var(--font-size-xs);

            &:not(:last-child) {
                border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.1);
            }

            .window-role {
                color: var(--color-text);
                font-weight: bold;
                font-family: 'Courier New', monospace;
            }

            .window-status {
                color: var(--color-text-dim);
                font-size: 0.7rem;

                &.alive {
                    color: var(--color-accent);
                }
            }
        }
    }
}
</style>
