<template>
  <div class="progress-wrapper" @click="onClick" ref="bar">
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: percent + '%' }" />
      <div class="progress-thumb" :style="{ left: percent + '%' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  value: number
  max?: number
}
const props = withDefaults(defineProps<Props>(), { max: 100 })
const emit = defineEmits(['seek'])
const bar = ref<HTMLElement | null>(null)

const percent = computed(() => {
  if (!Number.isFinite(props.max) || props.max === 0) return 0
  return (props.value / props.max) * 100
})

function onClick(e: MouseEvent) {
  if (!bar.value) return
  const rect = bar.value.getBoundingClientRect()
  const px = e.clientX - rect.left
  const p = Math.max(0, Math.min(1, px / rect.width))
  const time = (p * (props.max || 0))
  emit('seek', time)
}
</script>

<style scoped lang="scss">
@use '../../../style/base/variables' as *;

.progress-wrapper {
  width: 100%;
  cursor: pointer;
}
.progress-track {
  position: relative;
  height: 6px;
  background: rgba(var(--theme-primary-rgb), 0.12);
  border-radius: 6px;
  overflow: visible;
}
.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--theme-primary);
  border-radius: 6px;
  box-shadow: 0 0 8px rgba(var(--theme-primary-rgb), 0.5);
}
.progress-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: var(--color-text);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px rgba(var(--theme-primary-rgb), 0.6);
  border: 1px solid var(--color-accent);
}
</style>