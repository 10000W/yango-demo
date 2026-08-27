<script setup lang="ts">
import { TacPaymentUI } from '@tac-crypto-payment/ui/TacPaymentUI'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'

const route = useRoute()

onMounted(() => {
  const ui = new TacPaymentUI({
    flow: 'payment',
    productId: route.params.id as string,
    payzapUrl: 'https://staging-api.payzap.cc',
    elementSelector: '#ui-container',
    onClose: () => {
      // TODO: closing logic
      // if (window) {
      //   window.close()
      // }
    },
  })
  ui.mount()
})

</script>

<template>
  <div id="ui-container" />
</template>

<style scoped lang="scss">

</style>
