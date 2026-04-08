import { PAYZAP_API_URL, PAYZAP_PRODUCT_ID, wagmiAdapter } from '@/entities/config.ts'
import axios from 'axios'
import type { PayZapSession } from '@/entities/payzap.ts'
import { nextTick, type Ref, ref } from 'vue'
import { useTimeoutPoll } from '@vueuse/core'
import type { PaymentChainType } from '@/entities/payment'
import { type Asset } from '@/entities/asset'
import {encodeFunctionData, getAddress, parseUnits} from 'viem'
import { simulateContract, writeContract, waitForTransactionReceipt, estimateGas } from '@wagmi/core'
import { useAppKit } from '@/composables/useAppKit.ts'

const { address } = useAppKit()

const amount = '0.01'
const activeSession: Ref<PayZapSession | undefined> = ref()
const selectedChain: Ref<PaymentChainType | undefined> = ref()
const selectedAsset: Ref<Asset | undefined> = ref()

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
  console.log(activeSession.value, address.value, selectedChain.value)
  if (!activeSession.value || !address.value || selectedChain.value !== 'evm') {
    return
  }

  switch (selectedChain.value) {
    case 'evm':
      const res = await estimateGas(wagmiAdapter.wagmiConfig, {
        to: getAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
        account: address.value as `0x${string}`,
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
            parseUnits(activeSession.value.amount, selectedAsset.value?.decimals || 6),
          ],
        })
      })

      return res
  }
}
const createSession = async () => {
  console.log(selectedChain.value, selectedAsset.value)

  if (!selectedChain.value || !selectedAsset.value || !amount) {
    console.log()
    throw new Error('Some parameters are not specified')
  }

  const { data } = await axios.post<{ success: boolean, data: PayZapSession }>(`${PAYZAP_API_URL}/v1/payments/session`, {
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
      estimateGasFee()
    })
    return data.data
  }

  throw new Error('Error while creating session')
}
const pay = async () => {
  if (!activeSession.value) {
    throw new Error('Session not found')
  }

  if (!address.value) {
    throw new Error('Wallet not connected')
  }

  switch (selectedChain.value) {
    case 'evm':
      const sim = await simulateContract(wagmiAdapter.wagmiConfig, {
        address: getAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7'), // FIXME: usdt hardcoded
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
          parseUnits(activeSession.value.amount, selectedAsset.value?.decimals || 6),
        ],
      })
      const hash = await writeContract(wagmiAdapter.wagmiConfig, sim.request)
      await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
        hash,
      })
  }
}

export const usePayment = () => {
  return {
    init,
    createSession,
    updateSession,
    pay,
    amount,
    activeSession,
    selectedChain,
    selectedAsset,
    estimateGasFee,
  }
}
