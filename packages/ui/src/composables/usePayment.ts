import axios from 'axios'
import type { PayZapSession } from '@/entities/payzap'
import { computed, nextTick, type Ref, ref, watch, inject } from 'vue'
import type { TacCryptoPaymentOptions } from '@/TacCryptoPayment'
import { useTimeoutPoll } from '@vueuse/core'
import { type PaymentOption, paymentOptions } from '@/entities/payment'
import { type Asset } from '@/entities/asset'
import { parseUnits } from 'viem'
import { useAppKit } from '@/composables/useAppKit'
import { EvmPaymentChain } from '@/entities/payment/EvmPaymentChain'
import { TronPaymentChain } from '@/entities/payment/TronPaymentChain'
import { useAppKitProvider } from '@reown/appkit/vue'
import { TronConnector } from '@reown/appkit-adapter-tron'
import { PaymentOptionChainType } from '@/entities/payment/PaymentOption'

const amount = ref('0.01')
const productId = ref()
const payzapUrl = ref()
const currentOptions: Ref<TacCryptoPaymentOptions | undefined> = ref()

const activeSession: Ref<PayZapSession | undefined> = ref()
const selectedPaymentOption: Ref<PaymentOption | undefined> = ref()
const selectedChain: Ref<PaymentOptionChainType | undefined> = ref()
const selectedAsset: Ref<Asset | undefined> = ref()
const txStatusMessage = ref('')
const test = ref(false)

const paymentQrCode = computed(() => {
  if (!activeSession.value) {
    return
  }

  if (activeSession.value.chain === 'binance_pay') {
    return activeSession.value.exchangePayQr
  }

  if (activeSession.value.chain === 'evm') {
    const asset = selectedAsset.value
    if (asset && 'address' in asset) {
      // const tokenAddress = asset.address
      // const amountInUnits = parseUnits(activeSession.value.amount, asset.decimals).toString()
      // return `ethereum:${tokenAddress}@1/transfer?address=${activeSession.value.merchantWallet}&uint256=${amountInUnits}`
    }
    return undefined
  }

  return activeSession.value.paymentUrl
})

const init = () => {
  const options = inject<TacCryptoPaymentOptions>('tacPaymentOptions')!
  currentOptions.value = options
  productId.value = options.productId
  payzapUrl.value = options.payzapUrl
  amount.value = options.amount.toString()
}

const updateSession = async () => {
  if (test.value) {
    return
  }
  if (!activeSession.value) {
    return
  }

  const { data } = await axios.get<{ data: PayZapSession }>(`${payzapUrl.value}/v1/payments/session/${activeSession.value.id}`)
  activeSession.value = data.data
}
const poll = useTimeoutPoll(updateSession, 3000, { immediate: false })

const createSession = async (isTest = false) => {
  if (!selectedChain.value || !selectedAsset.value) {
    throw new Error('Some parameters are not specified')
  }

  if (isTest) {
    test.value = isTest
    await new Promise(resolve => setTimeout(resolve, 100))
    const data = {
      id: '0a7e66b6-6037-4269-9453-3d8f1c41df37',
      merchantId: '62bc763c-9256-480e-8d79-04342050cbac',
      status: 'pending',
      amount: '0.010000',
      asset: 'USDT',
      chain: 'tron',
      merchantWallet: selectedChain.value === 'evm' ? '0xD212a7F2dAFe1B55a92729C7Af7a5d227FCb4240' : 'THkQU6wfLHrADsiiKtbr84XDsXnM7Yw3yn',
      txHash: null,
      txExplorerUrl: null,
      expiresAt: '2026-05-09T20:34:16.343Z',
      successUrl: null,
      exchangePayUrl: null,
      exchangePayQr: null,
      gasless: false,
      gasFeeUsd: null,
      payerAmount: null,
      permitData: null,
      gasMode: null,
      gasSponsored: false,
      metadata: {},
      tronEnergyDelegated: false,
      tronEnergyAmount: 0,
      failureReason: null,
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    activeSession.value = data
    nextTick(() => {
      poll.resume()
    })
    return data
  }
  const { data } = await axios.post<{ success: boolean, data: PayZapSession }>
  (`${payzapUrl.value}/v1/payments/session`, {
    productId: productId.value,
    // amount: amount.value,
    chain: selectedChain.value,
    asset: selectedAsset.value.symbol,
    // customerRef string Your internal customer/order ID
    // successUrl string Override product success URL for this session
    // metadata object Arbitrary JSON metadata
  })

  if (data.success) {
    activeSession.value = data.data
    nextTick(() => {
      poll.resume()
    })
    return data.data
  }

  throw new Error('Error while creating session')
}
const reset = () => {
  poll.pause()
  activeSession.value = undefined
  selectedChain.value = undefined
  selectedAsset.value = undefined
  selectedPaymentOption.value = undefined
}

watch(() => activeSession.value?.status, (val) => {
  switch (val) {
    case 'failed':
    case 'expired':
    case 'completed':
      poll.pause()
      if (val === 'completed' && activeSession.value) {
        currentOptions.value?.onSuccess?.(activeSession.value)
      }
  }
})

export const usePayment = () => {
  const { address, chainId, isConnected, walletInfo } = useAppKit()

  const isOptionConnected = (option: PaymentOption) => {
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
  const selectAsset = async (asset: Asset) => {
    selectedAsset.value = asset
    if ('namespace' in asset) {
      selectedChain.value = asset.namespace === 'eip155'
        ? 'evm'
        : asset.namespace as PaymentOptionChainType
    }
  }
  const pay = async () => {
    if (!activeSession.value) {
      throw new Error('Session not found')
    }

    if (!address.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const asset = selectedAsset.value
      if (!asset || !('address' in asset)) {
        throw new Error(`Invalid asset for ${selectedChain.value}`)
      }

      let paymentInstance: EvmPaymentChain | TronPaymentChain
      switch (selectedChain.value) {
        case 'evm':
          paymentInstance = new EvmPaymentChain()
          break
        case 'tron': {
          const connector = useAppKitProvider<TronConnector>('tron').walletProvider
          if (!connector) {
            throw new Error('Tron connector not found')
          }
          paymentInstance = new TronPaymentChain(connector)
          break
        }
        default:
          throw 'Payment option is not supported'
      }

      await paymentInstance.pay({
        asset,
        amount: parseUnits(activeSession.value.amount, asset.decimals),
        userAddress: address.value,
        merchantAddress: activeSession.value.merchantWallet,
      }, {
        onUpdateStatus: (status: string) => {
          txStatusMessage.value = status
        },
      })

      txStatusMessage.value = ''
    }
    catch (e) {
      txStatusMessage.value = ''
      throw e
    }
  }

  return {
    init,
    createSession,
    updateSession,
    pay,
    reset,
    selectAsset,
    isOptionConnected,
    amount,
    activeSession,
    selectedPaymentOption,
    selectedChain,
    selectedAsset,
    txStatusMessage,
    paymentQrCode,
    address,
    chainId,
  }
}
