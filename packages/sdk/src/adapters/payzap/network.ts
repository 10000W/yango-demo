import { arbitrum, base, bsc, mainnet, polygon, tronMainnet } from '@reown/appkit/networks'
import { PayZapMandateNetworks } from './types'

export type PayZapMandateNetwork = (typeof PayZapMandateNetworks)[number]

const networkNamesByChainId: Readonly<Record<number, PayZapMandateNetwork>> = {
  [mainnet.id]: 'ethereum',
  [base.id]: 'base',
  [arbitrum.id]: 'arbitrum',
  [polygon.id]: 'polygon',
  [bsc.id]: 'bsc',
  [+tronMainnet.id]: 'tron',
}

export const getNetworkName = (chainId: number): PayZapMandateNetwork => {
  const network = networkNamesByChainId[chainId]
  if (!network) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }

  return network
}
