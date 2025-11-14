import { prisma } from '@/lib/prisma';

/**
 * Duration change audit log entry
 */
export interface DurationChangeLog {
  id: string;
  timestamp: Date;
  adminId: string;
  adminEmail: string;
  taskId: string;
  taskTitle: string;
  changeType: 'CREATED_WITH_TIME_LIMIT' | 'ADDED_TIME_LIMIT' | 'REMOVED_TIME_LIMIT' | 'INCREASED_DURATION' | 'DECREASED_DURATION';
  oldDuration: number | null;
  newDuration: number | null;
  oldExpiresAt: Date | null;
  newExpiresAt: Date | null;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Filters for querying duration change logs
 */
export interface DurationChangeFilters {
  taskId?: string;
  adminId?: string;
  changeType?: string;
  dateRange?: { start: Date; end: Date };
  limit?: number;
  offset?: number;
}

/**
 * Get duration change audit logs with filtering
 * Returns logs specifically for TaskDuration changes
 */
export async function getDurationChangeLogs(
  filters?: DurationChangeFilters
): Promise<{ logs: DurationChangeLog[]; total: number }> {
  const where: any = {
    affectedModel: 'TaskDuration',
  };

  if (filters?.taskId) {
    where.affectedId = filters.taskId;
  }

  if (filters?.adminId) {
    where.adminId = filters.adminId;
  }

  if (filters?.dateRange) {
    where.timestamp = {
      gte: filters.dateRange.start,
      lte: filters.dateRange.end,
    };
  }

  const [auditLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const logs: DurationChangeLog[] = auditLogs.map(log => {
    const beforeData = log.beforeData ? JSON.parse(log.beforeData) : {};
    const afterData = log.afterData ? JSON.parse(log.afterData) : {};

    return {
      id: log.id,
      timestamp: log.timestamp,
      adminId: log.adminId,
      adminEmail: log.adminEmail,
      taskId: afterData.taskId || beforeData.taskId || log.affectedId || '',
      taskTitle: afterData.taskTitle || beforeData.taskTitle || 'Unknown',
      changeType: afterData.changeType || 'UNKNOWN',
      oldDuration: beforeData.oldDuration ?? beforeData.duration ?? null,
      newDuration: afterData.newDuration ?? afterData.duration ?? null,
      oldExpiresAt: beforeData.oldExpiresAt ? new Date(beforeData.oldExpiresAt) : null,
      newExpiresAt: afterData.newExpiresAt ?? afterData.expiresAt ? new Date(afterData.newExpiresAt ?? afterData.expiresAt) : null,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
    };
  });

  return { logs, total };
}

/**
 * Get duration change history for a specific task
 */
export async function getTaskDurationHistory(
  taskId: string
): Promise<DurationChangeLog[]> {
  const { logs } = await getDurationChangeLogs({
    taskId,
    limit: 1000, // Get all changes for this task
  });

  return logs;
}

/**
 * Get duration change statistics
 */
export async function getDurationChangeStats(dateRange?: {
  start: Date;
  end: Date;
}): Promise<{
  totalChanges: number;
  changesByType: Array<{ changeType: string; count: number }>;
  changesByAdmin: Array<{ adminEmail: string; count: number }>;
  tasksWithTimeLimit: number;
  tasksWithoutTimeLimit: number;
}> {
  const where: any = {
    affectedModel: 'TaskDuration',
  };

  if (dateRange) {
    where.timestamp = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  const [totalChanges, auditLogs, allTasks] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      select: {
        adminEmail: true,
        afterData: true,
      },
    }),
    prisma.task.findMany({
      select: {
        duration: true,
      },
    }),
  ]);

  // Count changes by type
  const changeTypeMap = new Map<string, number>();
  const adminMap = new Map<string, number>();

  auditLogs.forEach(log => {
    const afterData = log.afterData ? JSON.parse(log.afterData) : {};
    const changeType = afterData.changeType || 'UNKNOWN';
    
    changeTypeMap.set(changeType, (changeTypeMap.get(changeType) || 0) + 1);
    adminMap.set(log.adminEmail, (adminMap.get(log.adminEmail) || 0) + 1);
  });

  // Count tasks with/without time limits
  const tasksWithTimeLimit = allTasks.filter(t => t.duration !== null).length;
  const tasksWithoutTimeLimit = allTasks.filter(t => t.duration === null).length;

  return {
    totalChanges,
    changesByType: Array.from(changeTypeMap.entries())
      .map(([changeType, count]) => ({ changeType, count }))
      .sort((a, b) => b.count - a.count),
    changesByAdmin: Array.from(adminMap.entries())
      .map(([adminEmail, count]) => ({ adminEmail, count }))
      .sort((a, b) => b.count - a.count),
    tasksWithTimeLimit,
    tasksWithoutTimeLimit,
  };
}

/**
 * Get recent duration changes (last 24 hours by default)
 */
export async function getRecentDurationChanges(
  hours: number = 24
): Promise<DurationChangeLog[]> {
  const start = new Date();
  start.setHours(start.getHours() - hours);

  const { logs } = await getDurationChangeLogs({
    dateRange: { start, end: new Date() },
    limit: 50,
  });

  return logs;
}

/**
 * Format duration change for display
 */
export function formatDurationChange(log: DurationChangeLog): string {
  const { changeType, oldDuration, newDuration, taskTitle } = log;

  switch (changeType) {
    case 'CREATED_WITH_TIME_LIMIT':
      return `Created task "${taskTitle}" with ${newDuration}h time limit`;
    case 'ADDED_TIME_LIMIT':
      return `Added ${newDuration}h time limit to task "${taskTitle}"`;
    case 'REMOVED_TIME_LIMIT':
      return `Removed time limit from task "${taskTitle}" (was ${oldDuration}h)`;
    case 'INCREASED_DURATION':
      return `Increased duration for task "${taskTitle}" from ${oldDuration}h to ${newDuration}h`;
    case 'DECREASED_DURATION':
      return `Decreased duration for task "${taskTitle}" from ${oldDuration}h to ${newDuration}h`;
    default:
      return `Modified duration for task "${taskTitle}"`;
  }
}
