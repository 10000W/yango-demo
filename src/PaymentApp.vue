<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoading = ref(true)

const isAccoladeVisible = computed(() => ['chain', 'asset', 'pay', 'edit'].includes(route.name as string))

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
    <small
      v-if="isAccoladeVisible"
      :class="$style.accolade"
    >
      <div :class="$style.accoladeTac" />
      Powered by TAC
    </small>
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
  overflow: auto;

  & > *:first-child {
    flex-grow: 1;
  }
}

.accolade {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  margin-top: 12px;
}

.accoladeTac {
  width: 16px;
  height: 16px;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url("/tac.png");
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
