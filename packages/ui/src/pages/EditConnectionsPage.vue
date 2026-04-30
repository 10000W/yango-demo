<script setup lang="ts">
import { useAppKit } from '@ui/composables/useAppKit'
import { useTonConnect } from '@ui/composables/useTonConnect'
import PageHeader from '@ui/components/PageHeader.vue'
import WalletDisconnectEVM from '@ui/components/entities/wallet/WalletDisconnectEVM.vue'
import WalletDisconnectTVM from '@ui/components/entities/wallet/WalletDisconnectTVM.vue'

const { isConnected: isEvmConnected } = useAppKit()
const { isConnected: isTonConnected } = useTonConnect()
</script>

<template>
  <div :class="$style.EditConnectionsPage">
    <PageHeader title="Connected wallets" />

    <div
      :class="$style.content"
      class="column"
    >
      <div
        v-if="!isEvmConnected && !isTonConnected"
        :class="$style.emptyState"
      >
        <p>No wallets connected</p>
      </div>

      <WalletDisconnectEVM v-if="isEvmConnected" />

      <WalletDisconnectTVM v-if="isTonConnected" />
    </div>
  </div>
</template>

<style module lang="scss">
.EditConnectionsPage {
  display: flex;
  flex-direction: column;
}

.content {
  & > *:not(:last-child) {
    border-bottom: 1px solid var(--ypm-color-border-default)
  }
}

.emptyState {
  text-align: center;
  color: var(--c-text-soft);
  margin-top: 48px;
  padding: 24px;
  background: var(--c-bg-soft);
  border-radius: 12px;
}
</style>
