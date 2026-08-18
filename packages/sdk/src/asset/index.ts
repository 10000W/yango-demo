// import { tronMainnet } from '@reown/appkit/networks'
import { assets as evmAssets } from './evm'
import { assets as tronAssets, TronAsset } from './tron'

export type AssetNamespace = 'ton' | 'tron' | 'eip155'
export type BaseAsset = {
  name: string
  symbol: string
  disabled?: boolean
  icon: string
}

export type EvmAsset = BaseAsset & {
  namespace: AssetNamespace
  address: string
  chain: {
    id: number
    name: string
    shortName: string
    color: string
  }
  decimals: number
}
export type Asset = BaseAsset | EvmAsset | TronAsset

export { evmAssets, tronAssets }
