import { SdkError } from '../../SdkError'
import { PayZapMandateNetworks } from './types'

export type PayZapMandateNetwork = (typeof PayZapMandateNetworks)[number]
export type PayZapNetworkDefinition = Readonly<{
  type: 'evm' | 'tron'
  namespace: 'eip155' | 'tron'
  chainId: number
}>

export const payZapNetworks = {
  ethereum: { type: 'evm', namespace: 'eip155', chainId: 1 },
  base: { type: 'evm', namespace: 'eip155', chainId: 8453 },
  arbitrum: { type: 'evm', namespace: 'eip155', chainId: 42161 },
  polygon: { type: 'evm', namespace: 'eip155', chainId: 137 },
  bsc: { type: 'evm', namespace: 'eip155', chainId: 56 },
  tron: { type: 'tron', namespace: 'tron', chainId: 728126428 },
} as const satisfies Record<PayZapMandateNetwork, PayZapNetworkDefinition>

const networkEntries = Object.entries(payZapNetworks) as [
  PayZapMandateNetwork,
  (typeof payZapNetworks)[PayZapMandateNetwork],
][]

export const payZapNetworksByChainId: ReadonlyMap<number, PayZapMandateNetwork> = new Map(
  networkEntries.map(([name, network]) => [network.chainId, name]),
)

export const getNetworkName = (chainId: number | string): PayZapMandateNetwork => {
  const id = +chainId
  const network = payZapNetworksByChainId.get(id)

  if (!network) {
    throw new SdkError(`Unsupported chain ID: ${chainId}`, {
      code: 'unsupported_chain',
      details: { chainId, payZapNetworks: payZapNetworks },
    })
  }

  return network
}
