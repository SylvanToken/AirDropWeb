// @ts-nocheck - Prisma types need regeneration after schema changes
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { userIdSchema } from '@/lib/validations'
import { createErrorResponse, handleApiError } from '@/lib/utils'
import { logCrudOperation } from '@/lib/admin/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Admin Users API] Fetching user details for ID:', params.id)
    
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      console.log('[Admin Users API] Unauthorized access attempt')
      return createErrorResponse(
        'Forbidden',
        'Admin access required',
        403
      )
    }

    console.log('[Admin Users API] Admin user:', session.user.email)

    // Validate user ID
    const idValidation = userIdSchema.safeParse({ id: params.id })
    if (!idValidation.success) {
      return createErrorResponse(
        'Bad Request',
        'Invalid user ID',
        400
      )
    }

    const userId = params.id

    // Parse pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return createErrorResponse(
        'Bad Request',
        'Invalid pagination parameters',
        400
      )
    }

    const skip = (page - 1) * limit

    // First check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!userExists) {
      return createErrorResponse(
        'Not Found',
        'User not found',
        404
      )
    }

    // Optimize: Fetch user, completions, login logs, and referral data separately with pagination
    const [user, completions, totalCompletions, loginLogs, referralData] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          status: true,
          walletAddress: true,
          walletVerified: true,
          twitterUsername: true,
          twitterVerified: true,
          telegramUsername: true,
          telegramVerified: true,
          referralCode: true,
          totalPoints: true,
          createdAt: true,
          lastActive: true,
        },
      }),
      prisma.completion.findMany({
        where: { userId },
        select: {
          id: true,
          completedAt: true,
          pointsAwarded: true,
          task: {
            select: {
              id: true,
              title: true,
              description: true,
              points: true,
              taskType: true,
            },
          },
        },
        orderBy: {
          completedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.completion.count({
        where: { userId },
      }),
      prisma.loginLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10, // Last 10 login attempts
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          success: true,
          createdAt: true,
        },
      }),
      // Get referral information
      (async () => {
        try {
          // Get the user's referral code first
          const userForReferral = await prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true },
          })

          // Get users referred by this user
          const referredUsers = await prisma.user.count({
            where: {
              invitedBy: userForReferral?.referralCode || '',
            },
          })

          // Get referral task completions
          const referralTasks = await prisma.task.findMany({
            where: { taskType: 'REFERRAL' },
            select: { id: true },
          })
          
          const referralTaskIds = referralTasks.map(t => t.id)
          
          const referralCompletions = referralTaskIds.length > 0 
            ? await prisma.completion.findMany({
                where: {
                  userId,
                  taskId: { in: referralTaskIds },
                },
                select: {
                  id: true,
                  completedAt: true,
                  pointsAwarded: true,
                  status: true,
                  task: {
                    select: {
                      id: true,
                      title: true,
                      points: true,
                    },
                  },
                },
                orderBy: {
                  completedAt: 'desc',
                },
              })
            : []

          return {
            referredUsersCount: referredUsers,
            referralCompletions,
          }
        } catch (error) {
          console.error('[Admin Users API] Error fetching referral data:', error)
          return {
            referredUsersCount: 0,
            referralCompletions: [],
          }
        }
      })(),
    ])

    // Optimize: Calculate streak using only dates (fetch separately if needed)
    const completionDatesForStreak = await prisma.completion.findMany({
      where: { userId },
      select: {
        completedAt: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    const completionDates = completionDatesForStreak.map((c) =>
      new Date(c.completedAt).toISOString().split('T')[0]
    )
    const uniqueDatesSet = new Set(completionDates)
    const uniqueDates = Array.from(uniqueDatesSet).sort().reverse()

    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    let currentDate = new Date(today)

    for (const date of uniqueDates) {
      const checkDate = currentDate.toISOString().split('T')[0]
      if (date === checkDate) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    // Transform response
    const userDetails = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      walletAddress: user.walletAddress,
      walletVerified: user.walletVerified,
      twitterUsername: user.twitterUsername,
      twitterVerified: user.twitterVerified,
      telegramUsername: user.telegramUsername,
      telegramVerified: user.telegramVerified,
      referralCode: user.referralCode,
      totalPoints: user.totalPoints,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
      completionCount: totalCompletions,
      streak,
      completions: completions.map((c) => ({
        id: c.id,
        completedAt: c.completedAt,
        pointsAwarded: c.pointsAwarded,
        task: c.task,
      })),
      loginLogs,
      referralData: {
        referredUsersCount: referralData.referredUsersCount,
        referralCompletions: referralData.referralCompletions,
        referralLink: user.referralCode 
          ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`
          : null,
      },
      pagination: {
        page,
        limit,
        totalCount: totalCompletions,
        totalPages: Math.ceil(totalCompletions / limit),
        hasMore: skip + completions.length < totalCompletions,
      },
    }

    console.log('[Admin Users API] Successfully fetched user details')
    return NextResponse.json(userDetails)
  } catch (error) {
    console.error('[Admin Users API] Error fetching user details:', error)
    return handleApiError(error)
  }
}

// PATCH /api/admin/users/[id] - Update user status (block/unblock)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        'Forbidden',
        'Admin access required',
        403
      )
    }

    const userId = params.id

    // Prevent admin from blocking themselves
    if (userId === session.user.id) {
      return createErrorResponse(
        'Bad Request',
        'You cannot block yourself',
        400
      )
    }

    const body = await request.json()
    const { status } = body

    // Validate status
    if (!['ACTIVE', 'BLOCKED'].includes(status)) {
      return createErrorResponse(
        'Bad Request',
        'Invalid status. Must be ACTIVE or BLOCKED',
        400
      )
    }

    // Get user before update for audit log
    const userBefore = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, status: true },
    })

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
      },
    })

    // Log audit event
    await logCrudOperation(
      request,
      'update',
      'User',
      userId,
      userBefore || undefined,
      updatedUser
    )

    return NextResponse.json({
      message: `User ${status === 'BLOCKED' ? 'blocked' : 'unblocked'} successfully`,
      user: updatedUser,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/users/[id] - Soft delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        'Forbidden',
        'Admin access required',
        403
      )
    }

    const userId = params.id

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return createErrorResponse(
        'Bad Request',
        'You cannot delete yourself',
        400
      )
    }

    // Get user before deletion for audit log
    const userBefore = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, status: true },
    })

    // Soft delete: mark as DELETED
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        status: 'DELETED',
        // Optionally anonymize data
        email: `deleted_${userId}@deleted.local`,
        username: `deleted_${userId}`,
      },
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
      },
    })

    // Log audit event (security-sensitive)
    await logCrudOperation(
      request,
      'delete',
      'User',
      userId,
      userBefore || undefined,
      deletedUser
    )

    return NextResponse.json({
      message: 'User deleted successfully',
      user: deletedUser,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
