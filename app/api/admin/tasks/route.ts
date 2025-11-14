// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, handleApiError } from '@/lib/utils'
import { sanitizeString, sanitizeUrl } from '@/lib/sanitize'
import { generateTaskTranslations } from '@/lib/auto-translate'
import { logCrudOperation } from '@/lib/admin/audit'

// GET /api/admin/tasks - Get all tasks (including inactive)
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
    const campaignId = searchParams.get('campaignId')

    const where = campaignId ? { campaignId } : {}

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: { completions: true }
        }
      }
    })

    return NextResponse.json({ data: tasks }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        'Forbidden',
        'Admin access required',
        403
      )
    }

    const body = await request.json()
    const { title, description, points, taskType, taskUrl, isActive, campaignId, isTimeLimited, duration } = body

    // Validate required fields
    if (!title || !description || !points || !taskType || !campaignId) {
      return createErrorResponse(
        'Bad Request',
        'Title, description, points, taskType, and campaignId are required',
        400
      )
    }

    // Validate duration if time-limited
    if (isTimeLimited && duration) {
      if (typeof duration !== 'number' || duration < 1 || duration > 24) {
        return createErrorResponse(
          'Bad Request',
          'Duration must be between 1 and 24 hours',
          400
        )
      }
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title)
    const sanitizedDescription = sanitizeString(description)
    const sanitizedTaskUrl = taskUrl ? sanitizeUrl(taskUrl) : null

    // Generate automatic translations
    const translations = generateTaskTranslations(sanitizedTitle, sanitizedDescription)

    // Calculate expiration timestamp if time-limited
    let expiresAt = null
    if (isTimeLimited && duration) {
      const now = new Date()
      expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000)
    }

    const task = await prisma.task.create({
      data: {
        campaignId,
        title: sanitizedTitle,
        description: sanitizedDescription,
        ...translations,
        points,
        taskType,
        taskUrl: sanitizedTaskUrl,
        isActive: isActive ?? true,
        duration: isTimeLimited && duration ? duration : null,
        expiresAt: expiresAt
      }
    })

    // Log general audit event
    await logCrudOperation(
      request,
      'create',
      'Task',
      task.id,
      undefined,
      task
    )

    // Log specific duration audit event if task is time-limited
    if (isTimeLimited && duration) {
      await logCrudOperation(
        request,
        'create',
        'TaskDuration',
        task.id,
        undefined,
        {
          taskId: task.id,
          taskTitle: task.title,
          duration: duration,
          expiresAt: expiresAt,
          isTimeLimited: true,
          changeType: 'CREATED_WITH_TIME_LIMIT',
        }
      )
    }

    return NextResponse.json({ 
      data: task,
      expiresAt: expiresAt 
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
