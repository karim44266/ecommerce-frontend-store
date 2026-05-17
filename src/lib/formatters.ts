const tndFormatter = new Intl.NumberFormat('en-TN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0)
  return `${tndFormatter.format(Number.isFinite(amount) ? amount : 0)} TND`
}
