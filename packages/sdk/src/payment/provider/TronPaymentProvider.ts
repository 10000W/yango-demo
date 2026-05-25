import { TronWeb } from 'tronweb'
import axios, { AxiosError } from 'axios'
import { EvmAsset } from '../../asset'
import { TronConnector } from '@reown/appkit-adapter-tron'
import { Types } from 'tronweb'
import { defaultPaymentProviderOptions, PaymentProvider, PaymentProviderContext, PaymentProviderOptions } from './PaymentProvider'
import { parseUnits } from 'viem'

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

export class TronPaymentProvider extends PaymentProvider<EvmAsset> {
  connector: TronConnector
  isEnergyAlreadyDelegated = false
  private readonly _tronWeb: TronWeb

  constructor(context: PaymentProviderContext<EvmAsset>, options: PaymentProviderOptions, connector: TronConnector) {
    super(context, options)
    this.connector = connector
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

  async approve() {
    const { asset, amount, merchantAddress, userAddress } = this.context
    const { onUpdateStatus = defaultPaymentProviderOptions.onUpdateStatus } = this.options || {}
    const parsedAmount = parseUnits(amount, asset.decimals)

    onUpdateStatus('Preparing approval')
    if (!userAddress) {
      throw new Error('User address is not defined')
    }
    this.tronWeb.setAddress(userAddress)
    const contract = this.tronWeb.contract(trc20Abi, asset.address)

    const allowance = await contract.allowance(userAddress, merchantAddress).call()
    await new Promise(resolve => setTimeout(resolve, 1000))

    const allowanceValue = BigInt(allowance.toString())

    if (allowanceValue >= parsedAmount) {
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
        { type: 'uint256', value: parsedAmount.toString() },
      ],
      userAddress,
    )
    await new Promise(resolve => setTimeout(resolve, 1000))
    const approveHash = await this._sendTransaction(tx)
    await new Promise(resolve => setTimeout(resolve, 1000))

    onUpdateStatus('Confirming approval')
    await this.waitForTransaction(approveHash)
  }

  async transfer() {
    const { asset, amount, merchantAddress, userAddress } = this.context
    const { onUpdateStatus = defaultPaymentProviderOptions.onUpdateStatus } = this.options || {}
    const parsedAmount = parseUnits(amount, asset.decimals)

    if (!userAddress) {
      throw new Error('User address is not defined')
    }
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
        { type: 'uint256', value: parsedAmount.toString() },
      ],
      userAddress,
    )
    await new Promise(resolve => setTimeout(resolve, 1000))

    const hash = await this._sendTransaction(tx)

    onUpdateStatus('Confirming transaction')
    await this.waitForTransaction(hash)
  }

  async pay() {
    const { onUpdateStatus = defaultPaymentProviderOptions.onUpdateStatus } = this.options || {}

    if (this.context.gasless && !this.isEnergyAlreadyDelegated) {
      onUpdateStatus('Requesting gas sponsorship')
      await this.delegateEnergy()
    }

    // await this.approve()
    await this.transfer()
  }

  private async delegateEnergy() {
    try {
      const { data } = await axios.post<DelegateEnergyResponse>
      (`${this.context.payzapUrl}/v1/public/session/${this.context.sessionId}/delegate-energy`, {
        buyerAddress: this.context.userAddress,
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

  private async _sendTransaction(txWrapper: Types.TransactionWrapper) {
    const { userAddress } = this.context
    const { onUpdateStatus = defaultPaymentProviderOptions.onUpdateStatus } = this.options || {}

    if (!txWrapper.transaction?.raw_data?.contract?.[0]?.parameter?.value?.data) {
      throw new Error('Failed to extract transaction data')
    }

    console.log(this.connector)
    const isWalletConnect = this.connector.type === 'WALLET_CONNECT' || this.connector.id === 'walletConnect'

    // FIXME: wait for appkit-adapter-tron update
    // internalRequest does not exist in TronWalletConnectConnector
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
