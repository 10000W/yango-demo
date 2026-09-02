import { type PaymentOption } from './payment'
import { Asset, evmAssets, tronAssets } from '@tac-crypto-payment/sdk'
import arbitrumIcon from '@tac-crypto-payment/ui/assets/crypto/arbitrum.svg?url'
import baseIcon from '@tac-crypto-payment/ui/assets/crypto/base.svg?url'
import bscIcon from '@tac-crypto-payment/ui/assets/crypto/bsc.svg?url'
import ethereumIcon from '@tac-crypto-payment/ui/assets/crypto/ethereum.svg?url'
import polygonIcon from '@tac-crypto-payment/ui/assets/crypto/polygon.svg?url'
import tronIcon from '@tac-crypto-payment/ui/assets/crypto/tron.svg?url'

const chainIconUrls: Record<string, string> = {
  polygon: polygonIcon,
  bsc: bscIcon,
  arbitrum: arbitrumIcon,
  base: baseIcon,
  tron: tronIcon,
  ethereum: ethereumIcon,
}

export const getChainIconUrl = (chain: string) => chainIconUrls[chain.toLowerCase()]

export const getAssetIconUrl = (asset?: string | Asset) => {
  if (typeof asset !== 'string') {
    return asset?.icon
  }

  const name = asset.toLowerCase()
  return [...evmAssets, ...tronAssets].find(item =>
    item.name.toLowerCase() === name || item.symbol.toLowerCase() === name,
  )?.icon
}

export const getAssetsByPaymentOption = (option: PaymentOption) => {
  if (option.type !== 'blockchain') {
    return []
  }

  const assets: Asset[] = []
  if (option.namespaces.includes('eip155')) {
    assets.push(...evmAssets)
  }
  if (option.namespaces.includes('tron')) {
    assets.push(...tronAssets)
  }

  return assets
}
