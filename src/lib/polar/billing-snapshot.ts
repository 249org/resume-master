import {
  getCustomerOrdersForRequest,
  getCustomerStateForUser,
} from '@/lib/polar/billing-data'
import type { CustomerStateResult } from '@/lib/polar/billing-data'
import {
  mapCustomerStateToBilling,
  mergeBillingWithPaidOrders,
  type BillingSummary,
} from '@/lib/polar/billing-map'
import { normalizeOrdersResponse } from '@/lib/polar/orders-map'
import type { BillingOrderRow } from '@/lib/polar/orders-map'

export type BillingSnapshot = {
  stateResult: CustomerStateResult
  billing: BillingSummary
  orders: BillingOrderRow[]
}

/**
 * Shared Polar billing state + orders merge (same pipeline as billing page,
 * without invoice URL enrichment — use on checkout for performance).
 */
export async function getBillingSnapshot(
  userId: string,
  cookieHeader: string | null,
): Promise<BillingSnapshot> {
  const stateResult = await getCustomerStateForUser(userId)
  const ordersRaw = await getCustomerOrdersForRequest(cookieHeader)
  const orders = normalizeOrdersResponse(ordersRaw)

  let billing = mapCustomerStateToBilling(null)
  if (stateResult.status === 'ok') {
    billing = mapCustomerStateToBilling(stateResult.state)
  }
  billing = mergeBillingWithPaidOrders(billing, orders)

  return { stateResult, billing, orders }
}
