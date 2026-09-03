// import { tronMainnet } from '@reown/appkit/networks'
import { assets as evmAssets } from './evm'
import { assets as solanaAssets } from './solana'
import { assets as tonAssets } from './ton'
import { assets as tronAssets } from './tron'

export type AssetNamespace = 'ton' | 'tron' | 'eip155'

export type Asset = {
  name: string
  namespace: AssetNamespace
  disabled?: boolean
  icon: string
  symbol: string
  address: string
  chain: {
    id: number
    name: string
    shortName: string
    color: string
  }
  decimals: number
}

export { evmAssets, solanaAssets, tonAssets, tronAssets }
