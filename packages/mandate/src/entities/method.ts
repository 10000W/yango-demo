import type { PayZapMandateSetupDataMethod } from '@tac-crypto-payment/sdk'

const networkNames: Record<PayZapMandateSetupDataMethod['network'], string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  bsc: 'BSC',
  arbitrum: 'Arbitrum',
  base: 'Base',
  tron: 'Tron',
}

export const getMethodName = (method: PayZapMandateSetupDataMethod) => {
  if (method.kind === 'tron_wallet') {
    return 'Tron Wallet'
  }
  if (method.kind === 'binance_pay') {
    return 'Binance'
  }
  return `${networkNames[method.network]} Wallet`
}
