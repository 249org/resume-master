import { mapCustomerStateToBilling } from '@/lib/polar/billing-map'

export type UsageSnapshotData = {
  consumed: number
  totalUnits: number
  displayLabel: string
}

export type UsageSnapshot = UsageSnapshotData | null

/** First Polar meter → sidebar “8/10” style progress. */
export function mapCustomerStateToUsageSnapshot(
  state: unknown,
): UsageSnapshot {
  const b = mapCustomerStateToBilling(state)
  const m = b.meters[0]
  if (!m) return null
  const consumed = m.consumed
  const cap =
    m.credited > 0 ? m.credited : consumed + Math.max(0, m.balance)
  if (cap <= 0 && consumed <= 0) return null
  const denom = cap > 0 ? cap : Math.max(consumed, 1)
  return {
    consumed,
    totalUnits: denom,
    displayLabel: `${Math.round(consumed)}/${Math.round(denom)}`,
  }
}
