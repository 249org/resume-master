import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema/auth-schema";

export type AppDb = ReturnType<typeof drizzle<typeof schema>>;

export function getDb(): AppDb {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
}

export function getCacheKV(): KVNamespace {
  const { env } = getCloudflareContext();
  return env.CACHE_KV;
}

export function getRateLimitKV(): KVNamespace {
  const { env } = getCloudflareContext();
  return env.RATE_LIMIT_KV;
}
