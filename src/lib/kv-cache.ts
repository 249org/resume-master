import { getCacheKV } from "@/lib/cloudflare";
import type { AiReport } from "@/lib/job-match/ai-report";

const AI_CACHE_TTL = 86_400; // 24 hours

/** Stable 16-char hex digest of any string (WebCrypto SHA-256). */
async function shortHash(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

function cacheKey(jobTypeId: string, hash: string): string {
  return `ai:${jobTypeId}:${hash}`;
}

/**
 * Returns a cached AiReport if one exists for the given resume text + job type,
 * or null if there is no cache entry.
 */
export async function getAiCache(
  resumeText: string,
  jobTypeId: string
): Promise<AiReport | null> {
  const kv = getCacheKV();
  const hash = await shortHash(resumeText);
  const key = cacheKey(jobTypeId, hash);

  const raw = await kv.get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AiReport;
  } catch {
    return null;
  }
}

/**
 * Stores an AiReport in KV for 24 hours keyed by resume text + job type.
 */
export async function setAiCache(
  resumeText: string,
  jobTypeId: string,
  report: AiReport
): Promise<void> {
  const kv = getCacheKV();
  const hash = await shortHash(resumeText);
  const key = cacheKey(jobTypeId, hash);

  await kv.put(key, JSON.stringify(report), {
    expirationTtl: AI_CACHE_TTL,
  });
}
