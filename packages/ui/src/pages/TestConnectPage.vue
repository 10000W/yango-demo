<script setup lang="ts">
import { useAppKit } from '@/composables/useAppKit'
import PageHeader from '@/components/PageHeader.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { computed, ref } from 'vue'
import { useAppKitAccount, useAppKitNetwork, type CaipNetwork } from '@reown/appkit/vue'
import { createAppKitWalletButton, type Wallet } from '@reown/appkit-wallet-button'

const { modal, isConnected: isAppKitConnected, address: appKitAddress, walletInfo, disconnect } = useAppKit()

const allAccount = useAppKitAccount()
const evmAccount = useAppKitAccount({ namespace: 'eip155' })
const tronAccount = useAppKitAccount({ namespace: 'tron' })

const networkData = useAppKitNetwork()
const caipNetwork = computed(() => networkData.value.caipNetwork)
const switchNetwork = (network: CaipNetwork) => networkData.value.switchNetwork(network)

const isMultiChainEnabled = ref(true)

const networks = computed(() => modal?.getCaipNetworks() || [])

const appKitWalletName = computed(() => walletInfo.value?.name || 'Unknown')

const toggleMultiChain = () => {
  isMultiChainEnabled.value = !isMultiChainEnabled.value

  // @ts-expect-error: property enableMultiChain does not exist in type Partial<Features>
  modal?.updateFeatures({ enableMultiChain: isMultiChainEnabled.value })
}

const connectEvm = () => {
  modal?.open({ view: 'Connect', namespace: 'eip155' })
}

const connectDefault = () => {
  modal?.open()
}

const connectTron = () => {
  modal?.open({ view: 'Connect', namespace: 'tron' })
}

const openProfile = () => {
  modal?.open({ view: 'ProfileWallets' })
}

const openAllWallets = () => {
  modal?.open({ view: 'AllWallets' })
}

const evmWalletButton = createAppKitWalletButton({ namespace: 'eip155' })
const tronWalletButton = createAppKitWalletButton({ namespace: 'tron' })

const connectWallet = async (wallet: Wallet, namespace: 'eip155' | 'tron') => {
  const button = namespace === 'eip155' ? evmWalletButton : tronWalletButton
  try {
    await button.connect(wallet)
  }
  catch (e) {
    console.error(`Failed to connect ${wallet} on ${namespace}`, e)
  }
}

</script>

