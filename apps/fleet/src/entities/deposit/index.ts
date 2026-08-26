import axios from 'axios'

const PAYZAP_API_URL = 'https://staging-api.payzap.cc'

export type DepositAsset = 'USDT' | 'USDC'
export type DepositChain = 'evm' | 'ton' | 'tron' | 'solana'
export type DepositNetwork = 'ethereum' | 'base' | 'arbitrum' | 'polygon' | 'bsc'

export type DepositOption = {
  chain: DepositChain
  network: string | null
  label: string
}

export type DepositOptionRecord = {
  label: string
  value: string
  chain: DepositChain
  network: string | null
  icon: string
  getExplorerLink: (hash: string) => string
}

export const depositOptions: DepositOptionRecord[] = [
  {
    chain: 'evm',
    network: 'ethereum',
    label: 'Ethereum',
    value: 'ethereum',
    icon: '/img/crypto/ethereum.svg',
    getExplorerLink: (hash: string) => `https://etherscan.io/tx/${hash}`,
  },
  {
    chain: 'evm',
    network: 'bsc',
    label: 'BNB Chain',
    value: 'bsc',
    icon: '/img/crypto/bsc.svg',
    getExplorerLink: (hash: string) => `https://bscscan.com/tx/${hash}`,
  },
  {
    chain: 'evm',
    network: 'polygon',
    label: 'Polygon',
    value: 'polygon',
    icon: '/img/crypto/polygon.svg',
    getExplorerLink: (hash: string) => `https://polygonscan.com/tx/${hash}`,
  },
  {
    chain: 'evm',
    network: 'arbitrum',
    label: 'Arbitrum',
    value: 'arbitrum',
    icon: '/img/crypto/arbitrum.svg',
    getExplorerLink: (hash: string) => `https://arbiscan.io/tx/${hash}`,
  },
  {
    chain: 'evm',
    network: 'base',
    label: 'Base',
    value: 'base',
    icon: '/img/crypto/base.svg',
    getExplorerLink: (hash: string) => `https://basescan.org/tx/${hash}`,
  },
  {
    chain: 'solana',
    network: null,
    label: 'Solana',
    value: 'solana',
    icon: '/img/crypto/solana.svg',
    getExplorerLink: (hash: string) => `https://solscan.io/tx/${hash}`,
  },
  {
    chain: 'ton',
    network: null,
    label: 'TON',
    value: 'ton',
    icon: '/img/crypto/ton.svg',
    getExplorerLink: (hash: string) => `https://tonviewer.com/transaction/${hash}`,
  },
  {
    chain: 'tron',
    network: null,
    label: 'Tron',
    value: 'tron',
    icon: '/img/crypto/tron.svg',
    getExplorerLink: (hash: string) => `https://tronscan.org/#/transaction/${hash}`,
  },
]

export type DepositAssetRecord = { value: DepositAsset, label: string, icon: string }
export const depositAssets: DepositAssetRecord[] = [
  {
    value: 'USDT',
    label: 'USDT',
    icon: '/img/crypto/usdt.svg',
  },
  {
    value: 'USDC',
    label: 'USDC',
    icon: '/img/crypto/usdc.svg',
  },
]
export type Deposit = {
  id: string
  status: 'draft' | 'pending' | 'confirming' | 'completed' | 'expired'
  chain: DepositChain | null
  network: string | null
  asset: DepositAsset
  amount: string
  requestedAmount: number
  address: string | null
  receiverKind?: string
  credit: {
    amount: number
    currency: string
    rate: number
    lockedAt: string
  }
  expiresAt: string
  txHash: string | null
  txExplorerUrl: string | null
  returnUrl: string | null
  options: DepositOption[] | null
}

type DepositResponse = {
  success: boolean
  data: Deposit
  error?: { message?: string }
}

export const mockDepositDraftResponse: DepositResponse = {
  success: true,
  data: {
    id: 'df69b6f3-f2e7-4b75-b6dc-8bd25ea27015',
    status: 'draft',
    chain: null,
    network: null,
    asset: 'USDT',
    amount: '0.020000',
    requestedAmount: 0.02,
    address: null,
    receiverKind: 'wallet',
    credit: {
      amount: 0.01,
      currency: 'USD',
      rate: 0.99,
      lockedAt: '2026-08-25T20:45:20.442Z',
    },
    expiresAt: '2026-08-25T21:00:20.442Z',
    txHash: null,
    txExplorerUrl: null,
    returnUrl: null,
    options: [
      {
        chain: 'evm',
        network: 'ethereum',
        label: 'ethereum',
      },
      {
        chain: 'evm',
        network: 'bsc',
        label: 'bsc',
      },
      {
        chain: 'evm',
        network: 'polygon',
        label: 'polygon',
      },
      {
        chain: 'evm',
        network: 'arbitrum',
        label: 'arbitrum',
      },
      {
        chain: 'evm',
        network: 'base',
        label: 'base',
      },
      {
        chain: 'solana',
        network: null,
        label: 'solana',
      },
      {
        chain: 'ton',
        network: null,
        label: 'ton',
      },
      {
        chain: 'tron',
        network: null,
        label: 'tron',
      },
    ],
  },
}

export const fetchDeposit = async (id: string) => {
  const { data } = await axios.get<DepositResponse>(`${PAYZAP_API_URL}/v1/public/deposit/${id}`)
  if (!data.success) {
    throw new Error(data.error?.message || 'Unable to load deposit.')
  }
  return data.data
}

export const selectDepositOptionAndAsset = async (id: string, option: DepositOptionRecord, asset: DepositAssetRecord) => {
  const { data } = await axios.post<DepositResponse>(`${PAYZAP_API_URL}/v1/public/deposit/${id}/select`, {
    chain: option.chain,
    network: option.network || undefined,
    asset: asset.value,
  })
  if (!data.success) {
    throw new Error(data.error?.message || 'Unable to select deposit method.')
  }
  return data.data
}
