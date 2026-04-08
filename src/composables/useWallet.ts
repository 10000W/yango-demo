import { walletManager } from '@/entities/wallet/WalletManager'
import type { PaymentChainType } from '@/entities/payment'

export const useWallet = () => {
  return {
    connect: (type: PaymentChainType) => walletManager.connect(type),
    disconnect: () => walletManager.disconnect(),
    address: walletManager.address,
    isConnected: walletManager.isConnected,
    activeChainType: walletManager.activeChainType,
  }
}
