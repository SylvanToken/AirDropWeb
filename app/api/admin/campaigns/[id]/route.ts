// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, handleApiError } from '@/lib/utils'
import { logCrudOperation } from '@/lib/admin/audit'

// GET /api/admin/campaigns/[id] - Get campaign details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse('Forbidden', 'Admin access required', 403)
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          include: {
            _count: {
              select: { completions: true },
            },
          },
        },
      },
    })

    if (!campaign) {
      return createErrorResponse('Not Found', 'Campaign not found', 404)
    }

    return NextResponse.json(campaign)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/admin/campaigns/[id] - Update campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse('Forbidden', 'Admin access required', 403)
    }

    const body = await request.json()
    const { title, description, startDate, endDate, isActive } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) updateData.endDate = new Date(endDate)
    if (isActive !== undefined) updateData.isActive = isActive

    // Validate dates if both are provided
    if (updateData.startDate && updateData.endDate) {
      if (updateData.endDate <= updateData.startDate) {
        return createErrorResponse(
          'Bad Request',
          'End date must be after start date',
          400
        )
      }
    }

    // Get campaign before update for audit log
    const campaignBefore = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, description: true, startDate: true, endDate: true, isActive: true }
    })

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: updateData,
    })

    // Log audit event
    await logCrudOperation(
      request,
      'update',
      'Campaign',
      params.id,
      campaignBefore || undefined,
      campaign
    )

    return NextResponse.json({
      message: 'Campaign updated successfully',
      campaign,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse('Forbidden', 'Admin access required', 403)
    }

    // Get campaign before deletion for audit log
    const campaignBefore = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, description: true, startDate: true, endDate: true }
    })

    await prisma.campaign.delete({
      where: { id: params.id },
    })

    // Log audit event (security-sensitive)
    await logCrudOperation(
      request,
      'delete',
      'Campaign',
      params.id,
      campaignBefore || undefined,
      undefined
    )

    return NextResponse.json({
      message: 'Campaign deleted successfully',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
