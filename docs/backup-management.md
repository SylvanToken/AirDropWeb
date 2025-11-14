# Backup Management System

## Overview

The backup management system provides comprehensive backup and restore capabilities for the Sylvan Token application. It automatically creates timestamped backups before deployments and enables quick rollback to previous versions.

## Features

- **Automated Backup Creation**: Creates timestamped backups with metadata
- **Backup Verification**: Validates backup integrity after creation
- **Easy Restoration**: Restore from any backup with a single command
- **Automatic Cleanup**: Removes backups older than 7 days
- **Detailed Metadata**: Tracks git commit, version, and system information
- **Size Tracking**: Reports backup sizes and space freed during cleanup

## Backup Contents

Each backup includes:

1. **`.next/` directory** - Compiled Next.js application
2. **`package-lock.json`** - Dependency lock file
3. **`.env.local`** - Environment configuration
4. **`metadata.json`** - Backup information and metadata

## Directory Structure

```
backups/
├── backup_20241114_143022/
│   ├── .next/
│   ├── package-lock.json
│   ├── .env.local
│   └── metadata.json
├── backup_20241114_120015/
│   └── ...
└── backup_20241113_093045/
    └── ...
```

## Metadata Format

Each backup includes a `metadata.json` file with the following information:

```json
{
  "timestamp": "2024-11-14T14:30:22Z",
  "backupPath": "backups/backup_20241114_143022",
  "gitCommit": "abc123def456",
  "gitBranch": "main",
  "version": "1.2.3",
  "nodeVersion": "v20.10.0",
  "npmVersion": "10.2.3",
  "backupSize": 52428800,
  "filesBackedUp": 3,
  "files": {
    "next": true,
    "packageLock": true,
    "envLocal": true
  }
}
```

## Usage

### Using the Backup Manager Script

The `scripts/backup-manager.sh` script provides a command-line interface for all backup operations.

#### Create a Backup

```bash
./scripts/backup-manager.sh create
```

This will:
- Create a timestamped backup directory
- Copy all critical files
- Generate metadata
- Verify the backup
- Display the backup path

#### List All Backups

```bash
./scripts/backup-manager.sh list
```

Output example:
```
Available backups:
  [1] backup_20241114_143022 (Created: 20241114 143022)
      Git: abc123def456
      Version: 1.2.3
  [2] backup_20241114_120015 (Created: 20241114 120015)
      Git: def456abc123
      Version: 1.2.2
Total backups: 2
```

#### Restore from a Specific Backup

```bash
./scripts/backup-manager.sh restore backups/backup_20241114_143022
```

This will:
- Verify the backup integrity
- Display backup metadata
- Restore all files
- Provide next steps

#### Restore from Latest Backup

```bash
./scripts/backup-manager.sh restore-latest
```

Automatically finds and restores the most recent backup.

#### Verify a Backup

```bash
./scripts/backup-manager.sh verify backups/backup_20241114_143022
```

Checks:
- Backup directory exists
- metadata.json is valid
- At least one critical file is present

#### Cleanup Old Backups

```bash
./scripts/backup-manager.sh cleanup
```

Removes backups older than 7 days and reports space freed.

### Using Backup Functions in Scripts

The backup functions are available in `lib/deployment-utils.sh` and can be used in deployment scripts:

```bash
# Source the utilities
source lib/deployment-utils.sh

# Create a backup
backup_path=$(create_backup)

# Verify a backup
if verify_backup "$backup_path"; then
    echo "Backup is valid"
fi

# Restore a backup
restore_backup "$backup_path"

# Get latest backup
latest=$(get_latest_backup)

# List all backups
list_backups

# Cleanup old backups
cleanup_old_backups
```

## Automatic Backup in Deployments

Backups are automatically created during deployment:

### deploy-update.sh

```bash
# Create backup before update
if [ "$SKIP_BACKUP" != "true" ]; then
    BACKUP_PATH=$(create_backup)
    if [ $? -ne 0 ]; then
        log_error "Failed to create backup"
        exit 1
    fi
fi
```

### Automatic Rollback

If deployment fails, the system automatically restores from the backup:

```bash
# On deployment failure
if ! verify_deployment; then
    log_error "Deployment verification failed, initiating rollback..."
    if [ -n "$BACKUP_PATH" ]; then
        restore_backup "$BACKUP_PATH"
        pm2 reload sylvan-app
    fi
fi
```

## Configuration

### Backup Retention Period

Default: 7 days

To change, edit `lib/deployment-utils.sh`:

