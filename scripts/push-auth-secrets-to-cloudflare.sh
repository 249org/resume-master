#!/usr/bin/env bash
# Upload Better Auth + OAuth env vars from a file into Cloudflare Worker secrets for this project.
# Usage:
#   ./scripts/push-auth-secrets-to-cloudflare.sh
#   ./scripts/push-auth-secrets-to-cloudflare.sh /path/to/production.vars
#
# Before deploying to production, ensure BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL in that file
# use your real site origin (e.g. https://resume-master.249org.com), not localhost.
#
# Requires: wrangler CLI, `wrangler login`, and wrangler.jsonc `name` matching the Worker.
# If you see auth error 10000: set wrangler.jsonc `account_id` to the account id from `wrangler whoami`
# (OAuth tokens only work for that account).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FILE="${1:-$ROOT/.dev.vars}"

if [[ ! -f "$FILE" ]]; then
  echo "File not found: $FILE" >&2
  exit 1
fi

KEYS=(
  BETTER_AUTH_SECRET
  BETTER_AUTH_URL
  GITHUB_CLIENT_ID
  GITHUB_CLIENT_SECRET
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  NEXT_PUBLIC_APP_URL
)

get_val() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "$FILE" | tail -1 || true)"
  [[ -z "$line" ]] && return 1
  line="${line#${key}=}"
  line="${line%$'\r'}"
  if [[ "$line" =~ ^\".*\"$ ]]; then
    line="${line#\"}"
    line="${line%\"}"
  fi
  printf '%s' "$line"
}

cd "$ROOT"

for key in "${KEYS[@]}"; do
  val="$(get_val "$key" || true)"
  if [[ -z "${val:-}" ]]; then
    echo "Skipping $key (not set in $FILE)"
    continue
  fi
  echo "Setting secret: $key"
  printf '%s' "$val" | wrangler secret put "$key"
done

echo "Done. Verify in Cloudflare dashboard → Workers & Pages → resume-master → Settings → Variables and Secrets."
