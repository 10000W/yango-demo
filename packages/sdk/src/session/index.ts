import axios from 'axios'
import { Asset, EvmAsset } from '../asset'

export type SessionChain = 'evm' | 'ton' | 'tron' | 'solana' | 'binance_pay' | 'bybit_pay'
export type SessionStatus = 'completed' | 'expired' | 'failed' | 'confirming' | 'pending'

export type Session = {
  id: string
  productId: string
  merchantWallet: string
  amount: string
  asset: 'USDT'
  chain: SessionChain
  status: SessionStatus
  expiresAt: string // iso date
  paymentUrl?: string
  exchangePayUrl?: string
  exchangePayQr?: string
  gasless: boolean
}

export type CreateSessionOptions = {
  payzapUrl?: string
  productId?: string
  gasless: boolean
  chain: SessionChain
  asset: Asset
}

export const createSession = async (options: CreateSessionOptions) => {
  const { payzapUrl, productId, gasless, chain, asset } = options
  const { data } = await axios.post<{ success: boolean, data: Session }>
  (`${payzapUrl}/v1/payments/session`, {
    productId: productId,
    gasless: chain === 'evm' ? gasless : undefined,
    chain,
    asset: asset.symbol,
    metadata: chain === 'evm'
      ? { chainId: (asset as EvmAsset)?.chain?.id }
      : undefined,
  })

  if (!data.success) {
    throw new Error('Failed to create session')
  }

  // return {
  //   id: '36e2fc1c-bb9c-4e14-a841-f9b548a8cc17',
  //   merchantId: '62bc763c-9256-480e-8d79-04342050cbac',
  //   status: 'pending',
  //   amount: '0.010000',
  //   asset: 'USDT',
  //   chain: 'evm',
  //   merchantWallet: '0xab57be8dbcd2e8b37662ffeb081b80d27204d7fd',
  //   txHash: null,
  //   txExplorerUrl: null,
  //   expiresAt: '2026-05-21T13:49:27.451Z',
  //   successUrl: null,
  //   exchangePayUrl: null,
  //   exchangePayQr: null,
  //   gasless: true,
  //   gasFeeUsd: '0.000000',
  //   payerAmount: '0.010000',
  //   permitData: null,
  //   gasMode: 'sponsored',
  //   gasSponsored: false,
  //   metadata: {
  //     chainId: 137,
  //     authMethod: 'sponsored',
  //     tokenAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  //   },
  //   tronEnergyDelegated: false,
  //   tronEnergyAmount: 0,
  //   failureReason: null,
  // }
  return data.data
}

export const fetchSession = async (sessionId: string, payzapUrl: string) => {
  const { data } = await axios.get<{ data: Session }>(`${payzapUrl}/v1/payments/session/${sessionId}`)
  return data.data
}
