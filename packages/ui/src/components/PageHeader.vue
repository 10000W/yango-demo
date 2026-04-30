<script setup lang="ts">
import BaseIcon from '@ui/components/base/BaseIcon.vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['back'])
const router = useRouter()

defineProps<{ title?: string, backDisabled?: boolean }>()

const handleBack = () => {
  emit('back')
  router.replace('/')
}
</script>

<template>
  <div
    :class="$style.PageHeader"
    class="flex between align-end gap-4"
  >
    <div>
      <BaseIcon
        v-if="!backDisabled"
        role="button"
        name="chevron-left"
        @click="handleBack"
      />
    </div>

    <p
      v-if="title"
      class="h3 center"
    >
      {{ title }}
    </p>

    <slot v-else />

    <div :class="$style.right" />
  </div>
</template>

<style module lang="scss">
.PageHeader {
  height: 54px;
  padding-bottom: 11px;
}

.right {
  width: 24px;
}
</style>
