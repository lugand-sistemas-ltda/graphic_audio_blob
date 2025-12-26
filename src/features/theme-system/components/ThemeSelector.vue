<template>
    <div class="theme-selector" v-draggable="{ id: 'theme-selector', handle: '.theme-header' }">
        <div class="theme-header">
            <span class="theme-title">[ THEME CONTROL ]</span>
            <button class="collapse-toggle" @click="toggleExpanded" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
                {{ isExpanded ? '−' : '+' }}
            </button>
        </div>

        <div v-if="isExpanded" class="theme-content">
            <!-- Current Theme Display -->
            <div class="current-theme">
                <span class="theme-label">ACTIVE:</span>
                <span class="theme-value">{{ currentThemeInfo?.name || 'Unknown' }}</span>
            </div>

            <!-- Theme Grid -->
            <div class="theme-grid">
                <button v-for="theme in availableThemes" :key="theme.id" class="theme-item"
                    :class="{ active: currentTheme === theme.id }" @click="selectTheme(theme.id)"
                    :title="theme.description">
                    <div class="theme-preview" :style="{ backgroundColor: theme.preview }"></div>
                    <span class="theme-name">{{ theme.name }}</span>
                </button>
            </div>

            <!-- Quick Navigation -->
            <div class="theme-navigation">
                <button class="nav-button" @click="previousTheme" title="Previous theme">
                    ◀ PREV
                </button>
                <button class="nav-button" @click="nextTheme" title="Next theme">
                    NEXT ▶
                </button>
            </div>

            <!-- RGB Mode Toggle -->
            <div class="rgb-mode-section">
                <div class="rgb-mode-header">
                    <span class="rgb-mode-title">[ PC MASTER RACE RGB MODE ]</span>
                </div>
                <button class="rgb-toggle-button" :class="{ active: isRgbModeActive }" @click="toggleRgbMode"
                    :title="isRgbModeActive ? 'Disable RGB cycling' : 'Enable RGB cycling'">
                    <span class="toggle-status">{{ isRgbModeActive ? 'ON' : 'OFF' }}</span>
                    <span class="toggle-indicator">
                        <span class="toggle-switch" :class="{ active: isRgbModeActive }"></span>
                    </span>
                </button>
            </div>

            <!-- Chameleon Mode Toggle -->
            <div class="chameleon-mode-section">
                <div class="chameleon-mode-header">
                    <span class="chameleon-mode-title">[ CHAMELEON MODE ]</span>
                </div>
                <button class="chameleon-toggle-button" :class="{ active: isChameleonModeActive }"
                    @click="toggleChameleonMode"
                    :title="isChameleonModeActive ? 'Disable Chameleon gradients' : 'Enable Chameleon gradients'">
                    <span class="toggle-status">{{ isChameleonModeActive ? 'ON' : 'OFF' }}</span>
                    <span class="toggle-indicator">
                        <span class="toggle-switch" :class="{ active: isChameleonModeActive }"></span>
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useGlobalTheme } from '../../../core/global'
import { useCollapsible } from '../../../shared'
import { useVisibilityReload } from '../../window-management'

const { currentTheme, availableThemes, setTheme, getCurrentThemeInfo, nextTheme, previousTheme } = useTheme()

// Acessa o estado global de tema (RGB e Chameleon são gerenciados globalmente)
const globalTheme = useGlobalTheme()

// Computed para acessar estados do global theme
const isRgbModeActive = computed(() => globalTheme.state.value.rgbMode.enabled)
const isChameleonModeActive = computed(() => globalTheme.state.value.chameleonMode.enabled)

// Funções para toggle (delega para o gerenciador global)
const toggleRgbMode = () => {
    globalTheme.toggleRgbMode('theme-selector')
}

const toggleChameleonMode = () => {
    globalTheme.toggleChameleonMode('theme-selector')
}

const { isExpanded, toggle: toggleExpanded, reloadState } = useCollapsible({ id: 'theme-selector', initialState: false })

// Detecta quando o componente fica visível e recarrega o estado
useVisibilityReload({
    selector: '.theme-selector',
    onVisible: reloadState
})

