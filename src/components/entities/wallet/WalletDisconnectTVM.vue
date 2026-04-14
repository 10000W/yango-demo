<script setup lang="ts">
import { useTonConnect } from '@/composables/useTonConnect.ts'
import WalletDisconnect from '@/components/entities/wallet/WalletDisconnect.vue'

const {
  shortAddress,
  disconnect,
  walletName,
} = useTonConnect()

const handleDisconnectTon = async () => {
  await disconnect()
}
</script>

<template>
  <WalletDisconnect
    icon="/icons/ton.svg"
    :name="walletName || 'TON Wallet'"
    :wallet-address="shortAddress"
    :disconnect="handleDisconnectTon"
  />
</template>

<style scoped lang="scss">

</style>
