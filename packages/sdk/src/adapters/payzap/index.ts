export * from './types'
export * from './PayZapService'
export * from './PayZapProduct'
export * from './PayZapPayment'
export * from './PayZapMandate'
export * from './PayZapTacPaymentSdk'
export * from './network'
import { PayZapTacPaymentSdk } from './PayZapTacPaymentSdk'

export const createPayZapSdk = (baseUrl?: string) => new PayZapTacPaymentSdk(baseUrl)