const currentThemeInfo = computed(() => getCurrentThemeInfo())

const selectTheme = (themeId: string) => {
    setTheme(themeId)
}
</script>

<style scoped lang="scss">
@use '../../../style/base/variables' as *;
@use '../../../style/mixins' as *;

.theme-selector {
    @include draggable-container;
    z-index: var(--z-controls);
}

.theme-header {
    @include draggable-header;

    .theme-title {
        @include draggable-title;
    }

    .collapse-toggle {
        @include draggable-collapse-toggle;
    }
}

.theme-content {
    @include draggable-content;
}

.current-theme {
    @include flex-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(var(--theme-primary-rgb), 0.1);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
    border-radius: var(--control-panel-border-radius);

    .theme-label {
        color: var(--color-text-dim);
        font-size: var(--font-size-xs);
        text-shadow: var(--text-shadow-sm);
    }

    .theme-value {
        color: var(--color-text);
        font-size: var(--font-size-sm);
        font-weight: bold;
        text-shadow: var(--text-shadow-md);
    }
}

.theme-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
}

.theme-item {
    @include flex-column;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    border-radius: var(--control-panel-border-radius);
    cursor: pointer;
    transition: all var(--transition-base);
    font-family: var(--font-family-mono);

    &:hover {
        border-color: var(--color-text);
        background: rgba(var(--theme-primary-rgb), 0.1);
        transform: translateY(-2px);
    }

    &.active {
        border-color: var(--color-accent);
        background: rgba(var(--theme-primary-rgb), 0.2);
        box-shadow: var(--glow-md);

        .theme-preview {
            box-shadow: 0 0 15px currentColor;
        }
    }

    .theme-preview {
        width: 100%;
        height: 40px;
        border-radius: 4px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        transition: all var(--transition-base);
    }

    .theme-name {
        font-size: var(--font-size-xs);
        color: var(--color-text);
        text-align: center;
        text-shadow: var(--text-shadow-sm);
    }
}

.theme-navigation {
    display: flex;
    gap: var(--spacing-sm);

    .nav-button {
        @include matrix-button;
        flex: 1;
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--font-size-xs);
        letter-spacing: 1px;
    }
}

.rgb-mode-section {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid rgba(var(--theme-primary-rgb), 0.2);

    .rgb-mode-header {
        margin-bottom: var(--spacing-md);
        text-align: center;

        .rgb-mode-title {
            font-size: var(--font-size-xs);
            color: var(--color-accent);
            font-weight: bold;
            letter-spacing: 1px;
            text-shadow: var(--text-shadow-md);
            animation: rgb-pulse 2s ease-in-out infinite;
        }
    }

    .rgb-toggle-button {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md);
        background: rgba(var(--theme-primary-rgb), 0.05);
        border: 2px solid rgba(var(--theme-primary-rgb), 0.3);
        border-radius: var(--control-panel-border-radius);
        cursor: pointer;
        transition: all var(--transition-base);
        font-family: var(--font-family-mono);

        .toggle-status {
            font-size: var(--font-size-sm);
            font-weight: bold;
            color: var(--color-text);
            letter-spacing: 2px;
            text-shadow: var(--text-shadow-sm);
        }

        .toggle-indicator {
            position: relative;
            width: 50px;
            height: 24px;
            background: rgba(var(--theme-primary-rgb), 0.2);
            border-radius: 12px;
            border: 1px solid rgba(var(--theme-primary-rgb), 0.4);
            transition: all var(--transition-base);

            .toggle-switch {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 18px;
                height: 18px;
                background: var(--color-text-dim);
                border-radius: 50%;
                transition: all var(--transition-base);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

                &.active {
                    left: 28px;
                    background: var(--color-text);
                    box-shadow:
                        0 0 10px rgba(var(--theme-primary-rgb), 0.8),
                        0 2px 4px rgba(0, 0, 0, 0.3);
                }
            }
        }

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.1);
            border-color: rgba(var(--theme-primary-rgb), 0.5);
            box-shadow: var(--glow-sm);
        }

        &.active {
            background: rgba(var(--theme-primary-rgb), 0.15);
            border-color: rgba(var(--theme-primary-rgb), 0.6);
            box-shadow: var(--glow-md);

            .toggle-status {
                color: var(--color-accent);
                animation: rgb-glow 2s ease-in-out infinite;
            }

            .toggle-indicator {
                background: rgba(var(--theme-primary-rgb), 0.4);
                border-color: rgba(var(--theme-primary-rgb), 0.8);
                animation: rgb-border 3s linear infinite;
            }
        }
    }
}

