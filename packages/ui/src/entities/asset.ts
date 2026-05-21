import { type PaymentOption, type PaymentOptionChainNamespace } from '@/entities/payment'
import { EvmAsset, evmAssets, tronAssets } from '@tac-crypto-payment/sdk'

export const getAssetsByPaymentOption = (option: PaymentOption) => {
  if (option.type !== 'blockchain') {
    return []
  }

  const assets: EvmAsset[] = []
  if (option.namespaces.includes('eip155')) {
    assets.push(...evmAssets)
  }
  if (option.namespaces.includes('tron')) {
    assets.push(...tronAssets)
  }

  return assets
}
