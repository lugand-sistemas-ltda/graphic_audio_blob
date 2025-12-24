<template>
    <div class="main-layout">
        <!-- Header Global (TODAS as janelas) -->
        <AppHeader :window-id="windowId" />

        <!-- Sidebar Global (TODAS as janelas) -->
        <AppSidebar :window-id="windowId" />

        <!-- Área de Conteúdo -->
        <main class="content-area">
            <RouterView />
        </main>

        <!-- Connection Status (apenas janelas não-main) -->
        <div v-if="!config.isMainWindow" class="connection-status" :class="{ connected: isConnected }">
            <span class="status-dot"></span>
            <span class="status-text">{{ isConnected ? 'SYNCED' : 'DISCONNECTED' }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, provide, ref, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppSidebar from '../components/AppSidebar.vue'
import { useWindowType } from '../composables/useWindowType'
import { useWindowManager } from '../core/sync'

// Detecta tipo de janela
const { windowConfig, generateWindowId } = useWindowType()
const config = windowConfig

// Window Manager para monitorar conexão
const windowManager = useWindowManager({ enableLogging: false })
const isConnected = ref(true)

// Gera ou injeta windowId
const parentWindowId = inject<string | null>('windowId', null)
const windowId = parentWindowId || generateWindowId()

// Provide para componentes filhos
provide('windowId', windowId)
provide('isMainWindow', config.value.isMainWindow)
provide('windowType', config.value.type)

console.log('[MainLayout] Initialized:', {
    windowId,
    type: config.value.type,
    isMain: config.value.isMainWindow,
    config: config.value
})

// Monitora conexão (apenas janelas filhas)
let heartbeatCheck: ReturnType<typeof setInterval> | null = null

onMounted(() => {
    if (!config.value.isMainWindow) {
        // Janela filha: monitora heartbeat da main
        heartbeatCheck = setInterval(() => {
            const windows = windowManager.getAliveWindows()
            const mainWindow = windows.find(w => w.role === 'main')
            isConnected.value = !!mainWindow && mainWindow.isAlive
        }, 1000)
    }
})

onUnmounted(() => {
    if (heartbeatCheck) {
        clearInterval(heartbeatCheck)
    }
})
</script>

<style scoped lang="scss">
@use '../style/variables' as *;

.main-layout {
    min-height: 100vh;
    background: transparent;
    position: relative;
}

.content-area {
    margin-top: var(--header-height);
    margin-left: var(--sidebar-width);
    min-height: calc(100vh - var(--header-height));
    padding: var(--spacing-xl);
    transition: margin-left var(--transition-base);
    position: relative;
    z-index: var(--z-base);

    // Quando sidebar colapsa (CSS controlado via classe no body ou evento)
    @at-root body.sidebar-collapsed & {
        margin-left: var(--sidebar-collapsed-width);
    }
}

// Connection Status (janelas filhas)
.connection-status {
    position: fixed;
    top: var(--spacing-md);
    right: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 0, 0, 0.5);
    border-radius: 4px;
    font-size: var(--font-size-xs);
    color: #ff4444;
    z-index: var(--z-modal);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &.connected {
        border-color: rgba(0, 255, 0, 0.5);
        color: #44ff44;

        .status-dot {
            background: #44ff44;
            box-shadow: 0 0 10px #44ff44;
        }
    }

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ff4444;
        box-shadow: 0 0 10px #ff4444;
        animation: pulse 2s ease-in-out infinite;
    }

    .status-text {
        font-weight: 600;
        letter-spacing: 0.05em;
    }
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

@media (max-width: 768px) {
    .content-area {
        padding: var(--spacing-lg);
    }
}

@media (max-width: 480px) {
    .content-area {
        margin-left: 0;
        padding: var(--spacing-md);
    }
}
</style>
