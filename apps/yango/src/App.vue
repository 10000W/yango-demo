<script setup lang="ts">
</script>

<template>
  <main class="tac-crypto-payment">
    <RouterView
      v-slot="{ Component }"
    >
      <component :is="Component" />
    </RouterView>
  </main>
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

main {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
</style>
