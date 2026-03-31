#!/bin/sh
set -e

echo "Running migrations..."
npx tsx src/migrate.ts

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "Seeding admin user..."
  npx tsx src/seed-admin.ts
fi

echo "Starting server..."
exec npm start
