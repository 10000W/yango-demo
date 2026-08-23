import { describe, expect, it, vi } from 'vitest'
import type { WalletClient } from 'viem'
import { EvmExecutor } from '../EvmExecutor'
import { ExecutorError } from '../../executor'
import { evmAsset } from '../../__tests__/fixtures'

describe('EvmExecutor', () => {
  it('rejects assets without an address', () => {
    const executor = new EvmExecutor({} as WalletClient)
    expect(() => executor.validateAsset({ ...evmAsset, address: '' })).toThrow(ExecutorError)
    expect(() => executor.validateAsset({
      ...evmAsset,
      address: '',
    })).toThrow(expect.objectContaining({ code: 'invalid_asset' }))
  })
  it('emits a failed transfer event for an invalid amount before using the wallet', async () => {
    const executor = new EvmExecutor({} as WalletClient)
    const onUpdate = vi.fn()
    await expect(executor.transfer({
      asset: evmAsset,
      amount: 'not-an-amount',
      fromAddress: '0x2222222222222222222222222222222222222222',
      toAddress: '0x1111111111111111111111111111111111111111',
    }, onUpdate)).rejects.toMatchObject({ code: 'invalid_amount', operation: 'transfer' })
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ type: 'transfer:failed' }))
  })
})
