<script setup lang="ts">
import { usePayment } from '@/composables/usePayment.ts'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import PayFormEVM from '@/components/entities/pay/PayFormEVM.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'

const { createSession, selectedAsset, activeSession, reset } = usePayment()
const router = useRouter()

const isLoading = ref(false)
const errorMessage = ref('')

watch(() => activeSession.value?.status, (status) => {
  if (status && status !== 'pending') {
    router.replace({ name: 'status' })
  }
})

onMounted(async () => {
  try {
    isLoading.value = true
    await createSession()
  }
  catch {
    router.replace({
      name: 'status',
      query: {
        status: 'failed',
        title: 'Error',
        description: errorMessage.value,
      },
    })
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

    <PayFormEVM
      v-else-if="activeSession?.chain === 'evm'"
      class="flex-1"
    />
  </div>
</template>

<style module lang="scss">
.PayPage {
  min-height: 100%;
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
