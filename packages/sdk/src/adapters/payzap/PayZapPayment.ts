import { PayZapService } from './PayZapService'
import { EvmExecutor } from '../EvmExecutor'
import { TronExecutor } from '../TronExecutor'
import { Asset, EvmAsset } from '../../asset'
import { PayZapChain, PayZapCreateSessionOptions, PayZapPermitDataResponse, PayZapSessionData } from './types'
import { SignTypedDataParameters } from 'viem'
import { IPayment, PaymentError, PaymentErrorCode, PaymentState } from '../../payment'
import { ExecutorError, ExecutorEvent, IExecutor } from '../../executor'
import { ServiceError } from '../../service'

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

const isChainAsset = (asset: Asset): asset is EvmAsset => 'namespace' in asset

const normalizeAddress = (address: string, namespace: EvmAsset['namespace']): string => {
  return namespace === 'eip155' ? address.toLowerCase() : address
}

const isPositiveDecimalAmount = (amount: unknown): amount is string => {
  if (typeof amount !== 'string' || !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(amount)) {
    return false
  }

  return /[1-9]/.test(amount)
}

export class PayZapPayment implements IPayment {
  private service: PayZapService
  private abortController: AbortController
  private readonly chain: PayZapChain
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
    this.chain = options.chain
    this.abortController = options.abortController ?? new AbortController()
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
      const payment = new PayZapPayment(service, session, options)
      payment.getAuthoritativeAmount()
      return payment
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
      this.session = await this.service.getSession(this.session.id)
      this.state = this.getStateFromPayZapSession(this.session)
      if (!this.isSponsored) {
        this.isSponsored = this.getIsSponsoredStateFromPayZapSession(this.session)
      }
      return this.session
    }
    catch (cause) {
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

  async pay(
    { fromAddress, executor }: PayZapPayParams,
    onUpdate?: ((event: ExecutorEvent) => void),
  ): Promise<PayZapPaymentSubmission> {
    if (this.state === 'paying') {
      throw this.toPaymentError(undefined, 'invalid_state', 'Payment is already in progress')
    }
    this.validateState()

    await this.refresh()
    this.validateState()
    const amount = this.getAuthoritativeAmount()

    this.state = 'paying'
    try {
      let submission: PayZapPaymentSubmission
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

  private getAuthoritativeAmount(): string {
    if (!isChainAsset(this.asset)) {
      throw this.toPaymentError(undefined, 'session_mismatch', 'Payment asset is missing chain information')
    }

    const { session, asset } = this
    if (session.chain !== this.chain) {
      throw this.toPaymentError(undefined, 'session_mismatch', 'Payment session chain does not match the requested chain')
    }

    if (typeof session.asset !== 'string' || session.asset.toUpperCase() !== asset.symbol.toUpperCase()) {
      throw this.toPaymentError(undefined, 'session_mismatch', 'Payment session asset does not match the requested asset')
    }

    if (!session.metadata || session.metadata.chainId !== asset.chain.id) {
      throw this.toPaymentError(undefined, 'session_mismatch', 'Payment session chain ID does not match the requested asset')
    }

    if (typeof session.metadata.tokenAddress !== 'string' || normalizeAddress(session.metadata.tokenAddress, asset.namespace) !== normalizeAddress(asset.address, asset.namespace)) {
      throw this.toPaymentError(undefined, 'session_mismatch', 'Payment session token address does not match the requested asset')
    }

    if (!isPositiveDecimalAmount(session.payerAmount)) {
      throw this.toPaymentError(undefined, 'session_mismatch', 'Payment session has an invalid payer amount')
    }

    return session.payerAmount
  }
}
