#!/bin/sh
set -e

# Fix uploads volume ownership — Docker volume may be root-owned on existing deployments
chown -R app:app /app/uploads 2>/dev/null || true

echo "Running migrations..."
su-exec app npx tsx src/migrate.ts

if [ "$SEED_FROM_DUMP" = "true" ]; then
  echo "Seeding from dump..."
  su-exec app npx tsx src/seed-from-dump.ts
fi

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "Seeding admin user..."
  su-exec app npx tsx src/seed-admin.ts
fi

echo "Starting server..."
exec su-exec app npm start