<template>
  <div :class="$style.TestConnectPage">
    <PageHeader title="Namespace Test" />

    <div
      :class="$style.content"
      class="column gap-24 p-16"
    >
      <!-- Connection Status Card -->
      <section
        v-if="isAppKitConnected"
        :class="$style.infoCard"
        class="column gap-12"
      >
        <div class="flex items-center justify-between">
          <h3 class="p2 w-700">
            Active Connection
          </h3>
          <div :class="$style.statusBadge">
            Connected
          </div>
        </div>

        <div class="column gap-8">
          <div class="flex justify-between">
            <span class="p4 c-text-secondary">Wallet</span>
            <span class="p4 w-600">{{ appKitWalletName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="p4 c-text-secondary">Network</span>
            <span class="p4 w-600">{{ caipNetwork?.name || 'Unknown' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="p4 c-text-secondary">Chain ID</span>
            <span class="p4 w-600">{{ caipNetwork?.id || '-' }}</span>
          </div>
          <div class="column gap-4">
            <span class="p4 c-text-secondary">Address</span>
            <span class="p4 text-ellipsis">{{ appKitAddress }}</span>
          </div>
        </div>

        <div class="flex gap-8 mt-4">
          <BaseButton
            size="small"
            @click="openProfile"
          >
            Profile
          </BaseButton>
          <BaseButton
            variant="danger"
            size="small"
            @click="() => disconnect()"
          >
            Disconnect
          </BaseButton>
        </div>
      </section>

      <!-- Connection Controls -->
      <section class="column gap-16">
        <h3 class="p2 w-700">
          AppKit Controls
        </h3>

        <div class="column gap-12">
          <p class="p3 c-text-secondary">
            Connect via Namespaces:
          </p>
          <div class="flex row gap-8 flex-wrap">
            <BaseButton
              @click="connectDefault"
            >
              Default
            </BaseButton>
            <BaseButton
              @click="connectEvm"
            >
              EVM (eip155)
            </BaseButton>
            <BaseButton
              @click="connectTron"
            >
              Tron
            </BaseButton>
            <BaseButton
              @click="openAllWallets"
            >
              All Wallets
            </BaseButton>
          </div>
        </div>

        <div class="column gap-12">
          <p class="p3 c-text-secondary">
            Connect Specific Wallets:
          </p>
          <div class="flex row gap-8 flex-wrap">
            <BaseButton
              @click="connectWallet('metamask', 'eip155')"
            >
              MetaMask (EVM)
            </BaseButton>
            <BaseButton
              @click="connectWallet('trust', 'eip155')"
            >
              Trust (EVM)
            </BaseButton>
            <BaseButton
              @click="connectWallet('metamask', 'tron')"
            >
              MetaMask (Tron)
            </BaseButton>
            <BaseButton
              @click="connectWallet('trust', 'tron')"
            >
              Trust (Tron)
            </BaseButton>
          </div>
        </div>

        <div
          v-if="networks.length"
          class="column gap-12"
        >
          <p class="p3 c-text-secondary">
            Switch Network:
          </p>
          <div class="flex row gap-8 flex-wrap">
            <BaseButton
              v-for="net in networks"
              :key="net.id"
              size="small"
              :variant="caipNetwork?.id === net.id ? 'primary' : 'secondary'"
              @click="switchNetwork(net)"
            >
              {{ net.name }}
            </BaseButton>
          </div>
        </div>

        <div class="column gap-12">
          <p class="p3 c-text-secondary">
            Settings:
          </p>
          <BaseButton
            :variant="isMultiChainEnabled ? 'primary' : 'secondary'"
            size="small"
            @click="toggleMultiChain"
          >
            {{ isMultiChainEnabled ? 'Disable' : 'Enable' }} Multi-chain Mode
          </BaseButton>
        </div>
      </section>

      <!-- Accounts Debug Info -->
      <section class="column gap-16">
        <h3 class="p2 w-700">
          Namespace Accounts
        </h3>

        <div class="column gap-12">
          <!-- EVM -->
          <div
            v-if="evmAccount.isConnected"
            :class="$style.miniCard"
            class="column gap-4"
          >
            <p class="p4 w-700">
              EIP155 (EVM)
            </p>
            <p class="p4 text-ellipsis">
              {{ evmAccount.address }}
            </p>
          </div>

          <!-- Tron -->
          <div
            v-if="tronAccount.isConnected"
            :class="$style.miniCard"
            class="column gap-4"
          >
            <p class="p4 w-700">
              TRON
            </p>
            <p class="p4 text-ellipsis">
              {{ tronAccount.address }}
            </p>
          </div>

          <!-- All Accounts -->
          <div
            v-if="allAccount.allAccounts?.length"
            class="column gap-8"
          >
            <p class="p3 c-text-secondary">
              All Connected Accounts:
            </p>
            <div
              v-for="acc in allAccount.allAccounts"
              :key="acc.namespace + acc.address"
              :class="$style.miniCard"
              class="column gap-4"
            >
              <p class="p4 w-700">
                {{ acc.namespace.toUpperCase() }}
              </p>
              <p class="p4 text-ellipsis">
                {{ acc.address }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style module lang="scss">
.TestConnectPage {
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
}

.infoCard {
  padding: 12px;
  background: var(--ypm-color-bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--ypm-color-border-default);
  overflow: hidden;
}

.miniCard {
  padding: 8px;
  background: var(--ypm-color-bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--ypm-color-border-default);
  overflow: hidden;
}

.statusBadge {
  padding: 4px 8px;
  background-color: oklch(from var(--ypm-color-state-success) l c h / 10%);
  color: var(--ypm-color-state-success);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.divider {
  border: none;
  border-top: 1px solid var(--ypm-color-border-default);
  margin: 0;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
