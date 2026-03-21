import { POLAR_USAGE_EVENT_JOB_MATCH } from "@/lib/polar/usage-constants";

function appBaseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/**
 * Record a usage event to Polar (meter must exist in Polar dashboard).
 * Safe to call without awaiting in API routes; swallows errors.
 */
export async function ingestPolarUsage(
  cookieHeader: string | null,
  eventName: string,
  metadata: Record<string, string | number | boolean>,
): Promise<void> {
  if (!cookieHeader) return;

  try {
    const res = await fetch(`${appBaseUrl()}/api/auth/usage/ingest`, {
      method: "POST",
      headers: {
        cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event: eventName, metadata }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("[polar] usage ingest failed:", res.status);
    }
  } catch (e) {
    console.warn("[polar] usage ingest error:", e);
  }
}

export async function ingestJobMatchAnalysis(
  cookieHeader: string | null,
  extra: Record<string, string | number | boolean> = {},
): Promise<void> {
  return ingestPolarUsage(cookieHeader, POLAR_USAGE_EVENT_JOB_MATCH, {
    ...extra,
    at: Date.now(),
  });
}
