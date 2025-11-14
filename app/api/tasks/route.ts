import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, handleApiError } from "@/lib/utils";
import { getLocalizedTask } from "@/lib/auto-translate";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return createErrorResponse(
        "Unauthorized",
        "You must be logged in to view tasks",
        401
      );
    }

    const userId = session.user.id;

    // Get locale from request headers or default to 'en'
    const locale = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 'en';

    // Get today's date range (UTC)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Get user's completions for today
    const todayCompletions = await prisma.completion.findMany({
      where: {
        userId,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        taskId: true,
        completedAt: true,
      },
    });

    // Create a set of completed task IDs
    const completedTaskIds = new Set(todayCompletions.map((c) => c.taskId));
    const completionMap = new Map(
      todayCompletions.map((c) => [c.taskId, c.completedAt])
    );

    // Get all active tasks that user hasn't completed today
    const allTasks = await prisma.task.findMany({
      where: {
        isActive: true,
        id: {
          notIn: Array.from(completedTaskIds),
        },
      },
      orderBy: [
        // Priority 1: Time-limited tasks (with expiresAt) come first
        { expiresAt: { sort: 'asc', nulls: 'last' } },
        // Priority 2: Then by creation date (newest first)
        { createdAt: 'desc' },
      ],
    });

    // Limit to 5 tasks maximum
    const tasks = allTasks.slice(0, 5);

    // Enrich tasks with completion status and localize
    const tasksWithCompletion = tasks.map((task) => {
      const localizedTask = getLocalizedTask(task, locale);
      return {
        ...localizedTask,
        isCompleted: false, // These are all incomplete tasks
        completedToday: false,
        lastCompletedAt: null,
      };
    });

    return NextResponse.json(tasksWithCompletion);
  } catch (error) {
    return handleApiError(error);
  }
}
