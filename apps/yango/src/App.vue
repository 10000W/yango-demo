<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isDesktop = computed(() => route.path === '/fleets' || route.path.startsWith('/fleets/'))

watch(isDesktop, (active) => {
  document.body.classList.toggle('is-desktop', active)
}, { immediate: true })

onUnmounted(() => {
  document.body.classList.remove('is-desktop')
})
</script>

<template>
  <main
    class="tac-crypto-payment yango-shell"
    :class="{ 'yango-shell--desktop': isDesktop }"
  >
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

html,
body,
#app {
  min-height: 100dvh;
}

body {
  margin: 0;
  background: var(--ypm-color-bg-primary);
}

.yango-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  width: 100%;
}

/* Apply the frame when either dimension is large enough for it. */
@media (min-width: 540px), (min-height: 940px) {
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  #app {
    flex: 0 1 500px;
    min-height: 0;
    width: 100%;
  }

  .yango-shell {
    min-height: 0;
    height: 900px;
    max-height: calc(100dvh - 40px);
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    border: 1px solid var(--ypm-color-border-default);
    border-radius: 24px;
    box-shadow: 0 16px 48px rgb(30 23 44 / 12%);
  }

  body.is-desktop {
    display: block;
    padding: 0;
  }

  body.is-desktop #app {
    flex: none;
    min-height: 100dvh;
  }

  .yango-shell.yango-shell--desktop {
    min-height: 100dvh;
    height: auto;
    max-height: none;
    overflow: visible;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
