<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: string | number
}>(), {
  size: 24,
})

const icons = import.meta.glob('../../assets/icons/*.svg', { as: 'raw' })

const svgContent = ref('')

watchEffect(async () => {
  const path = `../../assets/icons/${props.name}.svg`
  if (icons[path]) {
    try {
      svgContent.value = await (icons[path] as () => Promise<string>)()
    }
    catch (e) {
      console.error(`Failed to load icon: ${props.name}`, e)
      svgContent.value = ''
    }
  }
  else {
    svgContent.value = ''
    // console.warn(`Icon "${props.name}" not found at ${path}`)
  }
})
</script>

<template>
  <span
    v-if="svgContent"
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

.base-icon :deep(path) {
  fill: currentColor;
  stroke: inherit;
}
</style>
