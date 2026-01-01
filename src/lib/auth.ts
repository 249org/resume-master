import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index";
import * as schema from '@/db/schema/auth-schema';
import { polar, checkout, portal, usage, } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    // Use 'sandbox' if you're using the Polar Sandbox environment
    // Remember that access tokens, products, etc. are completely separated between environments.
    // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
    server: 'sandbox'
});

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        }
    },

    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "b0dcd715-4684-4225-bc34-47ca86aecf3b",
                            slug: "Pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/Tier-3
                        },
                        {
                            productId: "7eafbde9-798a-4afb-b378-b1fa65b6d255",
                            slug: "Basic" // Custom slug for easy reference in Checkout URL, e.g. /checkout/Tier-2
                        },
                        {
                            productId: "fd5fb6c3-2da0-4a94-96a9-0aa8613719b9",
                            slug: "Free" // Custom slug for easy reference in Checkout URL, e.g. /checkout/Free
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true
                })
            ],
        })
    ]

});
export async function signOutAction() {
    "use server"

    await auth.api.signOut({
        headers: await headers()
    })

    redirect('/sign-in')
}