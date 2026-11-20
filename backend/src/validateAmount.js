export function validateAmount(amount) {
  return Number.isFinite(amount) && amount > 0 && amount <= 99_999_999.99
    && amount === Number(amount.toFixed(2))
}
