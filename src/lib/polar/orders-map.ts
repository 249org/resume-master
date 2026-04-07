export type BillingOrderStatus = "Paid" | "Pending" | "Unpaid"

export type BillingOrderRow = {
  id: string
  date: string
  /** ms since epoch for sorting */
  paidAtMs: number
  amount: string
  status: BillingOrderStatus
  receiptUrl: string | null
  productName: string | null
}

function mapPolarStatus(raw: string | undefined, paidFlag?: unknown): BillingOrderStatus {
  if (paidFlag === true) return "Paid"
  const s = (raw ?? "").toLowerCase()
  if (s.includes("paid") || s.includes("complete")) return "Paid"
  if (s.includes("pending") || s.includes("open")) return "Pending"
  return "Unpaid"
}

function formatMoney(amount: unknown, currency: unknown): string {
  if (typeof amount !== "number") return "—"
  const cur = typeof currency === "string" ? currency.toUpperCase() : "USD"
  return `${(amount / 100).toFixed(2)} ${cur}`
}

function pickItems(data: unknown): unknown[] {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const o = data as Record<string, unknown>
  if (Array.isArray(o.items)) return o.items
  const r = o.result as Record<string, unknown> | undefined
  if (r && Array.isArray(r.items)) return r.items
  if (Array.isArray(o.results)) return o.results
  return []
}

function parseCreatedMs(o: Record<string, unknown>): number {
  const created =
    o.createdAt ??
    o.created_at ??
    o.created ??
    o.insertedAt ??
    o.paidAt ??
    o.paid_at
  if (created instanceof Date) return created.getTime()
  if (typeof created === "string" || typeof created === "number") {
    const d = new Date(created)
    if (!Number.isNaN(d.getTime())) return d.getTime()
  }
  return 0
}

function extractProductName(o: Record<string, unknown>): string | null {
  const prod = o.product
  if (prod && typeof prod === "object") {
    const p = prod as Record<string, unknown>
    const n = p.name ?? p.title
    if (typeof n === "string" && n.length > 0) return n
  }
  const items = o.items
  if (Array.isArray(items) && items[0] && typeof items[0] === "object") {
    const li = items[0] as Record<string, unknown>
    const lp = li.product
    if (lp && typeof lp === "object") {
      const p = lp as Record<string, unknown>
      const n = p.name ?? p.title
      if (typeof n === "string" && n.length > 0) return n
    }
  }
  if (typeof o.description === "string" && o.description.length > 0) {
    return o.description.length > 80
      ? `${o.description.slice(0, 80)}…`
      : o.description
  }
  return null
}

function extractReceiptUrl(o: Record<string, unknown>): string | null {
  if (typeof o.invoiceUrl === "string") return o.invoiceUrl
  if (typeof o.invoice_url === "string") return o.invoice_url
  if (typeof o.receiptUrl === "string") return o.receiptUrl
  if (typeof o.receipt_url === "string") return o.receipt_url
  if (typeof o.hostedInvoiceUrl === "string") return o.hostedInvoiceUrl
  if (typeof o.hosted_invoice_url === "string") return o.hosted_invoice_url
  const inv = o.invoice
  if (inv && typeof inv === "object") {
    const u = (inv as Record<string, unknown>).url
    if (typeof u === "string") return u
  }
  return null
}

/**
 * Normalize Polar customer portal orders list JSON to table rows.
 */
export function normalizeOrdersResponse(data: unknown): BillingOrderRow[] {
  const items = pickItems(data)
  const rows: BillingOrderRow[] = []

  for (const item of items) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    const id = String(o.id ?? o.orderId ?? "")
    if (!id) continue

    const paidAtMs = parseCreatedMs(o)

    const created =
      o.createdAt ??
      o.created_at ??
      o.created ??
      o.insertedAt ??
      o.paidAt
    let date = "—"
    if (created instanceof Date) {
      date = created.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } else if (typeof created === "string" || typeof created === "number") {
      const d = new Date(created)
      if (!Number.isNaN(d.getTime())) {
        date = d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }
    }

    const total =
      o.totalAmount ?? o.total_amount ?? o.amount ?? o.total ?? o.netAmount
    let amount = "—"
    if (typeof total === "number") {
      amount = formatMoney(total, o.currency ?? "usd")
    } else if (total && typeof total === "object") {
      const t = total as Record<string, unknown>
      amount = formatMoney(t.amount as number, t.currency)
    }

    const status = mapPolarStatus(
      String(o.status ?? o.paymentStatus ?? ""),
      o.paid,
    )

    const receiptUrl = extractReceiptUrl(o)
    const productName = extractProductName(o)

    rows.push({
      id,
      date,
      paidAtMs,
      amount,
      status,
      receiptUrl,
      productName,
    })
  }

  rows.sort((a, b) => b.paidAtMs - a.paidAtMs)
  return rows
}
