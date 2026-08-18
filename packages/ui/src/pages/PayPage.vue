<script setup lang="ts">
import { usePayment } from '@/composables/usePayment'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import PayFormBlockchain from '@/components/pay/PayFormBlockchain.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'

const { createSession, selectedAsset, paymentSession, reset } = usePayment()
const router = useRouter()

const isLoading = ref(false)

watch(() => paymentSession.value?.state, (status) => {
  if (status && status !== 'idle' && status !== 'paying' && status !== 'cancelled') {
    router.replace({ name: 'status' })
  }
})

const handleError = (message: string) => {
  router.replace({
    name: 'status',
    query: {
      status: 'failed',
      title: 'Error',
      description: message,
    },
  })
}

onMounted(async () => {
  try {
    isLoading.value = true

    await createSession()
  }
  catch (e) {
    handleError((e as Error)?.message || 'Unable to create a session. Please try again later.')
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div
    :class="$style.PayPage"
    class="column"
  >
    <PageHeader
      v-if="!isLoading"
      title=""
      @back="reset()"
    />

    <h1
      v-if="!isLoading"
      class="h1 mb-24 inline-flex gap-8 flex-wrap"
    >
      <span>Pay by</span> <span class="inline-flex align-center gap-8">
        <img
          v-if="selectedAsset?.icon"
          :src="selectedAsset.icon"
          :class="$style.icon"
          alt="icon"
        > {{ selectedAsset?.symbol }}
      </span>
    </h1>

    <div
      v-if="isLoading"
      class="flex column align-center justify-center flex-1"
    >
      <BaseSpinner name="loading">
        <div
          :class="$style.icon"
          :style="{backgroundImage: `url(${selectedAsset?.icon})`}"
        />
      </BaseSpinner>
    </div>

    <PayFormBlockchain
      v-else-if="['evm', 'tron'].includes(paymentSession?.session?.chain!) "
      class="flex-1"
      @error="handleError"
    />
  </div>
</template>

<style module lang="scss">
.PayPage {
  //
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 32px;
}

.icon {
  width: 32px;
  height: 32px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
