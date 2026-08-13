#!/usr/bin/env sh
# Daily Postgres backup helper (run via cron or compose).
set -eu
STAMP=$(date +%Y%m%d_%H%M%S)
OUT="/backups/dadda_${STAMP}.sql.gz"
pg_dump -U "${POSTGRES_USER:-dadda}" -d "${POSTGRES_DB:-dadda_bakery}" | gzip > "$OUT"
# Keep last 14 backups
ls -1t /backups/dadda_*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm -f
echo "Backup written to $OUT"
