<template>
    <div class="main-layout">
        <!-- Header Global -->
        <AppHeader :window-id="windowId" />

        <!-- Sidebar Global -->
        <AppSidebar :window-id="windowId" />

        <!-- Área de Conteúdo -->
        <main class="content-area">
            <RouterView />
        </main>
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppSidebar from '../components/AppSidebar.vue'

// Injeta o windowId do App.vue ou gera um novo
const parentWindowId = inject<string | null>('windowId', null)
const windowId = parentWindowId || 'main-' + Date.now()

console.log('[MainLayout] windowId:', windowId, 'parent:', parentWindowId)
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
