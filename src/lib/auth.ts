import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db/index";
import * as schema from "@/db/schema/auth-schema";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Lazily initialised — getDb() calls getCloudflareContext() which requires
// an active request context, so we cannot call it at module-load time.
let _auth: ReturnType<typeof betterAuth> | undefined;

/** Public origin for OAuth redirects, cookies, and CSRF — must match Google/GitHub callback URLs. */
function resolveAuthBaseURL(): string | undefined {
  const raw =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BASE_URL?.trim() ||
    "";
  if (!raw) return undefined;
  return raw.replace(/\/$/, "");
}

function buildTrustedOrigins(base: string | undefined): string[] {
  const set = new Set<string>();
  if (base) {
    try {
      const withScheme = base.startsWith("http") ? base : `https://${base}`;
      set.add(new URL(withScheme).origin);
    } catch {
      /* ignore */
    }
  }
  set.add("http://localhost:3000");
  set.add("http://127.0.0.1:3000");
  set.add("https://localhost:3000");
  return [...set];
}

export function getAuth() {
  if (_auth) {
    return _auth;
  }

  const baseURL = resolveAuthBaseURL();

  _auth = betterAuth({
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: buildTrustedOrigins(baseURL),
    database: drizzleAdapter(getDb(), {
      provider: "sqlite",
      schema,
    }),
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [nextCookies()],
  });

  return _auth;
}

// Proxy so all existing callers using `auth.api.*` continue to work unchanged.
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_, prop) {
    return (getAuth() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function signOutAction() {
  "use server";

  await getAuth().api.signOut({
    headers: await headers(),
  });

  redirect("/sign-in");
}
