import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, handleApiError } from '@/lib/utils'
import { organizeTasksForTimeLimited } from '@/lib/tasks/organizer'
import { getLocalizedTask } from '@/lib/auto-translate'
import { TaskWithCompletion } from '@/types'

/**
 * GET /api/tasks/organized
 * Fetch user's tasks organized into active, completed, and missed categories
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return createErrorResponse(
        'Unauthorized',
        'You must be logged in to view tasks',
        401
      )
    }

    const userId = session.user.id

    // Get locale from request headers or default to 'en'
    const locale =
      request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] ||
      'en'

    // Fetch all active tasks
    const tasks = await prisma.task.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Fetch user's completions with status information
    const completions = await prisma.completion.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        taskId: true,
        completedAt: true,
        missedAt: true,
        status: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    // Localize tasks
    const localizedTasks: TaskWithCompletion[] = tasks.map((task) => {
      const localizedTask = getLocalizedTask(task, locale)
      return {
        ...localizedTask,
        isCompleted: false,
        completedToday: false,
      }
    })

    // Organize tasks into categories
    const organized = organizeTasksForTimeLimited(localizedTasks, completions)

    return NextResponse.json(organized)
  } catch (error) {
    return handleApiError(error)
  }
}
