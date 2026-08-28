<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton } from '@tac-crypto-payment/ui'
import { PageHeader } from '@tac-crypto-payment/runtime'

const PAYZAP_API_URL = 'https://staging-api.payzap.cc'

type ApiResponse<T> = {
  success: boolean
  data: T
  error?: { message?: string }
}

type AuthData = {
  token: string
  refreshToken: string
  merchant: { id: string, plan: string }
}

type MandateSession = {
  setupUrl?: string
  [key: string]: unknown
}

type DepositDraft = Record<string, unknown>

const apiKey = ref('')
const customerRef = ref('')
const accessToken = ref('')
const merchant = ref<AuthData['merchant'] | null>(null)
const sessionResponse = ref<ApiResponse<MandateSession> | null>(null)
const depositDraftResponse = ref<ApiResponse<DepositDraft> | null>(null)
const errorMessage = ref('')
const isAuthenticating = ref(false)
const isCreatingSession = ref(false)
const isManagingSession = ref(false)
const isCreatingDepositDraft = ref(false)

const isAuthorized = computed(() => Boolean(accessToken.value))

const post = async <T>(path: string, body: Record<string, unknown>, token?: string) => {
  const response = await fetch(`${PAYZAP_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const result = await response.json() as ApiResponse<T>

  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || `PayZap request failed (${response.status})`)
  }

  return result
}

const createDepositDraft = async () => {
  errorMessage.value = ''
  depositDraftResponse.value = null
  isCreatingDepositDraft.value = true

  try {
    depositDraftResponse.value = await post<DepositDraft>('/v1/deposits/draft', {
      partnerRef: 'fleet_4417',
      fiatAmount: 500,
      creditCurrency: 'USD',
      asset: 'USDT',
      metadata: { source: 'test-mandate' },
    }, accessToken.value)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to create a B2B deposit draft.'
  }
  finally {
    isCreatingDepositDraft.value = false
  }
}

const authorize = async () => {
  if (!apiKey.value.trim()) {
    errorMessage.value = 'Enter an API key.'
    return
  }

  errorMessage.value = ''
  isAuthenticating.value = true
  try {
    const response = await post<AuthData>('/v1/auth', {
      authMethod: 'api_key',
      apiKey: apiKey.value.trim(),
    })
    accessToken.value = response.data.token
    merchant.value = response.data.merchant
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to authorize in PayZap.'
  }
  finally {
    isAuthenticating.value = false
  }
}

const createMandateSession = async () => {
  if (!customerRef.value.trim()) {
    errorMessage.value = 'Enter a customerRef.'
    return
  }

  errorMessage.value = ''
  sessionResponse.value = null
  isCreatingSession.value = true
  try {
    sessionResponse.value = await post<MandateSession>('/v1/mandates/session', {
      customerRef: customerRef.value.trim(),
    }, accessToken.value)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to create a mandate session.'
  }
  finally {
    isCreatingSession.value = false
  }
}

const manageMandateSession = async () => {
  if (!customerRef.value.trim()) {
    errorMessage.value = 'Enter a customerRef.'
    return
  }

  errorMessage.value = ''
  sessionResponse.value = null
  isManagingSession.value = true
  try {
    sessionResponse.value = await post<MandateSession>('/v1/mandates/manage', {
      customerRef: customerRef.value.trim(),
    }, accessToken.value)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to get a mandate management session.'
  }
  finally {
    isManagingSession.value = false
  }
}

const reset = () => {
  apiKey.value = ''
  customerRef.value = ''
  accessToken.value = ''
  merchant.value = null
  sessionResponse.value = null
  depositDraftResponse.value = null
  errorMessage.value = ''
}
</script>

<template>
  <div :class="$style.page">
    <PageHeader
      title="Mandate session test"
      back-disabled
    />

    <div class="column gap-24">
      <form
        v-if="!isAuthorized"
        class="column gap-12"
        @submit.prevent="authorize"
      >
        <label
          class="p3 w-500"
          for="payzap-api-key"
        >PayZap API key</label>
        <input
          id="payzap-api-key"
          v-model="apiKey"
          :class="$style.input"
          type="password"
          autocomplete="off"
          placeholder="sp_..."
        >
        <BaseButton
          :loading="isAuthenticating"
          wide
          @click="authorize"
        >
          Authorize
        </BaseButton>
      </form>

      <template v-else>
        <div
          :class="$style.authorized"
          class="column gap-4 p-12 br-md"
        >
          <span class="w-500">Authorized</span>
          <span class="p3 c-text-secondary">Merchant {{ merchant?.id }} · {{
            merchant?.plan
          }}</span>
        </div>
        <BaseButton
          :loading="isCreatingDepositDraft"
          wide
          @click="createDepositDraft"
        >
          Create B2B
          deposit draft
        </BaseButton>

        <form
          class="column gap-12"
          @submit.prevent="createMandateSession"
        >
          <label
            class="p3 w-500"
            for="payzap-customer-ref"
          >customerRef</label>
          <input
            id="payzap-customer-ref"
            v-model="customerRef"
            :class="$style.input"
            type="text"
            autocomplete="off"
            placeholder="user_44219"
          >
          <div :class="$style.actions">
            <BaseButton
              :loading="isCreatingSession"
              :disabled="isManagingSession"
              wide
              @click="createMandateSession"
            >
              Create new session
            </BaseButton>
            <BaseButton
              variant="secondary"
              :loading="isManagingSession"
              :disabled="isCreatingSession"
              wide
              @click="manageMandateSession"
            >
              Manage existing customer
            </BaseButton>
          </div>
        </form>
      </template>

      <p
        v-if="errorMessage"
        class="p3 c-text-error"
      >
        {{ errorMessage }}
      </p>

      <section
        v-if="sessionResponse"
        class="column gap-12"
      >
        <div class="flex between align-center">
          <h2 class="h3">
            Session response
          </h2>
          <a
            v-if="sessionResponse.data.setupUrl"
            :class="$style.link"
            :href="sessionResponse.data.setupUrl"
            target="_blank"
            rel="noopener noreferrer"
          >Open
            setup</a>
        </div>
        <pre :class="$style.response">{{ JSON.stringify(sessionResponse, null, 2) }}</pre>
      </section>

      <section
        v-if="depositDraftResponse"
        class="column gap-12"
      >
        <h2 class="h3">
          B2B deposit draft response
        </h2>
        <pre :class="$style.response">{{ JSON.stringify(depositDraftResponse, null, 2) }}</pre>
      </section>

      <BaseButton
        v-if="isAuthorized"
        variant="transparent"
        wide
        @click="reset"
      >
        Use another API
        key
      </BaseButton>
    </div>
  </div>
</template>

<style module lang="scss">
.page {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 0 16px 24px;
}

.input {
  width: 100%;
  height: 48px;
  padding: 0 12px;
  color: var(--ypm-color-text-primary);
  background: var(--ypm-color-bg-secondary);
  border: 1px solid var(--ypm-color-border-default);
  border-radius: 10px;
  outline: none;
}

.input:focus {
  border-color: var(--ypm-color-border-brand);
}

.authorized {
  color: var(--ypm-color-text-primary);
  background: var(--ypm-color-bg-secondary);
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.link {
  color: var(--ypm-color-brand-primary);
  font-weight: 500;
}

.response {
  max-height: 360px;
  overflow: auto;
  padding: 12px;
  color: var(--ypm-color-text-primary);
  background: var(--ypm-color-bg-secondary);
  border-radius: 10px;
  font-size: 12px;
  line-height: 18px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 480px) {
  .actions {
    grid-template-columns: 1fr;
  }
}
</style>
