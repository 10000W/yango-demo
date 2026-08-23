import { describe, expect, it } from 'vitest'
import { SdkError } from '../../../SdkError'
import { getNetworkName, payZapNetworksByChainId } from '../network'

describe('PayZap network mapping', () => {
  it('maps numeric and string chain IDs to the PayZap network name', () => {
    expect(getNetworkName(8453)).toBe('base')
    expect(getNetworkName('728126428')).toBe('tron')
    expect(payZapNetworksByChainId.get(42161)).toBe('arbitrum')
  })

  it('returns a structured error for an unsupported chain', () => {
    expect(() => getNetworkName(999999)).toThrow(SdkError)
    expect(() => getNetworkName(999999)).toThrow(expect.objectContaining({ code: 'unsupported_chain' }))
  })
})
