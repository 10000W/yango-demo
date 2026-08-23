import { IExecutor } from './IExecutor'
import { ExecutorEvent } from './ExecutorEvent'

export type ChainExecutorTransferParams<TAsset> = {
  asset: TAsset
  amount: string
  fromAddress: string
  toAddress: string
}
export type ChainExecutorApproveParams<T> = ChainExecutorTransferParams<T>

export interface IChainExecutor<TAsset> extends IExecutor {
  transfer: (params: ChainExecutorTransferParams<TAsset>, onUpdate?: (event: ExecutorEvent) => void) => Promise<unknown>
  approve: (params: ChainExecutorApproveParams<TAsset>, onUpdate?: (event: ExecutorEvent) => void) => Promise<unknown>
}
