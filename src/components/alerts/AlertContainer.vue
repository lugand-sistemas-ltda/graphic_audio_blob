<template>
    <Teleport to="body">
        <TransitionGroup name="alert-stack">
            <BaseAlert v-for="alert in sortedAlerts" :key="alert.id" :id="alert.id" :type="alert.type"
                :title="alert.title" :message="alert.message" :icon="alert.icon" :buttons="alert.buttons"
                :closable="alert.closable" @close="handleClose(alert.id)"
                @button-click="handleButtonClick(alert.id, $event)" />
        </TransitionGroup>
    </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseAlert from './BaseAlert.vue'
import { useGlobalAlerts } from '../../shared'
import type { WindowId } from '../../core/state/types'

interface Props {
    windowId: WindowId
}

const props = defineProps<Props>()

const { activeAlerts, hideAlert, respondToAlert } = useGlobalAlerts(props.windowId)

// Ordena alerts por data de criação (mais recente no topo)
const sortedAlerts = computed(() => {
    return [...activeAlerts.value].sort((a, b) => b.createdAt - a.createdAt)
})

function handleClose(alertId: string) {
    hideAlert(alertId)
}

function handleButtonClick(alertId: string, buttonId: string) {
    respondToAlert(alertId, buttonId)
}
</script>

<style scoped lang="scss">
// Animations para múltiplos alerts empilhados
.alert-stack-enter-active {
    transition: all 0.3s ease;
}

.alert-stack-leave-active {
    transition: all 0.3s ease;
}

.alert-stack-enter-from {
    opacity: 0;
    transform: scale(0.9);
}

.alert-stack-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.alert-stack-move {
    transition: transform 0.3s ease;
}
</style>
