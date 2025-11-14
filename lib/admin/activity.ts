import { prisma } from '@/lib/prisma';

/**
 * User Activity Timeline
 * Requirements: 5.1, 5.2, 5.3, 5.4
 * 
 * Provides comprehensive activity tracking for admin oversight
 */

export type ActivityType = 'login' | 'task_completion' | 'wallet_update' | 'profile_update';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  timestamp: Date;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityTimelineOptions {
  limit?: number;
  offset?: number;
  type?: ActivityType;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Get comprehensive user activity timeline
 * Requirement 5.1: Display chronological activity timeline
 * Requirement 5.2: Include all user actions (login, task completion, wallet updates)
 * Requirement 5.3: Support filtering by activity type
 * Requirement 5.4: Include timestamps, IP addresses, and user agents
 * 
 * @param userId User ID to fetch activities for
 * @param options Pagination and filtering options
 * @returns Array of activity events sorted chronologically
 */
export async function getUserActivityTimeline(
  userId: string,
  options: ActivityTimelineOptions = {}
): Promise<ActivityEvent[]> {
  const {
    limit = 50,
    offset = 0,
    type,
    startDate,
    endDate,
  } = options;

  try {
    const activities: ActivityEvent[] = [];

    // Requirement 5.2: Fetch login logs
    if (!type || type === 'login') {
      const logins = await fetchLoginActivities(userId, { startDate, endDate });
      activities.push(...logins);
    }

    // Requirement 5.2: Fetch task completions
    if (!type || type === 'task_completion') {
      const completions = await fetchCompletionActivities(userId, { startDate, endDate });
      activities.push(...completions);
    }

    // Requirement 5.2: Fetch wallet updates
    if (!type || type === 'wallet_update') {
      const walletUpdates = await fetchWalletActivities(userId, { startDate, endDate });
      activities.push(...walletUpdates);
    }

    // Requirement 5.2: Fetch profile changes
    if (!type || type === 'profile_update') {
      const profileUpdates = await fetchProfileActivities(userId, { startDate, endDate });
      activities.push(...profileUpdates);
    }

    // Requirement 5.1: Sort activities chronologically (newest first)
    const sortedActivities = activities.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );

    // Requirement 5.4: Add pagination support
    return sortedActivities.slice(offset, offset + limit);
  } catch (error) {
    console.error('Error fetching user activity timeline:', error);
    throw new Error('Failed to fetch user activity timeline');
  }
}

/**
 * Fetch login activities
 * Requirement 5.2: Fetch login logs
 * Requirement 5.4: Include timestamps, IP addresses, and user agents
 */
