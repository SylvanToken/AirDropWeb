import { prisma } from '@/lib/prisma';

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalCompletions: number;
  completionsToday: number;
  totalPoints: number;
  averagePointsPerUser: number;
  topTasks: Array<{ taskId: string; title: string; completions: number }>;
  userGrowth: Array<{ date: string; count: number }>;
  completionTrends: Array<{ date: string; count: number }>;
}

/**
 * Calculate comprehensive platform metrics
 * Requirements: 4.1, 4.2, 4.3, 4.4
 * 
 * @param dateRange Optional date range for trend calculations
 * @returns Platform metrics including users, completions, points, and trends
 */
export async function calculatePlatformMetrics(
  dateRange?: { start: Date; end: Date }
): Promise<PlatformMetrics> {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Requirement 4.1: Calculate total and active users
    // Requirement 4.2: Calculate completion statistics
    // Requirement 4.3: Calculate points statistics
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      totalCompletions,
      completionsToday,
      pointsAggregate,
    ] = await Promise.all([
      // Total users count
      prisma.user.count({
        where: { status: { not: 'DELETED' } },
      }),
      // Active users (logged in within last 7 days)
      prisma.user.count({
        where: {
          status: { not: 'DELETED' },
          lastActive: { gte: sevenDaysAgo },
        },
      }),
      // New users registered today
      prisma.user.count({
        where: {
          status: { not: 'DELETED' },
          createdAt: { gte: today },
        },
      }),
      // Total completions (approved only)
      prisma.completion.count({
        where: {
          status: { in: ['APPROVED', 'AUTO_APPROVED'] },
        },
      }),
      // Completions today (approved only)
      prisma.completion.count({
        where: {
          status: { in: ['APPROVED', 'AUTO_APPROVED'] },
          completedAt: { gte: today },
        },
      }),
      // Points statistics
      prisma.user.aggregate({
        where: { status: { not: 'DELETED' } },
        _sum: { totalPoints: true },
        _avg: { totalPoints: true },
      }),
    ]);

    // Requirement 4.4: Calculate top tasks by completions
    const topTasksData = await prisma.completion.groupBy({
      by: ['taskId'],
      where: {
        status: { in: ['APPROVED', 'AUTO_APPROVED'] },
      },
      _count: { taskId: true },
      orderBy: { _count: { taskId: 'desc' } },
      take: 10,
    });

    const topTasks = await enrichTopTasks(topTasksData);
    
    // Requirement 4.4: Calculate user growth and completion trends
    const userGrowth = await calculateUserGrowth(dateRange);
    const completionTrends = await calculateCompletionTrends(dateRange);

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      totalCompletions,
      completionsToday,
      totalPoints: pointsAggregate._sum.totalPoints || 0,
      averagePointsPerUser: Math.round(pointsAggregate._avg.totalPoints || 0),
      topTasks,
      userGrowth,
      completionTrends,
    };
  } catch (error) {
    console.error('Error calculating platform metrics:', error);
    throw new Error('Failed to calculate platform metrics');
  }
}

/**
 * Enrich top tasks data with task titles
 * Requirement 4.4: Calculate top tasks by completions
 */
async function enrichTopTasks(
  topTasksData: Array<{ taskId: string; _count: { taskId: number } }>
): Promise<Array<{ taskId: string; title: string; completions: number }>> {
  if (topTasksData.length === 0) {
    return [];
  }

  const taskIds = topTasksData.map(t => t.taskId);
  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds } },
    select: { id: true, title: true },
  });

  const taskMap = new Map(tasks.map(t => [t.id, t.title]));

  return topTasksData.map(t => ({
    taskId: t.taskId,
    title: taskMap.get(t.taskId) || 'Unknown Task',
    completions: t._count.taskId,
  }));
}

/**
 * Calculate user growth over time
 * Requirement 4.4: Implement user growth calculation
 * 
 * @param dateRange Optional date range (defaults to last 30 days)
 * @returns Array of daily user registration counts
 */
async function calculateUserGrowth(
  dateRange?: { start: Date; end: Date }
): Promise<Array<{ date: string; count: number }>> {
  const start = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = dateRange?.end || new Date();

  const users = await prisma.user.findMany({
    where: {
      status: { not: 'DELETED' },
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group users by date
  const growthMap = new Map<string, number>();
  
  // Initialize all dates in range with 0
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    growthMap.set(dateStr, 0);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Count users per date
  users.forEach(user => {
    const date = user.createdAt.toISOString().split('T')[0];
    growthMap.set(date, (growthMap.get(date) || 0) + 1);
  });

  return Array.from(growthMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate completion trends over time
 * Requirement 4.4: Implement completion trends calculation
 * 
 * @param dateRange Optional date range (defaults to last 30 days)
 * @returns Array of daily completion counts
 */
async function calculateCompletionTrends(
  dateRange?: { start: Date; end: Date }
): Promise<Array<{ date: string; count: number }>> {
  const start = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = dateRange?.end || new Date();

  const completions = await prisma.completion.findMany({
    where: {
      status: { in: ['APPROVED', 'AUTO_APPROVED'] },
      completedAt: {
        gte: start,
        lte: end,
      },
    },
    select: { completedAt: true },
    orderBy: { completedAt: 'asc' },
  });

  // Group completions by date
  const trendsMap = new Map<string, number>();
  
  // Initialize all dates in range with 0
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    trendsMap.set(dateStr, 0);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Count completions per date
  completions.forEach(completion => {
    const date = completion.completedAt.toISOString().split('T')[0];
    trendsMap.set(date, (trendsMap.get(date) || 0) + 1);
  });

  return Array.from(trendsMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
