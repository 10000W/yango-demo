import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  mainnet,
  polygon,
  bsc,
  arbitrum,
  base,
} from '@reown/appkit/networks'
import manifestImage from '../public/images/manifest-img.jpg?url'

export const REOWN_PROJECT_ID = 'b56e18d47c72ab683b10814fe9495694' // localhost
// export const REOWN_PROJECT_ID = '6e72dd19b1f21690fbf30d082bf9d929'
export const APP_METADATA = {
  name: 'Yango Payment DEMO',
  description: 'Yango Payment DEMO',
  url: 'https://yango-demo.vercel.app',
  icons: [manifestImage],
}

export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, polygon, bsc, arbitrum, base],
  projectId: REOWN_PROJECT_ID,
})
