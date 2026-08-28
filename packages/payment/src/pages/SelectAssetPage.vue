<script setup lang="ts">
import { AssetOption } from '@tac-crypto-payment/runtime'
import { getAssetsByPaymentOption } from '@tac-crypto-payment/runtime'
import { usePayment } from '@/usePayment'
import { useRouter } from 'vue-router'
import { PageHeader } from '@tac-crypto-payment/runtime'
import { computed, ComputedRef } from 'vue'
import { appKitNetworksMap } from '@tac-crypto-payment/runtime'
import { tronMainnet } from '@reown/appkit/networks'
import { Asset } from '@tac-crypto-payment/sdk'

const router = useRouter()
const { product, selectedPaymentOption, selectAsset, sdkInstance } = usePayment()

const assets: ComputedRef<(Asset & { gasless?: boolean })[]> = computed(() => {
  if (!selectedPaymentOption.value) {
    return []
  }
  const paymentOptionAssets = getAssetsByPaymentOption(selectedPaymentOption.value)

  switch (selectedPaymentOption.value.type) {
    case 'blockchain':
      if (!product.value) {
        return paymentOptionAssets
      }
      const productAvailableChains = product.value.availableChains
      const chainIds: (number | string)[] = product.value.evmNetworks
        .map(name => appKitNetworksMap[name].id)
      if (productAvailableChains.includes('tron')) {
        chainIds.push(+tronMainnet.id)
      }
      console.log(chainIds, paymentOptionAssets)
      return paymentOptionAssets
        .filter(asset => chainIds.includes(asset.chain.id))
        .map(asset => ({
          ...asset,
          gasless: product.value?.gasless.enabled && sdkInstance?.service.getSponsorshipMechanism
            ? !!sdkInstance.service.getSponsorshipMechanism(asset)
            : false,
        }))
    default:
      return paymentOptionAssets
  }
})

const onClickAsset = async (asset: Asset) => {
  await selectAsset(asset)
  router.replace({ name: 'payment.pay' })
}
</script>

<template>
  <div>
    <PageHeader title="Select currency" />
    <ul
      :class="$style.list"
      class="column p-0"
    >
      <li
        v-for="asset in assets"
        :key="asset.name"
      >
        <AssetOption
          :asset="asset"
          :disabled="asset.disabled"
          @click="onClickAsset(asset)"
        />
      </li>
    </ul>
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
</style>
