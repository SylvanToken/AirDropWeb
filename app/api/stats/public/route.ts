import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/stats/public
 * 
 * Public statistics for homepage
 * Returns real data from database
 */
export async function GET() {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count({
      where: {
        status: 'ACTIVE', // Only count active users
      },
    });

    // Get total completed tasks
    const totalCompletions = await prisma.completion.count();

    // Get total points distributed
    const pointsResult = await prisma.completion.aggregate({
      _sum: {
        pointsAwarded: true,
      },
    });

    const totalPoints = pointsResult._sum.pointsAwarded || 0;

    return NextResponse.json({
      users: totalUsers,
      completedTasks: totalCompletions,
      distributedPoints: totalPoints,
    });
  } catch (error) {
    console.error('[Public Stats] Error fetching stats:', error);
    
    // Return fallback stats on error
    return NextResponse.json({
      users: 0,
      completedTasks: 0,
      distributedPoints: 0,
    });
  }
}

/**
 * Cache configuration
 * Revalidate every 5 minutes
 */
export const revalidate = 300;
