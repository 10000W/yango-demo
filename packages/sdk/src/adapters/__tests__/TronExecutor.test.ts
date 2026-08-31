import { describe, expect, it, vi } from 'vitest'
import type { TronConnector } from '@reown/appkit-adapter-tron'
import { TronExecutor } from '../TronExecutor'
import { ExecutorError } from '../../executor'
import { tronAsset } from '../../__tests__/fixtures'

describe('TronExecutor', () => {
  it('rejects assets with invalid decimals', () => {
    const executor = new TronExecutor({} as TronConnector)
    expect(() => executor.validateAsset({ ...tronAsset, decimals: -1 })).toThrow(ExecutorError)
    expect(() => executor.validateAsset({
      ...tronAsset,
      decimals: -1,
    })).toThrow(expect.objectContaining({ code: 'invalid_asset' }))
  })
  it('emits a failed transfer event for an invalid amount before contacting TronGrid', async () => {
    const executor = new TronExecutor({} as TronConnector)
    const onUpdate = vi.fn()
    await expect(executor.transfer({
      asset: tronAsset,
      amount: 'not-an-amount',
      fromAddress: 'TXm7M5w5aQd9V1oJQ6L3QnN6kB4qP3p8YF',
      toAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    }, onUpdate)).rejects.toMatchObject({ code: 'invalid_amount', operation: 'transfer' })
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ type: 'transfer:failed' }))
  })

  it('uses WalletConnect transaction wrapping and broadcasts a signature-only response', async () => {
    const request = vi.fn().mockResolvedValue({ result: { signature: '0xsigned' } })
    const executor = new TronExecutor({
      type: 'WALLET_CONNECT',
      request,
      internalRequest: vi.fn(),
      provider: { request: vi.fn() },
    } as unknown as TronConnector)
    const sendRawTransaction = vi.spyOn(executor.tronWeb.trx, 'sendRawTransaction').mockResolvedValue({
      result: true,
      txid: 'broadcast-hash',
    } as never)

    const hash = await (executor as unknown as { _sendTransaction: (tx: unknown) => Promise<string> })._sendTransaction({
      transaction: { raw_data: { contract: [{ parameter: { value: { data: 'a9059cbb' } } }] } },
    })

    expect(hash).toBe('broadcast-hash')
    expect(request).toHaveBeenCalledWith(expect.objectContaining({
      method: 'tron_signTransaction',
      params: expect.objectContaining({
        transaction: expect.objectContaining({ transaction: expect.any(Object) }),
      }),
    }))
    expect(sendRawTransaction).toHaveBeenCalledWith(expect.objectContaining({
      signature: ['signed'],
    }))
  })

  it('uses the raw transaction for WalletConnect sessions negotiated with Tron RPC v1', async () => {
    const request = vi.fn().mockResolvedValue({ signature: 'signed' })
    const executor = new TronExecutor({
      type: 'WALLET_CONNECT',
      request,
      internalRequest: vi.fn(),
      provider: {
        request: vi.fn(),
        session: { sessionProperties: { tron_method_version: 'v1' } },
      },
    } as unknown as TronConnector)
    vi.spyOn(executor.tronWeb.trx, 'sendRawTransaction').mockResolvedValue({
      result: true,
      txid: 'broadcast-hash',
    } as never)

    const transaction = { raw_data: { contract: [{ parameter: { value: { data: 'a9059cbb' } } }] } }
    await (executor as unknown as { _sendTransaction: (tx: unknown) => Promise<string> })._sendTransaction({ transaction })

    expect(request).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ transaction }),
    }))
  })

  it('falls back to tron_sendTransaction when the wallet does not support signing', async () => {
    const request = vi.fn()
      .mockRejectedValueOnce({ code: -32601, message: 'the method tron_signTransaction does not exist/is not available' })
      .mockResolvedValueOnce({ result: true, txid: 'wallet-broadcast-hash' })
    const executor = new TronExecutor({
      type: 'WALLET_CONNECT',
      request,
      internalRequest: vi.fn(),
      provider: { request: vi.fn() },
    } as unknown as TronConnector)
    vi.spyOn(executor.tronWeb.trx, 'getTransaction').mockResolvedValue({ txID: 'wallet-broadcast-hash' } as never)

    const hash = await (executor as unknown as { _sendTransaction: (tx: unknown) => Promise<string> })._sendTransaction({
      transaction: { raw_data: { contract: [{ parameter: { value: { data: 'a9059cbb' } } }] } },
    })

    expect(hash).toBe('wallet-broadcast-hash')
    expect(request).toHaveBeenNthCalledWith(1, expect.objectContaining({ method: 'tron_signTransaction' }))
    expect(request).toHaveBeenNthCalledWith(2, expect.objectContaining({ method: 'tron_sendTransaction' }))
  })
})
