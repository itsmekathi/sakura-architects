// Budget options and formatting (Indian rupees, lakh / crore). Shared by the form and the server.

export const LAKH = 100_000
export const CRORE = 10_000_000

export type BudgetRange = { value: string; label: string; min?: number; max?: number }

/** Preset ranges; `custom` lets the visitor type their own amount or range. */
export const BUDGET_RANGES: BudgetRange[] = [
  { value: 'unsure', label: 'Not sure yet' },
  { value: 'lt25l', label: 'Under ₹25 lakh', max: 25 * LAKH },
  { value: '25l-1cr', label: '₹25 lakh – ₹1 crore', min: 25 * LAKH, max: 1 * CRORE },
  { value: '1cr-5cr', label: '₹1 crore – ₹5 crore', min: 1 * CRORE, max: 5 * CRORE },
  { value: 'gt5cr', label: 'Over ₹5 crore', min: 5 * CRORE },
  { value: 'custom', label: 'Specify my own amount or range…' },
]

export const BUDGET_UNITS = [
  { value: 'lakh', label: 'Lakh', multiplier: LAKH },
  { value: 'crore', label: 'Crore', multiplier: CRORE },
] as const
export type BudgetUnit = (typeof BUDGET_UNITS)[number]['value']

const trim = (n: number) => Number(n.toFixed(2)).toString()

/** ₹ amount in words-style Indian units: ₹45 lakh, ₹1.2 crore, ₹75,000. */
export function formatINR(rupees: number) {
  if (rupees >= CRORE) return `₹${trim(rupees / CRORE)} crore`
  if (rupees >= LAKH) return `₹${trim(rupees / LAKH)} lakh`
  return `₹${Math.round(rupees).toLocaleString('en-IN')}`
}

/** Parses a typed amount like "45", "1.5" or "1,20,000"; returns NaN when not a positive number. */
export const parseAmount = (raw: unknown) => {
  const n = Number(String(raw ?? '').replace(/[,\s₹]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : NaN
}

export const toRupees = (amount: number, unit: BudgetUnit) =>
  Math.round(amount * (BUDGET_UNITS.find((u) => u.value === unit)?.multiplier ?? LAKH))

/** Human-readable summary stored on the enquiry and shown to staff. */
export function budgetSummary(range?: string | null, min?: number | null, max?: number | null) {
  if (!range) return ''
  if (range === 'unsure') return 'Not sure yet'
  if (range !== 'custom') return BUDGET_RANGES.find((r) => r.value === range)?.label ?? range
  if (min && max && max !== min) return `${formatINR(min)} – ${formatINR(max)}`
  if (min) return `About ${formatINR(min)}`
  return ''
}
