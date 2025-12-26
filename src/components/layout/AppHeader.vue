<template>
    <header class="app-header">
        <div class="header-content">
            <div class="header-left">
                <div class="app-title">
                    <!-- Nome editável -->
                    <input v-if="isEditingTitle" v-model="editableTitle" @blur="saveTitle" @keyup.enter="saveTitle"
                        @keyup.esc="cancelEdit" class="title-input" ref="titleInput" maxlength="50" />
                    <span v-else class="title-text" @dblclick="startEditTitle">{{ windowTitle }}</span>
                    <BaseButton v-if="!isEditingTitle" variant="ghost" size="sm" icon="✏️" icon-only
                        @click="startEditTitle" title="Edit window name" custom-class="edit-button" />
                    <span class="title-subtitle">SPECTRAL VISUALIZER</span>
                </div>
            </div>

            <div class="header-right">
                <div class="window-info">
                    <span class="info-label">ID:</span>
                    <span class="info-value">{{ shortWindowId }}</span>
                </div>

                <BaseButton v-if="canClose" variant="danger" icon-only icon="✕" shadow @click="handleClose"
                    title="Close Window" custom-class="close-button" />
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useGlobalState, updateWindow } from '../../core/state'
import { useGlobalAlerts } from '../../shared'
import { BaseButton } from '../../shared/components/ui'
import type { WindowId } from '../../core/state/types'

interface Props {
    windowId: WindowId
}

const props = defineProps<Props>()

const { state } = useGlobalState()
const alerts = useGlobalAlerts(props.windowId)

// Edição de título
const isEditingTitle = ref(false)
const editableTitle = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

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

    // Usa o novo sistema de alerts com tipo 'attention'
    alerts.showConfirm(
        'Are you sure you want to close this window? All unsaved changes will be lost.',
        'Close Window',
        () => {
            // Confirmado - fecha a janela
            window.close()
        },
        () => {
            // Cancelado - não faz nada
            console.log('[AppHeader] Window close cancelled by user')
        }
    )
}

// Funções de edição de título
const startEditTitle = () => {
    isEditingTitle.value = true
    editableTitle.value = windowTitle.value
    nextTick(() => {
        titleInput.value?.focus()
        titleInput.value?.select()
    })
}

const saveTitle = () => {
    if (editableTitle.value.trim()) {
        updateWindow(props.windowId, { title: editableTitle.value.trim() })
    }
    isEditingTitle.value = false
}

const cancelEdit = () => {
    isEditingTitle.value = false
    editableTitle.value = windowTitle.value
}
</script>

<style scoped lang="scss">
@use '../../style/base/variables' as *;

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
    position: relative;

    .title-text {
        font-size: var(--font-size-md);
        font-weight: bold;
        color: var(--color-text);
        text-shadow: var(--text-shadow-md);
        letter-spacing: 1px;
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 0.8;
        }
    }

    .title-input {
        font-size: var(--font-size-md);
        font-weight: bold;
        color: var(--color-text);
        background: rgba(var(--theme-primary-rgb), 0.1);
        border: 1px solid var(--color-text);
        border-radius: 4px;
        padding: 4px 8px;
        font-family: var(--font-family-mono);
        letter-spacing: 1px;
        outline: none;
        box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.3);

        &:focus {
            box-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 0.5);
        }
    }

    .edit-button {
        position: absolute;
        top: 0;
        right: -30px;
        background: rgba(var(--theme-primary-rgb), 0.1);
        border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
        border-radius: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s ease;
        font-size: 0.8rem;

        &:hover {
            opacity: 1;
            background: rgba(var(--theme-primary-rgb), 0.2);
            transform: scale(1.1);
        }
    }

    &:hover .edit-button {
        opacity: 0.6;
    }

    .title-subtitle {
        font-size: var(--font-size-xs);
        color: var(--color-text);
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
        color: var(--color-text);
        opacity: 0.7;
    }

    .info-value {
        color: var(--color-text);
        font-weight: bold;
    }
}

// Customizações específicas para botões no header
.close-button {
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
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
        width: 36px !important;
        height: 36px !important;
    }
}
</style>
