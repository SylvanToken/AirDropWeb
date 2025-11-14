import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, handleApiError } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        'Forbidden',
        'Admin access required',
        403
      )
    }

    // Optimize: Run all queries in parallel
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [totalUsers, activeUsers, completionStats, userPointsStats, referralStats] = await Promise.all([
      // Get total users
      prisma.user.count(),
      
      // Get active users (users with activity in last 7 days)
      prisma.user.count({
        where: {
          lastActive: {
            gte: sevenDaysAgo,
          },
        },
      }),
      
      // Get total completions and points in a single query
      prisma.completion.aggregate({
        _count: true,
        _sum: {
          pointsAwarded: true,
        },
      }),

      // Get total points from user accounts
      prisma.user.aggregate({
        _sum: {
          totalPoints: true,
        },
      }),

      // Get referral-specific metrics
      (async () => {
        // Get referral task completions
        const referralTasks = await prisma.task.findMany({
          where: { taskType: 'REFERRAL' },
          select: { id: true },
        })
        
        const referralTaskIds = referralTasks.map(t => t.id)
        
        if (referralTaskIds.length === 0) {
          return {
            totalReferralCompletions: 0,
            totalReferralPoints: 0,
          }
        }

        const referralCompletions = await prisma.completion.aggregate({
          where: {
            taskId: { in: referralTaskIds },
            status: 'APPROVED',
          },
          _count: true,
          _sum: {
            pointsAwarded: true,
          },
        })

        return {
          totalReferralCompletions: referralCompletions._count,
          totalReferralPoints: referralCompletions._sum.pointsAwarded || 0,
        }
      })(),
    ])

    // Use the higher value between completion points and user total points
    const totalPointsAwarded = Math.max(
      completionStats._sum.pointsAwarded || 0,
      userPointsStats._sum.totalPoints || 0
    );

    const stats = {
      totalUsers,
      activeUsers,
      totalCompletions: completionStats._count,
      totalPointsAwarded,
      totalReferralCompletions: referralStats.totalReferralCompletions,
      totalReferralPoints: referralStats.totalReferralPoints,
    }

    return NextResponse.json(stats)
  } catch (error) {
    return handleApiError(error)
  }
}
