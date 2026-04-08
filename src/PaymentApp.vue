<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'

const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
    // router.replace({ name: 'chain' })
  }, 1000)
})
</script>

<template>
  <main :class="$style.viewport">
    <div
      v-if="isLoading"
      :class="$style.loader"
    >
      <BaseSpinner />
    </div>
    <RouterView
      v-else
      v-slot="{ Component }"
    >
      <Transition
        name="fade"
        mode="out-in"
      >
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
</template>

<style module lang="scss">
@use "@/assets/styles/main" as *;

.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.viewport {
  display: flex;
  flex-direction: column;
  min-height: 80dvh;

  & > * {
    flex-grow: 1;
  }
}
</style>

<style>
.fade-enter-active {
  transition: opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
