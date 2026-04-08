<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppKit } from '@/composables/useAppKit.ts'
import { useTonConnect } from '@/composables/useTonConnect.ts'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const { isConnected: isEvmConnected, shortAddress: evmAddress, disconnect: evmDisconnect, walletInfo } = useAppKit()
const { isConnected: isTonConnected, shortAddress: tonAddress, disconnect: tonDisconnect, walletName: tonWalletName } = useTonConnect()

const handleBack = () => {
  router.push('/chain')
}

const handleDisconnectEvm = async () => {
  await evmDisconnect()
}

const handleDisconnectTon = async () => {
  await tonDisconnect()
}
</script>

<template>
  <div :class="$style.EditConnectionsPage">
    <div :class="$style.header">
      <button
        :class="$style.backButton"
        type="button"
        @click="handleBack"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h1 :class="$style.title">
        Manage Wallets
      </h1>
    </div>

    <div :class="$style.content">
      <div
        v-if="!isEvmConnected && !isTonConnected"
        :class="$style.emptyState"
      >
        <p>No wallets connected</p>
      </div>

      <div
        v-if="isEvmConnected"
        :class="$style.connection"
      >
        <div :class="$style.walletInfo">
          <span :class="$style.walletName">{{ walletInfo?.name || 'EVM Wallet' }}</span>
          <span :class="$style.address">{{ evmAddress }}</span>
        </div>
        <BaseButton
          variant="danger"
          size="small"
          @click="handleDisconnectEvm"
        >
          Disconnect
        </BaseButton>
      </div>

      <div
        v-if="isTonConnected"
        :class="$style.connection"
      >
        <div :class="$style.walletInfo">
          <span :class="$style.walletName">{{ tonWalletName || 'TON Wallet' }}</span>
          <span :class="$style.address">{{ tonAddress }}</span>
        </div>
        <BaseButton
          variant="danger"
          size="small"
          @click="handleDisconnectTon"
        >
          Disconnect
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.EditConnectionsPage {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.backButton {
  padding: 8px;
  margin-left: -8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.connection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 12px;
  border: 1px solid #eee;
}

.walletInfo {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.walletName {
  font-weight: 600;
  color: #333;
}

.address {
  font-size: 0.85rem;
  color: #666;
}

.emptyState {
  text-align: center;
  color: #666;
  margin-top: 48px;
  padding: 24px;
  background: #f8f8f8;
  border-radius: 12px;
}
</style>
