import { tronMainnet } from '@reown/appkit/networks'
import { TronPaymentProvider } from '../payment'
import { EvmPaymentProvider } from '../payment'
import { assets as evmAssets } from './evm'
import { assets as tronAssets } from './tron'

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
    id: number | string
    name: string
    shortName: string
    color: string
  }
  decimals: number
}
export type Asset = BaseAsset | EvmAsset

export const getSponsorshipMechanism = (asset: Asset) => {
  if (!asset || !('chain' in asset)) {
    return null
  }

  switch (asset.chain.id) {
    case tronMainnet.id:
      return TronPaymentProvider.getSponsorshipMechanism(asset)
    default:
      return EvmPaymentProvider.getSponsorshipMechanism(asset)
  }
}

export { evmAssets, tronAssets }
