import { describe, expect, it, vi } from 'vitest'
import type { IChainExecutor } from '../../../executor'
import { MandateError } from '../../../mandate'
import { PayZapMandate } from '../PayZapMandate'
import type { PayZapService } from '../PayZapService'
import { Asset } from '../../../asset'
import { evmAsset, mandateData } from '../../../__tests__/fixtures'

const createService = () => ({
  getMandateSetup: vi.fn().mockResolvedValue({ success: true, data: mandateData }),
  revoke: vi.fn().mockResolvedValue({ success: true }),
  setMandateSetup: vi.fn().mockResolvedValue({ methodId: 'method-1' }),
}) as unknown as PayZapService

describe('PayZapMandate', () => {
  it('loads mandate data and exposes its methods', async () => {
    const service = createService()
    const mandate = await PayZapMandate.create({ id: mandateData.id, payZapService: service })

    expect(mandate.data).toBe(mandateData)
    expect(mandate.methods).toEqual(mandateData.methods)
  })

  it('rejects an unsuccessful mandate setup response', async () => {
    const service = {
      getMandateSetup: vi.fn().mockResolvedValue({
        success: false,
        data: mandateData,
      }),
    } as unknown as PayZapService

    await expect(PayZapMandate.create({ id: mandateData.id, payZapService: service }))
      .rejects.toMatchObject({ code: 'setup_failed' } satisfies Partial<MandateError>)
  })

  it('approves the token and records the approved wallet with PayZap', async () => {
    const service = createService()
    const mandate = await PayZapMandate.create({ id: mandateData.id, payZapService: service })
    const executor = {
      type: 'evm',
      approve: vi.fn().mockResolvedValue(undefined),
      transfer: vi.fn(),
    } as unknown as IChainExecutor<Asset>

    await mandate.approve({
      executor,
      asset: evmAsset,
      fromAddress: '0x2222222222222222222222222222222222222222',
      toAddress: mandateData.spenderAddress,
      amount: '10',
    })

    expect(executor.approve).toHaveBeenCalledOnce()
    expect(service.setMandateSetup).toHaveBeenCalledWith(mandateData.id, {
      network: 'base',
      tokenSymbol: 'USDC',
      customerWallet: '0x2222222222222222222222222222222222222222',
    })
  })

  it('uses the latest setup data on refresh', async () => {
    const updatedData = { ...mandateData, methods: [] }
    const service = createService()
    vi.mocked(service.getMandateSetup).mockResolvedValueOnce({
      success: true,
      data: mandateData,
    }).mockResolvedValueOnce({ success: true, data: updatedData })
    const mandate = await PayZapMandate.create({ id: mandateData.id, payZapService: service })

    await mandate.refresh()

    expect(mandate.data).toBe(updatedData)
    expect(mandate.methods).toEqual(updatedData.methods)
  })
})
