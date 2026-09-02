import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { ServiceError } from '../../../service'
import { PayZapService } from '../PayZapService'
import { evmAsset, tronAsset } from '../../../__tests__/fixtures'

describe('PayZapService', () => {
  it('sends the EVM session request with the server-required payload and idempotency key', async () => {
    const service = new PayZapService()
    const post = vi.fn().mockResolvedValue({ data: { success: true, data: { id: 'session-1' } } })
    service.http = { post } as unknown as AxiosInstance
    const controller = new AbortController()

    await service.createSession({
      productId: 'product-1',
      chain: 'evm',
      gasless: true,
      asset: evmAsset,
    }, { idempotencyKey: 'request-1', abortSignal: controller.signal })

    expect(post).toHaveBeenCalledWith('/v1/payments/session', {
      productId: 'product-1',
      chain: 'evm',
      gasless: true,
      asset: 'USDC',
      metadata: { chainId: 8453 },
    }, { signal: controller.signal, headers: { 'Idempotency-Key': 'request-1' } })
  })

  it('selects the expected sponsorship mechanism for supported assets', () => {
    const service = new PayZapService()

    expect(service.getSponsorshipMechanism(evmAsset)).toBe('permit')
    expect(service.getSponsorshipMechanism(tronAsset)).toBe('delegate')
    expect(service.getSponsorshipMechanism({ ...evmAsset, symbol: 'DAI' })).toBeNull()
  })

  it('activates a mandate method', async () => {
    const service = new PayZapService()
    const post = vi.fn().mockResolvedValue({ data: { success: true, data: { methods: [] } } })
    service.http = { post } as unknown as AxiosInstance

    await service.activateMandateMethod('mandate-1', 'method-1')

    expect(post).toHaveBeenCalledWith('/v1/public/mandate-setup/mandate-1/methods/method-1/activate')
  })

  it('wraps a failed request in a ServiceError', async () => {
    const service = new PayZapService()
    service.maxRetries = 0
    service.http = { get: vi.fn().mockRejectedValue(new Error('offline')) } as unknown as AxiosInstance

    await expect(service.getSession('session-1')).rejects.toMatchObject({
      code: 'request_failed',
      name: ServiceError.name,
    })
  })

  it('maps an aborted request to a cancellation error', async () => {
    const service = new PayZapService()
    service.maxRetries = 0
    const controller = new AbortController()
    controller.abort('User cancelled')
    service.http = { get: vi.fn().mockRejectedValue(new Error('request aborted')) } as unknown as AxiosInstance

    await expect(service.getSession('session-1', { abortSignal: controller.signal }))
      .rejects.toMatchObject({
        code: 'cancelled',
        name: ServiceError.name,
      })
  })
})
