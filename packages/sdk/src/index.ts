import type { IExecutor } from './executor'
import type { IService } from './service'

// export type ChainExecutorRegistry = Readonly<{
//   get(type: string): IExecutor | undefined
// }>

export interface PaymentSdkOptions<TService extends IService = IService> {
  service: TService
  // executors?: ChainExecutorRegistry
}

export class TacPaymentSdk<TService extends IService = IService> {
  readonly service: TService
  // readonly executors?: ChainExecutorRegistry

  constructor(options: PaymentSdkOptions<TService>) {
    this.service = options.service
    // this.executors = options.executors
  }
}
