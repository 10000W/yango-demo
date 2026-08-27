import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  mainnet,
  polygon,
  bsc,
  arbitrum,
  base,
  baseSepolia,
  tronMainnet,
} from '@reown/appkit/networks'
import { TronAdapter } from '@reown/appkit-adapter-tron'
import { TrustAdapter, TronLinkAdapter, MetaMaskAdapter, WalletConnectAdapter } from '@tronweb3/tronwallet-adapters'
import manifestImage from '@/public/images/manifest-img.jpg?no-inline'

// export const REOWN_PROJECT_ID = 'b56e18d47c72ab683b10814fe9495694' // localhost
export const REOWN_PROJECT_ID = '6e72dd19b1f21690fbf30d082bf9d929'
export const APP_METADATA = {
  name: 'Yango Payment DEMO',
  description: 'Yango Payment DEMO',
  url: 'https://yango-demo.vercel.app',
  icons: [manifestImage],
}

export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, polygon, bsc, arbitrum, base, baseSepolia],
  projectId: REOWN_PROJECT_ID,
})
export const tronAdapter = new TronAdapter({
  networks: [tronMainnet],
  walletAdapters: [
    // new WalletConnectAdapter({
    //   network: 'Mainnet',
    //   options: {
    //     projectId: REOWN_PROJECT_ID,
    //     metadata: APP_METADATA,
    //   },
    //   enableAnalytics: false,
    //   debug: true,
    // }),
    // new TronLinkAdapter({
    //   openAppWithDeeplink: true,
    //   openTronLinkAppOnMobile: false,
    //   openUrlWhenWalletNotFound: false,
    //   checkTimeout: 3000,
    //   dappIcon: APP_METADATA.icons[0],
    //   dappName: APP_METADATA.name,
    // }),
    new MetaMaskAdapter(),
    new TrustAdapter(),
  ],
})