async function fetchLoginActivities(
  userId: string,
  dateFilter: { startDate?: Date; endDate?: Date }
): Promise<ActivityEvent[]> {
  const logins = await prisma.loginLog.findMany({
    where: {
      userId,
      ...(dateFilter.startDate || dateFilter.endDate ? {
        createdAt: {
          ...(dateFilter.startDate && { gte: dateFilter.startDate }),
          ...(dateFilter.endDate && { lte: dateFilter.endDate }),
        },
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return logins.map(log => ({
    id: `login-${log.id}`,
    type: 'login' as const,
    timestamp: log.createdAt,
    details: {
      success: log.success,
      status: log.success ? 'successful' : 'failed',
    },
    ipAddress: log.ipAddress,
    userAgent: log.userAgent || undefined,
  }));
}

/**
 * Fetch task completion activities
 * Requirement 5.2: Fetch task completions
 */
async function fetchCompletionActivities(
  userId: string,
  dateFilter: { startDate?: Date; endDate?: Date }
): Promise<ActivityEvent[]> {
  const completions = await prisma.completion.findMany({
    where: {
      userId,
      ...(dateFilter.startDate || dateFilter.endDate ? {
        completedAt: {
          ...(dateFilter.startDate && { gte: dateFilter.startDate }),
          ...(dateFilter.endDate && { lte: dateFilter.endDate }),
        },
      } : {}),
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          taskType: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });

  return completions.map(completion => ({
    id: `completion-${completion.id}`,
    type: 'task_completion' as const,
    timestamp: completion.completedAt,
    details: {
      taskId: completion.taskId,
      taskName: completion.task.title,
      taskType: completion.task.taskType,
      points: completion.pointsAwarded,
      status: completion.status,
      verificationStatus: completion.verificationStatus,
      fraudScore: completion.fraudScore,
      needsReview: completion.needsReview,
      completionTime: completion.completionTime,
    },
    ipAddress: completion.ipAddress || undefined,
    userAgent: completion.userAgent || undefined,
  }));
}

/**
 * Fetch wallet update activities
 * Requirement 5.2: Fetch wallet updates
 * 
 * Note: Since wallet updates aren't tracked in a separate table,
 * we use audit logs to track these changes
 */
async function fetchWalletActivities(
  userId: string,
  dateFilter: { startDate?: Date; endDate?: Date }
): Promise<ActivityEvent[]> {
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      affectedModel: 'User',
      affectedId: userId,
      action: { in: ['wallet_added', 'wallet_verified', 'wallet_updated'] },
      ...(dateFilter.startDate || dateFilter.endDate ? {
        timestamp: {
          ...(dateFilter.startDate && { gte: dateFilter.startDate }),
          ...(dateFilter.endDate && { lte: dateFilter.endDate }),
        },
      } : {}),
    },
    orderBy: { timestamp: 'desc' },
  });

  return auditLogs.map(log => {
    const beforeData = log.beforeData ? JSON.parse(log.beforeData) : {};
    const afterData = log.afterData ? JSON.parse(log.afterData) : {};

    return {
      id: `wallet-${log.id}`,
      type: 'wallet_update' as const,
      timestamp: log.timestamp,
      details: {
        action: log.action,
        walletAddress: afterData.walletAddress,
        verified: afterData.walletVerified,
        previousAddress: beforeData.walletAddress,
      },
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
    };
  });
}

/**
 * Fetch profile update activities
 * Requirement 5.2: Fetch profile changes
 * 
 * Tracks changes to username, email, social media accounts
 */
async function fetchProfileActivities(
  userId: string,
  dateFilter: { startDate?: Date; endDate?: Date }
): Promise<ActivityEvent[]> {
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      affectedModel: 'User',
      affectedId: userId,
      action: {
        in: [
          'profile_updated',
          'email_updated',
          'username_updated',
          'twitter_connected',
          'twitter_verified',
          'telegram_connected',
          'telegram_verified',
        ],
      },
      ...(dateFilter.startDate || dateFilter.endDate ? {
        timestamp: {
          ...(dateFilter.startDate && { gte: dateFilter.startDate }),
          ...(dateFilter.endDate && { lte: dateFilter.endDate }),
        },
      } : {}),
    },
    orderBy: { timestamp: 'desc' },
  });

  return auditLogs.map(log => {
    const beforeData = log.beforeData ? JSON.parse(log.beforeData) : {};
    const afterData = log.afterData ? JSON.parse(log.afterData) : {};

    const changes: Record<string, any> = {};
    
    // Track what changed
    if (beforeData.email !== afterData.email) {
      changes.email = { from: beforeData.email, to: afterData.email };
    }
    if (beforeData.username !== afterData.username) {
      changes.username = { from: beforeData.username, to: afterData.username };
    }
    if (beforeData.twitterUsername !== afterData.twitterUsername) {
      changes.twitterUsername = { from: beforeData.twitterUsername, to: afterData.twitterUsername };
    }
    if (beforeData.telegramUsername !== afterData.telegramUsername) {
      changes.telegramUsername = { from: beforeData.telegramUsername, to: afterData.telegramUsername };
    }

    return {
      id: `profile-${log.id}`,
      type: 'profile_update' as const,
      timestamp: log.timestamp,
      details: {
        action: log.action,
        changes,
        adminId: log.adminId !== userId ? log.adminId : undefined,
        adminEmail: log.adminId !== userId ? log.adminEmail : undefined,
      },
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
    };
  });
}

/**
 * Get activity statistics for a user
 * Provides summary counts for different activity types
 */
