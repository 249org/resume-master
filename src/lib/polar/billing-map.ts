import { resolvePolarProductLabelById } from '@/config/polar-products'
import type { BillingOrderRow } from '@/lib/polar/orders-map'

/**
 * Map Polar CustomerState (SDK shape) to billing UI fields.
 * Defensive — Polar may evolve response shapes.
 *
 * Polar returns `active_subscriptions` / `active_meters` (snake_case) from the HTTP
 * API; the TS SDK may camelCase them — we accept both.
 */
export type BillingSummary = {
  planName: string | null
  priceLabel: string | null
  renewsAtLabel: string | null
  /** subscription = recurring Polar sub; one_time = paid order without active sub (e.g. one-time product) */
  purchaseKind: "subscription" | "one_time" | null
  subscriptionStatus: "active" | "trialing" | "canceled" | "none" | "unknown"
  meters: Array<{
    name: string
    balance: number
    consumed: number
    credited: number
  }>
}

function pick(obj: unknown, keys: string[]): unknown {
  if (!obj || typeof obj !== "object") return undefined
  const o = obj as Record<string, unknown>
  for (const k of keys) {
    if (k in o) return o[k]
  }
  return undefined
}

function formatDate(value: unknown): string | null {
  if (value == null) return null
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return value.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  return null
}

/** Polar SDK may nest state or return it at root depending on caller. */
function unwrapCustomerStatePayload(state: unknown): unknown {
  if (!state || typeof state !== "object") return state
  const o = state as Record<string, unknown>
  const inner = o.customerState ?? o.customer_state
  if (inner && typeof inner === "object") return inner
  return state
}

export function mapCustomerStateToBilling(state: unknown): BillingSummary {
  const empty: BillingSummary = {
    planName: null,
    priceLabel: null,
    renewsAtLabel: null,
    purchaseKind: null,
    subscriptionStatus: "none",
    meters: [],
  }

  const root = unwrapCustomerStatePayload(state)
  if (!root || typeof root !== "object") return empty

  const s = root as Record<string, unknown>

  const subs = pick(s, [
    "activeSubscriptions",
    "active_subscriptions",
    "subscriptions",
  ])
  const list = Array.isArray(subs) ? subs : []
  const first = list[0] as Record<string, unknown> | undefined

  if (first) {
    empty.purchaseKind = "subscription"
    const status = String(
      pick(first, ["status", "subscriptionStatus"]) ?? "",
    ).toLowerCase()
    if (status === "active" || status.includes("active"))
      empty.subscriptionStatus = "active"
    else if (status === "trialing" || status.includes("trial"))
      empty.subscriptionStatus = "trialing"
    else if (status.includes("cancel"))
      empty.subscriptionStatus = "canceled"
    else empty.subscriptionStatus = "unknown"

    const product = pick(first, ["product", "productName"])
    if (product && typeof product === "object") {
      const p = product as Record<string, unknown>
      empty.planName =
        (p.name as string) || (p.title as string) || empty.planName
    }

    const productId = pick(first, ["productId", "product_id"])
    if (typeof productId === "string" && !empty.planName) {
      empty.planName =
        resolvePolarProductLabelById(productId) ?? empty.planName
    }

    const amountNum = pick(first, ["amount"])
    const currencyRaw = pick(first, ["currency"])
    if (typeof amountNum === "number") {
      const cur =
        typeof currencyRaw === "string" ? currencyRaw.toUpperCase() : "USD"
      empty.priceLabel = `${(amountNum / 100).toFixed(2)} ${cur}`
      const interval = pick(first, [
        "recurringInterval",
        "recurring_interval",
      ])
      if (typeof interval === "string" && interval.length > 0) {
        empty.priceLabel = `${empty.priceLabel} / ${interval}`
      }
    } else {
      const price = pick(first, ["price", "recurringAmount"])
      if (price && typeof price === "object") {
        const pr = price as Record<string, unknown>
        const amt = pr.priceAmount ?? pr.amount
        const cur = pr.priceCurrency ?? pr.currency ?? "usd"
        if (typeof amt === "number") {
          empty.priceLabel = `${(amt / 100).toFixed(2)} ${String(cur).toUpperCase()}`
        }
      }
    }

    const end = pick(first, [
      "currentPeriodEnd",
      "current_period_end",
      "endsAt",
      "ends_at",
      "endedAt",
      "ended_at",
      "renewsAt",
    ])
    empty.renewsAtLabel = formatDate(end) ?? empty.renewsAtLabel
  }

  const metersRaw = pick(s, [
    "activeMeters",
    "active_meters",
    "meters",
    "customerMeters",
  ])
  const meterList = Array.isArray(metersRaw) ? metersRaw : []
  for (const m of meterList) {
    if (!m || typeof m !== "object") continue
    const mr = m as Record<string, unknown>
    const meter = pick(mr, ["meter", "meterName"])
    let name = "Usage"
    if (meter && typeof meter === "object") {
      const mm = meter as Record<string, unknown>
      name = String(mm.name ?? mm.slug ?? name)
    } else {
      const mid = pick(mr, ["meterId", "meter_id"])
      if (typeof mid === "string" && mid.length > 8) {
        name = `Meter …${mid.slice(-8)}`
      }
    }
    const balance = Number(mr.balance ?? mr.remaining ?? 0)
    const consumed = Number(
      mr.consumedUnits ?? mr.consumed_units ?? mr.consumed ?? 0,
    )
    const credited = Number(
      mr.creditedUnits ?? mr.credited_units ?? mr.credited ?? 0,
    )
    empty.meters.push({ name, balance, consumed, credited })
  }

  return empty
}

/** Product UUID of the first active subscription (for checkout “current plan” slug). */
export function getFirstSubscriptionProductId(state: unknown): string | null {
  const root = unwrapCustomerStatePayload(state)
  if (!root || typeof root !== "object") return null
  const s = root as Record<string, unknown>
  const subs = pick(s, [
    "activeSubscriptions",
    "active_subscriptions",
    "subscriptions",
  ])
  const list = Array.isArray(subs) ? subs : []
  const first = list[0] as Record<string, unknown> | undefined
  if (!first) return null
  const productId = pick(first, ["productId", "product_id"])
  return typeof productId === "string" ? productId : null
}

/**
 * When Polar has no `active_subscriptions` (common for **one-time** purchases),
 * still show plan/price from the latest paid order.
 */
export function mergeBillingWithPaidOrders(
  billing: BillingSummary,
  orders: BillingOrderRow[],
): BillingSummary {
  const paid = orders.filter((o) => o.status === "Paid")
  if (paid.length === 0) return billing

  const latest = [...paid].sort((a, b) => b.paidAtMs - a.paidAtMs)[0]

  if (billing.purchaseKind === "subscription") {
    return {
      ...billing,
      planName: billing.planName ?? latest.productName,
      priceLabel: billing.priceLabel ?? latest.amount,
    }
  }

  return {
    ...billing,
    purchaseKind: "one_time",
    planName: latest.productName ?? billing.planName ?? "Your purchase",
    priceLabel: latest.amount,
    subscriptionStatus: "active",
    renewsAtLabel: billing.renewsAtLabel,
  }
}
