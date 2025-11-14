-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "roleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "referralCode" TEXT,
    "invitedBy" TEXT,
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
    "termsAcceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "scheduledDeadline" DATETIME,
    "estimatedDuration" INTEGER,
    "isTimeSensitive" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Completion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "fraudScore" INTEGER NOT NULL DEFAULT 0,
    "autoApproveAt" DATETIME,
    "rejectionReason" TEXT,
    "completionTime" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "scheduledFor" DATETIME,
    "actualDeadline" DATETIME,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "missedAt" DATETIME,
    CONSTRAINT "Completion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Completion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoginLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FilterPreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FilterPreset_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Workflow_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "affectedModel" TEXT,
    "affectedId" TEXT,
    "beforeData" TEXT,
    "afterData" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" DATETIME,
    "clickedAt" DATETIME
);

-- CreateTable
CREATE TABLE "EmailPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "taskCompletions" BOOLEAN NOT NULL DEFAULT true,
    "walletVerifications" BOOLEAN NOT NULL DEFAULT true,
    "adminNotifications" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmailPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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

-- CreateTable
CREATE TABLE "TelegramReaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "reactionEmoji" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 20,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" DATETIME,
    "lastVerifiedAt" DATETIME,
    CONSTRAINT "TelegramReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PointAdjustment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reactionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" DATETIME,
    CONSTRAINT "PointAdjustment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PointAdjustment_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "TelegramReaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "pointsChange" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "showOnLogin" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ErrorReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "userEmail" TEXT,
    "errorType" TEXT NOT NULL,
    "errorTitle" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "stackTrace" TEXT,
    "pageUrl" TEXT NOT NULL,
    "userAgent" TEXT,
    "screenshot" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "resolution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ErrorReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterUsername_key" ON "User"("twitterUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramUsername_key" ON "User"("telegramUsername");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_totalPoints_idx" ON "User"("totalPoints");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_twitterUsername_idx" ON "User"("twitterUsername");

-- CreateIndex
CREATE INDEX "User_telegramUsername_idx" ON "User"("telegramUsername");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_invitedBy_idx" ON "User"("invitedBy");

-- CreateIndex
CREATE INDEX "Campaign_isActive_idx" ON "Campaign"("isActive");

-- CreateIndex
CREATE INDEX "Campaign_startDate_idx" ON "Campaign"("startDate");

-- CreateIndex
CREATE INDEX "Campaign_endDate_idx" ON "Campaign"("endDate");

-- CreateIndex
CREATE INDEX "Task_isActive_idx" ON "Task"("isActive");

-- CreateIndex
CREATE INDEX "Task_campaignId_idx" ON "Task"("campaignId");

-- CreateIndex
CREATE INDEX "Task_isTimeSensitive_idx" ON "Task"("isTimeSensitive");

-- CreateIndex
CREATE INDEX "Task_scheduledDeadline_idx" ON "Task"("scheduledDeadline");

-- CreateIndex
CREATE INDEX "Task_expiresAt_idx" ON "Task"("expiresAt");

-- CreateIndex
CREATE INDEX "Completion_userId_idx" ON "Completion"("userId");

-- CreateIndex
CREATE INDEX "Completion_taskId_idx" ON "Completion"("taskId");

-- CreateIndex
CREATE INDEX "Completion_completedAt_idx" ON "Completion"("completedAt");

-- CreateIndex
CREATE INDEX "Completion_userId_completedAt_idx" ON "Completion"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "Completion_taskId_completedAt_idx" ON "Completion"("taskId", "completedAt");

-- CreateIndex
CREATE INDEX "Completion_status_idx" ON "Completion"("status");

-- CreateIndex
CREATE INDEX "Completion_needsReview_idx" ON "Completion"("needsReview");

-- CreateIndex
CREATE INDEX "Completion_autoApproveAt_idx" ON "Completion"("autoApproveAt");

-- CreateIndex
CREATE INDEX "Completion_isExpired_idx" ON "Completion"("isExpired");

-- CreateIndex
CREATE INDEX "Completion_actualDeadline_idx" ON "Completion"("actualDeadline");

-- CreateIndex
CREATE INDEX "Completion_missedAt_idx" ON "Completion"("missedAt");

-- CreateIndex
CREATE INDEX "Completion_userId_status_taskId_idx" ON "Completion"("userId", "status", "taskId");

-- CreateIndex
CREATE INDEX "LoginLog_userId_idx" ON "LoginLog"("userId");

-- CreateIndex
CREATE INDEX "LoginLog_createdAt_idx" ON "LoginLog"("createdAt");

-- CreateIndex
CREATE INDEX "LoginLog_userId_createdAt_idx" ON "LoginLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FilterPreset_createdBy_idx" ON "FilterPreset"("createdBy");

-- CreateIndex
CREATE INDEX "Workflow_isActive_idx" ON "Workflow"("isActive");

-- CreateIndex
CREATE INDEX "Workflow_createdBy_idx" ON "Workflow"("createdBy");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

-- CreateIndex
CREATE INDEX "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_createdAt_idx" ON "SearchHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_to_idx" ON "EmailLog"("to");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");

-- CreateIndex
CREATE INDEX "EmailLog_template_idx" ON "EmailLog"("template");

-- CreateIndex
CREATE UNIQUE INDEX "EmailPreference_userId_key" ON "EmailPreference"("userId");

-- CreateIndex
CREATE INDEX "EmailPreference_userId_idx" ON "EmailPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitterConnection_userId_key" ON "TwitterConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitterConnection_twitterId_key" ON "TwitterConnection"("twitterId");

-- CreateIndex
CREATE INDEX "TwitterConnection_userId_idx" ON "TwitterConnection"("userId");

-- CreateIndex
CREATE INDEX "TwitterConnection_twitterId_idx" ON "TwitterConnection"("twitterId");

-- CreateIndex
CREATE INDEX "TwitterConnection_isActive_idx" ON "TwitterConnection"("isActive");

-- CreateIndex
CREATE INDEX "TwitterConnection_tokenExpiresAt_idx" ON "TwitterConnection"("tokenExpiresAt");

-- CreateIndex
CREATE INDEX "TwitterVerificationLog_completionId_idx" ON "TwitterVerificationLog"("completionId");

-- CreateIndex
CREATE INDEX "TwitterVerificationLog_userId_idx" ON "TwitterVerificationLog"("userId");

-- CreateIndex
CREATE INDEX "TwitterVerificationLog_taskId_idx" ON "TwitterVerificationLog"("taskId");

-- CreateIndex
CREATE INDEX "TwitterVerificationLog_verifiedAt_idx" ON "TwitterVerificationLog"("verifiedAt");

-- CreateIndex
CREATE INDEX "TwitterVerificationLog_verificationResult_idx" ON "TwitterVerificationLog"("verificationResult");

-- CreateIndex
CREATE INDEX "TwitterVerificationLog_taskType_idx" ON "TwitterVerificationLog"("taskType");

-- CreateIndex
CREATE INDEX "TwitterVerificationLog_twitterConnectionId_idx" ON "TwitterVerificationLog"("twitterConnectionId");

-- CreateIndex
CREATE INDEX "TelegramReaction_userId_idx" ON "TelegramReaction"("userId");

-- CreateIndex
CREATE INDEX "TelegramReaction_postId_idx" ON "TelegramReaction"("postId");

-- CreateIndex
CREATE INDEX "TelegramReaction_telegramUserId_idx" ON "TelegramReaction"("telegramUserId");

-- CreateIndex
CREATE INDEX "TelegramReaction_isActive_idx" ON "TelegramReaction"("isActive");

-- CreateIndex
CREATE INDEX "TelegramReaction_createdAt_idx" ON "TelegramReaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramReaction_userId_postId_reactionEmoji_key" ON "TelegramReaction"("userId", "postId", "reactionEmoji");

-- CreateIndex
CREATE INDEX "PointAdjustment_userId_idx" ON "PointAdjustment"("userId");

-- CreateIndex
CREATE INDEX "PointAdjustment_createdAt_idx" ON "PointAdjustment"("createdAt");

-- CreateIndex
CREATE INDEX "PointAdjustment_reason_idx" ON "PointAdjustment"("reason");

-- CreateIndex
CREATE INDEX "UserNotification_userId_idx" ON "UserNotification"("userId");

-- CreateIndex
CREATE INDEX "UserNotification_isRead_idx" ON "UserNotification"("isRead");

-- CreateIndex
CREATE INDEX "UserNotification_showOnLogin_idx" ON "UserNotification"("showOnLogin");

-- CreateIndex
CREATE INDEX "UserNotification_createdAt_idx" ON "UserNotification"("createdAt");

-- CreateIndex
CREATE INDEX "ErrorReport_userId_idx" ON "ErrorReport"("userId");

-- CreateIndex
CREATE INDEX "ErrorReport_status_idx" ON "ErrorReport"("status");

-- CreateIndex
CREATE INDEX "ErrorReport_priority_idx" ON "ErrorReport"("priority");

-- CreateIndex
CREATE INDEX "ErrorReport_errorType_idx" ON "ErrorReport"("errorType");

-- CreateIndex
CREATE INDEX "ErrorReport_createdAt_idx" ON "ErrorReport"("createdAt");

-- CreateIndex
CREATE INDEX "ErrorReport_assignedTo_idx" ON "ErrorReport"("assignedTo");
