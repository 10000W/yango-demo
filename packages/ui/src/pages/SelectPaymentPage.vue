<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { type PaymentOption, paymentOptions } from '@/entities/payment'
import PaymentOptionComponent from '@/components/payment/PaymentOption.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseBottomSheet from '@/components/base/BaseBottomSheet.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useAppKit } from '@/composables/useAppKit'
import { useTonConnect } from '@/composables/useTonConnect'
import { usePayment } from '@/composables/usePayment'
import { createAppKitWalletButton, type Wallet } from '@reown/appkit-wallet-button'
import { tronMainnet } from '@reown/appkit/networks'

const router = useRouter()
const { selectedChain } = usePayment()
const {
  isConnected: isEvmConnected,
  modal: appkitModal,
  walletInfo,
  disconnect: disconnectEvm,
  chainId,
} = useAppKit()
const { isConnected: isTvmConnected, modal: tonconnectModal } = useTonConnect()

const isConfirmOpen = ref(false)
const confirmResolve = ref<((value: boolean) => void) | null>(null)
const pendingOption = ref<PaymentOption | null>(null)

const appKitWalletButton = createAppKitWalletButton()

const isOptionConnected = (option: PaymentOption) => {
  if (option.type === 'ton') {
    return isTvmConnected.value
  }

  if (option.type === 'evm' || option.type === 'tron') {
    if (!isEvmConnected.value) {
      return false
    }

    const connectedName = walletInfo.value?.name?.toLowerCase() || ''
    if (option.walletName) {
      return connectedName.includes(option.walletName.toLowerCase())
    }

    const otherEvmOptions = paymentOptions.filter(o => o.type === 'evm' && o.walletName)
    const matchesAnySpecific = otherEvmOptions.some(o =>
      connectedName.includes(o.walletName!.toLowerCase()),
    )

    return !matchesAnySpecific
  }

  return false
}

const confirmDisconnect = () => {
  isConfirmOpen.value = true
  return new Promise<boolean>((resolve) => {
    confirmResolve.value = resolve
  })
}

const handleConfirm = (value: boolean) => {
  isConfirmOpen.value = false
  if (confirmResolve.value) {
    confirmResolve.value(value)
    confirmResolve.value = null
  }
}

const handlePaymentOptionClick = async (option: PaymentOption) => {
  if (isOptionConnected(option)) {
    if (option.type === 'evm') {
      selectedChain.value = chainId.value === tronMainnet.id ? 'tron' : 'evm'
    }
    else {
      selectedChain.value = option.type
    }
    router.push({ name: 'asset' })
    return
  }

  switch (option.type) {
    case 'yango':
      router.push('/promo')
      return
    case 'binance_pay':
      return
    case 'ton':
      tonconnectModal.open()
      return
    case 'tron':
    case 'evm':
      if (isEvmConnected.value && !isOptionConnected(option)) {
        pendingOption.value = option
        const confirmed = await confirmDisconnect()
        if (!confirmed) {
          return
        }
        await disconnectEvm()
      }

      try {
        if (!appKitWalletButton || !appKitWalletButton.isReady()) {
          throw 'Wallet name is not provided, fallback to appkit modal'
        }

        await appKitWalletButton.connect(option.walletName as Wallet)
        selectedChain.value = chainId.value === tronMainnet.id ? 'tron' : 'evm'
        router.push({ name: 'asset' })
      }
      catch {
        if (!option.walletName) {
          appkitModal.open({
            view: 'Connect',
          })
        }
      }
      return
  }
}
</script>

<template>
  <div>
    <div
      :class="$style.title"
      class="flex justify-between align-end gap-8"
    >
      <h1 class="h1 mb-8 flex-1">
        Select payment method
      </h1>
      <RouterLink
        v-if="isEvmConnected || isTvmConnected"
        :class="$style.editLink"
        :to="{ name: 'edit' }"
      >
        <BaseIcon
          size="32"
          name="edit-wallet"
        />
      </RouterLink>
    </div>

    <ul
      :class="$style.list"
      class="column"
    >
      <li
        v-for="o in paymentOptions"
        :key="o.name"
      >
        <PaymentOptionComponent
          :payment-option="o"
          :is-connected="isOptionConnected(o)"
          @click="handlePaymentOptionClick(o)"
        />
      </li>
    </ul>

    <BaseBottomSheet
      v-model="isConfirmOpen"
      to=".tac-crypto-payment"
      @close="handleConfirm(false)"
    >
      <div class="column align-center p-24 pt-0">
        <div class="h2 mb-8 center">
          Switch wallet?
        </div>

        <div class="c-text-secondary mb-24 center">
          You are already connected with another wallet. Do you want to disconnect it and connect {{ pendingOption?.name }}?
        </div>

        <div
          class="flex gap-12"
          :class="$style.confirmBtns"
        >
          <BaseButton
            class="flex-1"
            variant="secondary"
            @click="handleConfirm(false)"
          >
            Cancel
          </BaseButton>
          <BaseButton
            class="flex-1"
            variant="primary"
            @click="handleConfirm(true)"
          >
            Confirm
          </BaseButton>
        </div>
      </div>
    </BaseBottomSheet>
  </div>
</template>

<style module lang="scss">
.title {
  width: 100%;
  margin: 0;
}

.editLink {
  color: var(--ypm-color-brand-primary);
}

.list {
  list-style: none;
  padding: 0;

  & > *:not(:last-child) {
    border-bottom: 1px solid var(--ypm-color-border-default)
  }
}

.confirmBtns {
  width: 100%;
}

.evmInfo {
  margin: 12px 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.walletIcon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.muted {
  color: var(--c-text-soft);
  font-size: 0.85rem;
}
</style>