.chameleon-mode-section {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid rgba(var(--theme-primary-rgb), 0.2);

    .chameleon-mode-header {
        margin-bottom: var(--spacing-md);
        text-align: center;

        .chameleon-mode-title {
            font-size: var(--font-size-xs);
            color: var(--color-accent);
            font-weight: bold;
            letter-spacing: 1px;
            text-shadow: var(--text-shadow-md);
            animation: chameleon-pulse 2s ease-in-out infinite;
        }
    }

    .chameleon-toggle-button {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md);
        background: rgba(var(--theme-primary-rgb), 0.05);
        border: 2px solid rgba(var(--theme-primary-rgb), 0.3);
        border-radius: var(--control-panel-border-radius);
        cursor: pointer;
        transition: all var(--transition-base);
        font-family: var(--font-family-mono);

        .toggle-status {
            font-size: var(--font-size-sm);
            font-weight: bold;
            color: var(--color-text);
            letter-spacing: 2px;
            text-shadow: var(--text-shadow-sm);
        }

        .toggle-indicator {
            position: relative;
            width: 50px;
            height: 24px;
            background: rgba(var(--theme-primary-rgb), 0.2);
            border-radius: 12px;
            border: 1px solid rgba(var(--theme-primary-rgb), 0.4);
            transition: all var(--transition-base);

            .toggle-switch {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 18px;
                height: 18px;
                background: var(--color-text-dim);
                border-radius: 50%;
                transition: all var(--transition-base);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

                &.active {
                    left: 28px;
                    background: var(--color-text);
                    box-shadow:
                        0 0 10px rgba(var(--theme-primary-rgb), 0.8),
                        0 2px 4px rgba(0, 0, 0, 0.3);
                }
            }
        }

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.1);
            border-color: rgba(var(--theme-primary-rgb), 0.5);
            box-shadow: var(--glow-sm);
        }

        &.active {
            background: rgba(var(--theme-primary-rgb), 0.15);
            border-color: rgba(var(--theme-primary-rgb), 0.6);
            box-shadow: var(--glow-md);

            .toggle-status {
                color: var(--color-accent);
                animation: chameleon-glow 2s ease-in-out infinite;
            }

            .toggle-indicator {
                background: rgba(var(--theme-primary-rgb), 0.4);
                border-color: rgba(var(--theme-primary-rgb), 0.8);
                animation: chameleon-border 3s linear infinite;
            }
        }
    }
}

@keyframes rgb-pulse {

    0%,
    100% {
        opacity: 1;
        text-shadow: var(--text-shadow-md);
    }

    50% {
        opacity: 0.7;
        text-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.8);
    }
}

@keyframes rgb-glow {

    0%,
    100% {
        text-shadow: var(--text-shadow-md);
    }

    50% {
        text-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 1);
    }
}

@keyframes rgb-border {
    0% {
        box-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.5);
    }

    33% {
        box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.8);
    }

    66% {
        box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 1);
    }

    100% {
        box-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.5);
    }
}

@keyframes chameleon-pulse {

    0%,
    100% {
        opacity: 1;
        text-shadow: var(--text-shadow-md);
    }

    50% {
        opacity: 0.8;
        text-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.8);
    }
}

@keyframes chameleon-glow {

    0%,
    100% {
        text-shadow: var(--text-shadow-md);
    }

    50% {
        text-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 1);
    }
}

@keyframes chameleon-border {
    0% {
        box-shadow: 0 0 8px rgba(var(--theme-primary-rgb), 0.6);
    }

    33% {
        box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.9);
    }

    66% {
        box-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 1.2);
    }

    100% {
        box-shadow: 0 0 8px rgba(var(--theme-primary-rgb), 0.6);
    }
}
</style>
