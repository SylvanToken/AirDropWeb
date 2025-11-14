# Database Migration Safety Documentation

## Overview

This document describes the database migration safety features implemented in the Sylvan Token deployment system. These features ensure that database migrations are applied safely with automatic backup, rollback, and verification capabilities.

## Features

### 1. Automatic Database Backup

Before applying migrations in production, the system automatically creates a backup of the database:

- **SQLite**: Copies the database file
- **PostgreSQL**: Uses `pg_dump` to create SQL backup
- **MySQL**: Uses `mysqldump` to create SQL backup

Backups are stored in `backups/db_backups/` with timestamps.

### 2. Migration Error Handling

If a migration fails, the system automatically:

1. Detects the failure
2. Restores the database from the backup
3. Logs the error details
4. Returns error status to prevent deployment

### 3. Migration Logging

All migration steps are logged with:

- Timestamp
- Migration names being applied
- Duration
- Success/failure status
- Error details (if any)

### 4. Migration Verification

After applying migrations, the system verifies:

- All migrations were applied successfully
- Database schema is up to date
- No pending migrations remain

### 5. Dry-Run Mode

Test migrations without applying them:

```bash
bash scripts/migrate-database.sh --dry-run
```

This checks for pending migrations without making any changes.

## Usage

### Standalone Migration Script

The `scripts/migrate-database.sh` script provides safe migration capabilities:

#### Basic Usage

```bash
# Run migrations in production (with backup)
bash scripts/migrate-database.sh

# Run migrations in test environment (no backup)
bash scripts/migrate-database.sh --environment test

# Check pending migrations without applying
bash scripts/migrate-database.sh --dry-run

# List pending migrations
bash scripts/migrate-database.sh --list-pending

# Verify migration status
bash scripts/migrate-database.sh --verify

# Skip database backup (not recommended for production)
bash scripts/migrate-database.sh --skip-backup
```

#### Command Options

| Option | Description |
|--------|-------------|
| `--help` | Show help message |
| `--environment ENV` | Environment (production\|test) |
| `--skip-backup` | Skip database backup |
| `--dry-run` | Check migrations without applying |
| `--list-pending` | List pending migrations and exit |
| `--verify` | Verify migration status and exit |

### Integration with Deployment Scripts

All deployment scripts automatically use safe migrations:

#### deploy-update.sh

```bash
# Migrations run with safety features
./deploy-update.sh
```

Features:
- Automatic database backup (production)
- Error handling with rollback
- Migration verification
- Detailed logging

#### deploy-production.sh

```bash
# Initial production deployment
./deploy-production.sh
```

Features:
- Database backup before migrations
- Migration verification
- Rollback on failure

#### deploy-test.sh

```bash
# Test environment deployment
./deploy-test.sh
```

Features:
- Skips database backup (test environment)
- Migration verification
- Error logging

## Migration Safety Functions

### create_database_backup()

Creates a backup of the database before migrations.

**Parameters:**
- `environment` - Environment name (production|test)

**Returns:**
- Path to backup file on success
- Error code 1 on failure

**Example:**
```bash
db_backup=$(create_database_backup "production")
```

### restore_database_backup()

Restores database from a backup file.

**Parameters:**
- `backup_file` - Path to backup file

**Returns:**
- 0 on success
- 1 on failure

**Example:**
```bash
restore_database_backup "$db_backup_file"
```

### run_migration_dry_run()

Checks for pending migrations without applying them.

**Returns:**
- 0 on success
- 1 on failure

**Example:**
```bash
run_migration_dry_run
```

### get_pending_migrations()

Gets list of pending migrations.

**Returns:**
- List of migration names (one per line)

**Example:**
```bash
pending=$(get_pending_migrations)
echo "$pending"
```

### verify_migrations()

Verifies that all migrations were applied successfully.

**Returns:**
- 0 if all migrations applied
- 1 if some migrations pending

**Example:**
```bash
verify_migrations
```

### run_migrations_safe()

Runs migrations with full safety features.

**Parameters:**
- `environment` - Environment (production|test)
- `skip_backup` - Skip backup (true|false)
- `dry_run` - Dry run mode (true|false)

**Returns:**
- 0 on success
- 1 on failure

**Example:**
```bash
run_migrations_safe "production" "false" "false"
```

### cleanup_old_database_backups()

Removes database backups older than specified days.

**Parameters:**
- `retention_days` - Days to keep backups (default: 7)

**Returns:**
- 0 on success

**Example:**
```bash
cleanup_old_database_backups 7
```

## Migration Workflow

### Production Migration Workflow

```
1. Check for pending migrations (dry-run)
   ↓
2. Create database backup
   ↓
3. Apply migrations
   ↓
4. Verify migrations
   ↓
5. Log applied migrations
   ↓
6. Success!

If any step fails:
   ↓
7. Restore database from backup
   ↓
8. Log error
   ↓
9. Return failure
```

### Test Environment Workflow

```
1. Check for pending migrations (dry-run)
   ↓
2. Skip database backup (test environment)
   ↓
3. Apply migrations
   ↓
4. Verify migrations
   ↓
5. Log applied migrations
   ↓
6. Success!

If any step fails:
   ↓
7. Log error (no rollback in test)
   ↓
8. Return failure
```

## Database Support

### SQLite

- **Backup**: File copy
- **Restore**: File copy
- **Requirements**: None (built-in)

### PostgreSQL

- **Backup**: `pg_dump`
- **Restore**: `psql`
- **Requirements**: PostgreSQL client tools

Install on Ubuntu/Debian:
```bash
sudo apt-get install postgresql-client
```

