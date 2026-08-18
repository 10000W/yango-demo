import { Asset } from '../../asset'
import { TypedDataParameter } from 'viem'
export const PayZapEvmPaymentProviderNetworks = ['ethereum', 'base', 'arbitrum', 'polygon', 'bsc'] as const
export const PayZapPaymentGasslessChains = ['polygon', 'bsc', 'arbitrum', 'base', 'tron', 'solana'] as const

export type PayZapSessionStatus = 'completed' | 'expired' | 'failed' | 'confirming' | 'pending'
export type PayZapSessionData = {
  id: string
  merchantId: string
  status: PayZapSessionStatus
  amount: string
  asset: string
  chain: string
  merchantWallet: string
  txHash: string | null
  txExplorerUrl: string | null
  expiresAt: string
  successUrl: string | null
  exchangePayUrl: string | null
  exchangePayQr: string | null
  gasless: boolean
  gasFeeUsd: string
  payerAmount: string
  permitData: string | null
  gasMode: string
  gasSponsored: boolean
  metadata: {
    chainId: number
    authMethod: string
    tokenAddress: string
  }
  tronEnergyDelegated: boolean
  tronEnergyAmount: number | null
  failureReason: string | null
}
export type PayZapChain = 'evm' | 'ton' | 'tron' | 'solana' | 'binance_pay' | 'bybit_pay'
export type PayZapCreateSessionOptions = {
  productId: string
  gasless: boolean
  chain: PayZapChain
  asset: Asset
}
export type PayZapPermitResponse = {
  success: true
  data: {
    status: string
    sessionId: string
  }
}
export type PayZapPermitDataResponse = {
  success: boolean
  data: {
    domain: {
      name: string
      version: string
      chainId: number
      verifyingContract: `0x${string}`
    }
    types: Record<string, readonly TypedDataParameter[]>
    primaryType: string
    message: {
      owner: string
      spender: string
      value: string
      nonce: string
      deadline: string
    }
  }
}
export type PayZapSponsorGasResponse = {
  success: boolean
  data: {
    status: string
    sessionId: string
    txHash: string
    gasAmountWei: string
  }
}
export type PayZapDelegateEnergyResponse = {
  success: boolean
}
export type PayZapFeeMode = 'absorb' | 'passthrough' | 'fixed'
export type PayZapFeePayer = 'buyer' | 'merchant'
export type PayZapProductData = {
  id: string
  name: string
  description: null
  priceAmount: string
  priceCurrency: string
  availableChains: PayZapChain[]
  availableMethods: {
    id: PayZapChain
    type: string
    label: string
    color: string
  }[]
  evmNetworks: (typeof PayZapEvmPaymentProviderNetworks)[number][]
  gasless: {
    enabled: boolean
    networks: (typeof PayZapPaymentGasslessChains)[number][]
    feeMode: PayZapFeeMode
    payer: PayZapFeePayer
  }
  tip: null
}
export type PayZapSponsorshipMechanism = 'sponsor' | 'permit' | 'delegate' | null
