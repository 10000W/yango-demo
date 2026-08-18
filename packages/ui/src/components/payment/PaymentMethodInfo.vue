<script setup lang="ts">
import { PaymentMethod } from '@/entities/payment'
import PaymentMethodIcon from '@/components/payment/PaymentMethodIcon.vue'
import { formatNumber } from '@/utils/string-utils'

const { paymentMethod, active } = defineProps<{ paymentMethod: PaymentMethod, active: boolean }>()
</script>

<template>
  <div class="flex gap-16 align-center">
    <PaymentMethodIcon :payment-method="paymentMethod" />

    <div class="column gap-2">
      <p class="w-500 p1">
        {{ paymentMethod.name }}
      </p>

      <p
        v-if="active"
        class="c-text-success"
      >
        Active
      </p>
      <p class="flex align-center gap-8 c-text-secondary">
        <template v-if="paymentMethod.type === 'blockchain'">
          TRC-20
          <svg
            width="4"
            height="4"
            viewBox="0 0 4 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="2"
              cy="2"
              r="2"
              fill="#3D294C"
            />
          </svg>
          Cap ${{ formatNumber(500) }}
        </template>
        <template v-else>
          Authorized
        </template>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