export async function getUserActivityStats(
  userId: string,
  dateRange?: { start: Date; end: Date }
): Promise<{
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  totalCompletions: number;
  approvedCompletions: number;
  pendingCompletions: number;
  rejectedCompletions: number;
  walletUpdates: number;
  profileUpdates: number;
}> {
  const dateFilter = dateRange ? {
    gte: dateRange.start,
    lte: dateRange.end,
  } : undefined;

  const [
    loginStats,
    completionStats,
    walletUpdateCount,
    profileUpdateCount,
  ] = await Promise.all([
    // Login statistics
    prisma.loginLog.groupBy({
      by: ['success'],
      where: {
        userId,
        ...(dateFilter && { createdAt: dateFilter }),
      },
      _count: true,
    }),
    // Completion statistics
    prisma.completion.groupBy({
      by: ['status'],
      where: {
        userId,
        ...(dateFilter && { completedAt: dateFilter }),
      },
      _count: true,
    }),
    // Wallet updates
    prisma.auditLog.count({
      where: {
        affectedModel: 'User',
        affectedId: userId,
        action: { in: ['wallet_added', 'wallet_verified', 'wallet_updated'] },
        ...(dateFilter && { timestamp: dateFilter }),
      },
    }),
    // Profile updates
    prisma.auditLog.count({
      where: {
        affectedModel: 'User',
        affectedId: userId,
        action: {
          in: [
            'profile_updated',
            'email_updated',
            'username_updated',
            'twitter_connected',
            'twitter_verified',
            'telegram_connected',
            'telegram_verified',
          ],
        },
        ...(dateFilter && { timestamp: dateFilter }),
      },
    }),
  ]);

  const successfulLogins = loginStats.find(s => s.success)?._count || 0;
  const failedLogins = loginStats.find(s => !s.success)?._count || 0;
  
  const approvedCompletions = completionStats.find(s => 
    s.status === 'APPROVED' || s.status === 'AUTO_APPROVED'
  )?._count || 0;
  const pendingCompletions = completionStats.find(s => s.status === 'PENDING')?._count || 0;
  const rejectedCompletions = completionStats.find(s => s.status === 'REJECTED')?._count || 0;

  return {
    totalLogins: successfulLogins + failedLogins,
    successfulLogins,
    failedLogins,
    totalCompletions: completionStats.reduce((sum, s) => sum + s._count, 0),
    approvedCompletions,
    pendingCompletions,
    rejectedCompletions,
    walletUpdates: walletUpdateCount,
    profileUpdates: profileUpdateCount,
  };
}

/**
 * Detect suspicious activity patterns
 * Requirement 5.5: Highlight suspicious activities
 * 
 * @param userId User ID to analyze
 * @returns Array of suspicious activity indicators
 */
export async function detectSuspiciousActivity(
  userId: string
): Promise<Array<{
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
}>> {
  const suspiciousActivities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    timestamp: Date;
  }> = [];

  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Check for multiple failed login attempts
  const failedLogins = await prisma.loginLog.count({
    where: {
      userId,
      success: false,
      createdAt: { gte: last24Hours },
    },
  });

  if (failedLogins >= 5) {
    suspiciousActivities.push({
      type: 'multiple_failed_logins',
      severity: failedLogins >= 10 ? 'high' : 'medium',
      description: `${failedLogins} failed login attempts in the last 24 hours`,
      timestamp: now,
    });
  }

  // Check for high fraud scores
  const highFraudCompletions = await prisma.completion.findMany({
    where: {
      userId,
      fraudScore: { gte: 70 },
      completedAt: { gte: last7Days },
    },
    select: {
      id: true,
      fraudScore: true,
      completedAt: true,
    },
  });

  if (highFraudCompletions.length > 0) {
    suspiciousActivities.push({
      type: 'high_fraud_score',
      severity: 'high',
      description: `${highFraudCompletions.length} task completions with high fraud scores (≥70) in the last 7 days`,
      timestamp: highFraudCompletions[0].completedAt,
    });
  }

  // Check for rapid task completions
  const recentCompletions = await prisma.completion.findMany({
    where: {
      userId,
      completedAt: { gte: last24Hours },
    },
    select: {
      completedAt: true,
      completionTime: true,
    },
    orderBy: { completedAt: 'asc' },
  });

  if (recentCompletions.length >= 20) {
    suspiciousActivities.push({
      type: 'rapid_completions',
      severity: 'medium',
      description: `${recentCompletions.length} task completions in the last 24 hours`,
      timestamp: now,
    });
  }

  // Check for suspiciously fast completions
  const fastCompletions = recentCompletions.filter(c => 
    c.completionTime && c.completionTime < 5
  );

  if (fastCompletions.length >= 5) {
    suspiciousActivities.push({
      type: 'fast_completions',
      severity: 'high',
      description: `${fastCompletions.length} tasks completed in less than 5 seconds`,
      timestamp: now,
    });
  }

  // Check for multiple IP addresses
  const uniqueIPs = await prisma.loginLog.groupBy({
    by: ['ipAddress'],
    where: {
      userId,
      createdAt: { gte: last7Days },
    },
  });

  if (uniqueIPs.length >= 10) {
    suspiciousActivities.push({
      type: 'multiple_ip_addresses',
      severity: 'medium',
      description: `Logged in from ${uniqueIPs.length} different IP addresses in the last 7 days`,
      timestamp: now,
    });
  }

  return suspiciousActivities;
}
