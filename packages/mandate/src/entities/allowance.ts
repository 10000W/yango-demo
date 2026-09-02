const infiniteAllowanceThreshold = 10n ** 30n

export const isInfiniteAllowanceCap = (capUnits: string, decimals: number) => {
  try {
    return BigInt(capUnits) >= infiniteAllowanceThreshold * 10n ** BigInt(decimals)
  }
  catch {
    return false
  }
}

export const isInfiniteAllowanceAmount = (amount: string) => {
  const numericAmount = Number(amount)
  return !Number.isFinite(numericAmount) || numericAmount >= Number(infiniteAllowanceThreshold)
}
