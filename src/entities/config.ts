import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from 'viem/chains'

export const PAYZAP_PRODUCT_ID = 'e9a8d0c1-3216-48d4-a339-3db021efd703'
export const PAYZAP_API_URL = 'https://api.payzap.cc'

// export const REOWN_PROJECT_ID = 'b56e18d47c72ab683b10814fe9495694' // localhost
export const REOWN_PROJECT_ID = '460dbb7ed6c81dfb8226ef11c5a7a6e8'
export const TON_MANIFEST_URL = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json' // Placeholder

export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet],
  projectId: REOWN_PROJECT_ID,
})
