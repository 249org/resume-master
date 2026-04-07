import { getRateLimitKV } from "@/lib/cloudflare";

export type AnalysisMode = "ats" | "ai";

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
