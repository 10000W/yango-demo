import { type PaymentOption } from './payment'
import { Asset, evmAssets, tronAssets } from '@tac-crypto-payment/sdk'

const chainIconUrls: Record<string, string> = {
  polygon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
  bsc: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png',
  arbitrum: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
  base: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
  tron: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png',
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
