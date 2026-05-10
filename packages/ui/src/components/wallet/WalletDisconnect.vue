<script setup lang="ts">

import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseBottomSheet from '@/components/base/BaseBottomSheet.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { ref } from 'vue'

// defineEmits(['disconnect'])
const { icon = '', disconnect } = defineProps<{
  icon?: string
  name: string
  walletAddress: string
  disconnect: () => void
}>()

const isModalOpen = ref(false)

const openConfirmModal = () => {
  isModalOpen.value = true
}

const handleDisconnect = () => {
  disconnect()
  isModalOpen.value = false
}
</script>

<template>
  <div
    :class="$style.WalletDisconnect"
    class="gap-16 between align-center"
  >
    <BaseIcon
      v-if="icon === 'evm'"
      name="other-wallets"
      size="54"
      :class="$style.icon"
    />

    <div
      v-else-if="icon"
      :style="{ backgroundImage: `url(${icon})`}"
      :class="$style.icon"
    />

    <div class="column gap-2 flex-1">
      <div class="p1">
        {{ name }}
      </div>

      <div class="p3 c-text-secondary">
        {{ walletAddress }}
      </div>
    </div>

    <BaseIcon
      class="c-text-primary"
      role="button"
      name="trash"
      @click="openConfirmModal"
    />
  </div>

  <BaseBottomSheet
    v-model="isModalOpen"
    to=".tac-crypto-payment"
  >
    <div
      :class="$style.confirmModal"
      class="column align-center p-16"
    >
      <BaseIcon
        v-if="icon === 'evm'"
        class="mb-16"
        :class="$style.confirmIcon"
        name="other-wallets"
        size="67"
      />
      <div
        v-else-if="icon"
        class="mb-16"
        :class="$style.confirmIcon"
        :style="{ backgroundImage: `url(${icon})`}"
      />

      <div class="h2 mb-4 center">
        Disconnect {{ name }}
      </div>

      <div class="c-text-secondary mb-24">
        Do you really want to unlink the wallet?
      </div>

      <div
        :class="$style.confirmBtns"
        class="flex gap-8"
      >
        <BaseButton
          class="flex-1"
          variant="primary"
          @click="isModalOpen = false"
        >
          Cancel
        </BaseButton>
        <BaseButton
          class="flex-1"
          variant="secondary"
          @click="handleDisconnect"
        >
          Disconnect
        </BaseButton>
      </div>
    </div>
  </BaseBottomSheet>
</template>

<style module lang="scss">
.WalletDisconnect {
  padding: 8px 0;
  min-height: 54px;
}

.icon, .confirmIcon {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  color: var(--ypm-color-brand-primary);
}

.confirmIcon {
  width: 67px;
  height: 67px;
}

.confirmBtns {
  width: 100%;
}
</style>
