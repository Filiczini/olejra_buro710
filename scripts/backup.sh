#!/bin/sh
set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/buro710_$DATE.sql.gz"
UPLOADS_BACKUP="$BACKUP_DIR/uploads_$DATE.tar.gz"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# Database backup
pg_dump | gzip > "$BACKUP_FILE"
echo "[$(date)] Database backup: $BACKUP_FILE"

# Uploads backup
if [ -d "/uploads" ] && [ "$(ls -A /uploads 2>/dev/null)" ]; then
  tar czf "$UPLOADS_BACKUP" -C / uploads
  echo "[$(date)] Uploads backup: $UPLOADS_BACKUP"
else
  echo "[$(date)] No uploads to backup"
fi

# Rotate old backups
find "$BACKUP_DIR" -name "buro710_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

echo "[$(date)] Backup completed. Removed backups older than $RETENTION_DAYS days."
