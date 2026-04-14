import { PAYZAP_API_URL, PAYZAP_PRODUCT_ID, wagmiAdapter } from '@/entities/config.ts'
import axios from 'axios'
import type { PayZapSession } from '@/entities/payzap.ts'
import { computed, nextTick, type Ref, ref, watch } from 'vue'
import { useTimeoutPoll } from '@vueuse/core'
import type { PaymentChainType } from '@/entities/payment'
import { type Asset } from '@/entities/asset'
import { encodeFunctionData, getAddress, parseUnits } from 'viem'
import { estimateGas, simulateContract, switchChain, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { useAppKit } from '@/composables/useAppKit.ts'

const { address, chainId } = useAppKit()

const amount = '0.1'
const activeSession: Ref<PayZapSession | undefined> = ref()
const selectedChain: Ref<PaymentChainType | undefined> = ref()
const selectedAsset: Ref<Asset | undefined> = ref()
const txStatusMessage = ref('')

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
  // TODO: Pass price, customer data, etc...
}

const updateSession = async () => {
  if (!activeSession.value) {
    return
  }

  const { data } = await axios.get<{ data: PayZapSession }>(`${PAYZAP_API_URL}/v1/payments/session/${activeSession.value.id}`)
  activeSession.value = data.data
}
const poll = useTimeoutPoll(updateSession, 3000, { immediate: false })

const estimateGasFee = async () => {
  const asset = selectedAsset.value

  if (!activeSession.value || !address.value || selectedChain.value !== 'evm') {
    return
  }

  if (!asset || !('address' in asset)) {
    return
  }

  switch (selectedChain.value) {
    case 'evm':
      return await estimateGas(wagmiAdapter.wagmiConfig, {
        to: getAddress(asset.address),
        // account: address.value as `0x${string}`,
        data: encodeFunctionData({
          abi: [{
            name: 'transfer',
            type: 'function',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [],
          }],
          functionName: 'transfer',
          args: [
            activeSession.value.merchantWallet as `0x${string}`,
            parseUnits(activeSession.value.amount, asset.decimals),
          ],
        }),
      })
  }
}
const createSession = async (isTest = false) => {
  if (!selectedChain.value || !selectedAsset.value || !amount) {
    console.log()
    throw new Error('Some parameters are not specified')
  }

  if (isTest) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    const data = {
      id: 'f31482c5-e83e-48bd-9a78-56fa4b5e1919',
      productId: '734987a6-3a30-4fe1-bf84-88e3e7960e2f',
      merchantId: '121a930d-ee5d-40f4-9bd8-04e62aca5bb0',
      status: 'pending' as const,
      chain: 'evm' as const,
      asset: 'USDT' as const,
      amount: '0.100000',
      merchantWallet: '0xab57be8dbcd2e8b37662ffeb081b80d27204d7fd',
      buyerWallet: null,
      txHash: null,
      txExplorerUrl: null,
      customerRef: null,
      metadata: {},
      expiresAt: '2026-04-27T15:00:09.899Z',
      confirmedAt: null,
      createdAt: '2026-04-27T14:45:09.902Z',
      updatedAt: '2026-04-27T14:45:09.902Z',
      successUrl: null,
      gasless: false,
      gasFeeUsd: null,
      payerAmount: null,
      permitSignature: null,
      permitDeadline: null,
      permitNonce: null,
      settlementTxHash: null,
      settlementStatus: null,
      gasSponsored: false,
      gasSponsorTxHash: null,
    }
    activeSession.value = data
    nextTick(() => {
      poll.resume()
      // estimateGasFee()
    })
    return data
  }
  const { data } = await axios.post<{ success: boolean, data: PayZapSession }>
  (`${PAYZAP_API_URL}/v1/payments/session`, {
    productId: PAYZAP_PRODUCT_ID,
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
      // estimateGasFee()
    })
    return data.data
  }

  throw new Error('Error while creating session')
}
const selectAsset = async (asset: Asset) => {
  switch (selectedChain.value) {
    case 'evm':
      if ('chain' in asset && asset.chain.id !== chainId.value) {
        try {
          await switchChain(wagmiAdapter.wagmiConfig, { chainId: asset.chain.id })
        }
        catch (e) {
          console.error('Failed to switch chain:', e)
          return
        }
      }
      selectedAsset.value = asset
      return
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
    switch (selectedChain.value) {
      case 'evm': {
        const asset = selectedAsset.value
        if (!asset || !('address' in asset)) {
          throw new Error('Invalid asset for EVM')
        }
        const sim = await simulateContract(wagmiAdapter.wagmiConfig, {
          address: getAddress(asset.address),
          abi: [{
            name: 'transfer',
            type: 'function',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [],
          }],
          functionName: 'transfer',
          account: address.value as `0x${string}`,
          args: [
            activeSession.value.merchantWallet as `0x${string}`,
            parseUnits(activeSession.value.amount, asset.decimals),
          ],
        })
        txStatusMessage.value = 'Waiting for signature'
        const hash = await writeContract(wagmiAdapter.wagmiConfig, sim.request)
        txStatusMessage.value = 'Confirming transaction'
        await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
          hash,
        })
        txStatusMessage.value = 'Confirming payment'
      }
    }
  }
  catch (e) {
    txStatusMessage.value = ''
    throw e
  }
}

const reset = () => {
  poll.pause()
  activeSession.value = undefined
  selectedChain.value = undefined
  selectedAsset.value = undefined
}

watch(() => activeSession.value?.status, (val) => {
  switch (val) {
    case 'failed':
    case 'expired':
    case 'completed':
      poll.pause()
  }
})

export const usePayment = () => {
  return {
    init,
    createSession,
    updateSession,
    pay,
    reset,
    amount,
    activeSession,
    selectAsset,
    selectedChain,
    selectedAsset,
    txStatusMessage,
    estimateGasFee,
    paymentQrCode,
  }
}
