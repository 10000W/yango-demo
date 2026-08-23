import type { EvmAsset } from '../asset/evm'
import type { TronAsset } from '../asset/tron'
import type { PayZapMandateSetupData } from '../adapters/payzap'

export const evmAsset: EvmAsset = {
  name: 'USD Coin',
  symbol: 'USDC',
  namespace: 'eip155',
  decimals: 6,
  icon: '',
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  chain: { id: 8453, name: 'Base', shortName: 'ETH', color: '#0052FF' },
}

export const tronAsset: TronAsset = {
  name: 'Tether',
  symbol: 'USDT',
  namespace: 'tron',
  decimals: 6,
  icon: '',
  address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  chain: { id: 728126428, name: 'Tron', shortName: 'TRX', color: '#FF060A' },
}

export const mandateData: PayZapMandateSetupData = {
  id: 'mandate-1',
  status: 'pending',
  customerRef: 'customer-1',
  setupExpiresAt: '2099-01-01T00:00:00.000Z',
  spenderAddress: '0x1111111111111111111111111111111111111111',
  availableKinds: 'evm_wallet',
  supportedNetworks: ['base'],
  merchant: { brandName: 'Merchant', logoUrl: null, accentColor: null },
  methods: [{
    id: 'method-1',
    kind: 'evm_wallet',
    isActive: true,
    network: 'base',
    tokenSymbol: 'USDC',
    customerWallet: '0x2222222222222222222222222222222222222222',
    capUnits: '100',
    tokenDecimals: 6,
  }],
}
