import {
  arbitrum,
  base,
  baseSepolia,
  bsc,
  mainnet,
  polygon,
  tronMainnet,
} from '@reown/appkit/networks'

export const appKitNetworksMap = {
  ethereum: mainnet,
  bsc: bsc,
  polygon: polygon,
  arbitrum: arbitrum,
  base: base,
  baseSepolia: baseSepolia,
  tron: tronMainnet,
} as const
