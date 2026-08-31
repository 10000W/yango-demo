import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { Asset } from '../../asset'
import {
  PayZapCreateSessionOptions,
  PayZapDelegateEnergyResponse,
  PayZapPermitDataResponse,
  PayZapPermitResponse,
  PayZapSessionData,
  PayZapSponsorGasResponse,
  PayZapSponsorshipMechanism,
  PayZapProductData,
  PayZapSetMandateSetupOptions,
  PayZapRevokeMandateSetupResponse,
  PayZapMandateSetupResponse,
  PayZapMandateSetupChainKindResponse,
  PayZapMandateSetupBinanceKindResponse,
} from './types'
import { PayZapProduct } from './PayZapProduct'
import { IService, ISponsorshipService, ServiceError } from '../../service'
import { payZapNetworks } from './network'

const permitChainIds: readonly number[] = [
  payZapNetworks.base.id,
  payZapNetworks.arbitrum.id,
  payZapNetworks.polygon.id,
]
const sponsoredUsdtChainIds: readonly number[] = [
  payZapNetworks.arbitrum.id,
  payZapNetworks.polygon.id,
  payZapNetworks.bsc.id,
]

const postpone = (attempt: number): Promise<void> => {
  const delay = Math.min(1000 * attempt, 5000)
  return new Promise(resolve => setTimeout(resolve, delay))
}

export type PayZapServiceRequestConfig = {
  idempotencyKey?: string
  abortSignal?: AbortSignal
}

