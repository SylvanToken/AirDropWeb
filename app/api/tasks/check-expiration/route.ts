import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, handleApiError } from "@/lib/utils";
import { isTaskExpired } from "@/lib/tasks/expiration";
import { z } from "zod";

const checkExpirationSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return createErrorResponse(
        "Unauthorized",
        "You must be logged in to check task expiration",
        401
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = checkExpirationSchema.safeParse(body);

    if (!validation.success) {
      return createErrorResponse(
        "Validation Error",
        validation.error.errors[0].message,
        400
      );
    }

    const { taskId } = validation.data;

    // Fetch task from database
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        expiresAt: true,
        duration: true,
        isActive: true,
      },
    });

    if (!task) {
      return createErrorResponse(
        "Not Found",
        "Task not found",
        404
      );
    }

    // Check if task has expired
    const expired = isTaskExpired(task.expiresAt);

    return NextResponse.json({
      taskId: task.id,
      isExpired: expired,
      expiresAt: task.expiresAt,
      duration: task.duration,
      isActive: task.isActive,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
