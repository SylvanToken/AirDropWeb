# Database Connection Fix Guide

## Problem

Application showing error: "Application error: a server-side exception has occurred"
Database connection is failing on production server.

## Root Cause

The issue is caused by:
1. **Missing connection pooling parameters** in DATABASE_URL
2. **No direct database URL** for migrations
3. **No connection retry logic** in Prisma client
4. **No graceful connection handling** on server restarts

## Solution

### Step 1: Update Environment Variables on Server

SSH into your production server and update `.env.local`:

```bash
ssh user@your-server.com
cd /path/to/sylvan-token
nano .env.local
```

Update the DATABASE_URL lines:

```bash
# OLD (Remove these):
# DATABASE_URL="postgresql://postgres.fahcabutajczylskmmgw:bkEOzJECBtU2SZcM@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# NEW (Add these):
# Connection Pooler (for serverless/edge functions)
DATABASE_URL="postgresql://postgres.fahcabutajczylskmmgw:bkEOzJECBtU2SZcM@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10"

# Direct Connection (for migrations)
DIRECT_DATABASE_URL="postgresql://postgres.fahcabutajczylskmmgw:bkEOzJECBtU2SZcM@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

**Important Parameters Explained:**
- `pgbouncer=true` - Enables pgBouncer compatibility mode
- `connection_limit=1` - Limits connections per instance (important for serverless)
- `pool_timeout=10` - Sets connection timeout to 10 seconds
- Port `5432` - Pooled connection (use for app)
- Port `6543` - Direct connection (use for migrations)

### Step 2: Regenerate Prisma Client

```bash
# Generate new Prisma client with updated schema
npx prisma generate

# Verify Prisma can connect
npx prisma db pull --force
```

### Step 3: Deploy the Fix

```bash
# Pull latest code with fixes
git pull origin main

# Install dependencies
npm ci

# Build application
npm run build

# Restart application with PM2
pm2 restart sylvan-app-production --update-env

# Or use deployment script
./deploy-update.sh
```

### Step 4: Verify the Fix

```bash
# Check health endpoint
curl http://localhost:3333/api/health

# Expected response:
# {
#   "status": "healthy",
#   "checks": {
#     "database": {
#       "status": "up",
#       "latency": 50
#     }
#   }
# }

# Check PM2 logs
pm2 logs sylvan-app-production --lines 50

# Check application in browser
# Visit: http://your-domain.com
```

## What Was Fixed

### 1. Prisma Client (`lib/prisma.ts`)

**Before:**
```typescript
new PrismaClient({
  log: ['error'],
})
```

**After:**
```typescript
new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Added graceful shutdown handlers
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
})
```

### 2. Prisma Schema (`prisma/schema.prisma`)

**Before:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**After:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

### 3. Database Health Check (`lib/db-health.ts`)

**New file** with:
- Connection health checking
- Automatic reconnection with retry logic
- Connection error detection and handling
- Graceful disconnection

### 4. Health Check API (`app/api/health/route.ts`)

**New endpoint** at `/api/health` that:
- Checks database connectivity
- Returns detailed health status
- Monitors response times
- Reports memory usage

## Troubleshooting

### Issue: Still getting connection errors

**Solution 1: Check Supabase Connection Pooler**

```bash
# Test direct connection
psql "postgresql://postgres.fahcabutajczylskmmgw:bkEOzJECBtU2SZcM@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -c "SELECT 1"

# Test pooled connection
psql "postgresql://postgres.fahcabutajczylskmmgw:bkEOzJECBtU2SZcM@aws-0-us-east-1.pooler.supabase.com:5432/postgres" -c "SELECT 1"
```

**Solution 2: Check Supabase Dashboard**

1. Go to Supabase Dashboard
2. Check if database is paused (free tier auto-pauses after inactivity)
3. Check connection pooler settings
4. Verify connection limits

**Solution 3: Increase Connection Pool**

If you have many concurrent users, increase connection limit:

```bash
# In .env.local, change:
DATABASE_URL="...?pgbouncer=true&connection_limit=5&pool_timeout=10"
```

### Issue: Migrations failing

**Solution:**

Migrations need direct connection. Ensure DIRECT_DATABASE_URL is set:

```bash
# Run migrations with direct URL
npx prisma migrate deploy

# Or use the migration script
bash scripts/migrate-database.sh
```

### Issue: Connection timeout

**Solution:**

Increase timeout in DATABASE_URL:

```bash
DATABASE_URL="...?pgbouncer=true&connection_limit=1&pool_timeout=20&connect_timeout=30"
```

### Issue: Too many connections

**Solution:**

Reduce connection limit and ensure proper disconnection:

```bash
# Lower connection limit
DATABASE_URL="...?connection_limit=1..."

# Restart PM2 to clear old connections
pm2 restart sylvan-app-production
```

## Prevention

To prevent this issue in the future:

### 1. Always Use Connection Pooling Parameters

```bash
# Good
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1&pool_timeout=10"

# Bad
DATABASE_URL="postgresql://..."
```

### 2. Monitor Database Connections

```bash
# Check active connections in Supabase Dashboard
# Or query directly:
psql $DIRECT_DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'postgres';"
```

### 3. Use Health Checks

```bash
# Add to cron or monitoring
*/5 * * * * curl -f http://localhost:3333/api/health || echo "Health check failed"
```

### 4. Implement Graceful Shutdown

Already implemented in `lib/prisma.ts`:
- Disconnects on SIGTERM
- Disconnects on SIGINT
- Disconnects on process exit

### 5. Use Deployment Scripts

Always use the deployment scripts which handle:
- Environment variable updates
- Graceful PM2 reloads
- Health checks
- Automatic rollback on failure

```bash
# For updates
./deploy-update.sh

# For initial deployment
./deploy-production.sh
```

## Quick Fix Commands

If you need to quickly fix the issue on production:

```bash
# 1. Update environment variables
nano .env.local
# Add the DATABASE_URL and DIRECT_DATABASE_URL as shown above

# 2. Quick restart
pm2 restart sylvan-app-production --update-env

# 3. Verify
curl http://localhost:3333/api/health
```

## Related Documentation

- [Deployment Guide](./deployment.md)
- [Database Migration Safety](./database-migration-safety.md)
- [Health Check System](../scripts/health-check-README.md)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

## Support

If issues persist:

1. Check PM2 logs: `pm2 logs sylvan-app-production`
2. Check Supabase Dashboard for database status
3. Verify environment variables: `pm2 show sylvan-app-production | grep DATABASE`
4. Test database connection: `npx prisma db pull`
5. Contact DevOps team with error logs

---

**Last Updated**: November 14, 2024  
**Version**: 1.0  
**Maintained By**: DevOps Team
