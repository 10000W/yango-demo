import { PayZapService } from './PayZapService'
import { EvmExecutor } from '../EvmExecutor'
import { TronExecutor } from '../TronExecutor'
import { Asset } from '../../asset'
import { PayZapCreateSessionOptions, PayZapPermitDataResponse, PayZapSessionData } from './types'
import { SignTypedDataParameters } from 'viem'
import { IPayment, PaymentError, PaymentErrorCode, PaymentState } from '../../payment'
import { ExecutorError, ExecutorEvent, IExecutor } from '../../executor'
import { ServiceError } from '../../service'
import { EvmAsset } from '../../asset/evm'
import { TronAsset } from '../../asset/tron'

export type PayZapPaymentCreateConfig = PayZapCreateSessionOptions & {
  payzapUrl?: string
  payZapService?: PayZapService
  idempotencyKey?: string
  abortController?: AbortController
}

type PayZapPayParams = {
  executor: IExecutor
  fromAddress: string
}

export type PayZapPaymentSubmission = {
  kind: 'transaction'
  transactionHash?: string
  submittedAt: string
}

const getTransactionHash = (result: unknown): string | undefined => {
  if (typeof result === 'string') {
    return result
  }

  if (result && typeof result === 'object' && 'transactionHash' in result) {
    const transactionHash = result.transactionHash
    return typeof transactionHash === 'string' ? transactionHash : undefined
  }
}

const createSubmission = (result: unknown): PayZapPaymentSubmission => ({
  kind: 'transaction',
  transactionHash: getTransactionHash(result),
  submittedAt: new Date().toISOString(),
})

