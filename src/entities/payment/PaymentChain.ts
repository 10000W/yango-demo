import { type PaymentChainType } from './index'

export abstract class PaymentChain {
  constructor(public readonly type: PaymentChainType) {}

  abstract fetchAssetBalance(assetAddress: string): Promise<bigint>
}

export class EvmPaymentChain extends PaymentChain {
  constructor() {
    super('evm')
  }

  async fetchAssetBalance(assetAddress: string): Promise<bigint> {
    // Implement balance fetching using wagmi/viem if needed
    return 0n
  }
}

export class TonPaymentChain extends PaymentChain {
  constructor() {
    super('ton')
  }

  async fetchAssetBalance(assetAddress: string): Promise<bigint> {
    // Implement balance fetching using tonweb/ton-core if needed
    return 0n
  }
}
