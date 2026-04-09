import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from 'viem/chains'

export const PAYZAP_PRODUCT_ID = '734987a6-3a30-4fe1-bf84-88e3e7960e2f'
export const PAYZAP_API_URL = 'https://api.payzap.cc'

// export const REOWN_PROJECT_ID = 'b56e18d47c72ab683b10814fe9495694' // localhost
export const REOWN_PROJECT_ID = '6e72dd19b1f21690fbf30d082bf9d929'
export const TON_MANIFEST_URL = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json' // Placeholder

export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet],
  projectId: REOWN_PROJECT_ID,
})
