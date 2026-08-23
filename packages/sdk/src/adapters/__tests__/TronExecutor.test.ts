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
})
