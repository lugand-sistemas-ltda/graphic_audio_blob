<template>
    <Transition name="terminal-slide">
        <div v-if="terminal.state.value.isExpanded" class="integrated-terminal"
            :class="{ 'is-fullscreen': terminal.state.value.isFullscreen }">
            <!-- Terminal Header -->
            <div class="terminal-header">
                <div class="terminal-title">
                    <span class="terminal-icon">▶</span>
                    <span class="terminal-label">Terminal</span>
                    <span v-if="terminal.state.value.isFullscreen" class="terminal-badge">FULLSCREEN</span>
                </div>
                <div class="terminal-controls">
                    <button class="terminal-btn" @click="terminal.clearTerminal()" title="Clear (Ctrl+L)">
                        <span>⎚</span>
                    </button>
                    <button class="terminal-btn" @click="terminal.toggleFullscreen()"
                        :title="terminal.state.value.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">
                        <span>{{ terminal.state.value.isFullscreen ? '⇲' : '⇱' }}</span>
                    </button>
                    <button class="terminal-btn" @click="terminal.closeTerminal()" title="Close (')">
                        <span>✕</span>
                    </button>
                </div>
            </div>

            <!-- Terminal Content -->
            <div class="terminal-content" ref="terminalContent">
                <!-- Output Lines -->
                <div v-for="(line, index) in terminal.state.value.outputLines" :key="index" class="terminal-line">
                    <span v-if="line.type === 'command'" class="terminal-prompt">{{ prompt }}</span>
                    <span :class="['terminal-text', `terminal-${line.type}`]" v-html="line.text"></span>
                </div>

                <!-- Input Line -->
                <div class="terminal-line terminal-input-line">
                    <span class="terminal-prompt">{{ prompt }}</span>
                    <input ref="terminalInput" v-model="currentInput" type="text" class="terminal-input"
                        @keydown.enter="executeCommand" @keydown.up="navigateHistory(-1)"
                        @keydown.down="navigateHistory(1)" @keydown.tab.prevent="autocomplete" spellcheck="false"
                        autocomplete="off" />
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useGlobalTerminal } from '../../features/terminal'

// ========================================
// GLOBAL TERMINAL
// ========================================

const terminal = useGlobalTerminal()

// ========================================
// LOCAL STATE
// ========================================

const currentInput = ref('')
const historyIndex = ref(-1)

// Refs
const terminalInput = ref<HTMLInputElement | null>(null)
const terminalContent = ref<HTMLDivElement | null>(null)

// ========================================
// COMPUTED
// ========================================

const prompt = computed(() => {
    return 'spectral@visualizer:~$ '
})

// ========================================
// METHODS
// ========================================

const executeCommand = async () => {
    const command = currentInput.value.trim()

    if (!command) return

    // Executa comando via sistema global
    await terminal.executeCommand(command)

    // Reseta histórico e input
    historyIndex.value = terminal.getHistory().length
    currentInput.value = ''

    // Auto-scroll para o final
    nextTick(() => {
        scrollToBottom()
    })
}

const navigateHistory = (direction: number) => {
    const history = terminal.getHistory()

    if (history.length === 0) return

    historyIndex.value += direction

    // Clamp index
    if (historyIndex.value < 0) {
        historyIndex.value = 0
    } else if (historyIndex.value >= history.length) {
        historyIndex.value = history.length
        currentInput.value = ''
        return
    }

    currentInput.value = history[historyIndex.value] || ''
}

const autocomplete = () => {
    // Placeholder - será implementado futuramente
    console.log('Autocomplete:', currentInput.value)
}

const scrollToBottom = () => {
    if (terminalContent.value) {
        terminalContent.value.scrollTop = terminalContent.value.scrollHeight
    }
}

// ========================================
// KEYBOARD HANDLER
// ========================================

const handleGlobalKeydown = (event: KeyboardEvent) => {
    // Toggle terminal com tecla "'" (abre E fecha)
    if (event.key === "'") {
        event.preventDefault()
        terminal.toggleTerminal()
        return
    }

    // Fecha com Escape
    if (event.key === 'Escape' && terminal.state.value.isExpanded) {
        event.preventDefault()
        terminal.closeTerminal()
    }
}

// ========================================
// WATCHERS
// ========================================

