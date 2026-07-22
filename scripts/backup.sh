#!/bin/sh
set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_FILE="$BACKUP_DIR/buro710_${DATE}.sql.gz"
UPLOADS_FILE="$BACKUP_DIR/uploads_${DATE}.tar.gz"
RETENTION_DAYS=7
STATE_FILE="$BACKUP_DIR/.r2-last-upload"
R2_PREFIX="buro710"
WEEKLY_SECONDS=604800
RAW_DUMP="$BACKUP_DIR/.tmp_dump_${DATE}.sql"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# Database backup — dumped to a plain file first (not piped straight into
# gzip) so pg_dump's own exit status is checked directly. Piping it would
# mean `set -e` only sees gzip's exit code, and gzip happily produces a
# small-but-valid .gz from zero bytes if pg_dump fails partway — a broken
# dump would otherwise look like a successful, empty backup.
if ! pg_dump "$DATABASE_URL" > "$RAW_DUMP" 2>"$BACKUP_DIR/.tmp_dump_err"; then
  echo "[$(date)] ERROR: pg_dump failed:"
  cat "$BACKUP_DIR/.tmp_dump_err"
  rm -f "$RAW_DUMP" "$BACKUP_DIR/.tmp_dump_err"
  exit 1
fi
rm -f "$BACKUP_DIR/.tmp_dump_err"

# Sanity-check the dump actually looks like a PostgreSQL dump, not just
# "some bytes" — catches pg_dump exiting 0 while writing only a warning.
head -c 4096 "$RAW_DUMP" | grep -q "PostgreSQL database dump" || {
  echo "[$(date)] ERROR: dump doesn't look like a valid PostgreSQL dump"
  rm -f "$RAW_DUMP"
  exit 1
}

gzip -c "$RAW_DUMP" > "$DB_FILE"
rm -f "$RAW_DUMP"

# Integrity check
gzip -t "$DB_FILE" || { echo "[$(date)] ERROR: database backup corrupted"; exit 1; }
[ -s "$DB_FILE" ]   || { echo "[$(date)] ERROR: database backup is empty";    exit 1; }

echo "[$(date)] Database backup: $DB_FILE"

# Uploads backup (skip if empty). A failure here must not take down the
# whole run — the DB dump above already succeeded and should still reach
# local storage / R2 even if the uploads archive can't be made.
if [ -d "/uploads" ] && [ "$(ls -A /uploads 2>/dev/null)" ]; then
  if tar czf "$UPLOADS_FILE" -C / uploads; then
    echo "[$(date)] Uploads backup: $UPLOADS_FILE"
  else
    echo "[$(date)] WARN: uploads archive failed — continuing with DB backup only"
    rm -f "$UPLOADS_FILE"
  fi
else
  echo "[$(date)] No uploads to back up"
fi

# Offsite copy to Cloudflare R2 — daily whenever the DB actually changed,
# and at least once a week regardless, so a quiet week doesn't mean zero
# offsite copies.
if [ -n "$R2_ACCESS_KEY_ID" ] && [ -n "$R2_SECRET_ACCESS_KEY" ] && [ -n "$R2_ENDPOINT" ] && [ -n "$R2_BUCKET" ]; then
  DB_HASH=$(gzip -dc "$DB_FILE" | sha256sum | cut -d' ' -f1)
  LAST_HASH=""
  LAST_UPLOAD_EPOCH=0
  if [ -f "$STATE_FILE" ]; then
    LAST_HASH=$(sed -n '1p' "$STATE_FILE")
    LAST_UPLOAD_EPOCH=$(sed -n '2p' "$STATE_FILE")
  fi

  NOW_EPOCH=$(date +%s)
  AGE=$((NOW_EPOCH - LAST_UPLOAD_EPOCH))

  SHOULD_UPLOAD=0
  if [ "$DB_HASH" != "$LAST_HASH" ]; then
    echo "[$(date)] DB content changed since last R2 upload."
    SHOULD_UPLOAD=1
  elif [ "$AGE" -ge "$WEEKLY_SECONDS" ]; then
    echo "[$(date)] No DB changes, but $((AGE / 86400))d since last R2 upload — weekly fallback."
    SHOULD_UPLOAD=1
  fi

  if [ "$SHOULD_UPLOAD" = "1" ]; then
    export RCLONE_CONFIG_R2_TYPE=s3
    export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
    export RCLONE_CONFIG_R2_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
    export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
    export RCLONE_CONFIG_R2_ENDPOINT="$R2_ENDPOINT"
    export RCLONE_CONFIG_R2_ACL=private
    export RCLONE_CONFIG_R2_NO_CHECK_BUCKET=true

    if rclone copyto "$DB_FILE" "r2:${R2_BUCKET}/${R2_PREFIX}/db/$(basename "$DB_FILE")"; then
      if [ -f "$UPLOADS_FILE" ]; then
        rclone copyto "$UPLOADS_FILE" "r2:${R2_BUCKET}/${R2_PREFIX}/uploads/$(basename "$UPLOADS_FILE")" \
          || echo "[$(date)] WARN: uploads R2 copy failed, db copy still succeeded"
      fi
      printf '%s\n%s\n' "$DB_HASH" "$NOW_EPOCH" > "$STATE_FILE"
      echo "[$(date)] R2 upload complete."
    else
      echo "[$(date)] ERROR: R2 upload failed — will retry next run, local backup is unaffected."
    fi
  else
    echo "[$(date)] No DB changes and within the weekly window — skipping R2 upload."
  fi
else
  echo "[$(date)] R2 credentials not set — skipping offsite backup."
fi

# Rotate old backups
find "$BACKUP_DIR" -name "buro710_*.sql.gz"  -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "uploads_*.tar.gz"  -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

echo "[$(date)] Backup complete. Removed files older than ${RETENTION_DAYS} days."
