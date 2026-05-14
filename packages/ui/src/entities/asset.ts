import {
  arbitrum,
  base,
  baseSepolia,
  bsc,
  mainnet,
  polygon,
  tronMainnet,
} from '@reown/appkit/networks'
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
    chain: {
      id: polygon.id,
      name: polygon.name,
      shortName: polygon.nativeCurrency.symbol,
      color: '#8247E5',
    },
  },
  {
    name: 'Tether',
    symbol: 'USDT',
    namespace: 'eip155',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    chain: {
      id: arbitrum.id,
      name: arbitrum.name,
      shortName: arbitrum.nativeCurrency.symbol,
      color: '#97adce',
    },
  },
  {
    name: 'Tether',
    symbol: 'USDT',
    namespace: 'eip155',
    decimals: 18,
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
    address: '0x55d398326f99059ff775485246999027b3197955',
    chain: {
      id: bsc.id,
      name: bsc.name,
      shortName: bsc.nativeCurrency.symbol,
      color: '#F3BA2F',
    },
  },
  // {
  //   name: 'Tether',
  //   symbol: 'USDT',
  //   namespace: 'eip155',
  //   decimals: 6,
  //   icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
  //   address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  //   chain: {
  //     id: base.id,
  //     name: base.name,
  //     shortName: base.nativeCurrency.symbol,
  //     color: '#0052FF',
  //   },
  // },
  {
    name: 'Tether',
    symbol: 'USDT',
    namespace: 'eip155',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
    address: '0x323e78f944A9a1FcF3a10efcC5319DBb0bB6e673',
    chain: {
      id: baseSepolia.id,
      name: baseSepolia.name,
      shortName: baseSepolia.nativeCurrency.symbol,
      color: '#0052FF',
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
  // if (option.namespaces.includes('tron')) {
  //   assets.push(...tronAssets)
  // }

  return assets
}
