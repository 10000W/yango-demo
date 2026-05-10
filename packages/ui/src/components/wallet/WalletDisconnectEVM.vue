<script setup lang="ts">
import { useAppKit } from '@/composables/useAppKit'
import WalletDisconnect from '@/components/wallet/WalletDisconnect.vue'

const {
  shortAddress,
  disconnect,
  walletInfo,
} = useAppKit()

const handleDisconnectEvm = async () => {
  await disconnect()
}
</script>

<template>
  <WalletDisconnect
    :icon="walletInfo?.icon || 'evm'"
    :name="walletInfo?.name || 'Other Wallet'"
    :wallet-address="shortAddress"
    :disconnect="handleDisconnectEvm"
  />
</template>

<style module lang="scss">

</style>
