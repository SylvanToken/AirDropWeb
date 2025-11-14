// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

// GET /api/campaigns - List active campaigns for users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const skip = (page - 1) * limit

    const now = new Date()

    const [campaigns, totalCount] = await Promise.all([
      prisma.campaign.findMany({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        include: {
          tasks: {
            where: { isActive: true },
            select: {
              id: true,
              title: true,
              description: true,
              points: true,
              taskType: true,
              taskUrl: true,
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.campaign.count({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
    ])

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + campaigns.length < totalCount,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
