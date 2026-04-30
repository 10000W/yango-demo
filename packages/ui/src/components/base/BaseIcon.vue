<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: string | number
}>(), {
  size: 24,
})

const icons = import.meta.glob('../../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const svgContent = ref('')

watchEffect(() => {
  const path = `../../assets/icons/${props.name}.svg`
  if (icons[path]) {
    svgContent.value = icons[path] as string
  }
  else {
    svgContent.value = ''
  }
})
</script>

<template>
  <span
    class="base-icon"
    :style="{ width: `${size}px`, height: `${size}px` }"
    v-bind="$attrs"
    v-html="svgContent"
  />
</template>

<style scoped>
.base-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.base-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
