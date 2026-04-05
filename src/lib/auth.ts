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

export function getAuth() {
  if (_auth) {
    return _auth;
  }

  _auth = betterAuth({
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
