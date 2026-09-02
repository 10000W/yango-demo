import { Asset } from '../../asset'
import { TypedDataParameter } from 'viem'
export const PayZapEvmPaymentProviderNetworks = ['ethereum', 'base', 'arbitrum', 'polygon', 'bsc'] as const
export const PayZapMandateNetworks = [...PayZapEvmPaymentProviderNetworks, 'tron'] as const
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
  payerAmount: string | null
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
export type PayZapMandateSetupDataMethod = {
  id: string
  kind: 'evm_wallet' | 'tron_wallet' | 'binance_pay' | 'solana_wallet' // evm_wallet, ...
  isActive: boolean
  revokedAt?: string | null
  network: (typeof PayZapMandateNetworks)[number]
  tokenSymbol: string
  customerWallet: string
  capUnits: string
  tokenDecimals: number
}
export type PayZapMandateSetupData = {
  id: string
  status: 'active' | 'pending' | 'revoked' | 'expired'
  customerRef: string
  setupExpiresAt: string
  spenderAddress: string
  availableKinds: PayZapMandateSetupDataMethod['kind']
  supportedNetworks: PayZapMandateSetupDataMethod['network'][]
  merchant: {
    brandName: string | null
    logoUrl: string | null
    accentColor: string | null
  }
  methods: PayZapMandateSetupDataMethod[]
}
export type PayZapMandateSetupResponse = {
  success: boolean
  data: PayZapMandateSetupData
}

export type PayZapActivateMandateMethodResponse = {
  success: boolean
  data: Pick<PayZapMandateSetupData, 'methods'>
}
export type PayZapRevokeMandateMethodResponse = PayZapActivateMandateMethodResponse

export type PayZapSetMandateSetupOptionsBase = {
  kind: PayZapMandateSetupDataMethod['kind']

}
export type PayZapSetMandateSetupOptionsChain = PayZapSetMandateSetupOptionsBase & {
  kind: 'evm_wallet' | 'tron_wallet' | 'solana_wallet'
  network: (typeof PayZapMandateNetworks)[number]
  tokenSymbol: string
  customerWallet: string
}
export type PayZapSetMandateSetupOptionsBinance = PayZapSetMandateSetupOptionsBase & {
  kind: 'binance_pay'
  amount: number
}
export type PayZapSetMandateSetupOptions
  = PayZapSetMandateSetupOptionsChain | PayZapSetMandateSetupOptionsBinance
export type PayZapMandateSetupBinanceKindResponse = {
  qrcodeLink: string | null
  qrContent: string | null
  deeplink: string | null
  expiresAt: number | null
}

export type PayZapMandateSetupChainKindResponse = {
  mandate: {
    id: string
    status: PayZapMandateSetupData['status']
    customerRef: string
    setupExpiresAt: string
    metadata: Record<string, unknown>
    createdAt: string
  }
  methodId: string
}

export type PayZapRevokeMandateSetupResponse = {
  success: boolean
  data: {
    id: string
    status: PayZapMandateSetupData['status']
    customerRef: string
    setupExpiresAt: string
    revokeReason: string
    metadata: Record<string, unknown>
    createdAt: string
  }
}
