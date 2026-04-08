<script setup lang="ts">
import { paymentOptions } from '@/entities/payment'
import PaymentOption from '@/components/entities/payment/PaymentOption.vue'
</script>

<template>
  <div :class="$style.header">
    <h1 :class="$style.title">
      Select your Crypto Wallet
    </h1>
    <RouterLink
      :to="{ name: 'edit' }"
      :class="$style.editLink"
    >
      Edit
    </RouterLink>
  </div>
  <p>
    Which crypto wallet use for deposit
  </p>

  <ul :class="$style.list">
    <li
      v-for="o in paymentOptions"
      :key="o.name"
    >
      <PaymentOption :payment-option="o" />
    </li>
  </ul>
</template>

<style module lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title {
  margin: 0;
}

.editLink {
  color: var(--c-yango-purple, #7137ff);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
}

.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.evmInfo {
  margin: 12px 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.walletIcon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.muted {
  color: #666;
  font-size: 0.85rem;
}
</style>
