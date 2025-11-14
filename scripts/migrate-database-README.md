# Database Migration Script - Quick Reference

## Quick Start

```bash
# Check pending migrations (safe, no changes)
bash scripts/migrate-database.sh --dry-run

# List pending migrations
bash scripts/migrate-database.sh --list-pending

# Run migrations in production (with backup)
bash scripts/migrate-database.sh

# Run migrations in test (no backup)
bash scripts/migrate-database.sh --environment test
```

## Common Commands

| Command | Description |
|---------|-------------|
| `--help` | Show help message |
| `--dry-run` | Check migrations without applying |
| `--list-pending` | List pending migrations |
| `--verify` | Verify migration status |
| `--environment test` | Run in test environment |
| `--skip-backup` | Skip database backup |

## Safety Features

✅ Automatic database backup (production)
✅ Automatic rollback on failure
✅ Migration verification
✅ Detailed logging
✅ Dry-run mode

## Database Support

- SQLite (built-in)
- PostgreSQL (requires pg_dump/psql)
- MySQL (requires mysqldump/mysql)

## Backup Location

```
backups/db_backups/
├── db_backup_20241114_143022.db
└── db_backup_20241114_120015.sql
```

## Logs

```
logs/deployments/deploy_*.log
```

## Full Documentation

See: `docs/database-migration-safety.md`