// Auto-focus quando abrir
watch(() => terminal.state.value.isExpanded, (isExpanded) => {
    if (isExpanded) {
        nextTick(() => {
            terminalInput.value?.focus()
        })
    }
})

// Auto-scroll quando adicionar output
watch(() => terminal.state.value.outputLines.length, () => {
    nextTick(() => {
        scrollToBottom()
    })
})

// ========================================
// LIFECYCLE
// ========================================

onMounted(() => {
    globalThis.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
    globalThis.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped lang="scss">
@use '../../style/base/variables' as *;

// ========================================
// TERMINAL CONTAINER
// ========================================

.integrated-terminal {
    position: fixed;
    top: var(--header-height, 60px); // Logo abaixo do header
    left: 0;
    right: 0;
    height: 400px;
    z-index: 9999; // Por cima de TUDO (incluindo sidebar)

    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    border-bottom: 2px solid rgba(var(--theme-primary-rgb), 0.3);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);

    display: flex;
    flex-direction: column;

    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: var(--color-text);

    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    // Fullscreen mode
    &.is-fullscreen {
        top: 0;
        height: 100vh;
        border-bottom: none;
    }
}

// ========================================
// HEADER
// ========================================

.terminal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(var(--theme-primary-rgb), 0.1);
    border-bottom: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    min-height: 40px;
}

.terminal-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-theme-primary);
}

.terminal-badge {
    display: inline-block;
    padding: 2px 6px;
    background: rgba(var(--theme-primary-rgb), 0.2);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.4);
    border-radius: 3px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--color-theme-primary);
    margin-left: var(--spacing-xs);
}

.terminal-icon {
    font-size: 12px;
}

.terminal-controls {
    display: flex;
    gap: var(--spacing-xs);
}

.terminal-btn {
    background: rgba(var(--theme-primary-rgb), 0.1);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    color: var(--color-text-dim);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 12px;

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.2);
        color: var(--color-theme-primary);
        border-color: rgba(var(--theme-primary-rgb), 0.4);
    }

    span {
        display: block;
    }
}

// ========================================
// CONTENT
// ========================================

.terminal-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);

    // Custom scrollbar
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--theme-primary-rgb), 0.3) rgba(0, 0, 0, 0.1);

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(var(--theme-primary-rgb), 0.3);
        border-radius: 4px;

        &:hover {
            background: rgba(var(--theme-primary-rgb), 0.5);
        }
    }
}

// ========================================
// LINES
// ========================================

.terminal-line {
    display: flex;
    align-items: baseline;
    margin-bottom: 4px;
    line-height: 1.6;

    &.terminal-input-line {
        margin-top: 8px;
    }
}

.terminal-prompt {
    color: var(--color-theme-primary);
    font-weight: 600;
    margin-right: 8px;
    user-select: none;
    flex-shrink: 0;
}

.terminal-text {
    white-space: pre-wrap;
    word-break: break-word;
    flex: 1;

    &.terminal-command {
        color: var(--color-text);
    }

    &.terminal-success {
        color: #4ade80; // green
    }

    &.terminal-error {
        color: #f87171; // red
    }

    &.terminal-warning {
        color: #fbbf24; // yellow
    }

    &.terminal-info {
        color: #60a5fa; // blue
    }

    &.terminal-separator {
        height: 8px;
    }
}

// ========================================
// INPUT
// ========================================

.terminal-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text);
    font-family: 'Courier New', monospace;
    font-size: 14px;
    padding: 0;
    caret-color: var(--color-theme-primary);

    // Cursor piscante customizado (como terminal real)
    caret-shape: block;

    &::selection {
        background: rgba(var(--theme-primary-rgb), 0.3);
    }
}

// ========================================
// ANIMATION
// ========================================

.terminal-slide-enter-active,
.terminal-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.terminal-slide-enter-from {
    transform: translateY(-100%);
    opacity: 0;
}

.terminal-slide-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}

// ========================================
// RESPONSIVE
// ========================================

@media (max-width: 768px) {
    .integrated-terminal {
        height: 300px;
        font-size: 12px;
    }

    .terminal-header {
        padding: var(--spacing-xs) var(--spacing-sm);
    }

    .terminal-content {
        padding: var(--spacing-sm);
    }
}
</style>
