<script setup lang="ts">
</script>

<template>
  <RouterView
    v-slot="{ Component }"
  >
    <component :is="Component" />
  </RouterView>
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

*:not(dialog) {
  margin: 0;
}

body {
  margin: 0;
  background: var(--ypm-color-bg-primary);
}

#ui-container {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
</style>
