import { getPolarSdk } from "@/lib/polar/sdk";
import type { BillingOrderRow } from "@/lib/polar/orders-map";
import { formatCardDisplay } from "@/lib/polar/card-hint";

export type CustomerStateResult =
  | { status: "ok"; state: unknown }
  | { status: "no_customer" }
  | { status: "error"; message: string };

function appBaseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/**
 * Polar customer state for a user (externalId = Better Auth user id).
 * Call only after verifying session.user.id === userId.
 */
export async function getCustomerStateForUser(
  userId: string,
): Promise<CustomerStateResult> {
  try {
    const state = await getPolarSdk().customers.getStateExternal({
      externalId: userId,
    });
    return { status: "ok", state };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/404|not\s*found|unknown|does\s*not\s*exist|no\s*such/i.test(msg)) {
      return { status: "no_customer" };
    }
    return { status: "error", message: msg };
  }
}

/**
 * Orders via Better Auth polar plugin (requires session cookie).
 */
export async function getCustomerOrdersForRequest(
  cookieHeader: string | null,
): Promise<unknown | null> {
  if (!cookieHeader) return null;

  const url = `${appBaseUrl()}/api/auth/customer/orders/list?page=1&limit=50`;
  try {
    const res = await fetch(url, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fill receipt URLs via Polar Orders API (`orders.invoice`). If missing, try
 * generating the invoice first (async on Polar’s side).
 */
export async function enrichOrdersWithInvoiceUrls(
  rows: BillingOrderRow[],
): Promise<BillingOrderRow[]> {
  const sdk = getPolarSdk();
  const max = Math.min(rows.length, 10);
  const out: BillingOrderRow[] = [...rows];

  for (let i = 0; i < max; i++) {
    const row = out[i];
    if (row.receiptUrl || row.status !== "Paid") continue;

    try {
      const inv = await sdk.orders.invoice({ id: row.id });
      if (inv?.url) {
        out[i] = { ...row, receiptUrl: inv.url };
      }
    } catch {
      /* Invoice may not exist until generated in Polar — user can use portal. */
    }
  }

  return out;
}

export type CardPaymentHint = {
  display: string;
  brand: string;
  last4: string;
};

/**
 * Latest card payment for this email (org access token + `payments:read`).
 */
export async function getCardPaymentHintForEmail(
  email: string,
): Promise<CardPaymentHint | null> {
  if (!email?.trim()) return null;

  const sdk = getPolarSdk();
  try {
    const iter = await sdk.payments.list({
      customerEmail: email.trim(),
      limit: 20,
      sorting: ["-created_at"],
    });

    for await (const page of iter) {
      const items = page.result?.items ?? [];
      for (const p of items) {
        if (
          p &&
          typeof p === "object" &&
          "method" in p &&
          (p as { method?: string }).method === "card" &&
          "methodMetadata" in p
        ) {
          const meta = (p as { methodMetadata: { brand: string; last4: string } })
            .methodMetadata;
          if (meta?.brand && meta?.last4) {
            return {
              brand: meta.brand,
              last4: meta.last4,
              display: formatCardDisplay(meta.brand, meta.last4),
            };
          }
        }
      }
      break;
    }
  } catch {
    return null;
  }

  return null;
}
