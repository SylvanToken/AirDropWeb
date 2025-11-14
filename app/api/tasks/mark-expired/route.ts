import { NextRequest, NextResponse } from "next/server";
import { prisma, executeTransaction } from "@/lib/prisma";
import { createErrorResponse, handleApiError } from "@/lib/utils";

/**
 * Background job endpoint to mark expired tasks
 * This should be called periodically by a cron job or scheduler
 * 
 * Requirements: 2.3, 2.4, 2.5
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is an internal request (basic security)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dev-secret";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return createErrorResponse(
        "Unauthorized",
        "Invalid authorization",
        401
      );
    }

    const now = new Date();

    // Find all expired tasks that haven't been marked yet
    const expiredTasks = await prisma.task.findMany({
      where: {
        expiresAt: {
          lte: now,
        },
        isActive: true,
      },
      select: {
        id: true,
        expiresAt: true,
      },
    });

    if (expiredTasks.length === 0) {
      return NextResponse.json({
        message: "No expired tasks found",
        markedCount: 0,
      });
    }

    // Get all users who haven't completed these expired tasks
    const taskIds = expiredTasks.map(t => t.id);
    
    // Find all users who have NOT completed these tasks
    const allUsers = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    const existingCompletions = await prisma.completion.findMany({
      where: {
        taskId: {
          in: taskIds,
        },
      },
      select: {
        userId: true,
        taskId: true,
      },
    });

    // Create a set of user-task combinations that already have completions
    const completedSet = new Set(
      existingCompletions.map(c => `${c.userId}-${c.taskId}`)
    );

    // Create missed completions for users who didn't complete the tasks
    const missedCompletions: any[] = [];
    for (const user of allUsers) {
      for (const task of expiredTasks) {
        const key = `${user.id}-${task.id}`;
        if (!completedSet.has(key)) {
          missedCompletions.push({
            userId: user.id,
            taskId: task.id,
            missedAt: task.expiresAt || now,
            pointsAwarded: 0,
            status: "EXPIRED",
            verificationStatus: "UNVERIFIED",
            needsReview: false,
            fraudScore: 0,
          });
        }
      }
    }

    // Execute in transaction
    const result = await executeTransaction(async (tx) => {
      // Create missed completion records
      let createdCount = 0;
      if (missedCompletions.length > 0) {
        // SQLite doesn't support createMany with skipDuplicates, create individually
        for (const completion of missedCompletions) {
          try {
            await tx.completion.create({ data: completion });
            createdCount++;
          } catch (error) {
            // Skip if already exists (unique constraint violation)
            console.log('Skipping duplicate completion');
          }
        }
      }

      return { createdCount };
    });

    return NextResponse.json({
      message: "Expired tasks marked successfully",
      expiredTasksCount: expiredTasks.length,
      missedCompletionsCreated: result.createdCount,
      taskIds: taskIds,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
