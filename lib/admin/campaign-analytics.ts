/**
 * Campaign Analytics Module
 * 
 * Provides comprehensive analytics for campaigns including:
 * - Participation and completion rates
 * - Engagement metrics
 * - Task-level performance breakdown
 * - Campaign comparison functionality
 * - Automatic performance reports
 */

import { prisma } from '@/lib/prisma';

export interface CampaignAnalytics {
  campaignId: string;
  campaignTitle: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  
  // Participation metrics
  totalUsers: number;
  participatingUsers: number;
  participationRate: number; // Percentage
  
  // Completion metrics
  totalTasks: number;
  totalCompletions: number;
  averageCompletionsPerUser: number;
  completionRate: number; // Percentage
  
  // Engagement metrics
  engagementScore: number; // 0-100
  averageTimeToComplete: number; // Seconds
  dailyActiveUsers: number;
  
  // Task breakdown
  taskPerformance: TaskPerformance[];
  
  // Time-based patterns
  dailyParticipation: DailyPattern[];
  weeklyParticipation: WeeklyPattern[];
}

export interface TaskPerformance {
  taskId: string;
  taskTitle: string;
  taskType: string;
  points: number;
  totalCompletions: number;
  uniqueUsers: number;
  completionRate: number; // Percentage
  averageCompletionTime: number; // Seconds
  approvalRate: number; // Percentage
}

export interface DailyPattern {
  date: string;
  participants: number;
  completions: number;
  newUsers: number;
}

export interface WeeklyPattern {
  week: string;
  participants: number;
  completions: number;
  averageEngagement: number;
}

export interface CampaignComparison {
  campaigns: Array<{
    id: string;
    title: string;
    participationRate: number;
    completionRate: number;
    engagementScore: number;
    totalCompletions: number;
  }>;
  insights: string[];
}

export interface PerformanceReport {
  campaignId: string;
  campaignTitle: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalParticipants: number;
    totalCompletions: number;
    participationRate: number;
    completionRate: number;
    engagementScore: number;
  };
  topPerformingTasks: TaskPerformance[];
  lowPerformingTasks: TaskPerformance[];
  recommendations: string[];
}

/**
 * Calculate comprehensive analytics for a campaign
 */
