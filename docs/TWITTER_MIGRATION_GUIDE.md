# Twitter Feature Database Migration Guide

This guide explains how to apply the database migrations for the Twitter Task Automation feature.

## Overview

The Twitter feature adds two new tables to the database:
1. **TwitterConnection** - Stores encrypted OAuth tokens
2. **TwitterVerificationLog** - Audit trail for verifications

## Prerequisites

- Prisma CLI installed (`npm install -g prisma` or use `npx prisma`)
- Database backup (recommended)
- Environment variables configured

## Migration Steps

### Step 1: Backup Your Database

**IMPORTANT**: Always backup your database before running migrations!

```bash
# For SQLite (development)
cp prisma/dev.db prisma/dev.db.backup

# For PostgreSQL (production)
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# For MySQL (production)
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Review the Schema Changes

The schema includes:

```prisma
model TwitterConnection {
  id                String    @id @default(cuid())
  userId            String    @unique
  twitterId         String    @unique
  username          String
  displayName       String?
  profileImageUrl   String?
  accessToken       String    // Encrypted
  refreshToken      String    // Encrypted
  tokenExpiresAt    DateTime
  scope             String
  tokenType         String    @default("Bearer")
  isActive          Boolean   @default(true)
  lastVerifiedAt    DateTime?
  connectedAt       DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  verificationLogs  TwitterVerificationLog[]
}

model TwitterVerificationLog {
  id                    String    @id @default(cuid())
  completionId          String
  userId                String
  taskId                String
  taskType              String
  verificationResult    String
  twitterApiResponse    String?
  errorMessage          String?
  rejectionReason       String?
  verificationTime      Int
  apiCallCount          Int
  cacheHit              Boolean   @default(false)
  twitterConnectionId   String?
  verifiedAt            DateTime  @default(now())
  
  completion            Completion         @relation(fields: [completionId], references: [id])
  user                  User               @relation(fields: [userId], references: [id])
  task                  Task               @relation(fields: [taskId], references: [id])
  twitterConnection     TwitterConnection? @relation(fields: [twitterConnectionId], references: [id])
}
```

### Step 3: Generate Migration

```bash
# Generate migration files
npx prisma migrate dev --name add_twitter_features

# This will:
# 1. Create migration SQL files
# 2. Apply the migration to your database
# 3. Regenerate Prisma Client
```

### Step 4: Review Generated Migration

Check the generated SQL in `prisma/migrations/[timestamp]_add_twitter_features/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "TwitterConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "twitterId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "profileImageUrl" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" DATETIME NOT NULL,
    "scope" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL DEFAULT 'Bearer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastVerifiedAt" DATETIME,
    "connectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TwitterConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TwitterVerificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "completionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "verificationResult" TEXT NOT NULL,
    "twitterApiResponse" TEXT,
    "errorMessage" TEXT,
    "rejectionReason" TEXT,
    "verificationTime" INTEGER NOT NULL,
    "apiCallCount" INTEGER NOT NULL,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "twitterConnectionId" TEXT,
    "verifiedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TwitterVerificationLog_completionId_fkey" FOREIGN KEY ("completionId") REFERENCES "Completion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TwitterVerificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TwitterVerificationLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TwitterVerificationLog_twitterConnectionId_fkey" FOREIGN KEY ("twitterConnectionId") REFERENCES "TwitterConnection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitterConnection_userId_key" ON "TwitterConnection"("userId");
CREATE UNIQUE INDEX "TwitterConnection_twitterId_key" ON "TwitterConnection"("twitterId");
CREATE INDEX "TwitterConnection_userId_idx" ON "TwitterConnection"("userId");
CREATE INDEX "TwitterConnection_twitterId_idx" ON "TwitterConnection"("twitterId");
CREATE INDEX "TwitterConnection_isActive_idx" ON "TwitterConnection"("isActive");
CREATE INDEX "TwitterConnection_tokenExpiresAt_idx" ON "TwitterConnection"("tokenExpiresAt");

-- CreateIndex
CREATE INDEX "TwitterVerificationLog_completionId_idx" ON "TwitterVerificationLog"("completionId");
CREATE INDEX "TwitterVerificationLog_userId_idx" ON "TwitterVerificationLog"("userId");
CREATE INDEX "TwitterVerificationLog_taskId_idx" ON "TwitterVerificationLog"("taskId");
CREATE INDEX "TwitterVerificationLog_verifiedAt_idx" ON "TwitterVerificationLog"("verifiedAt");
CREATE INDEX "TwitterVerificationLog_verificationResult_idx" ON "TwitterVerificationLog"("verificationResult");
CREATE INDEX "TwitterVerificationLog_taskType_idx" ON "TwitterVerificationLog"("taskType");
CREATE INDEX "TwitterVerificationLog_twitterConnectionId_idx" ON "TwitterVerificationLog"("twitterConnectionId");
```

### Step 5: Apply Migration to Production

For production deployment:

```bash
# Deploy migration (doesn't prompt for confirmation)
npx prisma migrate deploy

