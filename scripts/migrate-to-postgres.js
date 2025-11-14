const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use environment variable for database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@host:5432/database';

// Read the Prisma schema and generate SQL
const schema = fs.readFileSync(path.join(__dirname, '../prisma/schema.prisma'), 'utf8');

const migrationSQL = `
-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "roleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "avatarUrl" TEXT,
    "walletAddress" TEXT,
    "walletVerified" BOOLEAN NOT NULL DEFAULT false,
    "twitterUsername" TEXT,
    "twitterVerified" BOOLEAN NOT NULL DEFAULT false,
    "telegramUsername" TEXT,
    "telegramVerified" BOOLEAN NOT NULL DEFAULT false,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "acceptedTerms" BOOLEAN NOT NULL DEFAULT false,
    "acceptedPrivacy" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "titleTr" TEXT,
    "descriptionTr" TEXT,
    "titleDe" TEXT,
    "descriptionDe" TEXT,
    "titleZh" TEXT,
    "descriptionZh" TEXT,
    "titleRu" TEXT,
    "descriptionRu" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "titleTr" TEXT,
    "descriptionTr" TEXT,
    "titleDe" TEXT,
    "descriptionDe" TEXT,
    "titleZh" TEXT,
    "descriptionZh" TEXT,
    "titleRu" TEXT,
    "descriptionRu" TEXT,
    "points" INTEGER NOT NULL,
    "taskType" TEXT NOT NULL,
    "taskUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scheduledDeadline" TIMESTAMP(3),
    "estimatedDuration" INTEGER,
    "isTimeSensitive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Completion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "fraudScore" INTEGER NOT NULL DEFAULT 0,
    "autoApproveAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "completionTime" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "actualDeadline" TIMESTAMP(3),
    "isExpired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Completion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LoginLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FilterPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilterPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "affectedModel" TEXT,
    "affectedId" TEXT,
    "beforeData" TEXT,
    "afterData" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EmailLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EmailPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskCompletions" BOOLEAN NOT NULL DEFAULT true,
    "walletVerifications" BOOLEAN NOT NULL DEFAULT true,
    "adminNotifications" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "User_walletAddress_key" ON "User"("walletAddress");
CREATE UNIQUE INDEX IF NOT EXISTS "User_twitterUsername_key" ON "User"("twitterUsername");
CREATE UNIQUE INDEX IF NOT EXISTS "User_telegramUsername_key" ON "User"("telegramUsername");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_totalPoints_idx" ON "User"("totalPoints");
CREATE INDEX IF NOT EXISTS "User_walletAddress_idx" ON "User"("walletAddress");
CREATE INDEX IF NOT EXISTS "User_status_idx" ON "User"("status");
CREATE INDEX IF NOT EXISTS "User_twitterUsername_idx" ON "User"("twitterUsername");
CREATE INDEX IF NOT EXISTS "User_telegramUsername_idx" ON "User"("telegramUsername");
CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId");

CREATE INDEX IF NOT EXISTS "Campaign_isActive_idx" ON "Campaign"("isActive");
CREATE INDEX IF NOT EXISTS "Campaign_startDate_idx" ON "Campaign"("startDate");
CREATE INDEX IF NOT EXISTS "Campaign_endDate_idx" ON "Campaign"("endDate");

CREATE INDEX IF NOT EXISTS "Task_isActive_idx" ON "Task"("isActive");
CREATE INDEX IF NOT EXISTS "Task_campaignId_idx" ON "Task"("campaignId");
CREATE INDEX IF NOT EXISTS "Task_isTimeSensitive_idx" ON "Task"("isTimeSensitive");
CREATE INDEX IF NOT EXISTS "Task_scheduledDeadline_idx" ON "Task"("scheduledDeadline");

CREATE INDEX IF NOT EXISTS "Completion_userId_idx" ON "Completion"("userId");
CREATE INDEX IF NOT EXISTS "Completion_taskId_idx" ON "Completion"("taskId");
CREATE INDEX IF NOT EXISTS "Completion_completedAt_idx" ON "Completion"("completedAt");
CREATE INDEX IF NOT EXISTS "Completion_userId_completedAt_idx" ON "Completion"("userId", "completedAt");
CREATE INDEX IF NOT EXISTS "Completion_taskId_completedAt_idx" ON "Completion"("taskId", "completedAt");
CREATE INDEX IF NOT EXISTS "Completion_status_idx" ON "Completion"("status");
CREATE INDEX IF NOT EXISTS "Completion_needsReview_idx" ON "Completion"("needsReview");
CREATE INDEX IF NOT EXISTS "Completion_autoApproveAt_idx" ON "Completion"("autoApproveAt");
CREATE INDEX IF NOT EXISTS "Completion_isExpired_idx" ON "Completion"("isExpired");
CREATE INDEX IF NOT EXISTS "Completion_actualDeadline_idx" ON "Completion"("actualDeadline");

CREATE INDEX IF NOT EXISTS "LoginLog_userId_idx" ON "LoginLog"("userId");
CREATE INDEX IF NOT EXISTS "LoginLog_createdAt_idx" ON "LoginLog"("createdAt");
CREATE INDEX IF NOT EXISTS "LoginLog_userId_createdAt_idx" ON "LoginLog"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "FilterPreset_createdBy_idx" ON "FilterPreset"("createdBy");

CREATE INDEX IF NOT EXISTS "Workflow_isActive_idx" ON "Workflow"("isActive");
CREATE INDEX IF NOT EXISTS "Workflow_createdBy_idx" ON "Workflow"("createdBy");

CREATE INDEX IF NOT EXISTS "AuditLog_adminId_idx" ON "AuditLog"("adminId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name");

CREATE INDEX IF NOT EXISTS "SearchHistory_userId_idx" ON "SearchHistory"("userId");
CREATE INDEX IF NOT EXISTS "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");
CREATE INDEX IF NOT EXISTS "SearchHistory_userId_createdAt_idx" ON "SearchHistory"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "EmailLog_to_idx" ON "EmailLog"("to");
CREATE INDEX IF NOT EXISTS "EmailLog_status_idx" ON "EmailLog"("status");
CREATE INDEX IF NOT EXISTS "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");
CREATE INDEX IF NOT EXISTS "EmailLog_template_idx" ON "EmailLog"("template");

CREATE UNIQUE INDEX IF NOT EXISTS "EmailPreference_userId_key" ON "EmailPreference"("userId");
CREATE INDEX IF NOT EXISTS "EmailPreference_userId_idx" ON "EmailPreference"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Completion" ADD CONSTRAINT "Completion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Completion" ADD CONSTRAINT "Completion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginLog" ADD CONSTRAINT "LoginLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterPreset" ADD CONSTRAINT "FilterPreset_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailPreference" ADD CONSTRAINT "EmailPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;

async function migrate() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔄 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    console.log('🔄 Running migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration completed successfully!\n');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    console.log('\n✅ Database migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
