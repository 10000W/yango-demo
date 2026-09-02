<script setup lang="ts">
import { BaseBottomSheet, BaseButton } from '@tac-crypto-payment/ui'
import { ref } from 'vue'
import { useMandate } from '../useMandate'

const { revoke } = useMandate()

const isRevoking = ref(false)
const revokeError = ref('')
const isRevokeConfirmOpen = ref(false)

const handleRevoke = async () => {
  revokeError.value = ''
  isRevoking.value = true

  try {
    await revoke()
    isRevokeConfirmOpen.value = false
  }
  catch (error) {
    revokeError.value = error instanceof Error ? error.message : 'Unable to cancel automatic payments.'
  }
  finally {
    isRevoking.value = false
  }
}
const openRevokeConfirm = () => {
  revokeError.value = ''
  isRevokeConfirmOpen.value = true
}
</script>

<template>
  <BaseButton
    variant="danger"
    wide
    @click="openRevokeConfirm"
  >
    Cancel automatic payments
  </BaseButton>

  <BaseBottomSheet
    v-model="isRevokeConfirmOpen"
    to=".tac-crypto-payment"
  >
    <div class="column align-center p-24">
      <div class="h2 mb-8 center">
        Stop automatic payments?
      </div>

      <div class="c-text-secondary mb-24 center">
        The app will no longer be able to charge you.
      </div>

      <p
        v-if="revokeError"
        class="c-text-error mb-24 center"
      >
        {{ revokeError }}
      </p>

      <div
        class="flex gap-12"
        :class="$style.confirmBtns"
      >
        <BaseButton
          class="flex-1"
          variant="danger"
          :loading="isRevoking"
          @click="handleRevoke"
        >
          Yes, cancel
        </BaseButton>
        <BaseButton
          class="flex-1"
          variant="secondary"
          :disabled="isRevoking"
          @click="isRevokeConfirmOpen = false"
        >
          Keep
        </BaseButton>
      </div>
    </div>
  </BaseBottomSheet>
</template>

<style module lang="scss">
.confirmBtns {
  width: 100%;
}
</style>
