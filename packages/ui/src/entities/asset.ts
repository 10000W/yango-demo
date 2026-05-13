import { mainnet, polygon, tronMainnet } from '@reown/appkit/networks'
import { type PaymentOption, type PaymentOptionChainNamespace } from '@/entities/payment'

export type BaseAsset = {
  name: string
  symbol: string
  disabled?: boolean
  icon: string
}

export type EvmAsset = BaseAsset & {
  namespace: PaymentOptionChainNamespace
  address: string
  gasless: boolean
  chain: {
    id: number | string
    name: string
    shortName: string
    color: string
  }
  decimals: number
}
export type Asset = BaseAsset | EvmAsset

export const evmAssets: EvmAsset[] = [
  {
    name: 'Tether',
    symbol: 'USDT',
    namespace: 'eip155',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    gasless: false,
    chain: {
      id: mainnet.id,
      name: mainnet.name,
      shortName: mainnet.nativeCurrency.symbol,
      color: '#627EEA',
    },
  },
  {
    name: 'Tether',
    symbol: 'USDT',
    namespace: 'eip155',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    gasless: true,
    chain: {
      id: polygon.id,
      name: polygon.name,
      shortName: polygon.nativeCurrency.symbol,
      color: '#8247E5',
    },
  },
]
export const tronAssets: EvmAsset[] = [
  {
    name: 'Tether',
    symbol: 'USDT',
    namespace: 'tron',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    gasless: true,
    chain: {
      id: tronMainnet.id,
      name: tronMainnet.name,
      shortName: tronMainnet.nativeCurrency.symbol,
      color: '#FF060A',
    },
  },
]

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
