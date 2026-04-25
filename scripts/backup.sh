#!/bin/sh
set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_FILE="$BACKUP_DIR/buro710_${DATE}.sql.gz"
UPLOADS_FILE="$BACKUP_DIR/uploads_${DATE}.tar.gz"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# Database backup — uses DATABASE_URL connection string directly
pg_dump "$DATABASE_URL" | gzip > "$DB_FILE"

# Integrity check
gzip -t "$DB_FILE" || { echo "[$(date)] ERROR: database backup corrupted"; exit 1; }
[ -s "$DB_FILE" ]   || { echo "[$(date)] ERROR: database backup is empty";    exit 1; }

echo "[$(date)] Database backup: $DB_FILE"

# Uploads backup (skip if empty)
if [ -d "/uploads" ] && [ "$(ls -A /uploads 2>/dev/null)" ]; then
  tar czf "$UPLOADS_FILE" -C / uploads
  echo "[$(date)] Uploads backup: $UPLOADS_FILE"
else
  echo "[$(date)] No uploads to back up"
fi

# Rotate old backups
find "$BACKUP_DIR" -name "buro710_*.sql.gz"  -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "uploads_*.tar.gz"  -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

echo "[$(date)] Backup complete. Removed files older than ${RETENTION_DAYS} days."
