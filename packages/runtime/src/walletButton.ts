import { createAppKitWalletButton, type Wallet } from '@reown/appkit-wallet-button'

export type { Wallet }

export const createWalletButton = (namespace: 'eip155' | 'tron'): ReturnType<typeof createAppKitWalletButton> => createAppKitWalletButton({
  namespace,
})
