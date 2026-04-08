<script setup lang="ts">
import { usePayment } from '@/composables/usePayment.ts'
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useRouter } from 'vue-router'

const { createSession, pay, activeSession, amount } = usePayment()
const router = useRouter()

const isPaying = ref(false)

onMounted(async () => {
  isPaying.value = true
  await createSession()
  isPaying.value = false
})

const submit = async () => {
  try {
    isPaying.value = true
    await pay()
    router.push({ name: 'status', query: { status: 'success' } })
  }
  catch (error) {
    console.warn(error)
    // router.push({
    //   name: 'status',
    //   query: {
    //     status: 'failed',
    //     description: error instanceof Error ? error.message : String(error),
    //   },
    // })
  }
  finally {
    isPaying.value = false
  }
}
</script>

<template>
  <div>
    Session:
    {{ activeSession }}

    <BaseButton
      :disabled="isPaying"
      @click="submit"
    >
      Pay $ {{ amount }}
    </BaseButton>
  </div>
</template>

<style module lang="scss">

</style>
