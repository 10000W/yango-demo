<script setup lang="ts">
import StackableCard from '@/components/StackableCard.vue'
import { BaseIcon } from '@tac-crypto-payment/ui'
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  label: string
  value?: string | null
  copyable?: boolean
}>()

const { copy, copied } = useClipboard({ source: () => props.value || '' })
</script>

<template>
  <StackableCard>
    <p class="c-text-secondary mb-2">
      {{ label }}
    </p>
    <div :class="{ 'flex align-center gap-12': copyable }">
      <p
        class="h3"
        :class="[$style.value, { wrap: copyable }]"
      >
        {{ value || 'Unknown' }}
      </p>
      <BaseIcon
        v-if="copyable"
        :name="copied ? 'check' : 'copy'"
        class="c-text-secondary ml-auto pointer"
        @click="copy()"
      />
    </div>
  </StackableCard>
</template>

<style module lang="scss">
.value {
  overflow: hidden;
  word-wrap: break-word;
  display: block;
}
</style>
