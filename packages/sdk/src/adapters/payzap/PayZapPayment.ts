import { PayZapService } from './PayZapService'
import { EvmExecutor } from '../EvmExecutor'
import { TronExecutor } from '../TronExecutor'
import { Asset, EvmAsset } from '../../asset'
import { PayZapCreateSessionOptions, PayZapPermitDataResponse, PayZapSessionData } from './types'
import { SignTypedDataParameters } from 'viem'
import { IPayment, PaymentState } from '../../payment'
import { ExecutorEvent, IExecutor } from '../../executor'

export type PayZapPaymentCreateConfig = PayZapCreateSessionOptions & {
  payzapUrl?: string
  payZapService?: PayZapService
  idempotencyKey?: string
  abortController?: AbortController
}

type PayZapPayParams = {
  executor: IExecutor
  fromAddress: string
  amount: string
}

export class PayZapPayment implements IPayment {
  private service: PayZapService
  private abortController: AbortController
  state: PaymentState = 'idle'
  asset: Asset
  session: PayZapSessionData
  isSponsored = false

  private constructor(
    service: PayZapService,
    session: PayZapSessionData,
    options: PayZapPaymentCreateConfig,
  ) {
    this.service = service
    this.session = session
    this.asset = options.asset
    this.abortController = options.abortController ?? new AbortController()
  }

  static async create(options: PayZapPaymentCreateConfig) {
    const service = options.payZapService ?? new PayZapService(options.payzapUrl)
    const session = await service.createSession({
      productId: options.productId,
      gasless: options.gasless,
      chain: options.chain,
      asset: options.asset,
    }, {
      idempotencyKey: options.idempotencyKey,
      abortSignal: options.abortController?.signal,
    })
    return new PayZapPayment(service, session, options)
  }

  getStateFromPayZapSession(session: PayZapSessionData): PaymentState {
    if (session.failureReason) {
      return 'failed'
    }

    if (+new Date(session.expiresAt) <= Date.now()) {
      return 'expired'
    }

    switch (session.status) {
      case 'pending':
        if (this.state === 'paying') {
          return 'paying'
        }
        return 'idle'
      case 'failed':
      case 'expired':
      case 'completed':
      case 'confirming':
        return session.status as PaymentState
      default:
        return 'idle'
    }
  }

  getIsSponsoredStateFromPayZapSession(session: PayZapSessionData): boolean {
    return session.gasSponsored || session.tronEnergyDelegated
  }

  validateState() {
    switch (this.state) {
      case 'expired':
        throw new Error(`Payment is expired`)
      case 'cancelled':
        throw new Error(`Payment was cancelled`)
      case 'failed':
        throw new Error(`Payment is failed`)
      case 'completed':
        throw new Error(`Payment already have been processed`)
      default:
        return
    }
  }

  async refresh() {
    if (!this.session) {
      return
    }
    this.session = await this.service.getSession(this.session.id)
    this.state = this.getStateFromPayZapSession(this.session)
    if (!this.isSponsored) {
      this.isSponsored = this.getIsSponsoredStateFromPayZapSession(this.session)
    }
    return this.session
  }

  async cancel() {
    this.abortController.abort('Cancelled by user')
    this.state = 'cancelled'
  }

  async evmPay(executor: EvmExecutor, fromAddress: string, amount: string, onUpdate?: ((event: ExecutorEvent) => void) | undefined) {
    // const { onUpdateStatus = defaultPaymentProviderOptions.onUpdateStatus } = this.options || {}
    if (!fromAddress) {
      throw new Error('No from address provided')
    }

    const mechanism
      = !this.session.gasless || this.isSponsored
        ? null
        : this.service.getSponsorshipMechanism(this.asset)

    let permitData: PayZapPermitDataResponse | undefined
    if (mechanism === 'permit') {
      // onUpdateStatus('Preparing gas sponsorship')
      permitData = await this.service.permitData(this.session.id, fromAddress)
    }
    else if (mechanism === 'sponsor') {
      // onUpdateStatus('Requesting gas sponsorship')
      await this.service.sponsorGas(this.session.id, fromAddress).catch(() => {})
    }

    // if (mechanism !== 'permit') {
    //   await this.approve()
    // }

    if (mechanism === 'permit' && permitData?.success) {
      // onUpdateStatus('Signing gas permit')
      const signature = await executor.sign({
        ...permitData.data as unknown as SignTypedDataParameters,
        account: fromAddress as `0x${string}`,
      })
      // onUpdateStatus('Submitting gas permit')
      await this.service.permit(this.session.id, fromAddress, signature)
      return
    }

    return await executor.transfer({
      amount,
      asset: this.asset as EvmAsset,
      fromAddress,
      toAddress: this.session.merchantWallet,
    }, onUpdate)
  }

  async tronPay(executor: TronExecutor, fromAddress: string, amount: string, onUpdate?: ((event: ExecutorEvent) => void) | undefined) {
    // const { onUpdateStatus = defaultPaymentProviderOptions.onUpdateStatus } = this.options || {}

    if (this.session.gasless && !this.isSponsored) {
      // onUpdateStatus('Requesting gas sponsorship')
      await this.service.delegateEnergy(this.session.id, fromAddress)
    }

    // await this.approve()
    return await executor.transfer({
      amount,
      asset: this.asset as EvmAsset,
      fromAddress,
      toAddress: this.session.merchantWallet,
    }, onUpdate).catch(() => {
      this.state = 'idle'
    })
  }

  async pay(
    { fromAddress, amount, executor }: PayZapPayParams,
    onUpdate?: ((event: ExecutorEvent) => void),
  ) {
    if (this.state === 'paying') {
      return
    }
    this.validateState()

    this.state = 'paying'
    if (executor instanceof EvmExecutor) {
      return await this.evmPay(executor, fromAddress, amount, onUpdate)
        .then((result) => {
          if (result) {
            this.state = 'confirming'
          }
          else {
            this.state = 'failed'
          }
        })
        .catch((e) => {
          this.state = 'idle'
          throw e
        })
    }
    else if (executor instanceof TronExecutor) {
      return await this.tronPay(executor, fromAddress, amount, onUpdate)
        .then((result) => {
          if (result) {
            this.state = 'confirming'
          }
          else {
            this.state = 'failed'
          }
        })
        .catch((e) => {
          this.state = 'idle'
          throw e
        })
    }
    throw new Error('Unsupported executor')
  }
}