export async function calculateCampaignAnalytics(
  campaignId: string
): Promise<CampaignAnalytics> {
  // Fetch campaign with tasks
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      tasks: {
        include: {
          completions: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  // Get total users in the system
  const totalUsers = await prisma.user.count({
    where: { role: 'USER' },
  });

  // Calculate participating users (users who completed at least one task)
  const participatingUserIds = new Set(
    campaign.tasks.flatMap(task => 
      task.completions.map(c => c.userId)
    )
  );
  const participatingUsers = participatingUserIds.size;
  const participationRate = totalUsers > 0 
    ? (participatingUsers / totalUsers) * 100 
    : 0;

  // Calculate total completions
  const totalCompletions = campaign.tasks.reduce(
    (sum, task) => sum + task.completions.length,
    0
  );

  // Calculate completion rate (completed tasks / total possible completions)
  const totalPossibleCompletions = campaign.tasks.length * participatingUsers;
  const completionRate = totalPossibleCompletions > 0
    ? (totalCompletions / totalPossibleCompletions) * 100
    : 0;

  // Calculate average completions per user
  const averageCompletionsPerUser = participatingUsers > 0
    ? totalCompletions / participatingUsers
    : 0;

  // Calculate engagement score (0-100)
  const engagementScore = calculateEngagementScore({
    participationRate,
    completionRate,
    averageCompletionsPerUser,
    totalTasks: campaign.tasks.length,
  });

  // Calculate average time to complete
  const completionsWithTime = campaign.tasks.flatMap(task =>
    task.completions.filter(c => c.completionTime !== null)
  );
  const averageTimeToComplete = completionsWithTime.length > 0
    ? completionsWithTime.reduce((sum, c) => sum + (c.completionTime || 0), 0) / completionsWithTime.length
    : 0;

  // Calculate daily active users (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCompletions = campaign.tasks.flatMap(task =>
    task.completions.filter(c => c.completedAt >= oneDayAgo)
  );
  const dailyActiveUsers = new Set(recentCompletions.map(c => c.userId)).size;

  // Calculate task performance
  const taskPerformance = await calculateTaskPerformance(campaign.tasks, participatingUsers);

  // Calculate daily participation patterns
  const dailyParticipation = calculateDailyParticipation(campaign.tasks);

  // Calculate weekly participation patterns
  const weeklyParticipation = calculateWeeklyParticipation(campaign.tasks);

  return {
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    isActive: campaign.isActive,
    totalUsers,
    participatingUsers,
    participationRate,
    totalTasks: campaign.tasks.length,
    totalCompletions,
    averageCompletionsPerUser,
    completionRate,
    engagementScore,
    averageTimeToComplete,
    dailyActiveUsers,
    taskPerformance,
    dailyParticipation,
    weeklyParticipation,
  };
}

/**
 * Calculate performance metrics for individual tasks
 */
async function calculateTaskPerformance(
  tasks: any[],
  totalParticipants: number
): Promise<TaskPerformance[]> {
  return tasks.map(task => {
    const uniqueUsers = new Set(task.completions.map((c: any) => c.userId)).size;
    const completionRate = totalParticipants > 0
      ? (uniqueUsers / totalParticipants) * 100
      : 0;

    const completionsWithTime = task.completions.filter(
      (c: any) => c.completionTime !== null
    );
    const averageCompletionTime = completionsWithTime.length > 0
      ? completionsWithTime.reduce((sum: number, c: any) => sum + (c.completionTime || 0), 0) / completionsWithTime.length
      : 0;

    const approvedCompletions = task.completions.filter(
      (c: any) => c.status === 'APPROVED' || c.status === 'AUTO_APPROVED'
    ).length;
    const approvalRate = task.completions.length > 0
      ? (approvedCompletions / task.completions.length) * 100
      : 0;

    return {
      taskId: task.id,
      taskTitle: task.title,
      taskType: task.taskType,
      points: task.points,
      totalCompletions: task.completions.length,
      uniqueUsers,
      completionRate,
      averageCompletionTime,
      approvalRate,
    };
  });
}

/**
 * Calculate engagement score based on multiple factors
 */
function calculateEngagementScore(metrics: {
  participationRate: number;
  completionRate: number;
  averageCompletionsPerUser: number;
  totalTasks: number;
}): number {
  const { participationRate, completionRate, averageCompletionsPerUser, totalTasks } = metrics;

  // Weighted scoring
  const participationWeight = 0.3;
  const completionWeight = 0.4;
  const engagementDepthWeight = 0.3;

  // Normalize engagement depth (how many tasks per user)
  const engagementDepth = totalTasks > 0
    ? Math.min((averageCompletionsPerUser / totalTasks) * 100, 100)
    : 0;

  const score = 
    (participationRate * participationWeight) +
    (completionRate * completionWeight) +
    (engagementDepth * engagementDepthWeight);

  return Math.round(score * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate daily participation patterns
 */
function calculateDailyParticipation(tasks: any[]): DailyPattern[] {
  const dailyData = new Map<string, DailyPattern>();

  tasks.forEach(task => {
    task.completions.forEach((completion: any) => {
      const date = completion.completedAt.toISOString().split('T')[0];
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          participants: new Set<string>(),
          completions: 0,
          newUsers: new Set<string>(),
        } as any);
      }

      const dayData = dailyData.get(date)!;
      (dayData.participants as any).add(completion.userId);
      dayData.completions++;
    });
  });

  // Convert Sets to counts and sort by date
  return Array.from(dailyData.values())
    .map(day => ({
      date: day.date,
      participants: (day.participants as any).size,
      completions: day.completions,
      newUsers: 0, // Would need user creation date to calculate
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate weekly participation patterns
 */
function calculateWeeklyParticipation(tasks: any[]): WeeklyPattern[] {
  const weeklyData = new Map<string, any>();

  tasks.forEach(task => {
    task.completions.forEach((completion: any) => {
      const date = new Date(completion.completedAt);
      const weekStart = getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, {
          week: weekKey,
          participants: new Set<string>(),
          completions: 0,
        });
      }

      const weekData = weeklyData.get(weekKey)!;
      weekData.participants.add(completion.userId);
      weekData.completions++;
    });
  });

  // Convert to array and calculate averages
  return Array.from(weeklyData.values())
    .map(week => ({
      week: week.week,
      participants: week.participants.size,
      completions: week.completions,
      averageEngagement: week.participants.size > 0
        ? week.completions / week.participants.size
        : 0,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Get the start of the week (Monday) for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Compare multiple campaigns
 */
export async function compareCampaigns(
  campaignIds: string[]
): Promise<CampaignComparison> {
  const campaigns = await Promise.all(
    campaignIds.map(id => calculateCampaignAnalytics(id))
  );

  const comparison: CampaignComparison = {
    campaigns: campaigns.map(c => ({
      id: c.campaignId,
      title: c.campaignTitle,
      participationRate: c.participationRate,
      completionRate: c.completionRate,
      engagementScore: c.engagementScore,
      totalCompletions: c.totalCompletions,
    })),
    insights: [],
  };

  // Generate insights
  if (campaigns.length >= 2) {
    const sorted = [...campaigns].sort((a, b) => b.engagementScore - a.engagementScore);
    comparison.insights.push(
      `${sorted[0].campaignTitle} has the highest engagement score (${sorted[0].engagementScore.toFixed(1)})`
    );

    const highestParticipation = [...campaigns].sort((a, b) => b.participationRate - a.participationRate)[0];
    comparison.insights.push(
      `${highestParticipation.campaignTitle} has the highest participation rate (${highestParticipation.participationRate.toFixed(1)}%)`
    );

    const highestCompletion = [...campaigns].sort((a, b) => b.completionRate - a.completionRate)[0];
    comparison.insights.push(
      `${highestCompletion.campaignTitle} has the highest completion rate (${highestCompletion.completionRate.toFixed(1)}%)`
    );
  }

  return comparison;
}

/**
 * Generate automatic performance report for a campaign
 */
export async function generatePerformanceReport(
  campaignId: string
): Promise<PerformanceReport> {
  const analytics = await calculateCampaignAnalytics(campaignId);

  // Sort tasks by performance
  const sortedTasks = [...analytics.taskPerformance].sort(
    (a, b) => b.completionRate - a.completionRate
  );

  const topPerformingTasks = sortedTasks.slice(0, 5);
  const lowPerformingTasks = sortedTasks.slice(-5).reverse();

  // Generate recommendations
  const recommendations: string[] = [];

  if (analytics.participationRate < 30) {
    recommendations.push(
      'Low participation rate detected. Consider promoting the campaign more actively or adjusting task difficulty.'
    );
  }

  if (analytics.completionRate < 50) {
    recommendations.push(
      'Low completion rate suggests tasks may be too difficult or time-consuming. Review task requirements.'
    );
  }

  if (analytics.engagementScore < 40) {
    recommendations.push(
      'Overall engagement is low. Consider adding more rewarding tasks or improving task variety.'
    );
  }

  // Check for tasks with low approval rates
  const lowApprovalTasks = analytics.taskPerformance.filter(t => t.approvalRate < 70);
  if (lowApprovalTasks.length > 0) {
    recommendations.push(
      `${lowApprovalTasks.length} task(s) have low approval rates. Review verification criteria.`
    );
  }

  // Check for unbalanced task performance
  if (sortedTasks.length > 0) {
    const performanceGap = sortedTasks[0].completionRate - sortedTasks[sortedTasks.length - 1].completionRate;
    if (performanceGap > 50) {
      recommendations.push(
        'Large performance gap between tasks. Consider rebalancing task difficulty or rewards.'
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Campaign is performing well. Continue monitoring metrics.');
  }

  return {
    campaignId: analytics.campaignId,
    campaignTitle: analytics.campaignTitle,
    generatedAt: new Date(),
    period: {
      start: analytics.startDate,
      end: analytics.endDate,
    },
    summary: {
      totalParticipants: analytics.participatingUsers,
      totalCompletions: analytics.totalCompletions,
      participationRate: analytics.participationRate,
      completionRate: analytics.completionRate,
      engagementScore: analytics.engagementScore,
    },
    topPerformingTasks,
    lowPerformingTasks,
    recommendations,
  };
}

/**
 * Get campaign analytics for a specific date range
 */
export async function getCampaignAnalyticsByDateRange(
  campaignId: string,
  startDate: Date,
  endDate: Date
): Promise<CampaignAnalytics> {
  // This would filter completions by date range
  // For now, returning full analytics
  // In production, you'd want to filter the completions query
  return calculateCampaignAnalytics(campaignId);
}
