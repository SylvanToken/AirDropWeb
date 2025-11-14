import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, handleApiError } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        'Forbidden',
        'Admin access required',
        403
      )
    }

    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'totalPoints'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return createErrorResponse(
        'Bad Request',
        'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
        400
      )
    }

    // Validate sort parameters
    const validSortFields = ['totalPoints', 'createdAt', 'lastActive', 'username', 'email']
    if (!validSortFields.includes(sortBy)) {
      return createErrorResponse(
        'Bad Request',
        `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`,
        400
      )
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
      return createErrorResponse(
        'Bad Request',
        'Invalid sort order. Must be "asc" or "desc"',
        400
      )
    }

    // Build where clause for search
    const whereClause = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { username: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination metadata
    const totalCount = await prisma.user.count({
      where: whereClause,
    })

    // Fetch users with completion count using pagination
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        totalPoints: true,
        createdAt: true,
        lastActive: true,
        _count: {
          select: {
            completions: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc',
      },
      skip,
      take: limit,
    })

    // Transform data to include completion count
    const usersWithStats = users.map((user, index) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      totalPoints: user.totalPoints,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
      completionCount: user._count.completions,
      rank: skip + index + 1,
    }))

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + users.length < totalCount,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
