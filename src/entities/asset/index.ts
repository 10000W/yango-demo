export type Asset = {
  name: string
  symbol: string
  decimals: number
  icon: string
}

export const assets: Asset[] = [
  {
    name: 'Tether',
    symbol: 'USDT',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdc.png',
  },
  {
    name: 'Dai',
    symbol: 'DAI',
    decimals: 18,
    icon: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dai.png',
  },
  {
    name: 'Binance USD',
    symbol: 'BUSD',
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png',
  },
]
