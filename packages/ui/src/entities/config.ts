import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet,
  polygon,
  bsc,
  arbitrum,
  base,
  baseSepolia,
  solana,
  tronMainnet } from '@reown/appkit/networks'
import { TronAdapter } from '@reown/appkit-adapter-tron'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'
import { MetaMaskAdapter } from '@tronweb3/tronwallet-adapter-metamask-tron'
import { TrustAdapter } from '@tronweb3/tronwallet-adapter-trust'
import { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect'

// export const REOWN_PROJECT_ID = 'b56e18d47c72ab683b10814fe9495694' // localhost
export const REOWN_PROJECT_ID = '6e72dd19b1f21690fbf30d082bf9d929'

export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, polygon, bsc, arbitrum, base, baseSepolia],
  projectId: REOWN_PROJECT_ID,
})
export const tronAdapter = new TronAdapter({
  networks: [tronMainnet],
  walletAdapters: [
    // new TronLinkAdapter({
    //   openAppWithDeeplink: true,
    //   openTronLinkAppOnMobile: false,
    //   openUrlWhenWalletNotFound: false,
    //   checkTimeout: 3000,
    //   dappIcon: 'https://yango-demo.vercel.app/manifest-img.jpg',
    //   dappName: 'Yango Payment DEMO',
    // }),
    new MetaMaskAdapter(),
    new TrustAdapter(),
    // new WalletConnectAdapter({
    //   network: 'Mainnet',
    //   allWallets: 'SHOW',
    //   options: {
    //     projectId: REOWN_PROJECT_ID,
    //     metadata: {
    //       name: 'Yango Payment DEMO',
    //       description: 'Yango Payment DEMO',
    //       url: 'https://yango-demo.vercel.app',
    //       icons: ['https://yango-demo.vercel.app/manifest-img.jpg'],
    //     },
    //   },
    // }),
  ],
})
