<script setup lang="ts">
import { getAssetsByPaymentOption } from '@/entities/asset'
import PageHeader from '@/components/PageHeader.vue'
import { computed, ComputedRef, ref } from 'vue'
import { appKitNetworksMap } from '@/entities/appkit'
import { tronMainnet } from '@reown/appkit/networks'
import { Asset, EvmAsset } from '@tac-crypto-payment/sdk'
import { useMandate } from '@/composables/useMandate'
import AssetOptionSelectable from '@/components/assets/AssetOptionSelectable.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { TronAsset } from '@tac-crypto-payment/sdk/asset/tron'
import { useRouter } from 'vue-router'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/vue'
import { useAppKit } from '@/composables/useAppKit'
import BaseAlert from '@/components/base/BaseAlert.vue'

const router = useRouter()
const { selectedPaymentOption, mandate, selectedAsset, approve } = useMandate()
const {
  isConnected,
  chainId,
  modal,
} = useAppKit()
const evmAccount = useAppKitAccount({ namespace: 'eip155' })
const tronAccount = useAppKitAccount({ namespace: 'tron' })

const isSubmitting = ref(false)
const submitError = ref('')

const selectedAssetAddress = computed(() => {
  return (selectedAsset.value as EvmAsset)?.address
})
const assets: ComputedRef<Asset[]> = computed(() => {
  if (!selectedPaymentOption.value) {
    return []
  }
  const paymentOptionAssets = getAssetsByPaymentOption(selectedPaymentOption.value)

  switch (selectedPaymentOption.value.type) {
    case 'blockchain':
      const supportedNetworks = mandate.value?.data.supportedNetworks || []
      const chainIds: (number | string)[] = supportedNetworks
        .map(name => appKitNetworksMap[name]?.id)
      if (supportedNetworks.includes('tron')) {
        chainIds.push(tronMainnet.id)
      }
      return paymentOptionAssets.filter(asset => chainIds.includes(asset.chain.id))
    default:
      return paymentOptionAssets
  }
})
const namespace = computed(() => {
  return selectedAsset.value && 'namespace' in selectedAsset.value
    ? selectedAsset.value.namespace
    : undefined
})
const isNamespaceSupported = computed(() => {
  if (!isConnected.value) {
    return true
  }
  if (namespace.value === 'eip155') {
    return evmAccount.value.isConnected
  }
  if (namespace.value === 'tron') {
    return tronAccount.value.isConnected
  }
  return true
})
const isCorrectChain = computed(() => {
  if (!selectedAsset.value || !('chain' in selectedAsset.value) || !isConnected.value || !isNamespaceSupported.value) {
    return true
  }
  return +(chainId.value || 0) === selectedAsset.value.chain.id
})

const onClickAsset = async (asset: EvmAsset | TronAsset) => {
  console.log(asset)
  selectedAsset.value = asset
  // await selectAsset(asset)
  // router.replace('/pay')
}
const switchNetwork = async () => {
  const asset = selectedAsset.value
  if (!modal || !asset || !('chain' in asset)) {
    throw new Error('Unable to switch network, connector is not ready')
  }

  const network = Object.values(appKitNetworksMap).find((n) => {
    return +n.id === +asset.chain.id
  })
  console.log(asset.chain.id)
  if (!network) {
    throw new Error(`Unable to find network ${asset.chain.name} in current wallet.`)
  }

  const appKitNetwork = useAppKitNetwork()
  await appKitNetwork.value.switchNetwork(network)

  console.log(isCorrectChain.value)
  if (!isCorrectChain.value) {
    throw new Error(`Unable to switch network to ${asset.chain.name}.`)
  }
}
const submit = async () => {
  try {
    isSubmitting.value = true
    submitError.value = ''

    if (!isCorrectChain.value) {
      await switchNetwork()
    }

    await approve()
    router.replace('/status')
  }
  catch (e) {
    console.warn(e)
    submitError.value = e instanceof Error ? e.message : 'Unable to approve automatic payments.'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="column gap-16">
    <div class="flex-1">
      <PageHeader title="" />
      <h1 class="h1 mb-8">
        Allow automatic payments
      </h1>
      <p class="c-text-secondary mb-24">
        Give permission in your wallet to charge your rides automatically.
      </p>

      <p class="mb-12">
        Select token
      </p>

      <ul
        :class="$style.list"
        class="column p-0 "
      >
        <li
          v-for="asset in assets"
          :key="asset.name"
        >
          <AssetOptionSelectable
            v-if="'address' in asset"
            :model-value="selectedAssetAddress"
            :value="asset.address"
            :asset="asset"
            :disabled="asset.disabled"
            @click="onClickAsset(asset)"
          />
        </li>
      </ul>
    </div>

    <div
      :class="$style.bottom"
      class="column gap-8"
    >
      <BaseAlert
        v-if="submitError"
        variant="error"
      >
        {{ submitError }}
      </BaseAlert>

      <BaseButton
        wide
        :disabled="!selectedAssetAddress || isSubmitting"
        :loading="isSubmitting"
        @click="submit"
      >
        Give permission
      </BaseButton>

      <BaseButton
        wide
        variant="transparent"
        :disabled="!selectedAssetAddress || isSubmitting"
        @click="$router.push('/edit-allowance')"
      >
        <div class="flex align-center gap-8">
          <BaseIcon
            name="pencil"
            :size="22"
          />
          Edit permission
        </div>
      </BaseButton>
    </div>
  </div>
</template>

<style module lang="scss">
.title {
  margin-bottom: 8px;
}

.description {
  color: var(--c-text-soft);
  margin-bottom: 24px;
}

.list {
  list-style: none;
  margin-top: 4px;

  & > *:not(:last-child) {
    border-bottom: 1px solid var(--ypm-color-border-default)
  }
}

.bottom {
  background: var(--ypm-color-bg-primary);
  position: sticky;
  bottom: 0;
  padding-bottom: 16px;
}
</style>
