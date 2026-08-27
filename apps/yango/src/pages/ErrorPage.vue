<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { BaseIcon } from '@tac-crypto-payment/ui'

const props = defineProps<{
  title?: string
  message?: string
}>()

const route = useRoute()

const errorTitle = computed(() => props.title
  || (route.query.title as string) || 'Something went wrong')
const errorMessage = computed(() => props.message
  || (route.query.message as string) || 'Please try again later')
</script>

<template>
  <div
    :class="$style.ErrorPage"
    class="flex-1"
  >
    <div :class="$style.content">
      <BaseIcon
        name="important"
        :size="64"
        :class="$style.icon"
      />
      <h1 class="h1 center mb-8">
        {{ errorTitle }}
      </h1>
      <p class="h4 center c-text-secondary">
        {{ errorMessage }}
      </p>
    </div>
    <!--    <BaseButton
      wide
      @click="onCloseCallback()"
    >
      Go back
    </BaseButton>-->
  </div>
</template>

<style module lang="scss">
.ErrorPage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 24px 0;
  text-align: center;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.icon {
  color: var(--ypm-color-state-error);
  margin-bottom: 24px;
}
</style>
