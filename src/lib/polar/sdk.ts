import { Polar } from "@polar-sh/sdk";

let _polar: Polar | undefined;
let _polarCacheKey: string | undefined;
let _loggedServer: boolean | undefined;

/**
 * Shared Polar SDK instance (same token/server as Better Auth polar plugin).
 * Use only on the server.
 *
 * **POLAR_ENV** must match where your access token and product IDs were created:
 * use `sandbox` for Polar Sandbox (typical local dev) and leave unset or
 * `production` for live. Sandbox tokens only work with `POLAR_ENV=sandbox`;
 * production tokens only with production — otherwise Polar returns **401 invalid_token**.
 */
export function getPolarSdk(): Polar {
  const accessToken = (process.env.POLAR_ACCESS_TOKEN ?? "").trim();
  const server =
    process.env.POLAR_ENV === "sandbox" ? "sandbox" : "production";
  const cacheKey = `${accessToken}|${server}`;

  if (_polar && _polarCacheKey === cacheKey) {
    return _polar;
  }

  _polarCacheKey = cacheKey;
  _polar = new Polar({
    accessToken,
    server,
  });

  if (!accessToken) {
    console.warn(
      "[polar] POLAR_ACCESS_TOKEN is not set — billing and checkout will fail until configured.",
    );
  } else if (
    process.env.NODE_ENV === "development" &&
    !accessToken.startsWith("polar_oat_")
  ) {
    console.warn(
      "[polar] POLAR_ACCESS_TOKEN should be a Polar Organization Access Token (prefix polar_oat_). Wrong token type → 401 invalid_token.",
    );
  }

  if (process.env.NODE_ENV === "development" && !_loggedServer) {
    _loggedServer = true;
    const raw = process.env.POLAR_ENV;
    console.info(
      `[polar] API server: ${server}` +
        (raw === undefined
          ? " (POLAR_ENV unset → production). Sandbox tokens require POLAR_ENV=sandbox."
          : ""),
    );
  }

  return _polar;
}
