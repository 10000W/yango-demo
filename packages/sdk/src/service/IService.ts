import { Asset } from '../asset'
import { IProduct } from '../product'

export interface IService {
  name: string

  createSession(options: unknown): Promise<unknown>

  getSession(id: string): Promise<unknown>

  getProduct(id: string): Promise<IProduct<unknown>>
}

export interface ISponsorshipService {
  delegateEnergy(sessionId: string, buyerAddress: string): Promise<unknown>

  sponsorGas(sessionId: string, buyerAddress: string): Promise<unknown>

  permit(sessionId: string, owner: string, signature: string): Promise<unknown>

  permitData(sessionId: string, buyer: string): Promise<unknown>

  getSponsorshipMechanism(asset: Asset): 'sponsor' | 'permit' | 'delegate' | null
}
