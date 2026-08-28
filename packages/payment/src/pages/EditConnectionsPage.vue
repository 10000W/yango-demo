<script setup lang="ts">
import { useAppKit } from '@tac-crypto-payment/runtime'
import { PageHeader } from '@tac-crypto-payment/runtime'
import { WalletDisconnectEVM } from '@tac-crypto-payment/runtime'

const { isConnected: isEvmConnected } = useAppKit()
</script>

<template>
  <div :class="$style.EditConnectionsPage">
    <PageHeader title="Connected wallets" />

    <div
      :class="$style.content"
      class="column"
    >
      <div
        v-if="!isEvmConnected"
        :class="$style.emptyState"
      >
        <p>No wallets connected</p>
      </div>

      <WalletDisconnectEVM v-if="isEvmConnected" />
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
