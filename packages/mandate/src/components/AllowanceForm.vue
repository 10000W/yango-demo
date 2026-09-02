<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, BaseInput, BaseSwitch } from '@tac-crypto-payment/ui'
import { isInfiniteAllowanceAmount } from '../entities/allowance'
import {
  appKitNetworksMap,
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
} from '@tac-crypto-payment/runtime'

type AllowanceValues = {
  amount: string
  isInfinite: boolean
}

type WalletNamespace = 'eip155' | 'tron' | 'solana'

const {
  amount,
  isInfinite,
  assetSymbol,
  walletNamespace,
  walletAddress,
  targetChainId,
  submitLabel = 'Save changes',
  connectLabel = 'Connect wallet',
  onSubmit,
} = defineProps<{
  amount: string
  isInfinite: boolean
  assetSymbol: string
  walletNamespace?: WalletNamespace
  walletAddress?: string
  targetChainId?: number
  submitLabel?: string
  connectLabel?: string
  onSubmit: (values: AllowanceValues) => void | Promise<void>
}>()

const { modal, chainId } = useAppKit()
const evmAccount = useAppKitAccount({ namespace: 'eip155' })
const tronAccount = useAppKitAccount({ namespace: 'tron' })
const solanaAccount = useAppKitAccount({ namespace: 'solana' })
const localAmount = ref(amount)
const localIsInfinite = ref(isInfinite || isInfiniteAllowanceAmount(amount))
const error = ref('')
const isSubmitting = ref(false)
const isCorrectNetwork = computed(() => !targetChainId || +(chainId.value ?? 0) === targetChainId)

const isMatchingWalletConnected = computed(() => {
  if (!walletNamespace || !walletAddress) {
    return true
  }

  const account = walletNamespace === 'eip155'
    ? evmAccount.value
    : walletNamespace === 'tron'
      ? tronAccount.value
      : solanaAccount.value
  if (!account.isConnected || !account.address) {
    return false
  }

  return walletNamespace === 'eip155'
    ? account.address.toLowerCase() === walletAddress.toLowerCase()
    : account.address === walletAddress
})

const connectWallet = async () => {
  if (modal && walletNamespace) {
    await modal.open({ view: 'Connect', namespace: walletNamespace })
  }
}

const switchNetwork = async () => {
  if (isCorrectNetwork.value || !targetChainId) {
    return
  }

  const network = Object.values(appKitNetworksMap).find(item => +item.id === targetChainId)
  if (!network) {
    throw new Error('The network for this payment method is unavailable.')
  }

  const appKitNetwork = useAppKitNetwork()
  await appKitNetwork.value.switchNetwork(network)

  if (!isCorrectNetwork.value) {
    throw new Error(`Unable to switch to ${network.name}.`)
  }
}

const submit = async () => {
  if (!localIsInfinite.value) {
    const value = parseFloat(localAmount.value)
    if (isNaN(value) || value <= 0) {
      error.value = 'Please enter a valid amount'
      return
    }
  }

  error.value = ''
  isSubmitting.value = true
  try {
    await switchNetwork()
    await onSubmit({
      amount: localAmount.value,
      isInfinite: localIsInfinite.value,
    })
  }
  catch (submitError) {
    error.value = submitError instanceof Error ? submitError.message : 'Unable to save permission changes.'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="column gap-24 flex-1">
    <div class="column gap-8">
      <p>
        Spending cap
      </p>
      <BaseInput
        v-model="localAmount"
        :caption="assetSymbol"
        placeholder="200"
        maxlength="36"
        autocomplete="off"
        step="0.1"
        inputmode="decimal"
        :disabled="localIsInfinite || isSubmitting"
        :error="error"
      />

      <p class="c-text-secondary">
        We can charge up to this amount before you approve again.
      </p>
    </div>

    <div class="flex justify-between align-center gap-16">
      <BaseSwitch
        v-model="localIsInfinite"
        aria-label="Infinite amount"
        :disabled="isSubmitting"
      />

      <div class="column">
        <p class="p2">
          Infinite amount
        </p>
        <p class="p3 c-text-secondary">
          No limit for payments
        </p>
      </div>
    </div>

    <BaseButton
      wide
      :loading="isSubmitting"
      @click="isMatchingWalletConnected ? submit() : connectWallet()"
    >
      {{ isMatchingWalletConnected ? submitLabel : connectLabel }}
    </BaseButton>
  </div>
</template>
