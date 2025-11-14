# Deployment Documentation

## Table of Contents

1. [Overview](#overview)
2. [Deployment Scripts](#deployment-scripts)
3. [When to Use Which Script](#when-to-use-which-script)
4. [Command-Line Options](#command-line-options)
5. [Deployment Procedures](#deployment-procedures)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)
8. [Deployment Checklist](#deployment-checklist)
9. [Monitoring and Alerting](#monitoring-and-alerting)
10. [Best Practices](#best-practices)

## Overview

The Sylvan Token application uses a robust deployment system designed for zero-downtime updates, automatic health checks, and rollback capabilities. The system consists of three main deployment scripts, each optimized for specific scenarios.

### Key Features

- **Zero-Downtime Deployments**: Uses PM2 cluster mode with rolling restarts
- **Automatic Health Checks**: Verifies application health after deployment
- **Automatic Rollback**: Reverts to previous version on failure
- **Comprehensive Logging**: Tracks all deployment steps and metrics
- **Backup Management**: Creates and manages deployment backups
- **Environment Management**: Handles environment variable updates

## Deployment Scripts

### 1. deploy-production.sh

**Purpose**: Initial production deployment or complete redeployment

**Use Cases**:
- First-time deployment to production server
- Complete infrastructure reset
- Major version upgrades requiring fresh start
- Recovery from catastrophic failure

**What It Does**:
- Validates environment and dependencies
- Creates initial backup structure
- Installs dependencies with `npm ci`
- Runs database migrations
- Builds application from scratch
- Starts PM2 with ecosystem configuration (2 instances)
- Performs comprehensive health checks
- Sets up monitoring and logging

### 2. deploy-update.sh

**Purpose**: Zero-downtime updates to running application

**Use Cases**:
- Regular code updates and bug fixes
- Feature deployments
- Configuration changes
- Database schema updates
- Dependency updates

**What It Does**:
- Creates backup of current deployment
- Aggressively cleans all caches (.next, node_modules/.cache)
- Installs dependencies with `npm ci`
- Runs database migrations (if any)
- Builds application with clean cache
- Reloads PM2 processes (zero downtime)
- Updates environment variables
- Performs health checks
- Automatically rolls back on failure

### 3. deploy-test.sh

**Purpose**: Deployment to test/staging environment

**Use Cases**:
- Testing new features before production
- QA environment updates
- Development environment deployment
- Integration testing

**What It Does**:
- Simplified deployment process
- Single PM2 instance
- Quick restart without extensive backup
- Basic health checks
- Development-friendly settings

## When to Use Which Script

### Use deploy-production.sh When:

✅ **First-time deployment**
```bash
# Initial production setup
./deploy-production.sh
```

✅ **Complete redeployment needed**
```bash
# After major infrastructure changes
./deploy-production.sh
```

✅ **PM2 is not running**
```bash
# Check PM2 status first
pm2 status

# If no processes, use production script
./deploy-production.sh
```

### Use deploy-update.sh When:

✅ **Regular updates** (most common)
```bash
# Standard update workflow
git pull origin main
./deploy-update.sh
```

✅ **Code changes**
```bash
# After pulling new code
./deploy-update.sh
```

✅ **Dependency updates**
```bash
# After updating package.json
./deploy-update.sh
```

✅ **Database migrations**
```bash
# Migrations are handled automatically
./deploy-update.sh
```

✅ **Environment variable changes**
```bash
# Update .env.local first, then:
./deploy-update.sh
```

### Use deploy-test.sh When:

✅ **Testing environment updates**
```bash
# On test/staging server
./deploy-test.sh
```

✅ **Development deployments**
```bash
# Quick deployments for testing
./deploy-test.sh
```

## Command-Line Options

### deploy-update.sh Options

```bash
./deploy-update.sh [OPTIONS]
```

#### --skip-backup
Skip creating backup before update (not recommended for production)

```bash
# Use only when you're confident and want faster deployment
./deploy-update.sh --skip-backup
```

**When to use**:
- Test environment deployments
- Minor configuration changes
- When you have recent manual backup

**Risks**:
- Cannot rollback automatically if deployment fails
- Manual recovery required on failure

#### --skip-health-check
Skip health check after deployment (not recommended)

```bash
# Deploy without health verification
./deploy-update.sh --skip-health-check
```

**When to use**:
- Health check endpoint is temporarily unavailable
- Manual verification preferred
- Emergency deployments

**Risks**:
- May deploy broken code
- No automatic rollback trigger
- Requires manual verification

#### --force
Force deployment even if health checks fail

```bash
# Deploy despite health check failures
./deploy-update.sh --force
```

**When to use**:
- Health checks are failing but application is actually working
- Emergency fixes that must be deployed
- Known issues with health check system

**Risks**:
- May deploy broken application
- Could cause downtime
- Use with extreme caution

#### Combining Options

```bash
# Fast deployment for test environment
./deploy-update.sh --skip-backup --skip-health-check

# Emergency production deployment
./deploy-update.sh --force

# Never combine all three in production!
```

### deploy-production.sh Options

```bash
./deploy-production.sh
```

No command-line options. This script always performs full validation and setup.

### deploy-test.sh Options

```bash
./deploy-test.sh
```

No command-line options. Optimized for test environment with sensible defaults.

## Deployment Procedures

### Standard Update Procedure

**Prerequisites**:
- SSH access to server
- Git repository access
- PM2 running with application

**Steps**:

1. **Connect to server**
```bash
ssh user@your-server.com
cd /path/to/sylvan-token
```

2. **Check current status**
```bash
pm2 status
pm2 logs --lines 20
```

3. **Pull latest code**
```bash
git fetch origin
git pull origin main
```

4. **Review changes**
```bash
git log -5 --oneline
git diff HEAD~1 HEAD
```

5. **Run deployment**
```bash
./deploy-update.sh
```

6. **Monitor deployment**
```bash
# Watch the deployment progress
# Script will show each step with timing
```

7. **Verify deployment**
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs --lines 50

# Test application
curl http://localhost:3333/api/health
```

8. **Check deployment logs**
```bash
# View latest deployment log
ls -lt logs/deployments/ | head -5
cat logs/deployments/deploy_$(date +%Y%m%d)*.log
```

### Initial Production Deployment

**Prerequisites**:
- Fresh server with Node.js installed
- PM2 installed globally (`npm install -g pm2`)
- Nginx configured (if using reverse proxy)
- Database accessible

**Steps**:

1. **Prepare server**
```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup
# Follow the instructions provided
```

2. **Clone repository**
```bash
cd /var/www
git clone https://github.com/your-org/sylvan-token.git
cd sylvan-token
```

3. **Configure environment**
```bash
# Copy example environment file
cp .env.example .env.local

# Edit with production values
nano .env.local
```

**Required environment variables**:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/sylvan"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
# ... other required variables
```

4. **Set up database**
```bash
# Create database
createdb sylvan

# Run initial migration
npx prisma migrate deploy
```

5. **Run initial deployment**
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

6. **Configure Nginx** (if using)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Set up SSL** (recommended)
```bash
sudo certbot --nginx -d your-domain.com
```

8. **Save PM2 configuration**
```bash
pm2 save
```

### Database Migration Deployment

**When migrations are included in update**:

1. **Review migrations**
```bash
# Check for new migrations
ls -la prisma/migrations/

# Review migration SQL
cat prisma/migrations/[latest-migration]/migration.sql
```

2. **Backup database** (automatic, but verify)
```bash
# Manual backup for extra safety
pg_dump sylvan > backup_$(date +%Y%m%d_%H%M%S).sql
```

3. **Deploy with migrations**
```bash
# Migrations run automatically during deployment
./deploy-update.sh
```

4. **Verify migrations**
```bash
# Check migration status
npx prisma migrate status

# Check application logs
pm2 logs --lines 50
```

5. **Test application**
```bash
# Verify database changes work
curl http://localhost:3333/api/health
# Test affected endpoints
```

### Environment Variable Updates

**When updating environment variables**:

1. **Edit environment file**
```bash
nano .env.local
```

2. **Verify changes**
```bash
# Check critical variables are present
grep -E "DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL" .env.local
```

3. **Deploy with environment update**
```bash
# The --update-env flag is used automatically
./deploy-update.sh
```

4. **Verify environment loaded**
```bash
# Check PM2 environment
pm2 show sylvan-app | grep -A 20 "env:"
```

## Rollback Procedures

### Automatic Rollback

The deployment system automatically rolls back when:
- Health checks fail after deployment
- PM2 reload fails
- Application crashes immediately after deployment

**What happens during automatic rollback**:
1. Deployment failure detected
2. Previous backup restored (.next, package-lock.json, .env.local)
3. PM2 reloaded with previous version
4. Health check performed on previous version
5. Rollback success/failure logged

**Monitoring automatic rollback**:
```bash
# Watch deployment output
# You'll see: "Health check failed. Initiating rollback..."

# Check rollback logs
tail -f logs/deployments/deploy_*.log
```

### Manual Rollback

**When to use manual rollback**:
- Automatic rollback failed
- Issue discovered after deployment completed
- Need to rollback to specific version

**Steps**:

1. **Identify backup to restore**
```bash
# List available backups
ls -lt backups/

# Check backup metadata
cat backups/backup_YYYYMMDD_HHMMSS/metadata.json
```

2. **Run rollback script**
```bash
# Rollback to latest backup
./scripts/rollback.sh

# Or specify backup directory
./scripts/rollback.sh backups/backup_20241114_143022
```

3. **Verify rollback**
```bash
# Check PM2 status
pm2 status

# Check application health
curl http://localhost:3333/api/health

# Check logs
pm2 logs --lines 50
```

4. **Test application**
```bash
# Test critical functionality
# Verify users can access the application
```

### Database Rollback

**For database migrations that need rollback**:

⚠️ **Warning**: Database rollbacks are complex and risky!

1. **Stop application**
```bash
pm2 stop sylvan-app
```

2. **Restore database backup**
```bash
# Find database backup
ls -lt backups/database/

# Restore from backup
psql sylvan < backups/database/backup_YYYYMMDD_HHMMSS.sql
```

3. **Rollback application**
```bash
./scripts/rollback.sh
```

4. **Verify database state**
```bash
# Check migration status
npx prisma migrate status

# Verify data integrity
psql sylvan -c "SELECT COUNT(*) FROM users;"
```

5. **Restart application**
```bash
pm2 start sylvan-app
```

### Emergency Rollback

**For critical production issues**:

1. **Immediate action**
```bash
# Stop current deployment if in progress
# Press Ctrl+C if deployment is running

# Run rollback immediately
./scripts/rollback.sh
```

2. **Verify service restored**
```bash
curl http://localhost:3333/api/health
pm2 status
```

3. **Notify team**
```bash
# Alert team members
# Document the issue
# Plan fix and redeployment
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "PM2 not found"

**Symptoms**:
```
bash: pm2: command not found
```

**Solution**:
```bash
# Install PM2 globally
npm install -g pm2

# Or use npx
npx pm2 status
```

#### Issue: "Port 3333 already in use"

**Symptoms**:
```
Error: listen EADDRINUSE: address already in use :::3333
```

**Solution**:
```bash
# Find process using port
lsof -i :3333

# Kill the process
kill -9 <PID>

# Or stop PM2 app
pm2 stop sylvan-app
pm2 delete sylvan-app

# Redeploy
./deploy-production.sh
```

#### Issue: "Build fails with TypeScript errors"

**Symptoms**:
```
Type error: Property 'x' does not exist on type 'Y'
```

**Solution**:
```bash
# Check TypeScript locally first
npm run type-check

# Fix errors in code
# Commit and push fixes

# Redeploy
./deploy-update.sh
```

#### Issue: "Database connection failed"

**Symptoms**:
```
Error: Can't reach database server at localhost:5432
```

**Solution**:
```bash
# Check database is running
sudo systemctl status postgresql

# Start database if stopped
sudo systemctl start postgresql

# Verify DATABASE_URL in .env.local
grep DATABASE_URL .env.local

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Redeploy
./deploy-update.sh
```

#### Issue: "Health check fails but app works"

**Symptoms**:
```
Health check failed: HTTP 500
But application is accessible
```

**Solution**:
```bash
# Check health endpoint specifically
curl -v http://localhost:3333/api/health

# Check application logs
pm2 logs --lines 100

# If app is actually working, force deploy
./deploy-update.sh --force

# Fix health endpoint after deployment
```

#### Issue: "Out of memory during build"

**Symptoms**:
```
FATAL ERROR: Reached heap limit Allocation failed
```

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Clean all caches
rm -rf .next node_modules/.cache

# Redeploy
./deploy-update.sh
```

#### Issue: "Rollback fails"

**Symptoms**:
```
Rollback failed: Backup not found
```

**Solution**:
```bash
# Check available backups
ls -la backups/

# If no backups, manual recovery needed
# 1. Check git history
git log --oneline -10

# 2. Checkout previous working version
git checkout <previous-commit>

# 3. Force deploy
./deploy-update.sh --skip-backup

# 4. After recovery, return to main
git checkout main
```

#### Issue: "PM2 reload hangs"

**Symptoms**:
```
PM2 reload command doesn't complete
Application not responding
```

**Solution**:
```bash
# Force stop PM2
pm2 kill

# Clean PM2 files
rm -rf ~/.pm2

# Restart from scratch
./deploy-production.sh
```

#### Issue: "Environment variables not updating"

**Symptoms**:
```
Application still using old environment values
```

**Solution**:
```bash
# Verify .env.local changes
cat .env.local

# Force PM2 to reload environment
pm2 restart sylvan-app --update-env

# Or redeploy
./deploy-update.sh
```

### Debugging Commands

**Check application status**:
```bash
# PM2 status
pm2 status
pm2 info sylvan-app
pm2 show sylvan-app

# Application logs
pm2 logs sylvan-app --lines 100
pm2 logs sylvan-app --err --lines 50

# System resources
pm2 monit
```

**Check deployment logs**:
```bash
# Latest deployment log
ls -lt logs/deployments/ | head -1
tail -f logs/deployments/deploy_*.log

# Search for errors
grep -i error logs/deployments/deploy_*.log
grep -i failed logs/deployments/deploy_*.log
```

**Check health status**:
```bash
# Health endpoint
curl -v http://localhost:3333/api/health

# With JSON formatting
curl -s http://localhost:3333/api/health | jq .

# Check response time
time curl http://localhost:3333/api/health
```

**Check backups**:
```bash
# List backups
ls -lh backups/

# Check backup size
du -sh backups/*

# View backup metadata
cat backups/backup_*/metadata.json | jq .
```

**Check database**:
```bash
# Migration status
npx prisma migrate status

# Database connection
psql $DATABASE_URL -c "SELECT version();"

# Check tables
psql $DATABASE_URL -c "\dt"
```

## Deployment Checklist

### Pre-Deployment Checklist

- [ ] Code reviewed and approved
- [ ] All tests passing locally
- [ ] Database migrations reviewed (if any)
- [ ] Environment variables updated (if needed)
- [ ] Breaking changes documented
- [ ] Rollback plan prepared
- [ ] Team notified of deployment
- [ ] Backup verified (automatic, but check)

### During Deployment Checklist

- [ ] SSH connection stable
- [ ] Latest code pulled from repository
- [ ] Deployment script executed
- [ ] Monitoring deployment output
- [ ] No errors in deployment logs
- [ ] Health checks passing
- [ ] PM2 status shows "online"

### Post-Deployment Checklist

- [ ] Application accessible
- [ ] Health endpoint responding
- [ ] Critical features tested
- [ ] Database migrations applied
- [ ] No errors in application logs
- [ ] Response times normal
- [ ] Memory usage normal
- [ ] Deployment logged and documented
- [ ] Team notified of completion
- [ ] Monitoring alerts configured

### Rollback Checklist

- [ ] Issue identified and documented
- [ ] Rollback decision made
- [ ] Rollback script executed
- [ ] Previous version restored
- [ ] Health checks passing
- [ ] Application functionality verified
- [ ] Team notified of rollback
- [ ] Incident report created
- [ ] Fix planned for next deployment

## Monitoring and Alerting

### PM2 Monitoring

**Built-in PM2 monitoring**:
```bash
# Real-time monitoring
pm2 monit

# Process status
pm2 status

# Detailed info
pm2 info sylvan-app

# Resource usage
pm2 describe sylvan-app
```

**PM2 logs**:
```bash
# Tail logs
pm2 logs sylvan-app

# Error logs only
pm2 logs sylvan-app --err

# Specific number of lines
pm2 logs sylvan-app --lines 200

# Log files location
ls -la logs/pm2-*.log
```

### Application Monitoring

**Health endpoint monitoring**:
```bash
# Manual check
curl http://localhost:3333/api/health

# Continuous monitoring (every 30 seconds)
watch -n 30 'curl -s http://localhost:3333/api/health | jq .'
```

**Setup automated health checks**:
```bash
# Create cron job for health monitoring
crontab -e

# Add this line (check every 5 minutes)
*/5 * * * * /path/to/scripts/health-check.sh >> /path/to/logs/health-checks/health_$(date +\%Y\%m\%d).log 2>&1
```

### Deployment Monitoring

**Monitor deployment logs**:
```bash
# Watch latest deployment
tail -f logs/deployments/deploy_$(date +%Y%m%d)*.log

# Check deployment history
ls -lt logs/deployments/ | head -10

# Search for failed deployments
grep -l "FAILED" logs/deployments/*.log
```

**Deployment metrics**:
```bash
# Count successful deployments
grep -c "SUCCESS" logs/deployments/*.log

# Count failed deployments
grep -c "FAILED" logs/deployments/*.log

# Average deployment time
grep "duration:" logs/deployments/*.log
```

### System Resource Monitoring

**Memory monitoring**:
```bash
# Check memory usage
free -h

# PM2 memory usage
pm2 list | grep sylvan-app

# Process memory
ps aux | grep node
```

**CPU monitoring**:
```bash
# System CPU
top -bn1 | grep "Cpu(s)"

# PM2 CPU usage
pm2 monit
```

**Disk monitoring**:
```bash
# Disk space
df -h

# Application directory size
du -sh /path/to/sylvan-token

# Log directory size
du -sh logs/

# Backup directory size
du -sh backups/
```

### Alerting Setup

**Email alerts for deployment failures**:

Create `/usr/local/bin/deployment-alert.sh`:
```bash
#!/bin/bash

DEPLOYMENT_LOG=$1
ADMIN_EMAIL="admin@your-domain.com"

if grep -q "FAILED" "$DEPLOYMENT_LOG"; then
    SUBJECT="Deployment Failed - Sylvan Token"
    BODY="Deployment failed. Check logs: $DEPLOYMENT_LOG"
    echo "$BODY" | mail -s "$SUBJECT" "$ADMIN_EMAIL"
fi
```

**Integrate with deployment**:
```bash
# Add to deploy-update.sh
./deploy-update.sh
/usr/local/bin/deployment-alert.sh logs/deployments/deploy_latest.log
```

**Health check alerts**:

Create `/usr/local/bin/health-alert.sh`:
```bash
#!/bin/bash

HEALTH_URL="http://localhost:3333/api/health"
ADMIN_EMAIL="admin@your-domain.com"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$RESPONSE" != "200" ]; then
    SUBJECT="Health Check Failed - Sylvan Token"
    BODY="Health check returned: $RESPONSE"
    echo "$BODY" | mail -s "$SUBJECT" "$ADMIN_EMAIL"
fi
```

**Setup cron for health alerts**:
```bash
# Check every 5 minutes
*/5 * * * * /usr/local/bin/health-alert.sh
```

### Third-Party Monitoring (Optional)

**Recommended monitoring services**:

1. **PM2 Plus** (formerly Keymetrics)
```bash
# Link PM2 to PM2 Plus
pm2 link <secret> <public>

# Features:
# - Real-time monitoring
# - Custom metrics
# - Exception tracking
# - Deployment tracking
```

2. **Uptime monitoring**:
- UptimeRobot
- Pingdom
- StatusCake

Configure to monitor:
- Main application URL
- Health endpoint
- API endpoints

3. **Log aggregation**:
- Papertrail
- Loggly
- Datadog

Forward logs:
```bash
# Example: Forward to Papertrail
pm2 install pm2-papertrail
pm2 set pm2-papertrail:host logs.papertrailapp.com
pm2 set pm2-papertrail:port 12345
```

4. **Error tracking**:
- Sentry
- Rollbar
- Bugsnag

Integrate in application code for detailed error tracking.

### Monitoring Dashboard

**Create simple monitoring dashboard**:

Create `monitoring-dashboard.sh`:
```bash
#!/bin/bash

clear
echo "=== Sylvan Token Monitoring Dashboard ==="
echo ""
echo "=== PM2 Status ==="
pm2 status
echo ""
echo "=== System Resources ==="
echo "Memory:"
free -h | grep Mem
echo "Disk:"
df -h | grep -E "/$|/var"
echo ""
echo "=== Recent Deployments ==="
ls -lt logs/deployments/ | head -5
echo ""
echo "=== Health Check ==="
curl -s http://localhost:3333/api/health | jq .
echo ""
echo "=== Recent Errors ==="
pm2 logs sylvan-app --err --lines 5 --nostream
```

Run dashboard:
```bash
chmod +x monitoring-dashboard.sh
./monitoring-dashboard.sh
```

## Best Practices

### Deployment Best Practices

1. **Always test in staging first**
   - Deploy to test environment
   - Run full test suite
   - Manual QA testing
   - Then deploy to production

2. **Deploy during low-traffic periods**
   - Schedule deployments during off-peak hours
   - Notify users of maintenance window (if needed)
   - Monitor traffic during deployment

3. **Use version tags**
   ```bash
   # Tag releases
   git tag -a v1.2.3 -m "Release version 1.2.3"
   git push origin v1.2.3
   ```

4. **Keep deployment logs**
   - Review logs after each deployment
   - Archive important deployment logs
   - Use logs for post-mortem analysis

5. **Monitor after deployment**
   - Watch logs for 15-30 minutes after deployment
   - Check error rates
   - Monitor performance metrics
   - Be ready to rollback

6. **Document changes**
   - Update CHANGELOG.md
   - Document breaking changes
   - Update API documentation
   - Notify team of changes

### Security Best Practices

1. **Protect environment files**
   ```bash
   chmod 600 .env.local
   ```

2. **Secure backup directory**
   ```bash
   chmod 700 backups/
   ```

3. **Use SSH keys, not passwords**
   ```bash
   ssh-keygen -t ed25519
   ssh-copy-id user@server
   ```

4. **Limit deployment access**
   - Only authorized users can deploy
   - Use sudo for system operations
   - Audit deployment actions

5. **Rotate secrets regularly**
   - Update NEXTAUTH_SECRET periodically
   - Rotate database passwords
   - Update API keys

### Performance Best Practices

1. **Clean caches regularly**
   - Automatic during updates
   - Manual cleaning if needed:
   ```bash
   rm -rf .next node_modules/.cache
   ```

2. **Monitor resource usage**
   - Set memory limits in PM2
   - Monitor CPU usage
   - Watch disk space

3. **Optimize build process**
   - Use production builds
   - Enable compression
   - Minimize bundle size

4. **Database optimization**
   - Index frequently queried fields
   - Optimize slow queries
   - Regular database maintenance

### Backup Best Practices

1. **Automated backups**
   - Backups created automatically during deployment
   - Verify backups exist after deployment

2. **Backup retention**
   - Keep last 7 days of backups (automatic)
   - Archive important backups manually
   - Store critical backups off-server

3. **Test backups**
   - Periodically test backup restoration
   - Verify backup integrity
   - Document restoration procedures

4. **Database backups**
   - Separate database backup strategy
   - Daily automated database backups
   - Test database restoration

### Rollback Best Practices

1. **Know when to rollback**
   - Critical bugs affecting users
   - Performance degradation
   - Data integrity issues
   - Security vulnerabilities

2. **Rollback quickly**
   - Don't wait to see if issues resolve
   - Rollback first, investigate later
   - User experience is priority

3. **Document rollbacks**
   - Record reason for rollback
   - Document issues encountered
   - Plan fix for next deployment

4. **Learn from rollbacks**
   - Conduct post-mortem
   - Improve testing procedures
   - Update deployment checklist

---

## Quick Reference

### Common Commands

```bash
# Standard update
git pull && ./deploy-update.sh

# Check status
pm2 status && pm2 logs --lines 20

# Health check
curl http://localhost:3333/api/health

# Rollback
./scripts/rollback.sh

# View logs
tail -f logs/deployments/deploy_*.log

# Monitor resources
pm2 monit
```

### Emergency Contacts

- **System Administrator**: [contact info]
- **Lead Developer**: [contact info]
- **DevOps Team**: [contact info]
- **On-Call**: [contact info]

### Important URLs

- **Production**: https://your-domain.com
- **Test**: https://test.your-domain.com
- **Health Check**: https://your-domain.com/api/health
- **Monitoring Dashboard**: [URL if applicable]

### File Locations

- **Application**: `/path/to/sylvan-token`
- **Logs**: `/path/to/sylvan-token/logs`
- **Backups**: `/path/to/sylvan-token/backups`
- **Environment**: `/path/to/sylvan-token/.env.local`

---

**Last Updated**: November 14, 2024  
**Version**: 1.0  
**Maintained By**: DevOps Team
