import { IMandate, IMandateMethod } from '../../mandate'
import { PayZapService } from './PayZapService'
import {
  PayZapMandateSetupData,
  PayZapMandateSetupDataMethod,
} from './types'
import { ExecutorEvent, IChainExecutor } from '../../executor'
import { EvmAsset } from '../../asset'
import { MandateError } from '../../mandate'
import { getNetworkName } from './network'

export type PayZapMandateConfig = {
  id: string
  payzapUrl?: string
  payZapService?: PayZapService
  idempotencyKey?: string
  abortController?: AbortController
}

type PayZapMandateAllowanceParams<TAsset> = {
  executor: IChainExecutor<TAsset>
  asset: TAsset
  fromAddress: string
  toAddress: string
  amount: string
}

export class PayZapMandate implements IMandate {
  private service: PayZapService
  name = 'payzap'
  data: PayZapMandateSetupData
  methods = [] as PayZapMandateSetupDataMethod[]

  constructor(service: PayZapService, data: PayZapMandateSetupData) {
    this.service = service
    this.data = data
    this.methods = data.methods
  }

  static async create(options: PayZapMandateConfig) {
    const service = options.payZapService ?? new PayZapService(options.payzapUrl)
    const { success, data } = await service.getMandateSetup(options.id)
    if (success) {
      return new PayZapMandate(service, data)
    }

    throw new MandateError(`Unable to get mandate data, success: ${success}`, {
      code: 'setup_failed',
    })
  }

  async refresh() {
    const { success, data } = await this.service.getMandateSetup(this.data.id)
    if (success) {
      this.data = data
      return data
    }
    return data
  }

  async revoke() {
    return this.service.revoke(this.data.id)
  }

  async approve(
    { asset, fromAddress, toAddress, amount, executor }: PayZapMandateAllowanceParams<EvmAsset>,
    onUpdate?: ((event: ExecutorEvent) => void),
  ) {
    const network = getNetworkName(asset.chain.id)
    await executor.approve({ asset, fromAddress, toAddress, amount }, onUpdate)
    await this.service.setMandateSetup(this.data.id, {
      network,
      tokenSymbol: asset.symbol,
      customerWallet: fromAddress,
    })
  }
}
