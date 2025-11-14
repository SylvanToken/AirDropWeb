// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, handleApiError } from '@/lib/utils'
import { logCrudOperation } from '@/lib/admin/audit'

// GET /api/admin/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse('Forbidden', 'Admin access required', 403)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const skip = (page - 1) * limit

    const [campaigns, totalCount] = await Promise.all([
      prisma.campaign.findMany({
        include: {
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: [
          { isActive: 'desc' },
          { startDate: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.campaign.count(),
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

// POST /api/admin/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse('Forbidden', 'Admin access required', 403)
    }

    const body = await request.json()
    const { title, description, startDate, endDate, isActive } = body

    // Validation
    if (!title || !description || !startDate || !endDate) {
      return createErrorResponse(
        'Bad Request',
        'Title, description, start date, and end date are required',
        400
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end <= start) {
      return createErrorResponse(
        'Bad Request',
        'End date must be after start date',
        400
      )
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        startDate: start,
        endDate: end,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    // Log audit event
    await logCrudOperation(
      request,
      'create',
      'Campaign',
      campaign.id,
      undefined,
      campaign
    )

    return NextResponse.json(
      { message: 'Campaign created successfully', campaign },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
