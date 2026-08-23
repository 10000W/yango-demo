import { describe, expect, it, vi } from 'vitest'
import type { WalletClient } from 'viem'
import { EvmExecutor } from '../../EvmExecutor'
import { PayZapPayment } from '../PayZapPayment'
import type { PayZapService } from '../PayZapService'
import type { PayZapSessionData } from '../types'
import type { EvmAsset } from '../../../asset'

const asset: EvmAsset = {
  name: 'USD Coin',
  symbol: 'USDC',
  namespace: 'eip155',
  decimals: 6,
  icon: '',
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  chain: { id: 8453, name: 'Base', shortName: 'ETH', color: '#0052FF' },
}
const createSession = (overrides: Partial<PayZapSessionData> = {}): PayZapSessionData => ({
  id: 'session-1',
  merchantId: 'merchant-1',
  status: 'pending',
  amount: '5.00',
  payerAmount: '5.10',
  asset: 'USDC',
  chain: 'evm',
  merchantWallet: '0x1111111111111111111111111111111111111111',
  txHash: null,
  txExplorerUrl: null,
  expiresAt: '2099-01-01T00:00:00.000Z',
  successUrl: null,
  exchangePayUrl: null,
  exchangePayQr: null,
  gasless: false,
  gasFeeUsd: '0',
  permitData: null,
  gasMode: 'none',
  gasSponsored: false,
  metadata: { chainId: 8453, authMethod: 'wallet', tokenAddress: asset.address },
  tronEnergyDelegated: false,
  tronEnergyAmount: null,
  failureReason: null, ...overrides,
})
const createService = (initial: PayZapSessionData, refreshed = initial) => ({
  createSession: vi.fn().mockResolvedValue(initial),
  getSession: vi.fn().mockResolvedValue(refreshed),
  getSponsorshipMechanism: vi.fn().mockReturnValue(null),
}) as unknown as PayZapService
const createExecutor = () => {
  const executor = new EvmExecutor({} as WalletClient)
  executor.transfer = vi.fn().mockResolvedValue({ transactionHash: '0xtransaction' })
  return executor
}
const createPayment = (service: PayZapService) => PayZapPayment.create({
  productId: 'product-1',
  chain: 'evm',
  gasless: false,
  asset,
  payZapService: service,
})

describe('PayZapPayment', () => {
  it('uses the refreshed server payer amount for the transfer', async () => {
    const payment = await createPayment(createService(createSession(), createSession({ payerAmount: '5.25' })))
    const executor = createExecutor()
    await payment.pay({ executor, fromAddress: '0x2222222222222222222222222222222222222222' })
    expect(executor.transfer).toHaveBeenCalledWith(expect.objectContaining({ amount: '5.25' }), undefined)
  })
  it('rejects a session whose token does not match the requested asset', async () => {
    await expect(createPayment(createService(createSession({ asset: 'USDT' })))).rejects.toMatchObject({ code: 'session_mismatch' })
  })
  it('rejects a changed token address before submitting a transfer', async () => {
    const payment = await createPayment(createService(createSession(), createSession({
      metadata: {
        chainId: 8453,
        authMethod: 'wallet',
        tokenAddress: '0x0000000000000000000000000000000000000001',
      },
    })))
    const executor = createExecutor()
    await expect(payment.pay({
      executor,
      fromAddress: '0x2222222222222222222222222222222222222222',
    })).rejects.toMatchObject({ code: 'session_mismatch' })
    expect(executor.transfer).not.toHaveBeenCalled()
  })
  it('rejects a session with an invalid payer amount', async () => {
    await expect(createPayment(createService(createSession({ payerAmount: '0' })))).rejects.toMatchObject({ code: 'session_mismatch' })
  })
})
