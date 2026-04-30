import { Address } from '@ton/core'
import { getAddress, isAddress } from 'viem'

export const truncate = (string = '', length = 6) => {
  return string.slice(0, length) + '...' + string.slice(string.length - 4, string.length)
}

export const formatNumber = (value: string | number = 0, maximumFractionDigits = 4) =>
  Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    maximumSignificantDigits: maximumFractionDigits,
    // roundingMode: 'trunc',
    // roundingPriority: 'morePrecision',
  }).format(+value)

export const compactNumber = (value: string | number = 0, maximumFractionDigits = 2) =>
  Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits,
  }).format(+value)

export const stringToColor = (value: string, saturation = 85, lightness = 40) => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  return `hsl(${(hash % 360)}, ${saturation}%, ${lightness}%)`
}

export const getAddressByType = (type: 'evm' | 'tvm', value: string) => {
  try {
    if (type === 'tvm') {
      return Address.parse(value)
    }

    return getAddress(value)
  }
  catch {
    return false as boolean
  }
}

export const isAddressValidByType = (type: 'evm' | 'tvm', value: string) => {
  try {
    if (type === 'tvm') {
      return Address.isAddress(Address.parse(value))
    }

    return isAddress(value)
  }
  catch {
    return false as boolean
  }
}
