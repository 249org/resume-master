import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db/index";
import * as schema from "@/db/schema/auth-schema";
import { polar, checkout } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "production",
});

// Lazily initialised — getDb() calls getCloudflareContext() which requires
// an active request context, so we cannot call it at module-load time.
let _auth: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (_auth) return _auth;

  _auth = betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: "sqlite",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
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
    plugins: [
      nextCookies(),
      polar({
        client: polarClient,
        // Disabled: Polar does not allow updating external_id on existing customers.
        // When enabled, the plugin tries to sync external_id after sign-up and fails
        // if a Polar customer already exists for that email (e.g. after DB migration).
        // Customers are created when users go through checkout instead.
        createCustomerOnSignUp: false,
        use: [
          checkout({
            products: [
              {
                productId: "b0dcd715-4684-4225-bc34-47ca86aecf3b",
                slug: "Pro",
              },
              {
                productId: "7eafbde9-798a-4afb-b378-b1fa65b6d255",
                slug: "Basic",
              },
              {
                productId: "fd5fb6c3-2da0-4a94-96a9-0aa8613719b9",
                slug: "Free",
              },
            ],
            successUrl: process.env.POLAR_SUCCESS_URL,
            authenticatedUsersOnly: true,
          }),
        ],
      }),
    ],
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
