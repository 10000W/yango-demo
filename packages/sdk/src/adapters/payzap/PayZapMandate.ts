import { IMandate } from '../../mandate'
import { PayZapService } from './PayZapService'
import {
  PayZapMandateSetupBinanceKindResponse,
  PayZapMandateSetupChainKindResponse,
  PayZapMandateSetupData,
  PayZapMandateSetupDataMethod,
} from './types'
import { ExecutorEvent, IChainExecutor } from '../../executor'
import { Asset } from '../../asset'
import { MandateError } from '../../mandate'
import { getNetworkName } from './network'

export type PayZapMandateConfig = {
  id: string
  payzapUrl?: string
  payZapService?: PayZapService
  idempotencyKey?: string
  abortController?: AbortController
}

type PayZapMandateAllowanceParamsBase = {
  kind: 'binance' | 'blockchain'
}
type PayZapMandateAllowanceParamsChain<TAsset> = PayZapMandateAllowanceParamsBase & {
  kind: 'blockchain'
  executor: IChainExecutor<TAsset>
  asset: TAsset
  fromAddress: string
  toAddress: string
  amount: string
}
type PayZapMandateAllowanceParamsBinance = PayZapMandateAllowanceParamsBase & {
  kind: 'binance'
  amount: string
}
type PayZapMandateAllowanceParams<TAsset>
  = PayZapMandateAllowanceParamsChain<TAsset>
    | PayZapMandateAllowanceParamsBinance

export class PayZapMandate implements IMandate {
  private service: PayZapService
  name = 'payzap'
  data: PayZapMandateSetupData
  methods = [] as PayZapMandateSetupDataMethod[]

  constructor(service: PayZapService, data: PayZapMandateSetupData) {
    this.service = service
    this.data = data
    this.methods = this.getActiveMethods(data.methods)
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
      this.methods = this.getActiveMethods(data.methods)
      return data
    }
    return data
  }

  async revoke() {
    return this.service.revoke(this.data.id)
  }

  async activateMethod(methodId: string) {
    const response = await this.service.activateMandateMethod(this.data.id, methodId)
    if (!response.success) {
      throw new MandateError('Unable to activate mandate method', {
        code: 'setup_failed',
      })
    }

    this.methods = this.getActiveMethods(response.data.methods)
    this.data = { ...this.data, methods: this.methods }
    return this.methods
  }

  async revokeMethod(methodId: string) {
    const response = await this.service.revokeMandateMethod(this.data.id, methodId)
    if (!response.success) {
      throw new MandateError('Unable to revoke mandate method', {
        code: 'setup_failed',
      })
    }

    this.methods = response.data.methods
    this.data = { ...this.data, methods: response.data.methods }
    return response.data.methods
  }

  async approve(
    params: PayZapMandateAllowanceParams<Asset>,
    onUpdate?: ((event: ExecutorEvent) => void),
  ) {
    if (params.kind === 'binance') {
      return (await this.service.setMandateSetup(this.data.id, {
        kind: 'binance_pay',
        amount: +params.amount,
      })) as PayZapMandateSetupBinanceKindResponse
    }
    else {
      const { asset, fromAddress, toAddress, amount } = params
      const network = getNetworkName(asset.chain.id)
      await params.executor.approve({
        force: true, asset, fromAddress, toAddress, amount,
      }, onUpdate)
      return (await this.service.setMandateSetup(this.data.id, {
        kind: network === 'tron' ? 'tron_wallet' : 'evm_wallet',
        network,
        tokenSymbol: asset.symbol,
        customerWallet: fromAddress,
      })) as PayZapMandateSetupChainKindResponse
    }
  }

  private getActiveMethods(methods: PayZapMandateSetupDataMethod[]) {
    return methods.filter(method => !method.revokedAt)
  }
}
