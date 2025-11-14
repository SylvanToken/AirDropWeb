# Migration Guide: Transitioning to New Deployment System

## Overview

This guide provides step-by-step instructions for migrating from the old deployment system to the new enhanced deployment infrastructure with comprehensive logging, backup management, health checks, and database migration safety features.

**Migration Duration**: Approximately 30-60 minutes  
**Downtime Required**: Minimal (5-10 minutes during final cutover)  
**Rollback Time**: 5 minutes if needed

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Preparation Steps](#preparation-steps)
4. [Test Environment Migration](#test-environment-migration)
5. [Production Migration Steps](#production-migration-steps)
6. [Post-Migration Verification](#post-migration-verification)
7. [Rollback Plan](#rollback-plan)
8. [Migration Checklist](#migration-checklist)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Prerequisites

### System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PM2**: v5.0.0 or higher (installed globally)
- **Git**: v2.30.0 or higher
- **Bash**: v4.0 or higher (for deployment scripts)
- **Database**: PostgreSQL 13+, MySQL 8+, or SQLite 3+

### Access Requirements

- SSH access to production and test servers
- Git repository access with pull permissions
- Database access credentials
- PM2 process management permissions
- File system write permissions for logs and backups

### Knowledge Requirements

- Basic understanding of PM2 process management
- Familiarity with bash scripts
- Understanding of database migrations
- Knowledge of your current deployment process

---

## Pre-Migration Checklist

Before starting the migration, ensure you have:

### Documentation Review

- [ ] Read this entire migration guide
- [ ] Review [Deployment Documentation](./deployment.md)
- [ ] Review [Backup Management](./backup-management.md)
- [ ] Review [Database Migration Safety](./database-migration-safety.md)
- [ ] Review [Deployment Logging](./deployment-logging.md)
- [ ] Review [Health Check System](../scripts/health-check-README.md)

### Environment Preparation

- [ ] Backup current production database manually
- [ ] Document current deployment process
- [ ] Identify current PM2 app names
- [ ] Note current environment variables
- [ ] Document current Nginx/proxy configuration
- [ ] List all custom deployment scripts in use

### Team Coordination

- [ ] Schedule migration window with team
- [ ] Notify stakeholders of planned maintenance
- [ ] Assign roles (migration lead, backup operator, monitor)
- [ ] Prepare communication channels for issues
- [ ] Plan for rollback if needed

### Backup Strategy

- [ ] Create full server backup (if possible)
- [ ] Backup current `.env.local` file
- [ ] Backup current `ecosystem.config.js` (if exists)
- [ ] Backup current deployment scripts
- [ ] Export current database to safe location
- [ ] Document backup locations

---

## Preparation Steps

### Step 1: Update Repository

Pull the latest code with the new deployment system:

```bash
# Connect to server
ssh user@your-server.com
cd /path/to/sylvan-token

# Backup current branch
git branch backup-old-deployment

# Pull latest changes
git fetch origin
git pull origin main
```

### Step 2: Verify New Files

Ensure all new deployment files are present:

```bash
# Check deployment scripts
ls -la deploy-*.sh scripts/rollback.sh

# Check utility library
ls -la lib/deployment-utils.sh

# Check helper scripts
ls -la scripts/backup-manager.sh scripts/health-check.sh scripts/migrate-database.sh

# Check documentation
ls -la docs/*.md
```

Expected files:
- `deploy-production.sh`
- `deploy-update.sh`
- `deploy-test.sh`
- `scripts/rollback.sh`
- `lib/deployment-utils.sh`
- `scripts/backup-manager.sh`
- `scripts/health-check.sh`
- `scripts/migrate-database.sh`
- `ecosystem.config.js`

### Step 3: Make Scripts Executable

```bash
# Make deployment scripts executable
chmod +x deploy-production.sh
chmod +x deploy-update.sh
chmod +x deploy-test.sh
chmod +x scripts/rollback.sh
chmod +x scripts/backup-manager.sh
chmod +x scripts/health-check.sh
chmod +x scripts/migrate-database.sh
```

### Step 4: Create Required Directories

```bash
# Create directory structure
mkdir -p logs/deployments
mkdir -p logs/health-checks
mkdir -p logs/pm2
mkdir -p backups
mkdir -p backups/db_backups

# Set appropriate permissions
chmod 755 logs logs/deployments logs/health-checks logs/pm2
chmod 700 backups backups/db_backups
```

### Step 5: Review Configuration Files

#### ecosystem.config.js

Check if `ecosystem.config.js` exists and is configured correctly:

```bash
cat ecosystem.config.js
```

The file should define your PM2 apps. Example:

```javascript
module.exports = {
  apps: [
    {
      name: 'sylvan-app-production',
      script: 'npm',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3333
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      // ... other settings
    }
  ]
};
```

#### Environment Variables

Verify `.env.local` has all required variables:

```bash
# Check critical variables
grep -E "DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL|PORT" .env.local
```

### Step 6: Test Database Connection

```bash
# Test database connectivity
npx prisma db pull --force

# Check migration status
npx prisma migrate status
```

---

## Test Environment Migration

**Always migrate test environment first!**

### Test Migration Steps

#### 1. Stop Current Test Application

```bash
# Check current PM2 processes
pm2 list

# Stop old test app (if running)
pm2 stop sylvan-app-test  # or your test app name
pm2 delete sylvan-app-test
```

#### 2. Clean Test Environment

```bash
# Remove old build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Clean npm cache
npm cache clean --force
```

#### 3. Run Test Deployment

```bash
# Deploy to test environment
./deploy-test.sh
```

This will:
- Validate environment
- Install dependencies
- Run database migrations
- Build application
- Start PM2 with test configuration
- Run health checks

#### 4. Verify Test Deployment

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs sylvan-app-test --lines 50

# Test health endpoint
curl http://localhost:3334/api/health

# Check deployment logs
tail -50 logs/deployments/deploy_*.log
```

#### 5. Test Update Process

```bash
# Make a small change (e.g., update a comment in code)
# Commit the change
git add .
git commit -m "Test deployment update"

# Run update deployment
./deploy-update.sh --app-name sylvan-app-test
```

#### 6. Test Rollback

```bash
# List available backups
./scripts/backup-manager.sh list

# Test rollback to previous version
./scripts/rollback.sh
```

#### 7. Test Health Check Script

```bash
# Run standalone health check
bash scripts/health-check.sh
```

### Test Environment Validation

Verify the following in test environment:

- [ ] Application starts successfully
- [ ] Health endpoint responds correctly
- [ ] Database migrations applied
- [ ] Logs are being created in `logs/` directory
- [ ] Backups are being created in `backups/` directory
- [ ] Update deployment works
- [ ] Rollback works
- [ ] PM2 reload works without downtime

---

## Production Migration Steps

**⚠️ IMPORTANT**: Only proceed after successful test environment migration!

### Pre-Production Checklist

- [ ] Test environment migration completed successfully
- [ ] All stakeholders notified
- [ ] Maintenance window scheduled
- [ ] Rollback plan reviewed
- [ ] Team members on standby
- [ ] Manual database backup completed

### Migration Window

**Recommended**: Low-traffic period (e.g., late night, weekend)

### Step 1: Create Safety Backups

```bash
# Manual database backup
pg_dump your_database > /tmp/pre_migration_db_backup_$(date +%Y%m%d_%H%M%S).sql

# Backup current deployment
tar -czf /tmp/pre_migration_app_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  .next package-lock.json .env.local ecosystem.config.js

# Backup current PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 ~/.pm2/dump.pm2.backup
```

### Step 2: Document Current State

```bash
# Document current PM2 processes
pm2 list > /tmp/pm2_state_before_migration.txt
pm2 describe sylvan-app >> /tmp/pm2_state_before_migration.txt

# Document current environment
env | grep -E "NODE|PORT|DATABASE" > /tmp/env_before_migration.txt

# Document current git state
git log -1 > /tmp/git_state_before_migration.txt
git status >> /tmp/git_state_before_migration.txt
```

### Step 3: Stop Current Production Application

```bash
# Get current app name
CURRENT_APP=$(pm2 list | grep sylvan | awk '{print $2}' | head -1)
echo "Current app: $CURRENT_APP"

# Stop current application
pm2 stop $CURRENT_APP

# Verify stopped
pm2 list
```

**Downtime starts here** ⏱️

### Step 4: Pull Latest Code

```bash
# Ensure we're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Verify new deployment files exist
ls -la deploy-*.sh lib/deployment-utils.sh
```

### Step 5: Update Configuration

#### Update ecosystem.config.js

If you have a custom PM2 configuration, merge it with the new `ecosystem.config.js`:

```bash
# Backup old config if exists
if [ -f ecosystem.config.js.old ]; then
  cp ecosystem.config.js.old ecosystem.config.js.backup
fi

# Review and edit new config
nano ecosystem.config.js
```

Ensure the app name matches your production app name (or update it):

```javascript
{
  name: 'sylvan-app-production',  // Your production app name
  // ... other settings
}
```

#### Verify Environment Variables

```bash
# Check .env.local is correct
cat .env.local

# Ensure all required variables are set
grep -E "DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL|PORT" .env.local
```

### Step 6: Run Production Deployment

```bash
# Run initial production deployment with new system
./deploy-production.sh
```

This will:
1. Validate environment and dependencies
2. Create initial backup
3. Install dependencies
4. Run database migrations (with automatic backup)
5. Build application
6. Start PM2 with ecosystem configuration
7. Run comprehensive health checks
8. Display deployment summary

**Monitor the output carefully!**

### Step 7: Verify Production Deployment

```bash
# Check PM2 status
pm2 status

# Check application is running
pm2 list | grep sylvan

# View recent logs
pm2 logs sylvan-app-production --lines 100

# Test health endpoint
curl http://localhost:3333/api/health

# Test application in browser
# Visit: http://your-domain.com
```

### Step 8: Verify Logging Infrastructure

```bash
# Check deployment logs were created
ls -lh logs/deployments/

# View latest deployment log
tail -100 logs/deployments/deploy_$(date +%Y%m%d)*.log

# Check PM2 logs directory
ls -lh logs/pm2/
```

### Step 9: Verify Backup System

```bash
# List backups
./scripts/backup-manager.sh list

# Verify backup was created
ls -lh backups/

# Check database backup
ls -lh backups/db_backups/
```

### Step 10: Test Update Process

```bash
# Test zero-downtime update
./deploy-update.sh

# Verify no downtime occurred
pm2 list
curl http://localhost:3333/api/health
```

**Downtime ends here** ⏱️ (Total: ~5-10 minutes)

### Step 11: Update Monitoring

If you have external monitoring (UptimeRobot, Pingdom, etc.):

- [ ] Verify monitoring shows application is up
- [ ] Check response times are normal
- [ ] Verify no alerts triggered

### Step 12: Cleanup Old PM2 Processes

```bash
# If old PM2 processes exist with different names
pm2 list

# Delete old processes (if any)
pm2 delete old-app-name

# Save current PM2 configuration
pm2 save
```

---

## Post-Migration Verification

### Immediate Verification (First 30 Minutes)

- [ ] Application accessible via web browser
- [ ] Health endpoint responding: `curl http://localhost:3333/api/health`
- [ ] PM2 shows "online" status: `pm2 status`
- [ ] No errors in PM2 logs: `pm2 logs --lines 100`
- [ ] Database queries working
- [ ] User authentication working
- [ ] Critical features functional

### Short-Term Verification (First 24 Hours)

- [ ] Monitor application logs: `pm2 logs`
- [ ] Check deployment logs: `tail -f logs/deployments/deploy_*.log`
- [ ] Verify backups being created
- [ ] Monitor memory usage: `pm2 monit`
- [ ] Check for any error patterns
- [ ] Verify database performance
- [ ] Monitor response times

### Long-Term Verification (First Week)

- [ ] Test update deployment: `./deploy-update.sh`
- [ ] Test rollback procedure: `./scripts/rollback.sh`
- [ ] Verify backup retention (7 days)
- [ ] Check log rotation working
- [ ] Monitor disk space usage
- [ ] Verify health checks running
- [ ] Test database migrations with new changes

### Performance Baseline

Document baseline metrics for comparison:

```bash
# Memory usage
pm2 list | grep sylvan

# Response time
time curl http://localhost:3333/api/health

# Disk usage
du -sh logs/ backups/

# Database size
# PostgreSQL:
psql -c "SELECT pg_size_pretty(pg_database_size('your_database'));"
```

---

## Rollback Plan

### When to Rollback

Rollback immediately if:

- Application fails to start after migration
- Critical features not working
- Database corruption detected
- Severe performance degradation
- Health checks consistently failing

### Rollback Procedure

#### Option 1: Automatic Rollback (Preferred)

If deployment failed and automatic rollback occurred:

```bash
# Check if rollback already happened
pm2 logs --lines 100 | grep -i rollback

# Verify application state
pm2 status
curl http://localhost:3333/api/health
```

#### Option 2: Manual Rollback Using Backup

```bash
# List available backups
./scripts/backup-manager.sh list

# Rollback to specific backup
./scripts/rollback.sh backups/backup_YYYYMMDD_HHMMSS

# Or rollback to latest
./scripts/rollback.sh
```

#### Option 3: Complete Rollback to Pre-Migration State

If new deployment system has issues:

```bash
# Stop current application
pm2 stop sylvan-app-production
pm2 delete sylvan-app-production

# Restore application files
cd /path/to/sylvan-token
tar -xzf /tmp/pre_migration_app_backup_*.tar.gz

# Restore database
psql your_database < /tmp/pre_migration_db_backup_*.sql

# Restore PM2 configuration
cp ~/.pm2/dump.pm2.backup ~/.pm2/dump.pm2
pm2 resurrect

# Start application with old method
pm2 start npm --name "sylvan-app" -- start
pm2 save
```

#### Option 4: Git Rollback

```bash
# Checkout previous commit
git log --oneline -10
git checkout <previous-commit-hash>

# Rebuild and restart
npm ci
npm run build
pm2 restart sylvan-app-production
```

### Post-Rollback Actions

After rollback:

1. **Verify Application**
   ```bash
   pm2 status
   curl http://localhost:3333/api/health
   ```

2. **Document Issue**
   - What went wrong
   - Error messages
   - Logs captured
   - Steps taken

3. **Notify Team**
   - Inform stakeholders of rollback
   - Share issue details
   - Plan fix and retry

4. **Analyze Failure**
   - Review deployment logs
   - Check error messages
   - Identify root cause
   - Plan corrective actions

---

## Migration Checklist

### Pre-Migration Phase

- [ ] Read all documentation
- [ ] Backup production database manually
- [ ] Backup application files
- [ ] Document current state
- [ ] Test environment migrated successfully
- [ ] Team notified and ready
- [ ] Maintenance window scheduled
- [ ] Rollback plan reviewed

### Migration Phase

- [ ] Safety backups created
- [ ] Current state documented
- [ ] Application stopped
- [ ] Latest code pulled
- [ ] Configuration updated
- [ ] Production deployment executed
- [ ] Deployment successful
- [ ] Application started
- [ ] Health checks passing

### Post-Migration Phase

- [ ] Application accessible
- [ ] Critical features working
- [ ] Logs being created
- [ ] Backups being created
- [ ] PM2 configuration saved
- [ ] Old processes cleaned up
- [ ] Monitoring updated
- [ ] Team notified of success

### Verification Phase

- [ ] Immediate verification completed (30 min)
- [ ] Short-term monitoring setup (24 hours)
- [ ] Update deployment tested
- [ ] Rollback procedure tested
- [ ] Performance baseline documented
- [ ] Long-term monitoring plan established

---

## Troubleshooting

### Issue: Deployment Script Not Found

**Symptoms**:
```
bash: ./deploy-production.sh: No such file or directory
```

**Solution**:
```bash
# Verify you're in project root
pwd

# Check if files exist
ls -la deploy-*.sh

# If missing, pull from git
git pull origin main

# Make executable
chmod +x deploy-*.sh
```

### Issue: Permission Denied

**Symptoms**:
```
bash: ./deploy-production.sh: Permission denied
```

**Solution**:
```bash
# Make scripts executable
chmod +x deploy-production.sh deploy-update.sh deploy-test.sh
chmod +x scripts/*.sh
```

### Issue: PM2 Not Found

**Symptoms**:
```
pm2: command not found
```

**Solution**:
```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version

# Setup PM2 startup
pm2 startup
# Follow the instructions provided
```

### Issue: Database Migration Fails

**Symptoms**:
```
Error: Database migration failed
```

**Solution**:
```bash
# Check database connection
npx prisma db pull

# Check migration status
npx prisma migrate status

# View migration error details
cat logs/deployments/deploy_*.log | grep -i migration

# If needed, restore database backup
psql your_database < backups/db_backups/db_backup_*.sql

# Retry migration
bash scripts/migrate-database.sh
```

### Issue: Health Check Fails

**Symptoms**:
```
Health check failed: HTTP 500
```

**Solution**:
```bash
# Check application logs
pm2 logs sylvan-app-production --lines 100

# Check if app is actually running
pm2 status

# Test health endpoint directly
curl -v http://localhost:3333/api/health

# Check port configuration
grep PORT .env.local

# If app is working but health check fails, force deployment
./deploy-update.sh --force
```

### Issue: Build Fails

**Symptoms**:
```
Build failed with errors
```

**Solution**:
```bash
# Check Node.js version
node --version  # Should be 18+

# Clean everything
rm -rf .next node_modules/.cache node_modules
npm cache clean --force

# Reinstall dependencies
npm ci

# Try build manually
npm run build

# Check for TypeScript errors
npm run type-check
```

### Issue: Backup Creation Fails

**Symptoms**:
```
Failed to create backup
```

**Solution**:
```bash
# Check disk space
df -h

# Check backup directory permissions
ls -la backups/
chmod 700 backups/

# Create backup manually
./scripts/backup-manager.sh create

# If still fails, skip backup (not recommended)
./deploy-update.sh --skip-backup
```

### Issue: Rollback Fails

**Symptoms**:
```
Rollback failed: Backup not found
```

**Solution**:
```bash
# List available backups
ls -la backups/

# If no backups, use manual backup
tar -xzf /tmp/pre_migration_app_backup_*.tar.gz

# Restore database
psql your_database < /tmp/pre_migration_db_backup_*.sql

# Restart application
pm2 restart sylvan-app-production
```

### Issue: Application Won't Start

**Symptoms**:
```
PM2 shows "errored" status
```

**Solution**:
```bash
# Check PM2 logs
pm2 logs sylvan-app-production --err --lines 100

# Check environment variables
pm2 show sylvan-app-production | grep env

# Verify .env.local exists
ls -la .env.local

# Check port not in use
lsof -i :3333

# Try starting manually
npm start

# If works manually, restart PM2
pm2 restart sylvan-app-production
```

---

## FAQ

### Q: How long does the migration take?

**A**: Typically 30-60 minutes total:
- Preparation: 15-20 minutes
- Test environment: 10-15 minutes
- Production migration: 5-10 minutes downtime
- Verification: 15-20 minutes

### Q: Will there be downtime?

**A**: Yes, minimal downtime of 5-10 minutes during the production cutover when stopping the old application and starting with the new deployment system.

### Q: Can I rollback if something goes wrong?

**A**: Yes, multiple rollback options are available:
1. Automatic rollback (if deployment fails)
2. Script-based rollback using backups
3. Manual rollback to pre-migration state
4. Git-based rollback

### Q: What if I don't have a test environment?

**A**: You can use the `deploy-test.sh` script on production with a different port to test the new system before migrating the main application.

### Q: Do I need to change my Nginx configuration?

**A**: No, if your application runs on the same port. The new deployment system maintains the same application behavior.

### Q: What happens to my existing PM2 processes?

**A**: You'll stop and delete old PM2 processes and start new ones with the ecosystem configuration. The new system uses PM2 cluster mode with 2 instances for better performance.

### Q: Are my environment variables preserved?

**A**: Yes, your `.env.local` file is not modified during migration. The new system reads from the same file.

### Q: What if my database migrations fail?

**A**: The new system automatically creates a database backup before migrations. If migration fails, the database is automatically restored from backup.

### Q: How do I update the application after migration?

**A**: Use the new update script:
```bash
git pull origin main
./deploy-update.sh
```

This provides zero-downtime updates with automatic rollback on failure.

### Q: Where are logs stored?

**A**: Logs are stored in:
- Deployment logs: `logs/deployments/`
- PM2 logs: `logs/pm2/`
- Health check logs: `logs/health-checks/`

### Q: How long are backups kept?

**A**: Backups are automatically retained for 7 days. Older backups are automatically cleaned up during deployments.

### Q: Can I customize the deployment process?

**A**: Yes, you can modify the deployment scripts or use command-line options:
- `--skip-backup`: Skip backup creation
- `--skip-health-check`: Skip health checks
- `--force`: Force deployment despite failures

### Q: What if I need help during migration?

**A**: 
1. Check deployment logs: `logs/deployments/deploy_*.log`
2. Review this troubleshooting section
3. Check PM2 logs: `pm2 logs`
4. Contact your team lead or DevOps team
5. Use rollback if needed

### Q: How do I verify the migration was successful?

**A**: Check these indicators:
- PM2 shows "online" status
- Health endpoint responds: `curl http://localhost:3333/api/health`
- Application accessible in browser
- Logs being created in `logs/` directory
- Backups being created in `backups/` directory

---

## Additional Resources

### Documentation

- [Deployment Guide](./deployment.md) - Complete deployment documentation
- [Backup Management](./backup-management.md) - Backup system details
- [Database Migration Safety](./database-migration-safety.md) - Migration safety features
- [Deployment Logging](./deployment-logging.md) - Logging infrastructure
- [Health Check System](../scripts/health-check-README.md) - Health check details

### Scripts

- `deploy-production.sh` - Initial production deployment
- `deploy-update.sh` - Zero-downtime updates
- `deploy-test.sh` - Test environment deployment
- `scripts/rollback.sh` - Rollback to previous version
- `scripts/backup-manager.sh` - Backup management
- `scripts/health-check.sh` - Health check verification
- `scripts/migrate-database.sh` - Safe database migrations

### Support

For issues or questions:
1. Review deployment logs
2. Check this documentation
3. Contact DevOps team
4. Create issue in repository

---

**Last Updated**: November 14, 2024  
**Version**: 1.0  
**Maintained By**: DevOps Team

