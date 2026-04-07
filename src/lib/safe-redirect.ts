const FALLBACK = "/users";

/**
 * Resolve OAuth callbackURL from query (?callbackUrl=).
 * Same-origin relative paths only; small allowlist to avoid open redirects.
 */
export function getSafeRedirectPath(raw: string | null | undefined): string {
  if (raw == null || typeof raw !== "string") return FALLBACK;
  let s = raw.trim();
  if (!s) return FALLBACK;
  try {
    s = decodeURIComponent(s);
  } catch {
    return FALLBACK;
  }
  if (!s.startsWith("/") || s.startsWith("//")) return FALLBACK;
  if (s.includes("@")) return FALLBACK;

  const pathOnly = s.split("?")[0].split("#")[0] || "";

  if (pathOnly === "/users") return "/users";
  if (pathOnly === "/continue/job-match") return "/continue/job-match";

  if (
    /^\/users\/[a-zA-Z0-9_-]+\/(job-match|resumes)$/.test(pathOnly)
  ) {
    return pathOnly;
  }

  return FALLBACK;
}
