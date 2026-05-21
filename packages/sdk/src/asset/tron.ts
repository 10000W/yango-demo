import { tronMainnet } from '@reown/appkit/networks'
import { EvmAsset } from './index'

export const assets: EvmAsset[] = [
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
