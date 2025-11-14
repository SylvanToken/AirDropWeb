import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { queueAdminDailyDigestEmail } from '@/lib/email/queue';

/**
 * Daily Digest Cron Job
 * 
 * Sends daily summary email to admins with platform statistics.
 * Should be triggered once per day (e.g., via Vercel Cron or external scheduler).
 * 
 * Requirements: 4.3, 4.5
 * 
 * Usage:
 * - Set up Vercel Cron: Add to vercel.json
 * - Or use external cron service to call this endpoint daily
 * 
 * Security:
 * - Verify cron secret to prevent unauthorized access
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get yesterday's date for the digest
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Gather statistics
    const [
      newUsers,
      taskCompletions,
      pendingReviews,
      totalUsers,
      totalPointsResult,
      topTaskResult,
    ] = await Promise.all([
      // New users yesterday
      prisma.user.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      }),
      
      // Task completions yesterday
      prisma.completion.count({
        where: {
          completedAt: {
            gte: yesterday,
            lt: today,
          },
        },
      }),
      
      // Pending reviews (all time)
      prisma.completion.count({
        where: {
          status: 'PENDING',
          needsReview: true,
        },
      }),
      
      // Total users
      prisma.user.count(),
      
      // Total points earned (all time)
      prisma.user.aggregate({
        _sum: {
          totalPoints: true,
        },
      }),
      
      // Most popular task yesterday
      prisma.completion.groupBy({
        by: ['taskId'],
        where: {
          completedAt: {
            gte: yesterday,
            lt: today,
          },
        },
        _count: {
          taskId: true,
        },
        orderBy: {
          _count: {
            taskId: 'desc',
          },
        },
        take: 1,
      }),
    ]);

    // Get top task details if available
    let topTask: { name: string; completions: number } | undefined;
    
    if (topTaskResult.length > 0) {
      const taskDetails = await prisma.task.findUnique({
        where: { id: topTaskResult[0].taskId },
        select: { title: true },
      });
      
      if (taskDetails) {
        topTask = {
          name: taskDetails.title,
          completions: topTaskResult[0]._count.taskId,
        };
      }
    }

    // Queue daily digest email
    await queueAdminDailyDigestEmail(
      yesterday.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      {
        newUsers,
        taskCompletions,
        pendingReviews,
        totalUsers,
        totalPoints: totalPointsResult._sum.totalPoints || 0,
        topTask,
      },
      'en' // Default to English for admin emails
    );

    return NextResponse.json({
      success: true,
      message: 'Daily digest email queued successfully',
      stats: {
        newUsers,
        taskCompletions,
        pendingReviews,
        totalUsers,
        totalPoints: totalPointsResult._sum.totalPoints || 0,
        topTask,
      },
    });
  } catch (error) {
    console.error('Daily digest cron job failed:', error);
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