### MySQL

- **Backup**: `mysqldump`
- **Restore**: `mysql`
- **Requirements**: MySQL client tools

Install on Ubuntu/Debian:
```bash
sudo apt-get install mysql-client
```

## Backup Management

### Backup Location

Database backups are stored in:
```
backups/db_backups/
├── db_backup_20241114_143022.db    # SQLite backup
├── db_backup_20241114_120015.sql   # PostgreSQL/MySQL backup
└── ...
```

### Backup Retention

- Default retention: 7 days
- Automatic cleanup on deployment
- Manual cleanup: `cleanup_old_database_backups 7`

### Backup Size

Backup sizes vary by database:
- SQLite: Same as database file
- PostgreSQL: Compressed SQL dump
- MySQL: Compressed SQL dump

## Error Handling

### Migration Failure

When a migration fails:

1. **Error Detection**: System detects migration failure
2. **Logging**: Error details logged to deployment log
3. **Rollback**: Database restored from backup (if available)
4. **Verification**: Rollback verified
5. **Notification**: Error status returned

### Backup Failure

If database backup fails:

1. **Error Detection**: Backup creation fails
2. **Abort**: Migration aborted before applying changes
3. **Logging**: Error logged
4. **Safe State**: Database unchanged

### Restore Failure

If database restore fails (critical):

1. **Error Detection**: Restore operation fails
2. **Critical Alert**: CRITICAL error logged
3. **Manual Intervention**: Admin notified
4. **Backup Location**: Backup file path logged

## Best Practices

### Production Deployments

1. **Always use backup**: Never skip backup in production
2. **Test first**: Test migrations in test environment first
3. **Monitor logs**: Check deployment logs after migration
4. **Verify status**: Use `--verify` to check migration status
5. **Keep backups**: Don't delete recent backups manually

### Test Environment

1. **Use test database**: Separate database for testing
2. **Test migrations**: Test new migrations before production
3. **Skip backup**: Use `--skip-backup` for faster testing
4. **Verify results**: Check migration results

### Development

1. **Use dry-run**: Check pending migrations with `--dry-run`
2. **List migrations**: Use `--list-pending` to see what will run
3. **Test locally**: Test migrations on local database first
4. **Review changes**: Review migration files before deploying

## Troubleshooting

### Migration Fails

**Problem**: Migration fails during deployment

**Solution**:
1. Check deployment logs: `logs/deployments/deploy_*.log`
2. Check migration error details
3. Verify database connection
4. Check migration files for errors
5. Database automatically restored from backup

### Backup Fails

**Problem**: Database backup fails

**Solution**:
1. Check disk space: `df -h`
2. Check database client tools installed
3. Verify DATABASE_URL is correct
4. Check permissions on backup directory
5. Migration aborted (safe state)

### Restore Fails

**Problem**: Database restore fails after migration failure

**Solution**:
1. **CRITICAL**: Manual intervention required
2. Check backup file exists: `ls -la backups/db_backups/`
3. Manually restore: `restore_database_backup <backup_file>`
4. Check database client tools
5. Contact database administrator if needed

### No Pending Migrations

**Problem**: `--list-pending` shows no migrations but schema is wrong

**Solution**:
1. Check Prisma schema: `npx prisma migrate status`
2. Verify DATABASE_URL points to correct database
3. Check if migrations are in sync
4. May need to reset: `npx prisma migrate reset` (development only)

## Monitoring

### Check Migration Status

```bash
# Check if migrations are up to date
bash scripts/migrate-database.sh --verify

# List pending migrations
bash scripts/migrate-database.sh --list-pending

# Check Prisma migration status
npx prisma migrate status
```

### View Migration Logs

```bash
# View latest deployment log
tail -f logs/deployments/deploy_*.log

# Search for migration errors
grep -i "migration" logs/deployments/deploy_*.log

# View database backup logs
grep -i "database backup" logs/deployments/deploy_*.log
```

### Check Backups

```bash
# List database backups
ls -lh backups/db_backups/

# Check backup size
du -sh backups/db_backups/*

# Count backups
ls backups/db_backups/ | wc -l
```

## Testing

### Test Migration Safety

Run the test script to verify migration safety features:

```bash
bash scripts/test-migration-safety.sh
```

This tests:
- Migration functions exist
- Database backup functions work
- Migration dry-run works
- Migration verification works
- Deployment scripts use safe migrations

### Manual Testing

1. **Test dry-run**:
   ```bash
   bash scripts/migrate-database.sh --dry-run
   ```

2. **Test list-pending**:
   ```bash
   bash scripts/migrate-database.sh --list-pending
   ```

3. **Test verify**:
   ```bash
   bash scripts/migrate-database.sh --verify
   ```

4. **Test backup** (test environment):
   ```bash
   bash scripts/migrate-database.sh --environment test
   ```

## Requirements Mapping

This implementation satisfies the following requirements:

- **Requirement 6.1**: Database migrations run before building application
- **Requirement 6.2**: Uses `prisma migrate deploy` for production
- **Requirement 6.3**: Halts deployment on migration failure
- **Requirement 6.4**: Logs which migrations were applied
- **Requirement 6.5**: Creates database backup before migrations in production

## Related Documentation

- [Deployment Logging](./deployment-logging.md)
- [Backup Management](./backup-management.md)
- [Health Check System](../scripts/health-check-README.md)

## Support

For issues or questions:

1. Check deployment logs
2. Review this documentation
3. Run test script: `bash scripts/test-migration-safety.sh`
4. Check Prisma documentation: https://www.prisma.io/docs/
