#!/usr/bin/env bash
# Build and deploy the OpenNext Worker, then re-apply Worker secrets from a local file.
# Cloudflare **secrets** are not removed by `wrangler deploy`, but if you only set values
# in the dashboard and your deploy path replaces config, or you use a fresh environment,
# re-syncing from the same file every time keeps production aligned with your intent.
#
# Usage (from repo root):
#   ./scripts/deploy-cloudflare.sh
#   ./scripts/deploy-cloudflare.sh /path/to/production.vars
#
# Skip the secret step (e.g. CI that injects secrets another way):
#   SKIP_CF_SECRETS=1 ./scripts/deploy-cloudflare.sh
#
# Cloudflare/GitHub build images usually have no .dev.vars (gitignored). The deploy still
# succeeds; secrets should live in the dashboard or be pushed from a protected CI secret file.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

opennextjs-cloudflare build
opennextjs-cloudflare deploy

if [[ "${SKIP_CF_SECRETS:-}" == "1" ]]; then
  echo "SKIP_CF_SECRETS=1 — skipped re-uploading Worker secrets. Set them in the dashboard or your pipeline."
  exit 0
fi

SECRETS_FILE="${1:-$ROOT/.dev.vars}"
if [[ ! -f "$SECRETS_FILE" ]]; then
  echo "No secrets file at $SECRETS_FILE (CI builds rarely commit .dev.vars). Deploy finished; manage Worker secrets in Cloudflare or run locally: npm run cf:secrets"
  exit 0
fi

exec bash scripts/push-auth-secrets-to-cloudflare.sh "$SECRETS_FILE"
