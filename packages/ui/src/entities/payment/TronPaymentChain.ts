import { TronWeb } from 'tronweb'
import axios, { AxiosError } from 'axios'
import {
  defaultPaymentChainPayOptions, PaymentChain,
  PaymentChainPayContext, PaymentChainPayOptions,
} from '@/entities/payment/PaymentChain'
import { EvmAsset } from '@/entities/asset'
import { TronConnector } from '@reown/appkit-adapter-tron'
import { Types } from 'tronweb'

const MAX_UINT256 = 2n ** 256n - 1n

const trc20Abi = [
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

type DelegateEnergyResponse = {
  success: boolean
}

export class TronPaymentChain extends PaymentChain<EvmAsset> {
  connector: TronConnector
  isEnergyAlreadyDelegated = false
  payzapUrl: string
  private readonly _tronWeb: TronWeb

  constructor(connector: TronConnector, config: { payzapUrl: string }) {
    super()
    this.connector = connector
    this.payzapUrl = config.payzapUrl
    this._tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
    })
  }

  get tronWeb(): TronWeb {
    return this._tronWeb
  }

  static getSponsorshipMechanism(asset: EvmAsset) {
    return (asset.symbol === 'USDT' || asset.symbol === 'USDC') ? 'delegate' : null
  }

  async approve(context: PaymentChainPayContext<EvmAsset>, options?: PaymentChainPayOptions) {
    const { asset, amount, merchantAddress, userAddress } = context
    const { onUpdateStatus = defaultPaymentChainPayOptions.onUpdateStatus } = options || {}

    onUpdateStatus('Preparing approval')
    this.tronWeb.setAddress(userAddress)
    const contract = this.tronWeb.contract(trc20Abi, asset.address)

    const allowance = await contract.allowance(userAddress, merchantAddress).call()
    await new Promise(resolve => setTimeout(resolve, 1000))

    const allowanceValue = BigInt(allowance.toString())

    if (allowanceValue >= amount) {
      return
    }

    onUpdateStatus('Waiting for approval signature')
    await new Promise(resolve => setTimeout(resolve, 1000))

    const tx = await this.tronWeb.transactionBuilder.triggerSmartContract(
      asset.address,
      'approve(address,uint256)',
      {
        feeLimit: 100_000_000,
      },
      [
        { type: 'address', value: merchantAddress },
        { type: 'uint256', value: amount.toString() },
      ],
      userAddress,
    )
    await new Promise(resolve => setTimeout(resolve, 1000))

    const approveHash = await this._sendTransaction(tx, context, options)
    await new Promise(resolve => setTimeout(resolve, 1000))

    onUpdateStatus('Confirming approval')
    await this.waitForTransaction(approveHash)
  }

  async transfer(context: PaymentChainPayContext<EvmAsset>, options: PaymentChainPayOptions) {
    const { asset, amount, merchantAddress, userAddress } = context
    const { onUpdateStatus = defaultPaymentChainPayOptions.onUpdateStatus } = options || {}

    this.tronWeb.setAddress(userAddress)
    onUpdateStatus('Waiting for signature')
    const tx = await this.tronWeb.transactionBuilder.triggerSmartContract(
      asset.address,
      'transfer(address,uint256)',
      {
        feeLimit: 100_000_000,
      },
      [
        { type: 'address', value: merchantAddress },
        { type: 'uint256', value: amount.toString() },
      ],
      userAddress,
    )
    await new Promise(resolve => setTimeout(resolve, 1000))

    const hash = await this._sendTransaction(tx, context, options)

    onUpdateStatus('Confirming transaction')
    await this.waitForTransaction(hash)
  }

  async pay(context: PaymentChainPayContext<EvmAsset>, options: PaymentChainPayOptions) {
    const { onUpdateStatus = defaultPaymentChainPayOptions.onUpdateStatus } = options || {}

    if (context.gasless && !this.isEnergyAlreadyDelegated) {
      onUpdateStatus('Requesting gas sponsorship')
      await this.delegateEnergy(context)
    }

    await this.approve(context, options)
    await this.transfer(context, options)
  }

  private async delegateEnergy(context: PaymentChainPayContext<EvmAsset>) {
    try {
      const { data } = await axios.post<DelegateEnergyResponse>
      (`${this.payzapUrl}/v1/public/session/${context.sessionId}/delegate-energy`, {
        buyerAddress: context.userAddress,
      })

      if (!data.success) {
        throw new Error('Failed to delegate energy')
      }

      this.isEnergyAlreadyDelegated = true
    }
    catch (e) {
      if (e instanceof AxiosError && e.status === 429) {
        // Rate limit exceeded, just allow going further
        return
      }
      throw e
    }
  }

  private async _sendTransaction(
    txWrapper: Types.TransactionWrapper,
    context: PaymentChainPayContext<EvmAsset>,
    options?: PaymentChainPayOptions,
  ) {
    const { userAddress } = context
    const { onUpdateStatus = defaultPaymentChainPayOptions.onUpdateStatus } = options || {}

    if (!txWrapper.transaction?.raw_data?.contract?.[0]?.parameter?.value?.data) {
      throw new Error('Failed to extract transaction data')
    }

    console.log(this.connector)
    const isWalletConnect = this.connector.type === 'WALLET_CONNECT' || this.connector.id === 'walletConnect'

    // FIXME: wait for appkit-adapter-tron update
    // internalRequest does not exist in TronWalletConnectConnector
    console.log(this.connector)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (isWalletConnect && !(this.connector as any).internalRequest) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.connector as any).internalRequest = (args: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.connector as any).provider.request(args, (this.connector as any).chains?.[0]?.caipNetworkId)
      }
    }

    onUpdateStatus('Waiting for signature')

    const method = isWalletConnect ? 'tron_signTransaction' : 'tron_sendTransaction'

    const response = await this.connector.request({
      method,
      params: { address: userAddress, transaction: txWrapper.transaction },
    })

    if (typeof response === 'string') {
      return response
    }

    onUpdateStatus('Broadcasting transaction')
    const result = await this.tronWeb.trx.sendRawTransaction(response as Types.SignedTransaction)
    if (!result.result) {
      throw new Error(result.message || 'Failed to broadcast transaction')
    }
    return result.txid
  }

  private async waitForTransaction(hash: string) {
    // FIXME: use tonweb or new adapter for receipt waiting
    while (true) {
      const info = await this.tronWeb.trx.getTransactionInfo(hash)
      if (info && info.id) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (info.receipt?.result === 'SUCCESS' || info.result === 'SUCCESS') {
          return true
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (info.result && info.result !== 'SUCCESS') {
          throw new Error(`Transaction failed: ${info.result}`)
        }
      }
      await new Promise(resolve => setTimeout(resolve, 4000))
    }
  }
}
