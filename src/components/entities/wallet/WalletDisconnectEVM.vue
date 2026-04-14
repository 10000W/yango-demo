<script setup lang="ts">
import { useAppKit } from '@/composables/useAppKit.ts'
import WalletDisconnect from '@/components/entities/wallet/WalletDisconnect.vue'

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
    :icon="walletInfo?.icon"
    :name="walletInfo?.name || ''"
    :wallet-address="shortAddress"
    :disconnect="handleDisconnectEvm"
  />
</template>

<style module lang="scss">

</style>
