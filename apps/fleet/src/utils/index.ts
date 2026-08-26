export const formatCurrency = (amount: string | number, currency: string): string => {
  let numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numericAmount)) {
    numericAmount = 0
  }

  let str = ''
  try {
    str = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(numericAmount)
  }
  catch (e) {
    str = Intl.NumberFormat('en-US').format(numericAmount) + ` ${currency}`
  }

  return str
}

export const formatCryptocurrency = (amount: string | number, currency: string): string => {
  let numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numericAmount)) {
    numericAmount = 0
  }

  return `${numericAmount} ${currency}`
}
