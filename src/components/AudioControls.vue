<template>
    <div class="lower-menu">
        <p class="info-text">[ MATRIX MODE ACTIVE ]</p>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.lower-menu {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);

    padding: 1rem 2rem;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(15px);
    border-radius: 4px;
    border: 1px solid var(--color-border);
    box-shadow:
        0 0 30px rgba(var(--theme-primary-rgb), 0.2),
        inset 0 0 30px rgba(var(--theme-primary-rgb), 0.05);
    z-index: 10000; // Camada estática - sempre visível

    // Efeito de scanline
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(0deg,
                rgba(var(--theme-primary-rgb), 0.03) 0px,
                transparent 1px,
                transparent 2px,
                rgba(var(--theme-primary-rgb), 0.03) 3px);
        pointer-events: none;
        border-radius: 4px;
    }

    .info-text {
        margin: 0;
        font-size: 0.85rem;
        color: var(--color-accent);
        text-align: center;
        font-family: 'Courier New', monospace;
        letter-spacing: 2px;
        text-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.5);
        animation: pulse-text 2s infinite;
    }
}

@keyframes pulse-text {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}
</style>
