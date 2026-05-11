import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { tronMainnet, mainnet, polygon } from '@reown/appkit/networks'
import { TronAdapter } from '@reown/appkit-adapter-tron'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'
// import { MetaMaskAdapter } from '@tronweb3/tronwallet-adapter-metamask-tron'
// import { TrustAdapter } from '@tronweb3/tronwallet-adapter-trust'
// import { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect'

// export const REOWN_PROJECT_ID = 'b56e18d47c72ab683b10814fe9495694' // localhost
export const REOWN_PROJECT_ID = '6e72dd19b1f21690fbf30d082bf9d929'
export const TON_MANIFEST_URL = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json' // Placeholder

export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, polygon],

  projectId: REOWN_PROJECT_ID,
})
export const tronAdapter = new TronAdapter({
  networks: [tronMainnet],
  walletAdapters: [
    new TronLinkAdapter({
      openUrlWhenWalletNotFound: false,
      checkTimeout: 3000,
    }),
    // new MetaMaskAdapter(),
    // new TrustAdapter(),
    // new WalletConnectAdapter({
    //   network: 'Mainnet',
    //   options: {},
    // }),
  ],
})
