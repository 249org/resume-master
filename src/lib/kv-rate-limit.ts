import { getRateLimitKV } from "@/lib/cloudflare";

export type AnalysisMode = "ats" | "ai";

const GUEST_ATS_PREVIEW_HOURLY = 10;

/** Best-effort client IP for rate limiting (Workers: cf-connecting-ip; else X-Forwarded-For). */
export function getRequestIpKey(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf?.trim()) return cf.trim();
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

/**
 * Hourly cap for unauthenticated ATS preview on the marketing home page.
 * Keyed by IP string from getRequestIpKey.
 */
export async function checkGuestAtsPreviewRateLimit(
  ipKey: string
): Promise<boolean> {
  const kv = getRateLimitKV();
  const window = Math.floor(Date.now() / 3_600_000);
  const safeIp = ipKey.replace(/[^a-zA-Z0-9.:_-]/g, "_").slice(0, 64);
  const key = `rl:ats_preview:guest:${safeIp}:${window}`;

  const raw = await kv.get(key);
  const count = raw !== null ? parseInt(raw, 10) : 0;

  if (count >= GUEST_ATS_PREVIEW_HOURLY) return false;

  await kv.put(key, String(count + 1), { expirationTtl: 3_700 });
  return true;
}

const LIMITS: Record<AnalysisMode, number> = {
  ats: 20,
  ai: 5,
};

/**
 * Returns true if the user is within their hourly limit, false if rate limited.
 * Uses an hourly window keyed by wall-clock hour so limits reset naturally.
 */
export async function checkRateLimit(
  userId: string,
  mode: AnalysisMode
): Promise<boolean> {
  const kv = getRateLimitKV();
  const window = Math.floor(Date.now() / 3_600_000); // current UTC hour
  const key = `rl:${mode}:${userId}:${window}`;
  const limit = LIMITS[mode];

  const raw = await kv.get(key);
  const count = raw !== null ? parseInt(raw, 10) : 0;

  if (count >= limit) return false;

  // Increment — TTL slightly over 1 hour so the key expires naturally
  await kv.put(key, String(count + 1), { expirationTtl: 3_700 });
  return true;
}

/** Returns remaining calls for the current hour window (for response headers). */
export async function getRateLimitRemaining(
  userId: string,
  mode: AnalysisMode
): Promise<number> {
  const kv = getRateLimitKV();
  const window = Math.floor(Date.now() / 3_600_000);
  const key = `rl:${mode}:${userId}:${window}`;
  const limit = LIMITS[mode];

  const raw = await kv.get(key);
  const count = raw !== null ? parseInt(raw, 10) : 0;
  return Math.max(0, limit - count);
}
