-- CreateTable
CREATE TABLE "ErrorReportTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "errorReportId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ErrorReportTag_errorReportId_fkey" FOREIGN KEY ("errorReportId") REFERENCES "ErrorReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ErrorReportComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "errorReportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ErrorReportComment_errorReportId_fkey" FOREIGN KEY ("errorReportId") REFERENCES "ErrorReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ErrorReport" (
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
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "responseTime" INTEGER,
    "resolutionTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ErrorReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ErrorReport" ("assignedTo", "createdAt", "errorMessage", "errorTitle", "errorType", "id", "pageUrl", "priority", "resolution", "resolvedAt", "resolvedBy", "screenshot", "stackTrace", "status", "updatedAt", "userAgent", "userEmail", "userId") SELECT "assignedTo", "createdAt", "errorMessage", "errorTitle", "errorType", "id", "pageUrl", "priority", "resolution", "resolvedAt", "resolvedBy", "screenshot", "stackTrace", "status", "updatedAt", "userAgent", "userEmail", "userId" FROM "ErrorReport";
DROP TABLE "ErrorReport";
ALTER TABLE "new_ErrorReport" RENAME TO "ErrorReport";
CREATE INDEX "ErrorReport_userId_idx" ON "ErrorReport"("userId");
CREATE INDEX "ErrorReport_status_idx" ON "ErrorReport"("status");
CREATE INDEX "ErrorReport_priority_idx" ON "ErrorReport"("priority");
CREATE INDEX "ErrorReport_errorType_idx" ON "ErrorReport"("errorType");
CREATE INDEX "ErrorReport_createdAt_idx" ON "ErrorReport"("createdAt");
CREATE INDEX "ErrorReport_assignedTo_idx" ON "ErrorReport"("assignedTo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ErrorReportTag_errorReportId_idx" ON "ErrorReportTag"("errorReportId");

-- CreateIndex
CREATE INDEX "ErrorReportTag_tag_idx" ON "ErrorReportTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorReportTag_errorReportId_tag_key" ON "ErrorReportTag"("errorReportId", "tag");

-- CreateIndex
CREATE INDEX "ErrorReportComment_errorReportId_idx" ON "ErrorReportComment"("errorReportId");

-- CreateIndex
CREATE INDEX "ErrorReportComment_userId_idx" ON "ErrorReportComment"("userId");

-- CreateIndex
CREATE INDEX "ErrorReportComment_createdAt_idx" ON "ErrorReportComment"("createdAt");
