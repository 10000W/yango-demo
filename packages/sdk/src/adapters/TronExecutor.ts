import { TronWeb } from 'tronweb'
import { TronConnector } from '@reown/appkit-adapter-tron'
import { Types } from 'tronweb'
import {
  ChainExecutorApproveParams,
  ChainExecutorTransferParams,
  IChainExecutor,
  ExecutorEvent,
} from '../executor'
import { parseUnits } from 'viem'
import { TronAsset } from '../asset/tron'

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

export class TronExecutor implements IChainExecutor<TronAsset> {
  type = 'tron'
  connector: TronConnector
  private readonly _tronWeb: TronWeb

  constructor(connector: TronConnector) {
    this.connector = connector
    this._tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
    })
  }

  get tronWeb(): TronWeb {
    return this._tronWeb
  }

  validateAsset(asset: TronAsset) {
    if (!asset?.address) {
      throw new Error('Asset does not have an address')
    }

    if (!asset?.decimals) {
      throw new Error('Asset does not have decimals')
    }
  }

  async approve(params: ChainExecutorApproveParams<TronAsset>, onUpdate?: (event: ExecutorEvent) => void) {
    this.validateAsset(params.asset)
    const { asset, amount, fromAddress, toAddress } = params
    const parsedAmount = parseUnits(amount, asset.decimals)

    onUpdate?.({ type: 'approval:preparing' })
    this.tronWeb.setAddress(fromAddress)
    const contract = this.tronWeb.contract(trc20Abi, asset.address)

    const allowance = await contract.allowance(fromAddress, toAddress).call()
    await new Promise(resolve => setTimeout(resolve, 1000))

    const allowanceValue = BigInt(allowance.toString())

    if (allowanceValue >= parsedAmount) {
      return
    }

    onUpdate?.({ type: 'approval:signing' })
    const tx = await this.tronWeb.transactionBuilder.triggerSmartContract(
      asset.address,
      'approve(address,uint256)',
      {
        feeLimit: 100_000_000,
      },
      [
        { type: 'address', value: toAddress },
        { type: 'uint256', value: parsedAmount.toString() },
      ],
      fromAddress,
    )
    await new Promise(resolve => setTimeout(resolve, 1000))
    const approveHash = await this._sendTransaction(tx)
    await new Promise(resolve => setTimeout(resolve, 1000))

    onUpdate?.({ type: 'approval:confirming' })
    await this.waitForTransaction(approveHash)
    onUpdate?.({ type: 'approval:completed' })

    return approveHash
  }

  async transfer(params: ChainExecutorTransferParams<TronAsset>, onUpdate?: (event: ExecutorEvent) => void) {
    this.validateAsset(params.asset)
    const { asset, amount, fromAddress, toAddress } = params
    const parsedAmount = parseUnits(amount, asset.decimals)

    this.tronWeb.setAddress(fromAddress)
    onUpdate?.({ type: 'transfer:preparing' })
    const tx = await this.tronWeb.transactionBuilder.triggerSmartContract(
      asset.address,
      'transfer(address,uint256)',
      {
        feeLimit: 100_000_000,
      },
      [
        { type: 'address', value: toAddress },
        { type: 'uint256', value: parsedAmount.toString() },
      ],
      fromAddress,
    )
    await new Promise(resolve => setTimeout(resolve, 1000))

    const hash = await this._sendTransaction(tx)

    onUpdate?.({ type: 'transfer:confirming' })
    await this.waitForTransaction(hash)
    onUpdate?.({ type: 'transfer:completed' })
    return hash
  }

  private async _sendTransaction(txWrapper: Types.TransactionWrapper) {
    if (!txWrapper.transaction?.raw_data?.contract?.[0]?.parameter?.value?.data) {
      throw new Error('Failed to extract transaction data')
    }

    const isWalletConnect = this.connector.type === 'WALLET_CONNECT' || this.connector.id === 'walletConnect'

    // FIXME: wait for appkit-adapter-tron update
    // internalRequest does not exist in TronWalletConnectConnector
    const connectorHack = this.connector as unknown as {
      internalRequest?: (args: unknown) => Promise<unknown>
      provider: {
        request: (args: unknown, networkId?: string) => Promise<unknown>
      }
      chains?: { caipNetworkId: string }[]
    }
    if (isWalletConnect && !connectorHack.internalRequest) {
      connectorHack.internalRequest = (args: unknown) => {
        return connectorHack.provider.request(args, connectorHack.chains?.[0]?.caipNetworkId)
      }
    }

    const method = isWalletConnect ? 'tron_signTransaction' : 'tron_sendTransaction'

    const response = await this.connector.request({
      method,
      params: { address: this.tronWeb.defaultAddress.base58, transaction: txWrapper.transaction },
    })

    if (typeof response === 'string') {
      return response
    }

    const result = await this.tronWeb.trx.sendRawTransaction(response as Types.SignedTransaction)
    if (!result.result) {
      throw new Error(result.message || 'Failed to broadcast transaction')
    }
    return result.txid
  }

  private async waitForTransaction(hash: string) {
    // FIXME: use tronweb or new adapter for receipt waiting
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
