#!/usr/bin/env bash
set -euo pipefail

# Supabase → Local PostgreSQL Export Script
# Run this BEFORE switching DATABASE_URL to local postgres

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backup/supabase-export"
mkdir -p "$BACKUP_DIR"

OLD_DATABASE_URL="${OLD_DATABASE_URL:-}"
if [ -z "$OLD_DATABASE_URL" ]; then
  # Try to load from saved env file
  if [ -f "$BACKUP_DIR/.env_old" ]; then
    # shellcheck source=/dev/null
    source "$BACKUP_DIR/.env_old"
  fi
fi

if [ -z "$OLD_DATABASE_URL" ]; then
  echo "ERROR: OLD_DATABASE_URL not set."
  echo "Either export OLD_DATABASE_URL or ensure backup/supabase-export/.env_old exists."
  exit 1
fi

DUMP_FILE="$BACKUP_DIR/supabase-export.sql"

echo "Exporting Supabase database..."
echo "  Source: $(echo "$OLD_DATABASE_URL" | sed 's/:\/\/.*@/:\/\/****@/')"
echo "  Output: $DUMP_FILE"

# Run pg_dump inside Docker since it may not be installed locally
docker run --rm \
  -e DATABASE_URL="$OLD_DATABASE_URL" \
  postgres:17-alpine \
  sh -c 'pg_dump --no-owner --no-acl --format=plain "$DATABASE_URL"' \
  > "$DUMP_FILE"

echo "Export complete: $(wc -l < "$DUMP_FILE") lines"

echo ""
echo "Verifying dump contains all 6 tables..."
for table in posts blocks users refresh_tokens activity_logs contact_messages; do
  if grep -q "CREATE TABLE.*$table" "$DUMP_FILE" 2>/dev/null || grep -q "CREATE TABLE $table" "$DUMP_FILE" 2>/dev/null; then
    echo "  ✓ $table"
  else
    echo "  ✗ $table — NOT FOUND in dump!"
    exit 1
  fi
done

echo ""
echo "All tables verified. Dump saved to:"
echo "  $DUMP_FILE"
