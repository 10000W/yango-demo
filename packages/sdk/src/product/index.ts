import { SessionChain } from '../session'
import { EvmPaymentProviderNetworks, paymentGasslessChains } from '../network'
import { FeeMode, FeePayer } from '../fee'
import axios from 'axios'

export type Product = {
  id: string
  name: string
  description: null
  priceAmount: string
  priceCurrency: string
  availableChains: SessionChain[]
  availableMethods: {
    id: SessionChain
    type: string
    label: string
    color: string
  }[]
  evmNetworks: (typeof EvmPaymentProviderNetworks)[number][]
  gasless: {
    enabled: boolean
    networks: (typeof paymentGasslessChains)[number][]
    feeMode: FeeMode
    payer: FeePayer
  }
  tip: null
}

export const fetchProduct = async (productId: string, payzapUrl: string) => {
  const { data } = await axios.get<{ success: boolean, data: Product }>
  (`${payzapUrl}/v1/public/product/${productId}`)

  return data.data
}
