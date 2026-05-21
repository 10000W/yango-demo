export type PaymentMethod = 'evm' | 'tron'

export type PaymentProviderContext<TAsset> = {
  asset: TAsset
  amount: string
  gasless: boolean
  sessionId: string
  payzapUrl: string
  userAddress?: string
  merchantAddress: string
}
export type PaymentProviderOptions = {
  onUpdateStatus?: (status: string) => void
}
export const defaultPaymentProviderOptions = {
  onUpdateStatus: () => {},
}

export abstract class PaymentProvider<TAsset> {
  context: PaymentProviderContext<TAsset>
  options: PaymentProviderOptions

  constructor(context: PaymentProviderContext<TAsset>, options: PaymentProviderOptions) {
    this.context = context
    this.options = options
  }

  abstract pay(): Promise<void>
  updateUserAddress(address: string | undefined): void {
    this.context.userAddress = address
  }
}
