# Time-Limited Tasks Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the time-limited tasks feature to staging and production environments. It includes pre-deployment checks, migration procedures, testing protocols, rollback plans, and monitoring strategies.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Staging Deployment](#staging-deployment)
3. [Production Deployment](#production-deployment)
4. [Rollback Plan](#rollback-plan)
5. [Post-Deployment Monitoring](#post-deployment-monitoring)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Review

- [ ] All code changes reviewed and approved
- [ ] All tests passing (unit, integration, E2E)
- [ ] No console errors or warnings
- [ ] Code follows project style guidelines
- [ ] Documentation is complete and accurate

### Database Preparation

- [ ] Migration files created and tested locally
- [ ] Backup strategy confirmed
- [ ] Rollback migration prepared
- [ ] Database indexes reviewed
- [ ] Data integrity checks passed

### Testing Verification

- [ ] Unit tests: 100% passing
- [ ] Integration tests: 100% passing
- [ ] Manual testing completed
- [ ] Cross-browser testing completed
- [ ] Accessibility testing completed
- [ ] Performance testing completed

### Dependencies

- [ ] All npm packages up to date
- [ ] No security vulnerabilities (run `npm audit`)
- [ ] Environment variables documented
- [ ] API keys and secrets secured

### Documentation

- [ ] API documentation complete
- [ ] User guide created
- [ ] Deployment guide reviewed
- [ ] Changelog updated
- [ ] README updated if needed

---

## Staging Deployment

### Step 1: Prepare Staging Environment

#### 1.1 Backup Staging Database

```bash
# For PostgreSQL
pg_dump -h staging-db-host -U username -d database_name > backup_staging_$(date +%Y%m%d_%H%M%S).sql

# For SQLite (if using)
cp prisma/dev.db prisma/dev.db.backup_$(date +%Y%m%d_%H%M%S)
```

#### 1.2 Verify Environment Variables

Ensure staging `.env` includes:

```env
# Database
DATABASE_URL="postgresql://user:password@staging-host:5432/dbname"

# Application
NODE_ENV="staging"
NEXT_PUBLIC_APP_URL="https://staging.your-domain.com"

# Feature Flags (if applicable)
ENABLE_TIME_LIMITED_TASKS=true

# Monitoring
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="debug"
```

### Step 2: Deploy Code to Staging

#### 2.1 Pull Latest Code

```bash
# SSH into staging server
ssh user@staging-server

# Navigate to application directory
cd /var/www/your-app

# Pull latest changes
git fetch origin
git checkout main
git pull origin main
```

#### 2.2 Install Dependencies

```bash
# Install npm packages
npm ci

# Build application
npm run build
```

### Step 3: Run Database Migrations

#### 3.1 Review Migration Files

```bash
# List pending migrations
npx prisma migrate status
```

Expected migrations:
- `20250112_add_task_duration_fields`
- `20250112_add_completion_missed_at`
- `20250112_add_duration_change_log`

#### 3.2 Execute Migrations

```bash
# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db pull
npx prisma generate
```

#### 3.3 Verify Database Changes

```sql
-- Connect to staging database
psql -h staging-db-host -U username -d database_name

-- Verify Task table columns
\d "Task"

-- Should show:
-- duration: integer (nullable)
-- expiresAt: timestamp (nullable)

-- Verify Completion table columns
\d "Completion"

-- Should show:
-- missedAt: timestamp (nullable)

-- Verify DurationChangeLog table exists
\d "DurationChangeLog"

-- Exit
\q
```

### Step 4: Restart Application

```bash
# For PM2
pm2 restart your-app

# For systemd
sudo systemctl restart your-app

# For Docker
docker-compose restart

# Verify application is running
curl https://staging.your-domain.com/api/health
```

### Step 5: Staging Testing

#### 5.1 Smoke Tests

Run automated smoke tests:

```bash
# Run API tests
npm run test:api:staging

# Run E2E tests
npm run test:e2e:staging
```

#### 5.2 Manual Testing Checklist

**Admin Functions:**
- [ ] Log in as admin
- [ ] Create task without time limit (verify works as before)
- [ ] Create task with 6-hour time limit
- [ ] Create task with 24-hour time limit
- [ ] Edit existing task to add time limit
- [ ] Edit existing task to remove time limit
- [ ] View duration change audit logs
- [ ] Verify all changes are logged

**User Functions:**
- [ ] Log in as regular user
- [ ] View tasks page - verify 3-row layout
- [ ] See countdown timer on time-limited task
- [ ] Complete a time-limited task before expiration
- [ ] Wait for a task to expire (or manually set short duration)
- [ ] Verify expired task moves to "Missed Tasks"
- [ ] Attempt to complete expired task (should fail)
- [ ] Click on completed task in list - verify modal opens
- [ ] Click on missed task in list - verify modal opens
- [ ] Test collapsible lists (if more than 5 tasks)

**Timer Behavior:**
- [ ] Verify timer updates every second
- [ ] Switch browser tabs - verify timer pauses
- [ ] Return to tab - verify timer resumes and syncs
- [ ] Refresh page - verify timer shows correct time
- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Firefox, Safari)

#### 5.3 Performance Testing

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 https://staging.your-domain.com/api/tasks/organized

# Monitor response times
# Target: < 200ms for 95th percentile
```

#### 5.4 Security Testing

- [ ] Verify non-admin cannot access admin endpoints
- [ ] Verify users cannot complete other users' tasks
- [ ] Verify expired tasks cannot be completed
- [ ] Verify duration validation (1-24 hours)
- [ ] Test SQL injection attempts (should be blocked)
- [ ] Test XSS attempts (should be sanitized)

### Step 6: Staging Sign-Off

- [ ] All smoke tests passed
- [ ] All manual tests passed
- [ ] Performance metrics acceptable
- [ ] Security tests passed
- [ ] No critical errors in logs
- [ ] Stakeholder approval received

---

## Production Deployment

### Step 1: Pre-Production Preparation

#### 1.1 Schedule Maintenance Window

- **Recommended:** Low-traffic period (e.g., 2 AM - 4 AM local time)
- **Duration:** 30-60 minutes
- **Notification:** Inform users 24-48 hours in advance

#### 1.2 Backup Production Database

```bash
# Create full database backup
pg_dump -h prod-db-host -U username -d database_name > backup_prod_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
pg_restore --list backup_prod_*.sql | head -20

# Store backup securely
aws s3 cp backup_prod_*.sql s3://your-backup-bucket/backups/
```

#### 1.3 Enable Maintenance Mode (Optional)

```bash
# Create maintenance page
touch /var/www/your-app/public/maintenance.html

# Configure nginx to serve maintenance page
# (See nginx configuration below)
```

### Step 2: Deploy to Production

#### 2.1 Deploy Code

```bash
# SSH into production server
ssh user@production-server

# Navigate to application directory
cd /var/www/your-app

# Pull latest code
git fetch origin
git checkout main
git pull origin main

# Install dependencies
npm ci

# Build application
npm run build
```

#### 2.2 Run Database Migrations

```bash
# Review pending migrations
npx prisma migrate status

# Execute migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

#### 2.3 Verify Database Schema

```sql
-- Connect to production database
psql -h prod-db-host -U username -d database_name

-- Verify changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Task' 
AND column_name IN ('duration', 'expiresAt');

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Completion' 
AND column_name = 'missedAt';

SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'DurationChangeLog';
```

### Step 3: Restart Production Application

```bash
# For PM2
pm2 restart your-app --update-env

# For systemd
sudo systemctl restart your-app

# For Docker
docker-compose up -d --force-recreate

# Verify application is running
curl https://your-domain.com/api/health

# Check application logs
pm2 logs your-app --lines 50
```

### Step 4: Disable Maintenance Mode

```bash
# Remove maintenance page
rm /var/www/your-app/public/maintenance.html

# Reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Production Smoke Tests

#### 5.1 Automated Tests

```bash
# Run production smoke tests
npm run test:smoke:production

# Expected output:
# ✓ Health check endpoint responds
# ✓ Database connection successful
# ✓ API endpoints accessible
# ✓ Authentication working
```

#### 5.2 Critical Path Testing

**Test 1: Create Time-Limited Task**
```bash
curl -X POST https://your-domain.com/api/admin/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Production Test Task",
    "description": "Test task for deployment verification",
    "points": 10,
    "taskType": "CUSTOM",
    "isActive": true,
    "isTimeLimited": true,
    "duration": 1
  }'

# Expected: 201 Created with task object including duration and expiresAt
```

**Test 2: Get Organized Tasks**
```bash
curl -X GET https://your-domain.com/api/tasks/organized \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: 200 OK with activeTasks, completedTasks, missedTasks arrays
```

**Test 3: Check Task Expiration**
```bash
curl -X POST https://your-domain.com/api/tasks/check-expiration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"taskId": "test-task-id"}'

# Expected: 200 OK with isExpired boolean
```

#### 5.3 Manual Verification

- [ ] Log in as admin - verify dashboard loads
- [ ] Create a test time-limited task
- [ ] Log in as regular user - verify tasks page loads
- [ ] Verify countdown timer displays correctly
- [ ] Complete a task - verify points awarded
- [ ] Check database - verify data is being written correctly

### Step 6: Monitor Initial Traffic

Monitor for 15-30 minutes after deployment:

```bash
# Watch application logs
pm2 logs your-app --lines 100

# Monitor error rate
tail -f /var/log/your-app/error.log

# Check database connections
psql -h prod-db-host -U username -d database_name -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Rollback Plan

### When to Rollback

Rollback immediately if:
- ❌ Critical errors in production logs
- ❌ Database migration failures
- ❌ Application won't start
- ❌ Core functionality broken
- ❌ Data corruption detected
- ❌ Performance degradation > 50%

### Rollback Procedure

#### Option 1: Code Rollback (Preferred)

If database migrations succeeded but application has issues:

```bash
# SSH into production server
ssh user@production-server

# Navigate to application directory
cd /var/www/your-app

# Revert to previous commit
git log --oneline -10  # Find previous commit hash
git checkout <previous-commit-hash>

# Reinstall dependencies
npm ci

# Rebuild application
npm run build

# Restart application
pm2 restart your-app

# Verify rollback
curl https://your-domain.com/api/health
```

#### Option 2: Full Rollback (Database + Code)

If database migrations caused issues:

**Step 1: Stop Application**
```bash
pm2 stop your-app
```

**Step 2: Restore Database Backup**
```bash
# Download backup from S3
aws s3 cp s3://your-backup-bucket/backups/backup_prod_YYYYMMDD_HHMMSS.sql .

# Restore database
psql -h prod-db-host -U username -d database_name < backup_prod_YYYYMMDD_HHMMSS.sql

# Verify restoration
psql -h prod-db-host -U username -d database_name -c "SELECT COUNT(*) FROM \"Task\";"
```

**Step 3: Revert Code**
```bash
# Revert to previous commit
git checkout <previous-commit-hash>

# Reinstall dependencies
npm ci

# Rebuild
npm run build
```

**Step 4: Restart Application**
```bash
pm2 restart your-app

# Verify application is working
curl https://your-domain.com/api/health
```

#### Option 3: Database Migration Rollback Only

If only database changes need to be reverted:

```bash
# Create rollback migration
npx prisma migrate resolve --rolled-back <migration-name>

# Or manually run rollback SQL
psql -h prod-db-host -U username -d database_name << EOF
-- Remove new columns
ALTER TABLE "Task" DROP COLUMN IF EXISTS "duration";
ALTER TABLE "Task" DROP COLUMN IF EXISTS "expiresAt";
ALTER TABLE "Completion" DROP COLUMN IF EXISTS "missedAt";

-- Drop new table
DROP TABLE IF EXISTS "DurationChangeLog";
EOF

# Regenerate Prisma client
npx prisma generate
```

### Post-Rollback Actions

- [ ] Verify application is functioning normally
- [ ] Check error logs for any issues
- [ ] Notify stakeholders of rollback
- [ ] Document rollback reason
- [ ] Schedule post-mortem meeting
- [ ] Fix issues before attempting redeployment

---

## Post-Deployment Monitoring

### Immediate Monitoring (First 24 Hours)

#### Application Metrics

Monitor these metrics closely:

```bash
# Error rate
# Target: < 0.1% of requests
grep "ERROR" /var/log/your-app/app.log | wc -l

# Response times
# Target: p95 < 200ms, p99 < 500ms
# (Use your APM tool: New Relic, Datadog, etc.)

# Request volume
# Monitor for unusual spikes or drops
pm2 monit
```

#### Database Metrics

```sql
-- Query performance
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%Task%' OR query LIKE '%Completion%'
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('Task', 'Completion', 'DurationChangeLog')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Connection count
SELECT count(*) FROM pg_stat_activity;
```

#### Feature-Specific Metrics

Track these custom metrics:

- **Time-Limited Tasks Created**: Count per hour
- **Tasks Expired**: Count per hour
- **Tasks Completed Before Expiration**: Percentage
- **Tasks Missed**: Count per hour
- **Average Completion Time**: For time-limited tasks
- **Duration Change Logs**: Count per day

### Ongoing Monitoring (First Week)

#### Daily Checks

- [ ] Review error logs for new error patterns
- [ ] Check database performance metrics
- [ ] Monitor API response times
- [ ] Review user feedback/support tickets
- [ ] Check countdown timer accuracy
- [ ] Verify expiration marking is working

#### Weekly Review

- [ ] Analyze feature adoption rate
- [ ] Review completion vs. missed task ratio
- [ ] Check for any performance degradation
- [ ] Review audit logs for unusual patterns
- [ ] Gather user feedback
- [ ] Plan optimizations if needed

### Monitoring Tools Setup

#### Sentry Error Tracking

```javascript
// Already configured in your app
// Monitor for these specific errors:
// - "Task has expired"
// - "Duration must be between 1 and 24 hours"
// - Timer synchronization errors
```

#### Custom Logging

```javascript
// Add custom log events
logger.info('time-limited-task-created', {
  taskId: task.id,
  duration: task.duration,
  expiresAt: task.expiresAt
});

logger.info('task-expired', {
  taskId: task.id,
  userId: user.id,
  expiresAt: task.expiresAt
});

logger.info('task-completed-before-expiration', {
  taskId: task.id,
  userId: user.id,
  timeRemaining: timeRemaining
});
```

#### Alerts Configuration

Set up alerts for:

- **High Error Rate**: > 1% of requests
- **Slow Response Times**: p95 > 500ms
- **Database Connection Issues**: Connection pool exhausted
- **High Task Expiration Rate**: > 50% of time-limited tasks missed
- **Migration Failures**: Any database migration errors

---

## Troubleshooting

### Issue: Migration Fails

**Symptoms:**
```
Error: Migration failed to apply
```

**Solution:**
```bash
# Check migration status
npx prisma migrate status

# Resolve failed migration
npx prisma migrate resolve --rolled-back <migration-name>

# Try again
npx prisma migrate deploy
```

### Issue: Application Won't Start

**Symptoms:**
```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Rebuild application
npm run build

# Restart
pm2 restart your-app
```

### Issue: Countdown Timers Not Showing

**Symptoms:**
- Users report no timers visible
- Console errors about undefined expiresAt

**Solution:**
```bash
# Check if migration applied
psql -h db-host -U username -d database_name -c "\d Task"

# Verify expiresAt column exists
# If not, run migration again

# Clear Next.js cache
rm -rf .next
npm run build
pm2 restart your-app
```

### Issue: High Database Load

**Symptoms:**
- Slow query performance
- High CPU on database server

**Solution:**
```sql
-- Add indexes if missing
CREATE INDEX IF NOT EXISTS idx_task_expires_at ON "Task"("expiresAt");
CREATE INDEX IF NOT EXISTS idx_completion_missed_at ON "Completion"("missedAt");

-- Analyze tables
ANALYZE "Task";
ANALYZE "Completion";
```

---

## Deployment Checklist Summary

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Documentation complete
- [ ] Backup strategy confirmed
- [ ] Stakeholders notified

### Staging
- [ ] Database backed up
- [ ] Code deployed
- [ ] Migrations executed
- [ ] Application restarted
- [ ] Smoke tests passed
- [ ] Manual testing completed
- [ ] Sign-off received

### Production
- [ ] Maintenance window scheduled
- [ ] Database backed up
- [ ] Code deployed
- [ ] Migrations executed
- [ ] Application restarted
- [ ] Smoke tests passed
- [ ] Critical path verified
- [ ] Monitoring active

### Post-Deployment
- [ ] No critical errors in logs
- [ ] Performance metrics normal
- [ ] User feedback positive
- [ ] Documentation published
- [ ] Team debriefed

---

## Emergency Contacts

**On-Call Engineer:** [Your contact info]  
**Database Admin:** [DBA contact info]  
**DevOps Lead:** [DevOps contact info]  
**Product Manager:** [PM contact info]  

---

## Additional Resources

- [API Documentation](API_DOCUMENTATION.md)
- [User Guide](USER_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)
- [Technical Design](design.md)
- [Rollback Procedures](ROLLBACK_PROCEDURES.md)

---

**Last Updated:** November 12, 2025  
**Version:** 1.0.0  
**Deployment Team:** Development Team
