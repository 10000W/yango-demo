import { IProduct } from '../../product'
import { PayZapProductData } from './types'

export class PayZapProduct implements IProduct<PayZapProductData> {
  id: string
  name: string
  data: PayZapProductData

  constructor(data: PayZapProductData) {
    this.id = data.id
    this.name = data.name
    this.data = data
  }

  get availableChains() {
    return this.data.availableChains
  }

  get evmNetworks() {
    return this.data.evmNetworks
  }

  get gasless() {
    return this.data.gasless
  }
}
