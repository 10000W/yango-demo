export type PaymentOptionAsset = 'USDT' | 'USDC' | 'DAI' | 'BUSD'
export type PaymentOptionChain = 'evm' | 'ton' | 'tron' | 'solana' | 'binance_pay' | 'bybit_pay' | 'yango'

export class PaymentOption {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly type: PaymentOptionChain,
    public readonly icon: string,
    public readonly walletName?: string,
  ) {
  }

  get supportedAssets(): PaymentOptionAsset[] {
    return ['USDT', 'USDC', 'BUSD']
  }
}