```bash
BACKUP_RETENTION_DAYS=7  # Change this value
```

### Backup Directory

Default: `backups/`

To change, edit `lib/deployment-utils.sh`:

```bash
BACKUP_DIR="backups"  # Change this value
```

## Best Practices

### 1. Regular Backups

Create backups before:
- Deploying updates
- Running database migrations
- Making configuration changes
- Testing major features

### 2. Verify Backups

Always verify backups after creation:

```bash
backup_path=$(create_backup)
verify_backup "$backup_path"
```

### 3. Test Restoration

Periodically test backup restoration in a test environment:

```bash
# In test environment
./scripts/backup-manager.sh restore-latest
pm2 reload sylvan-app
# Verify application works
```

### 4. Monitor Backup Size

Keep an eye on backup directory size:

```bash
du -sh backups/
```

### 5. Manual Cleanup

If needed, manually remove specific backups:

```bash
rm -rf backups/backup_20241114_143022
```

## Troubleshooting

### Backup Creation Fails

**Problem**: Backup creation returns an error

**Solutions**:
1. Check disk space: `df -h`
2. Verify permissions: `ls -la backups/`
3. Ensure `.next` directory exists: `ls -la .next/`

### Restore Fails

**Problem**: Backup restoration fails

**Solutions**:
1. Verify backup exists: `ls -la backups/`
2. Check backup integrity: `./scripts/backup-manager.sh verify <path>`
3. Ensure sufficient disk space
4. Check file permissions

### Backup Verification Fails

**Problem**: Backup verification reports invalid backup

**Solutions**:
1. Check metadata.json: `cat backups/backup_*/metadata.json`
2. Verify backup contents: `ls -la backups/backup_*/`
3. Recreate the backup if corrupted

### Cleanup Doesn't Remove Backups

**Problem**: Old backups remain after cleanup

**Solutions**:
1. Check backup age: `ls -lt backups/`
2. Verify retention period setting
3. Manually remove if needed: `rm -rf backups/backup_*`

## Integration with Deployment Scripts

### deploy-update.sh

```bash
# Create backup before update
BACKUP_PATH=$(create_backup)

# On failure, restore backup
if ! verify_deployment; then
    restore_backup "$BACKUP_PATH"
fi

# Cleanup old backups
cleanup_old_backups
```

### deploy-production.sh

```bash
# Create initial backup
create_backup

# Cleanup old backups after successful deployment
cleanup_old_backups
```

### rollback.sh

```bash
# Get latest backup
BACKUP_PATH=$(get_latest_backup)

# Restore from backup
restore_backup "$BACKUP_PATH"

# Reload application
pm2 reload sylvan-app
```

## Security Considerations

### 1. Sensitive Data

Backups include `.env.local` which contains sensitive information:

- Store backups in a secure location
- Restrict directory permissions: `chmod 700 backups/`
- Don't commit backups to version control
- Add to `.gitignore`: `backups/`

### 2. Backup Encryption

For production environments, consider encrypting backups:

```bash
# Encrypt backup
tar -czf - backups/backup_* | openssl enc -aes-256-cbc -out backup.tar.gz.enc

# Decrypt backup
openssl enc -d -aes-256-cbc -in backup.tar.gz.enc | tar -xzf -
```

### 3. Access Control

Limit access to backup directory:

```bash
# Set restrictive permissions
chmod 700 backups/
chown $USER:$USER backups/

# Verify permissions
ls -la backups/
```

## Monitoring

### Backup Status

Check backup system health:

```bash
# List recent backups
./scripts/backup-manager.sh list

# Check backup directory size
du -sh backups/

# Count backups
find backups/ -maxdepth 1 -type d -name "backup_*" | wc -l
```

### Automated Monitoring

Add to monitoring scripts:

```bash
# Check if backups exist
if [ $(find backups/ -maxdepth 1 -type d -name "backup_*" | wc -l) -eq 0 ]; then
    echo "WARNING: No backups found"
fi

# Check backup age
latest_backup=$(find backups/ -maxdepth 1 -type d -name "backup_*" | sort -r | head -n 1)
if [ -n "$latest_backup" ]; then
    backup_age=$(( ($(date +%s) - $(stat -c %Y "$latest_backup")) / 86400 ))
    if [ $backup_age -gt 1 ]; then
        echo "WARNING: Latest backup is $backup_age days old"
    fi
fi
```

## Related Documentation

- [Deployment Guide](deployment.md)
- [Rollback Procedures](rollback.md)
- [Health Check System](health-check-README.md)
- [Deployment Logging](deployment-logging.md)
