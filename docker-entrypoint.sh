#!/bin/sh
set -e

# Apply pending database migrations before starting (safe, idempotent).
echo "Running database migrations…"
./node_modules/.bin/prisma migrate deploy || echo "migrate deploy skipped/failed (continuing)"

echo "Starting ForcePK…"
exec "$@"
