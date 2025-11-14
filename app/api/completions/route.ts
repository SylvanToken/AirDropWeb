import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, executeTransaction } from "@/lib/prisma";
import { completionSchema } from "@/lib/validations";
import { validateRequest, createErrorResponse, handleApiError } from "@/lib/utils";
import { rateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { calculateFraudScore, getClientIP, getUserAgent } from "@/lib/fraud-detection";
import { queueTaskCompletionEmail, queueAdminReviewNeededEmail } from "@/lib/email/queue";
import { reportApiError } from "@/lib/error-monitoring";
import { canCompleteTask, isTaskExpired } from "@/lib/tasks/expiration";
import { verifyCompletion } from "@/lib/twitter/verification-service";
import { hasActiveConnection } from "@/lib/twitter/token-manager";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return createErrorResponse(
        "Unauthorized",
        "You must be logged in to complete tasks",
        401
      );
    }

    const userId = session.user.id;

    // Check if user has verified wallet address and is active
    const user: any = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return createErrorResponse(
        "Not Found",
        "User not found",
        404
      );
    }

    // Check if user is blocked or deleted
    if (user.status === "BLOCKED") {
      return createErrorResponse(
        "Forbidden",
        "Your account has been blocked. Please contact support.",
        403
      );
    }

    if (user.status === "DELETED") {
      return createErrorResponse(
        "Forbidden",
        "This account no longer exists",
        403
      );
    }

    if (!user?.walletVerified || !user.walletAddress) {
      return createErrorResponse(
        "Wallet Required",
        "You must add and verify your BEP-20 wallet address before completing tasks. Please go to the Wallet page to add your address.",
        403
      );
    }

    // Apply rate limiting
    const identifier = `${getClientIdentifier(request)}-${userId}`;
    const rateLimitResult = rateLimit(identifier, RATE_LIMITS.COMPLETION);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Too many completion attempts. Please slow down.",
          resetTime: rateLimitResult.resetTime,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Validate request body
    const validation = await validateRequest(request, completionSchema);
    
    if (!validation.success) {
      return validation.error;
    }

    // Sanitize input
    const taskId = sanitizeString(validation.data.taskId);

    // Verify task exists and is active
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return createErrorResponse(
        "Not Found",
        "Task not found",
        404
      );
    }

    if (!task.isActive) {
      return createErrorResponse(
        "Bad Request",
        "This task is no longer active",
        400
      );
    }

    // Check if task has expired (Requirements: 2.4, 2.5)
    const expirationCheck = canCompleteTask(task.expiresAt);
    if (!expirationCheck.canComplete) {
      // Log expiration attempt for monitoring
      console.warn(`User ${userId} attempted to complete expired task ${taskId}`, {
        userId,
        taskId,
        expiresAt: task.expiresAt,
        attemptedAt: new Date().toISOString(),
      });

      return createErrorResponse(
        "Task Expired",
        expirationCheck.reason || "This task has expired and can no longer be completed",
        400
      );
    }

    // Special handling for REFERRAL tasks (Requirements: 2.1, 2.2, 2.3, 2.4)
    if (task.taskType === 'REFERRAL') {
      // Check if user already has a pending or approved referral task completion
      const existingReferralCompletion = await prisma.completion.findFirst({
        where: {
          userId,
          taskId,
          status: {
            in: ['PENDING', 'APPROVED'],
          },
        },
      });

      if (existingReferralCompletion) {
        if (existingReferralCompletion.status === 'PENDING') {
          return createErrorResponse(
            "Conflict",
            "You already have a pending referral task. Share your referral code with friends to complete it.",
            409
          );
        } else {
          return createErrorResponse(
            "Conflict",
            "You have already completed this referral task",
            409
          );
        }
      }

      // Create PENDING completion for referral task
      // Points will be awarded when a friend registers with the user's referral code
      const referralCompletion = await prisma.completion.create({
        data: {
          userId: userId,
          taskId: taskId,
          pointsAwarded: 0, // Will be updated when referral completes
          completedAt: new Date(),
          status: 'PENDING',
          verificationStatus: 'UNVERIFIED',
          needsReview: false,
          fraudScore: 0,
        },
      });

      // Get user's referral code
      const referralCode = user.referralCode || '';

      return NextResponse.json({
        message: "Referral task claimed successfully",
        statusMessage: "Share your referral code with friends. When they register, you'll automatically receive your points!",
        completion: {
          id: referralCompletion.id,
          status: referralCompletion.status,
          needsReview: false,
          fraudScore: 0,
        },
        pointsAwarded: 0,
        pendingPoints: task.points,
        totalPoints: user.totalPoints,
        referralCode: referralCode,
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}/register?ref=${referralCode}`,
      });
    }

    // Special handling for TWITTER tasks (Requirements: 8.1, 8.2, 8.3, 8.4)
    const isTwitterTask = ['TWITTER_FOLLOW', 'TWITTER_LIKE', 'TWITTER_RETWEET'].includes(task.taskType);
    
    if (isTwitterTask) {
      // Check if user has Twitter connected
      const hasTwitter = await hasActiveConnection(userId);
      
      if (!hasTwitter) {
        return createErrorResponse(
          "Twitter Not Connected",
          "You must connect your Twitter account before completing Twitter tasks. Please go to your Profile page to connect.",
          403
        );
      }
    }

    // Check if user has already completed this task today
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingCompletion = await prisma.completion.findFirst({
      where: {
        userId,
        taskId,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingCompletion) {
      return createErrorResponse(
        "Conflict",
        "You have already completed this task today",
        409
      );
    }

    // Get client info for fraud detection
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    // Calculate fraud score
    const fraudCheck = await calculateFraudScore({
      userId,
      taskId,
      ipAddress,
      userAgent,
    });

    // Determine initial status
    // High risk (score >= 60) = needs review immediately
    // Medium risk (40-59) = auto-approved with monitoring
    // Low risk (< 40) = auto-approved immediately
    const initialStatus = fraudCheck.fraudScore >= 60 ? 'PENDING' : 'AUTO_APPROVED';
    const verificationStatus = fraudCheck.fraudScore >= 60 ? 'FLAGGED' : 'VERIFIED';

    // Create completion and update user points in an optimized transaction
    const result = await executeTransaction(async (tx) => {
      // Create completion record with verification data
      const completion = await tx.completion.create({
        data: {
          userId: userId,
          taskId: taskId,
          pointsAwarded: task.points,
          completedAt: new Date(),
          status: initialStatus,
          verificationStatus: verificationStatus,
          needsReview: fraudCheck.needsReview,
          fraudScore: fraudCheck.fraudScore,
          autoApproveAt: fraudCheck.autoApproveAt,
          ipAddress: ipAddress,
          userAgent: userAgent,
        },
      });

      // Add points immediately for auto-approved completions
      const pointsToAdd = initialStatus === 'AUTO_APPROVED' ? task.points : 0;
      
      // Update user's points and last active timestamp
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: {
            increment: pointsToAdd,
          },
          lastActive: new Date(),
        },
      });

      return { completion, updatedUser };
    });

    // Trigger automatic Twitter verification if applicable (Requirements: 8.1, 8.2, 8.3)
    if (isTwitterTask) {
      try {
        // Verify asynchronously (don't wait for result)
        verifyCompletion(result.completion.id).then(verificationResult => {
          console.log('[Completion API] Twitter verification completed:', {
            completionId: result.completion.id,
            result: verificationResult.result,
            verificationTime: verificationResult.verificationTime,
          });
        }).catch(verificationError => {
          console.error('[Completion API] Twitter verification failed:', {
            completionId: result.completion.id,
            error: verificationError instanceof Error ? verificationError.message : String(verificationError),
          });
        });
      } catch (error) {
        // Don't fail completion if verification trigger fails
        console.error('[Completion API] Failed to trigger Twitter verification:', {
          completionId: result.completion.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Prepare response message based on fraud score
    let message = "Task completed successfully";
    let statusMessage = "";

    if (fraudCheck.needsReview) {
      statusMessage = "Your submission is under review. Points will be awarded after verification.";
    } else {
      statusMessage = "Congratulations! Your points have been awarded.";
    }

    // Queue task completion email
    // Check user email preferences before sending (Requirements: 2.5, 7.2)
    try {
      // Check if user has opted out of task completion emails
      let shouldSendEmail = true;
      
      // Check if EmailPreference model exists (will be added in task 14)
      if ('emailPreference' in prisma) {
        const emailPrefs = await (prisma as any).emailPreference.findUnique({
          where: { userId },
        });
        
        // If preferences exist and task completions are disabled, don't send
        if (emailPrefs && emailPrefs.taskCompletions === false) {
          shouldSendEmail = false;
        }
      }
      
      // Send email if user hasn't opted out (Requirements: 2.1, 2.2, 2.3, 2.4)
      if (shouldSendEmail && user.email) {
        await queueTaskCompletionEmail(
          userId,
          user.email,
          user.username || user.name || 'User',
          task.title,
          task.points,
          result.updatedUser.totalPoints,
          user.language || 'en'
        );
      }
    } catch (emailError) {
      // Log error but don't fail the completion
      console.error('Failed to queue task completion email:', emailError);
    }

    // Send admin notification if manual review is needed (Requirements: 4.1, 4.5)
    if (fraudCheck.needsReview) {
      try {
        await queueAdminReviewNeededEmail(
          user.name || user.username || 'Unknown User',
          userId,
          task.title,
          result.completion.id,
          result.completion.completedAt.toISOString(),
          'en' // Default to English for admin emails
        );
      } catch (emailError) {
        // Log error but don't fail the completion
        console.error('Failed to queue admin review needed email:', emailError);
      }
    }

    // Calculate points awarded
    const pointsAwarded = result.completion.status === 'AUTO_APPROVED' ? task.points : 0;
    const pendingPoints = result.completion.status === 'PENDING' ? task.points : 0;

    return NextResponse.json({
      message,
      statusMessage,
      completion: {
        id: result.completion.id,
        status: result.completion.status,
        needsReview: result.completion.needsReview,
        fraudScore: result.completion.fraudScore,
        autoApproveAt: result.completion.autoApproveAt,
      },
      pointsAwarded: pointsAwarded,
      pendingPoints: pendingPoints,
      totalPoints: result.updatedUser.totalPoints,
    });
  } catch (error) {
    // Report error to monitoring system (Requirements: 4.4)
    if (error instanceof Error) {
      await reportApiError(error, '/api/completions', 'HIGH');
    }
    
    return handleApiError(error);
  }
}
