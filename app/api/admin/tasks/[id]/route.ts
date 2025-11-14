// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, handleApiError } from '@/lib/utils'
import { logCrudOperation } from '@/lib/admin/audit'

/**
 * Determine the type of duration change for audit logging
 */
function getDurationChangeType(oldDuration: number | null, newDuration: number | null): string {
  if (oldDuration === null && newDuration !== null) {
    return 'ADDED_TIME_LIMIT'
  }
  if (oldDuration !== null && newDuration === null) {
    return 'REMOVED_TIME_LIMIT'
  }
  if (oldDuration !== null && newDuration !== null && oldDuration !== newDuration) {
    return newDuration > oldDuration ? 'INCREASED_DURATION' : 'DECREASED_DURATION'
  }
  return 'NO_CHANGE'
}

// GET /api/admin/tasks/[id] - Get a single task
export async function GET(
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

    const taskId = params.id

    // Fetch task with campaign details
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            completions: true,
          },
        },
      },
    })

    if (!task) {
      return createErrorResponse(
        'Not Found',
        'Task not found',
        404
      )
    }

    return NextResponse.json({ task }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/admin/tasks/[id] - Update a task
export async function PUT(
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

    const taskId = params.id
    const body = await request.json()
    const { title, description, points, taskType, taskUrl, isActive, isTimeLimited, duration } = body

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return createErrorResponse(
        'Not Found',
        'Task not found',
        404
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

    // Calculate expiration timestamp if time-limited
    // When editing, recalculate from current time (not from original creation time)
    let expiresAt = null
    if (isTimeLimited && duration) {
      const now = new Date()
      expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000)
    }

    // Prepare update data
    const updateData: any = {
      ...(title && { title }),
      ...(description && { description }),
      ...(points && { points }),
      ...(taskType && { taskType }),
      ...(taskUrl !== undefined && { taskUrl }),
      ...(isActive !== undefined && { isActive }),
    }

    // Handle time-limited changes
    if (isTimeLimited !== undefined) {
      if (isTimeLimited && duration) {
        // Adding or updating time limit
        updateData.duration = duration
        updateData.expiresAt = expiresAt
      } else {
        // Removing time limit
        updateData.duration = null
        updateData.expiresAt = null
      }
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    })

    // Log general audit event
    await logCrudOperation(
      request,
      'update',
      'Task',
      taskId,
      existingTask,
      updatedTask
    )

    // Log specific duration change audit event if duration was modified
    const durationChanged = 
      existingTask.duration !== updatedTask.duration ||
      existingTask.expiresAt?.getTime() !== updatedTask.expiresAt?.getTime()
    
    if (durationChanged) {
      await logCrudOperation(
        request,
        'update',
        'TaskDuration',
        taskId,
        {
          taskId: existingTask.id,
          taskTitle: existingTask.title,
          oldDuration: existingTask.duration,
          oldExpiresAt: existingTask.expiresAt,
          wasTimeLimited: existingTask.duration !== null,
        },
        {
          taskId: updatedTask.id,
          taskTitle: updatedTask.title,
          newDuration: updatedTask.duration,
          newExpiresAt: updatedTask.expiresAt,
          isTimeLimited: updatedTask.duration !== null,
          changeType: getDurationChangeType(existingTask.duration, updatedTask.duration),
        }
      )
    }

    return NextResponse.json({ 
      data: updatedTask,
      expiresAt: expiresAt 
    }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/tasks/[id] - Delete a task
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

    const taskId = params.id

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!existingTask) {
      return createErrorResponse(
        'Not Found',
        'Task not found',
        404
      )
    }

    // Delete the task (this will cascade delete completions if configured in schema)
    await prisma.task.delete({
      where: { id: taskId },
    })

    // Log audit event
    await logCrudOperation(
      request,
      'delete',
      'Task',
      taskId,
      existingTask,
      undefined
    )

    return NextResponse.json(
      { 
        success: true,
        message: 'Task deleted successfully' 
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
