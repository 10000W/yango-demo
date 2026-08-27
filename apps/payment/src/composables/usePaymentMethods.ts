import type { Asset } from '@tac-crypto-payment/sdk'
import { PaymentOption, paymentOptions } from '@/entities/payment'
import { useAppKit } from '@/composables/useAppKit'

export const usePaymentMethods = () => {
  const { isConnected, walletInfo } = useAppKit()

  const isPaymentMethodConnected = (option: PaymentOption) => {
    if (!isConnected.value) {
      return false
    }

    if (option.type !== 'blockchain') {
      return false
    }

    const connectedName = walletInfo.value?.name?.toLowerCase() || ''
    if (option.walletName) {
      return connectedName.includes(option.walletName.toLowerCase())
    }

    const otherEvmOptions = paymentOptions.filter(o => o.type === 'blockchain' && o.walletName)
    const matchesAnySpecific = otherEvmOptions.some(o =>
      connectedName.includes(o.walletName!.toLowerCase()),
    )

    return !matchesAnySpecific
  }

  return {
    isPaymentMethodConnected,
  }
}
