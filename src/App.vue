<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseSpinner from '@/components/base/BaseSpinner.vue'

const router = useRouter()
const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
    router.replace({ name: 'chain' })
  }, 2300)
})
</script>

<template>
  <main>
    <div
      v-if="isLoading"
      :class="$style.loader"
    >
      <BaseSpinner />
    </div>
    <RouterView v-else />
  </main>
</template>

<style module lang="scss">
@use "@/assets/styles/main" as *;

.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
