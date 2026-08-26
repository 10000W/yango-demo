import { computed, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import {
  type Deposit,
  type DepositAssetRecord,
  type DepositOptionRecord,
  fetchDeposit, selectDepositOptionAndAsset,
} from '@/entities/deposit'
import type { AxiosError } from 'axios'

const deposit = ref<Deposit | null>(null)
const isLoading = ref(false)
const isSelecting = ref(false)
const error = ref('')

const { pause, resume } = useIntervalFn(async () => {
  if (!deposit.value?.id || ['completed', 'expired'].includes(deposit.value.status)) {
    pause()
    return
  }

  try {
    deposit.value = await fetchDeposit(deposit.value.id).catch()
  }
  catch {}
}, 7000, { immediate: false })

export const useDeposit = () => {
  const isDraft = computed(() => deposit.value?.status === 'draft')

  const load = async (id: string) => {
    isLoading.value = true
    error.value = ''

    try {
      deposit.value = await fetchDeposit(id)
      if (!['completed', 'expired'].includes(deposit.value.status)) {
        resume()
      }

      return deposit.value
    }
    catch (requestError) {
      error.value = requestError instanceof Error
        ? `${requestError.message}`
        : 'Unable to load deposit data.'
      throw requestError
    }
    finally {
      isLoading.value = false
    }
  }
  const select = async (option: DepositOptionRecord, asset: DepositAssetRecord) => {
    error.value = ''

    if (!deposit.value) {
      throw new Error('Deposit not loaded')
    }

    try {
      isSelecting.value = true
      deposit.value = await selectDepositOptionAndAsset(deposit.value?.id, option, asset)
      if (!['completed', 'expired'].includes(deposit.value.status)) {
        resume()
      }

      return deposit.value
    }
    catch (requestError) {
      error.value = ((requestError as AxiosError).response?.data as { error: { message: string } })?.error?.message
        || 'Unable to select network and asset. Please, try another network or asset'
      throw new Error(error.value)
    }
    finally {
      isSelecting.value = false
    }
  }

  return {
    deposit,
    error,
    isDraft,
    isLoading,
    isSelecting,
    load,
    select,
  }
}
