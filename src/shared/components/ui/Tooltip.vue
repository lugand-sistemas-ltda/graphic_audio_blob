<template>
  <div class="tooltip-wrapper">
    <div
      class="tooltip-trigger"
      @mouseenter="show"
      @mouseleave="hide"
      @focus="show"
      @blur="hide"
    >
      <slot name="trigger"></slot>
    </div>

    <Transition name="tooltip-fade">
      <div
        v-if="visible"
        class="tooltip-box"
        :style="boxStyle"
        role="tooltip"
      >
        <slot>{{ text }}</slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  text?: string
  maxWidth?: number
  maxHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  maxWidth: 320,
  maxHeight: 240
})

const visible = ref(false)

function show() {
  visible.value = true
}
function hide() {
  visible.value = false
}

const boxStyle = computed(() => ({
  maxWidth: `${props.maxWidth}px`,
  maxHeight: `${props.maxHeight}px`
}))
</script>

<style scoped lang="scss">
@use '../../../style/base/variables' as *;

.tooltip-wrapper {
  display: inline-block;
  position: relative;
}

.tooltip-box {
  position: absolute;
  bottom: calc(100% + var(--spacing-xs));
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.95);
  color: var(--color-accent);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  box-shadow: 0 0 15px rgba(var(--theme-primary-rgb),0.25);
  z-index: 2000;
  overflow: auto;
  white-space: pre-wrap;
  font-size: 0.85rem;
}

.tooltip-fade-enter-active, .tooltip-fade-leave-active {
  transition: opacity 0.15s ease;
}
.tooltip-fade-enter-from, .tooltip-fade-leave-to { opacity: 0; }
.tooltip-fade-enter-to, .tooltip-fade-leave-from { opacity: 1; }
</style>