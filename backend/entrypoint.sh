#!/bin/sh
set -e

# Fix uploads volume ownership — Docker volume may be root-owned on existing deployments
chown -R app:app /app/uploads 2>/dev/null || true

echo "Running migrations..."
su-exec app npx tsx src/migrate.ts

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "Seeding admin user..."
  su-exec app npx tsx src/seed-admin.ts
fi

echo "Starting server..."
exec su-exec app npm start