const getErrorMetadata = (cause: unknown) => ({
  retryable: cause instanceof ServiceError || cause instanceof ExecutorError
    ? cause.retryable
    : false,
  status: cause instanceof ServiceError ? cause.status : undefined,
})

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

    this.validateSession(session)
  }

  static async create(options: PayZapPaymentCreateConfig): Promise<PayZapPayment> {
    const service = options.payZapService ?? new PayZapService(options.payzapUrl)
    try {
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
    catch (cause) {
      if (cause instanceof PaymentError) {
        throw cause
      }

      const metadata = getErrorMetadata(cause)
      throw new PaymentError('Failed to create payment session', {
        cause,
        code: cause instanceof ServiceError && cause.code === 'cancelled'
          ? 'cancelled'
          : 'session_creation_failed',
        ...metadata,
      })
    }
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
        throw this.toPaymentError(undefined, 'invalid_state', 'Payment is expired')
      case 'cancelled':
        throw this.toPaymentError(undefined, 'cancelled', 'Payment was cancelled')
      case 'failed':
        throw this.toPaymentError(undefined, 'invalid_state', 'Payment has failed')
      case 'completed':
        throw this.toPaymentError(undefined, 'invalid_state', 'Payment has already been processed')
      default:
        return
    }
  }

  async refresh() {
    if (!this.session) {
      return
    }
    try {
      const session = await this.service.getSession(this.session.id)
      this.validateSession(session)
      this.session = session
      this.state = this.getStateFromPayZapSession(this.session)
      if (!this.isSponsored) {
        this.isSponsored = this.getIsSponsoredStateFromPayZapSession(this.session)
      }
      return this.session
    }
    catch (cause) {
      if (cause instanceof PaymentError) {
        throw cause
      }
      throw this.toPaymentError(cause, 'session_refresh_failed')
    }
  }

  async cancel() {
    this.abortController.abort('Cancelled by user')
    this.state = 'cancelled'
  }

  async evmPay(executor: EvmExecutor, fromAddress: string, amount: string, onUpdate?: ((event: ExecutorEvent) => void) | undefined): Promise<PayZapPaymentSubmission> {
    if (!fromAddress) {
      throw this.toPaymentError(undefined, 'invalid_argument', 'Payer address is required')
    }

    const mechanism
      = !this.session.gasless || this.isSponsored
        ? null
        : this.service.getSponsorshipMechanism(this.asset)

    let permitData: PayZapPermitDataResponse | undefined
    if (mechanism === 'permit') {
      try {
        permitData = await this.service.permitData(this.session.id, fromAddress)
      }
      catch (cause) {
        throw this.toPaymentError(cause, 'permit_failed')
      }
    }
    else if (mechanism === 'sponsor') {
      try {
        await this.service.sponsorGas(this.session.id, fromAddress)
      }
      catch (cause) {
        throw this.toPaymentError(cause, 'sponsorship_failed')
      }
    }

    // if (mechanism !== 'permit') {
    //   await this.approve()
    // }

    if (mechanism === 'permit' && permitData?.success) {
      try {
        const signature = await executor.sign({
          ...permitData.data as unknown as SignTypedDataParameters,
          account: fromAddress as `0x${string}`,
        })
        await this.service.permit(this.session.id, fromAddress, signature)
      }
      catch (cause) {
        throw this.toPaymentError(cause, 'permit_failed')
      }
    }

    try {
      const result = await executor.transfer({
        amount,
        asset: this.asset as EvmAsset,
        fromAddress,
        toAddress: this.session.merchantWallet,
      }, onUpdate)
      return createSubmission(result)
    }
    catch (cause) {
      throw this.toPaymentError(cause, 'transfer_failed')
    }
  }

  async tronPay(executor: TronExecutor, fromAddress: string, amount: string, onUpdate?: ((event: ExecutorEvent) => void) | undefined): Promise<PayZapPaymentSubmission> {
    if (!fromAddress) {
      throw this.toPaymentError(undefined, 'invalid_argument', 'Payer address is required')
    }

    if (this.session.gasless && !this.isSponsored) {
      try {
        await this.service.delegateEnergy(this.session.id, fromAddress)
      }
      catch (cause) {
        throw this.toPaymentError(cause, 'sponsorship_failed')
      }
    }

    try {
      const result = await executor.transfer({
        amount,
        asset: this.asset as TronAsset,
        fromAddress,
        toAddress: this.session.merchantWallet,
      }, onUpdate)
      return createSubmission(result)
    }
    catch (cause) {
      throw this.toPaymentError(cause, 'transfer_failed')
    }
  }

  async pay(
    { fromAddress, executor }: PayZapPayParams,
    onUpdate?: ((event: ExecutorEvent) => void),
  ): Promise<PayZapPaymentSubmission> {
    if (this.state === 'paying') {
      throw this.toPaymentError(undefined, 'invalid_state', 'Payment is already in progress')
    }
    this.validateState()

    this.state = 'paying'
    try {
      await this.refresh()

      let submission: PayZapPaymentSubmission
      const amount = this.session.amount

      if (executor instanceof EvmExecutor) {
        submission = await this.evmPay(executor, fromAddress, amount, onUpdate)
      }
      else if (executor instanceof TronExecutor) {
        submission = await this.tronPay(executor, fromAddress, amount, onUpdate)
      }
      else {
        throw this.toPaymentError(undefined, 'unsupported_executor', 'Unsupported executor')
      }

      this.state = 'confirming'
      return submission
    }
    catch (e) {
      const error = this.toPaymentError(e, 'unknown')
      this.state = 'idle'
      throw error
    }
  }

  private validateSession(session: PayZapSessionData) {
    if (!Number.isFinite(+session.amount) || +session.amount <= 0) {
      throw this.toPaymentError(`Wrong amount: ${session.amount}`, 'session_mismatch', 'Session has invalid amount')
    }

    if (session.asset !== this.asset.symbol) {
      throw this.toPaymentError(`Asset mismatch: ${session.asset} !== ${this.asset.symbol}`, 'session_mismatch', 'Session asset mismatch')
    }

    const tokenAddress = (this.asset as EvmAsset | TronAsset).address
    if (tokenAddress && session.metadata?.tokenAddress) {
      const sessionTokenAddress = session.metadata.tokenAddress
      const mismatch = this.asset.namespace === 'eip155'
        ? sessionTokenAddress.toLowerCase() !== tokenAddress.toLowerCase()
        : sessionTokenAddress !== tokenAddress

      if (mismatch) {
        throw this.toPaymentError(`Token address mismatch: ${sessionTokenAddress} !== ${tokenAddress}`, 'session_mismatch', 'Session token address mismatch')
      }
    }
  }

  private toPaymentError(
    cause: unknown,
    code: PaymentErrorCode,
    message?: string,
  ): PaymentError {
    if (cause instanceof PaymentError) {
      return cause
    }

    const metadata = getErrorMetadata(cause)
    return new PaymentError(message ?? 'Payment operation failed', {
      cause,
      code: cause instanceof ServiceError && cause.code === 'cancelled' ? 'cancelled' : code,
      ...metadata,
    })
  }
}
