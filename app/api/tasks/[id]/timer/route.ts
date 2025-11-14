import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { timerStartSchema, timerUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/tasks/[id]/timer
 * Fetch timer state for a task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const taskId = params.id;

    // Get task with timer fields
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        scheduledDeadline: true,
        estimatedDuration: true,
        isTimeSensitive: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Get user's completion for this task if exists
    const completion = await prisma.completion.findFirst({
      where: {
        userId: session.user.id,
        taskId: taskId,
      },
      select: {
        scheduledFor: true,
        actualDeadline: true,
        isExpired: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    return NextResponse.json({
      task: {
        id: task.id,
        scheduledDeadline: task.scheduledDeadline,
        estimatedDuration: task.estimatedDuration,
        isTimeSensitive: task.isTimeSensitive,
      },
      completion: completion || null,
    });
  } catch (error) {
    console.error('Error fetching timer state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timer state' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks/[id]/timer
 * Start a timer for a task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const taskId = params.id;
    const body = await request.json();

    // Validate input using Zod schema
    try {
      const validatedData = timerStartSchema.parse({
        taskId,
        userId: session.user.id,
        duration: body.duration,
      });
      
      const { duration } = validatedData;
      const scheduledFor = body.scheduledFor;

      // Check if task exists
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      if (!task.isActive) {
        return NextResponse.json(
          { error: 'Cannot start timer for inactive task' },
          { status: 400 }
        );
      }

      // Check if user already has an active timer for this task
      const existingCompletion = await prisma.completion.findFirst({
        where: {
          userId: session.user.id,
          taskId: taskId,
          isExpired: false,
        },
      });

      if (existingCompletion) {
        return NextResponse.json(
          { error: 'Timer already exists for this task' },
          { status: 409 }
        );
      }

      // Calculate deadline
      const now = new Date();
      const deadline = new Date(now.getTime() + duration * 1000);

      // Update task with timer info
      await prisma.task.update({
        where: { id: taskId },
        data: {
          scheduledDeadline: deadline,
          estimatedDuration: duration,
          isTimeSensitive: true,
        },
      });

      return NextResponse.json({
        success: true,
        timer: {
          taskId,
          deadline: deadline.toISOString(),
          duration,
          scheduledFor: scheduledFor || now.toISOString(),
        },
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error starting timer:', error);
    return NextResponse.json(
      { error: 'Failed to start timer', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/[id]/timer
 * Update timer state
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const taskId = params.id;
    const body = await request.json();

    // Validate input using Zod schema
    try {
      const validatedData = timerUpdateSchema.parse(body);
      const { status, remainingTime, deadline } = validatedData;

      // Check if task exists
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      // Update task deadline if provided
      if (deadline) {
        const deadlineDate = new Date(deadline);
        
        // Validate deadline is in the future for active timers
        if (status === 'active' && deadlineDate <= new Date()) {
          return NextResponse.json(
            { error: 'Deadline must be in the future for active timers' },
            { status: 400 }
          );
        }

        await prisma.task.update({
          where: { id: taskId },
          data: {
            scheduledDeadline: deadlineDate,
          },
        });
      }

      // If status is expired, mark any pending completions as expired
      if (status === 'expired') {
        await prisma.completion.updateMany({
          where: {
            userId: session.user.id,
            taskId: taskId,
            isExpired: false,
          },
          data: {
            isExpired: true,
          },
        });
      }

      return NextResponse.json({
        success: true,
        timer: {
          taskId,
          status,
          remainingTime,
          deadline,
        },
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error updating timer:', error);
    return NextResponse.json(
      { error: 'Failed to update timer', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]/timer
 * Cancel a timer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const taskId = params.id;

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Clear timer fields
    await prisma.task.update({
      where: { id: taskId },
      data: {
        scheduledDeadline: null,
        estimatedDuration: null,
        isTimeSensitive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Timer cancelled',
    });
  } catch (error) {
    console.error('Error cancelling timer:', error);
    return NextResponse.json(
      { error: 'Failed to cancel timer' },
      { status: 500 }
    );
  }
}