export class PayZapService implements IService, ISponsorshipService {
  name = 'payzap'
  http: AxiosInstance
  baseUrl: string
  maxRetries = 5

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || 'https://api.payzap.cc'
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    })
  }

  async createSession(options: PayZapCreateSessionOptions, config?: PayZapServiceRequestConfig) {
    const { productId, gasless, chain, asset } = options
    const { data } = await this.request(
      'createSession',
      () => this.http.post<{ success: boolean, data: PayZapSessionData }>
      (`/v1/payments/session`, {
        productId,
        chain,
        gasless: chain === 'evm' ? gasless : undefined,
        asset: asset.symbol,
        metadata: chain === 'evm'
          ? { chainId: asset.chain.id }
          : undefined,
      }, {
        signal: config?.abortSignal,
        headers: config?.idempotencyKey
          ? { 'Idempotency-Key': config.idempotencyKey }
          : undefined,
      }),
      config?.abortSignal,
    )

    if (!data.success) {
      throw new ServiceError('Failed to create session', { code: 'request_failed' })
    }

    return data.data
  }

  async getSession(id: string, config?: PayZapServiceRequestConfig) {
    const { data } = await this.request(
      'getSession',
      () => this.http.get<{ data: PayZapSessionData }>(`/v1/payments/session/${id}`, {
        signal: config?.abortSignal,
        headers: config?.idempotencyKey
          ? { 'Idempotency-Key': config.idempotencyKey }
          : undefined,
      }),
      config?.abortSignal,
    )
    return data.data
  }

  async getProduct(id: string): Promise<PayZapProduct> {
    const { data } = await this.request('getProduct', () => this.http.get<{ data: PayZapProductData }>(`/v1/public/product/${id}`))
    return new PayZapProduct(data.data)
  }

  async getMandateSetup(id: string): Promise<PayZapMandateSetupResponse> {
    const { data } = await this.request('getMandateSetup', () =>
      this.http.get<PayZapMandateSetupResponse>(`/v1/public/mandate-setup/${id}`),
    )
    return data
  }

  async revoke(id: string): Promise<PayZapRevokeMandateSetupResponse> {
    const { data } = await this.request('revoke', () =>
      this.http.post<PayZapRevokeMandateSetupResponse>(`/v1/public/mandate-setup/${id}/revoke`),
    )
    return data
  }

  async setMandateSetup(
    id: string,
    options: PayZapSetMandateSetupOptions,
    config?: PayZapServiceRequestConfig,
  ): Promise<PayZapMandateSetupChainKindResponse | PayZapMandateSetupBinanceKindResponse> {
    const kind = options.kind
    if (kind === 'binance_pay') {
      const { data } = await this.request('setMandateSetup', () =>
        this.http.post<PayZapMandateSetupBinanceKindResponse>(`/v1/public/mandate-setup/${id}/binance`, {
          singleUpperLimit: options.amount,
        }, {
          signal: config?.abortSignal,
          headers: config?.idempotencyKey
            ? { 'Idempotency-Key': config.idempotencyKey }
            : undefined,
        }),
      config?.abortSignal)
      return data
    }
    else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (options.network === 'solana') {
        throw new ServiceError(`Unable to set mandate setup with solana chain`, {
          cause: 'Solana is not supported yet',
          code: 'invalid_configuration',
        })
      }
      const method = options.network === 'tron' ? 'tron' : 'evm'
      const { data } = await this.request('setMandateSetup', () =>
        this.http.post<PayZapMandateSetupChainKindResponse>(`/v1/public/mandate-setup/${id}/${method}`, options, {
          signal: config?.abortSignal,
          headers: config?.idempotencyKey
            ? { 'Idempotency-Key': config.idempotencyKey }
            : undefined,
        }),
      config?.abortSignal)
      return data
    }
  }

  async delegateEnergy(sessionId: string, buyerAddress: string) {
    const { data } = await this.request('delegateEnergy', () => this.http.post<PayZapDelegateEnergyResponse>
    (`/v1/public/session/${sessionId}/delegate-energy`, { buyerAddress }))

    if (!data.success) {
      throw new ServiceError('Failed to delegate energy', { code: 'request_failed' })
    }

    return data
  }

  async sponsorGas(sessionId: string, buyerAddress: string) {
    const { data } = await this.request('sponsorGas', () => this.http.post<PayZapSponsorGasResponse>
    (`/v1/public/session/${sessionId}/sponsor-gas`, { buyerAddress }))

    if (!data.success) {
      throw new ServiceError('Failed to sponsor gas', { code: 'request_failed' })
    }

    return data
  }

  async permit(sessionId: string, owner: string, signature: string) {
    const { data } = await this.request('permit', () => this.http.post<PayZapPermitResponse>
    (`/v1/public/session/${sessionId}/permit`, {
      owner,
      signature,
    }))

    if (!data.success) {
      throw new ServiceError('Failed to permit', { code: 'request_failed' })
    }

    return data
  }

  async permitData(sessionId: string, buyer: string) {
    const { data } = await this.request('permitData', () => this.http.post<PayZapPermitDataResponse>
    (`/v1/public/session/${sessionId}/permit-data`, {
      buyer,
    }))

    if (!data.success) {
      throw new ServiceError('Failed to permit data', { code: 'request_failed' })
    }

    return data
  }

  getSponsorshipMechanism(asset: Asset): PayZapSponsorshipMechanism | null {
    if (asset.namespace === 'tron') {
      return asset.symbol === 'USDT' || asset.symbol === 'USDC' ? 'delegate' : null
    }
    if (asset.namespace !== 'eip155') {
      return null
    }
    const chainId = asset.chain.id
    const symbol = asset.symbol.toUpperCase()
    if (symbol === 'USDC' && permitChainIds.includes(chainId)) {
      return 'permit'
    }
    if (symbol === 'USDT' && sponsoredUsdtChainIds.includes(chainId)) {
      return 'sponsor'
    }
    if (symbol === 'USDC' && chainId === payZapNetworks.bsc.id) {
      return 'sponsor'
    }
    return null
  }

  private isStatusRetryable(status?: number, operation?: string): boolean {
    if (status) {
      if (operation === 'delegateEnergy' || operation === 'sponsorGas' || operation === 'permit' || operation === 'permitData') {
        return false
      }

      return status === 409 || status === 429 || status >= 500
    }
    return false
  }

  private async request<T>(
    operation: string,
    request: () => Promise<AxiosResponse<T>>,
    signal?: AbortSignal,
  ): Promise<AxiosResponse<T>> {
    let lastError: unknown

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await request()
      }
      catch (error) {
        lastError = error

        if (error instanceof ServiceError) {
          if (!error.retryable || attempt === this.maxRetries) {
            throw error
          }

          await postpone(attempt)
          continue
        }

        if (signal?.aborted || axios.isCancel(error)) {
          throw new ServiceError(`${operation} was cancelled`, {
            cause: error,
            code: 'cancelled',
          })
        }

        if (axios.isAxiosError(error)) {
          const status = error.response?.status
          const isRetryable = this.isStatusRetryable(status, operation)

          if (isRetryable && attempt < this.maxRetries) {
            await postpone(attempt)
            continue
          }

          const errorData = error.response?.data?.error as unknown as {
            message?: string
            error?: { message?: string }
          }
          // Look for any human-readable error from payzap validation error
          const message = errorData.message
            || error?.message
            || `Unable to ${operation}`

          throw new ServiceError(message, {
            cause: error,
            code: status === 429 ? 'rate_limited' : 'request_failed',
            status,
            retryable: isRetryable,
          })
        }

        throw new ServiceError(`Unable to ${operation}`, {
          cause: error,
          code: 'request_failed',
        })
      }
    }

    throw new ServiceError(`Unable to ${operation} after ${this.maxRetries} retries`, {
      cause: lastError,
      code: 'request_failed',
    })
  }
}
