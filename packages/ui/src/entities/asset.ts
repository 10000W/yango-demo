import { mainnet, polygon } from 'viem/chains'
import { PaymentOptionChainType } from '@/entities/payment'
import { tronMainnet } from '@reown/appkit/networks'

export type BaseAsset = {
  name: string
  symbol: string
  disabled?: boolean
  icon: string
}

export type EvmAsset = BaseAsset & {
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

export const getAssetsByPaymentOptionChain = (chain: PaymentOptionChainType) => {
  if (chain === 'evm') {
    return evmAssets
  }
  if (chain === 'tron') {
    return tronAssets
  }
  return []
}