# This will:
# 1. Apply pending migrations
# 2. NOT regenerate Prisma Client (do this separately)
```

### Step 6: Regenerate Prisma Client

```bash
# Regenerate Prisma Client with new models
npx prisma generate
```

### Step 7: Verify Migration

```bash
# Check migration status
npx prisma migrate status

# Open Prisma Studio to verify tables
npx prisma studio
```

## Rollback (If Needed)

If you need to rollback the migration:

### Option 1: Restore from Backup

```bash
# For SQLite
cp prisma/dev.db.backup prisma/dev.db

# For PostgreSQL
psql your_database < backup_file.sql

# For MySQL
mysql -u username -p database_name < backup_file.sql
```

### Option 2: Manual Rollback

```sql
-- Drop the tables (CAUTION: This will delete all data!)
DROP TABLE IF EXISTS "TwitterVerificationLog";
DROP TABLE IF EXISTS "TwitterConnection";
```

## Post-Migration Verification

### 1. Check Tables Exist

```sql
-- SQLite
SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Twitter%';

-- PostgreSQL
SELECT tablename FROM pg_tables WHERE tablename LIKE 'Twitter%';

-- MySQL
SHOW TABLES LIKE 'Twitter%';
```

### 2. Verify Indexes

```sql
-- SQLite
SELECT * FROM sqlite_master WHERE type='index' AND tbl_name LIKE 'Twitter%';

-- PostgreSQL
SELECT indexname FROM pg_indexes WHERE tablename LIKE 'Twitter%';

-- MySQL
SHOW INDEX FROM TwitterConnection;
SHOW INDEX FROM TwitterVerificationLog;
```

### 3. Test Application

1. Start your application
2. Try connecting a Twitter account
3. Complete a Twitter task
4. Check verification logs in admin panel
5. Verify data is being stored correctly

## Troubleshooting

### Migration Fails

**Error**: "Migration failed to apply"

**Solutions**:
1. Check database connection
2. Verify user has CREATE TABLE permissions
3. Check for conflicting table names
4. Review migration SQL for syntax errors

### Foreign Key Constraints

**Error**: "Foreign key constraint failed"

**Solutions**:
1. Ensure User table exists
2. Ensure Completion table exists
3. Ensure Task table exists
4. Check cascade delete settings

### Index Creation Fails

**Error**: "Index already exists"

**Solutions**:
1. Drop existing indexes manually
2. Modify migration to skip existing indexes
3. Use `IF NOT EXISTS` in SQL

### Prisma Client Out of Sync

**Error**: "Prisma Client is out of sync"

**Solution**:
```bash
npx prisma generate
```

## Migration Checklist

Before deploying to production:

- [ ] Database backup created
- [ ] Migration tested in development
- [ ] Migration tested in staging
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Downtime window scheduled (if needed)
- [ ] Rollback plan prepared
- [ ] Team notified

During deployment:

- [ ] Put application in maintenance mode (if needed)
- [ ] Run migration
- [ ] Verify tables created
- [ ] Verify indexes created
- [ ] Regenerate Prisma Client
- [ ] Restart application
- [ ] Test Twitter connection flow
- [ ] Test verification flow
- [ ] Check error logs

After deployment:

- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Verify user connections working
- [ ] Review verification logs
- [ ] Update documentation
- [ ] Notify team of completion

## Performance Considerations

### Index Usage

The migration creates several indexes for optimal performance:

- `userId` - Fast user lookups
- `twitterId` - Unique Twitter user identification
- `isActive` - Filter active connections
- `tokenExpiresAt` - Find expired tokens
- `verificationResult` - Analytics queries
- `taskType` - Filter by task type
- `verifiedAt` - Time-based queries

### Expected Table Sizes

Estimate storage requirements:

- **TwitterConnection**: ~1KB per user
  - 1,000 users = ~1MB
  - 10,000 users = ~10MB
  - 100,000 users = ~100MB

- **TwitterVerificationLog**: ~500 bytes per verification
  - 10,000 verifications = ~5MB
  - 100,000 verifications = ~50MB
  - 1,000,000 verifications = ~500MB

### Maintenance

Regular maintenance tasks:

```sql
-- Archive old verification logs (older than 90 days)
DELETE FROM TwitterVerificationLog 
WHERE verifiedAt < datetime('now', '-90 days');

-- Find inactive connections (not used in 30 days)
SELECT * FROM TwitterConnection 
WHERE lastVerifiedAt < datetime('now', '-30 days')
OR lastVerifiedAt IS NULL;

-- Clean up expired tokens
UPDATE TwitterConnection 
SET isActive = false 
WHERE tokenExpiresAt < datetime('now');
```

## Support

If you encounter issues:

1. Check Prisma documentation: https://www.prisma.io/docs
2. Review migration logs
3. Check database logs
4. Contact development team

---

**Last Updated**: November 13, 2025  
**Version**: 1.0
