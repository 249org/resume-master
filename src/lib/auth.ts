import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db/index";
import * as schema from "@/db/schema/auth-schema";
import { polar, checkout, portal, usage } from "@polar-sh/better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCheckoutProductsForAuth } from "@/config/polar-products";
import { getPolarSdk } from "@/lib/polar/sdk";

function appBaseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

// Lazily initialised — getDb() calls getCloudflareContext() which requires
// an active request context, so we cannot call it at module-load time.
let _auth: ReturnType<typeof betterAuth> | undefined;
/** When Polar env changes, rebuild auth so checkout uses the new token / product list. */
let _authPolarConfigKey: string | undefined;

function polarPluginConfigKey(): string {
  return [
    (process.env.POLAR_ACCESS_TOKEN ?? "").trim(),
    process.env.POLAR_ENV ?? "",
    process.env.POLAR_SUCCESS_URL ?? "",
    JSON.stringify(getCheckoutProductsForAuth()),
  ].join("\0");
}

export function getAuth() {
  const key = polarPluginConfigKey();
  if (_auth && _authPolarConfigKey === key) {
    return _auth;
  }

  _authPolarConfigKey = key;

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
    plugins: [
      nextCookies(),
      polar({
        client: getPolarSdk(),
        // Disabled: Polar does not allow updating external_id on existing customers.
        // When enabled, the plugin tries to sync external_id after sign-up and fails
        // if a Polar customer already exists for that email (e.g. after DB migration).
        // Customers are created when users go through checkout instead.
        createCustomerOnSignUp: false,
        use: [
          checkout({
            products: getCheckoutProductsForAuth(),
            successUrl: process.env.POLAR_SUCCESS_URL,
            authenticatedUsersOnly: true,
          }),
          portal({
            returnUrl: appBaseUrl(),
          }),
          usage(),
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
