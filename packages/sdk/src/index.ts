import { fetchProduct, Product } from './product'
import { createSession, CreateSessionOptions, fetchSession, Session } from './session'
import {
  PaymentMethod,
  PaymentProviderContext,
  PaymentProviderOptions,
  EvmPaymentProvider,
  TronPaymentProvider,
} from './payment'
import { Asset, EvmAsset } from './asset'
import { TronConnector } from '@reown/appkit-adapter-tron'
import { WalletClient } from 'viem'

export type TacPaymentConfig = {
  productId: string
  payzapUrl?: string
}

type CreatePaymentBaseConfig = {
  asset: Asset
  method: PaymentMethod
}
type CreatePaymentEvmConfig = CreatePaymentBaseConfig & {
  asset: EvmAsset
  userAddress: string
  client: WalletClient
}
type CreatePaymentTronConfig = CreatePaymentBaseConfig & {
  asset: EvmAsset
  userAddress: string
  connector: TronConnector
}
export type CreatePaymentConfig = CreatePaymentEvmConfig | CreatePaymentTronConfig

/**
 * TacPaymentSdk class for managing crypto payments.
 *
 * @example
 * ```TypeScript
 * import { evmAsset } from './asset'
 * import { createWalletClient } from 'viem'
 *
 * // You can retreive wallet client from wagmi too
 * const client = createWalletClient({ ... })
 *
 * const sdk = await TacPaymentSdk.create({
 *  productId: 'your-product-id',
 * })
 *
 * await sdk.createSession()
 * await sdk.createPayment({
 *  asset: evmAsset,
 *  method: 'evm',
 *  userAddress: client.account.address,
 *  client: viemWalletClient,
 * }).pay()
 *
 * // poll session state
 * await sdk.updateSession()
 *
 * if (sdk.session?.status === 'confirmed') {
 *  console.log('Product is bought!')
 * }
 *
 * ```
 */
export class TacPaymentSdk {
  private config: TacPaymentConfig
  session: Session | undefined = undefined
  product: Product | undefined = undefined

  constructor(config: TacPaymentConfig) {
    this.config = config
  }

  /**
   * Creates `TacPaymentSdk` instance with the provided configuration.
   * Loads the product data and returns the instance.
   *
   * This method should be called instead of creating the instance with `new`
   */
  static async create(config: TacPaymentConfig) {
    const instance = new TacPaymentSdk({ payzapUrl: 'https://api.payzap.cc', ...config })
    await instance.updateProduct()

    return instance
  }

  /**
   * Creates a new payment session.
   * Call it when you are ready to accept the payment.
   *
   * @param options - Configuration options for creating the session
   * @throws {Error} If productId is not configured in TacPaymentSdk initialization
   */
  async createSession(options: CreateSessionOptions) {
    if (!this.config.productId) {
      throw new Error('Product ID is not provided. Check TacPaymentSdk initialization.')
    }

    this.session = await createSession({
      payzapUrl: this.config.payzapUrl,
      productId: this.config.productId,
      ...options,
    })
  }

  /**
   * Use this method for updating the session data.
   * Works for polling.
   */
  async updateSession() {
    if (!this.session?.id) {
      throw new Error('Session ID is not provided. Did you call createSession?.')
    }
    this.session = await fetchSession(this.session?.id, this.config.payzapUrl!)
  }

  /**
   * Use this method for updating the product data.
   * Usually is not required.
   */
  async updateProduct() {
    if (!this.config.productId) {
      throw new Error('Product ID is not provided. Check TacPaymentSdk initialization.')
    }

    this.product = await fetchProduct(this.config.productId, this.config.payzapUrl!)
  }

  /**
   * Resets the SDK state by clearing the current session and product data.
   * Does not reset config.
   */
  reset() {
    this.session = undefined
    this.product = undefined
  }

  /**
   * Create the `Payment` instance.
   *
   * Call it when the user is ready to buy the product - provide the `method` and required parameters.
   *
   * You can chain this method with `.pay()`
   */
  async createPayment(config: CreatePaymentConfig, options: PaymentProviderOptions) {
    if (!this.session) {
      throw new Error('Session is not initialized. Call `createSession` method first.')
    }

    const context: PaymentProviderContext<Asset> = {
      asset: config.asset,
      userAddress: config.userAddress,
      amount: this.session.amount,
      sessionId: this.session.id,
      merchantAddress: this.session.merchantWallet,
      gasless: this.session.gasless,
      payzapUrl: this.config.payzapUrl!,
    }
    switch (config.method) {
      case 'evm':
        return new EvmPaymentProvider(
          context as PaymentProviderContext<EvmAsset>,
          options,
          (config as CreatePaymentEvmConfig).client!,
        )
      case 'tron':
        return new TronPaymentProvider(
          context as PaymentProviderContext<EvmAsset>,
          options,
          (config as CreatePaymentTronConfig).connector!,
        )
      default:
        throw new Error(`Unsupported payment method: ${config.method}`)
    }
  }
}
