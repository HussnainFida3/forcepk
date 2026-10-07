#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# ForcePK one-command deploy: pack -> upload -> install -> build -> restart
#
# Usage (from the repo root):
#   FORCEPK_SSH_KEY=~/.ssh/shadilife_deploy bash deploy/deploy.sh
#
# Optional flags (env vars):
#   RUN_MIGRATIONS=1   also run `npx prisma migrate deploy` on the server
#   RUN_SEED=1         also run `npx prisma db seed` (adds demo data if empty)
#
# Safety:
#   * All .env* files are EXCLUDED from the upload, so the server's own
#     secrets in /var/www/forcepk/.env are never overwritten.
#   * node_modules/.next/.git/.pgdata are excluded (rebuilt on the server).
# ──────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Config (override via env if needed) ──
HOST="${FORCEPK_HOST:-root@187.127.74.184}"
SSH_KEY="${FORCEPK_SSH_KEY:-$HOME/.ssh/shadilife_deploy}"
REMOTE_DIR="${FORCEPK_REMOTE_DIR:-/var/www/forcepk}"
PM2_NAME="${FORCEPK_PM2_NAME:-forcepk-frontend}"

SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=no)

# ── Resolve repo root (parent of this script's dir) ──
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

echo "▶ Deploying ForcePK"
echo "   repo:   $ROOT"
echo "   host:   $HOST"
echo "   key:    $SSH_KEY"
echo "   target: $REMOTE_DIR  (pm2: $PM2_NAME)"
echo

if [[ ! -f "$SSH_KEY" ]]; then
  echo "✖ SSH key not found at: $SSH_KEY" >&2
  echo "  Set FORCEPK_SSH_KEY to the path of your deploy key." >&2
  exit 1
fi

# ── 1. Pack + upload source (never touches server .env*) ──
echo "① Uploading source…"
tar czf - \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=.pgdata \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.log' \
  app components lib prisma public scripts deploy types \
  auth.ts auth.config.ts middleware.ts next.config.mjs \
  package.json package-lock.json postcss.config.mjs tailwind.config.ts tsconfig.json \
  | ssh "${SSH_OPTS[@]}" "$HOST" "mkdir -p $REMOTE_DIR && tar xzf - -C $REMOTE_DIR"

# ── 2. Install, (migrate), generate, build, restart ──
echo "② Installing + building on server…"
ssh "${SSH_OPTS[@]}" "$HOST" "bash -s" <<REMOTE
set -euo pipefail
cd "$REMOTE_DIR"
npm install --no-audit --no-fund
npx prisma generate
if [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
  echo "   running migrations…"
  npx prisma migrate deploy
fi
if [ "${RUN_SEED:-0}" = "1" ]; then
  echo "   running seed…"
  npx prisma db seed || true
fi
npm run build
pm2 restart "$PM2_NAME" --update-env
pm2 save >/dev/null 2>&1 || true
echo "   ✓ built and restarted"
REMOTE

# ── 3. Health check ──
echo "③ Verifying https://forcepk.com …"
CODE="$(curl -s -o /dev/null -w '%{http_code}' https://forcepk.com/ || echo 000)"
echo "   forcepk.com -> HTTP $CODE"
[[ "$CODE" == "200" ]] && echo "✅ Deploy complete." || echo "⚠ Site returned $CODE — check 'pm2 logs $PM2_NAME' on the server."
