import { createAuthClient } from "better-auth/react";

/**
 * Must match server `baseURL` (BETTER_AUTH_URL / NEXT_PUBLIC_APP_URL) or OAuth return + session
 * cookies will not line up. Falls back to current origin in the browser when env is missing.
 */
function getAuthClientBaseURL(): string {
  const fromEnv = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    ""
  ).replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

const baseURL = getAuthClientBaseURL();

export const authClient = createAuthClient({
  baseURL: baseURL || "http://localhost:3000",
});

export const { signIn, useSession, signOut } = authClient;
