/**
 * Referral Task Automation
 * 
 * Automatically completes referral tasks when users successfully
 * invite friends to register using their referral codes.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.4, 4.5, 4.6, 7.1, 7.2, 7.5
 */

import { prisma, executeTransaction } from './prisma';
import { findUserByReferralCode, isValidReferralCode } from './referral-code';

export interface ReferralCompletionResult {
  success: boolean;
  completionId?: string;
  pointsAwarded?: number;
  error?: string;
  message?: string;
}

/**
 * Error types for referral automation
 */
export enum ReferralErrorType {
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  REFERRER_NOT_FOUND = 'REFERRER_NOT_FOUND',
  NO_PENDING_TASKS = 'NO_PENDING_TASKS',
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  DUPLICATE_COMPLETION = 'DUPLICATE_COMPLETION',
  INVALID_REFERRAL_CODE = 'INVALID_REFERRAL_CODE',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Structured error log entry for referral automation
 * Requirement 7.2: Log all referral processing errors with context
 */
interface ReferralErrorLog {
  timestamp: Date;
  errorType: ReferralErrorType;
  referralCode?: string;
  newUserId?: string;
  referrerId?: string;
  completionId?: string;
  error: string;
  stack?: string;
  context?: Record<string, any>;
}

/**
 * Log referral automation error with full context
 * Requirement 7.2: Add error monitoring for failed referral completions
 */
function logReferralError(errorLog: ReferralErrorLog): void {
  const logEntry = {
    ...errorLog,
    timestamp: errorLog.timestamp.toISOString(),
    service: 'referral-automation',
  };

  // Log to console with structured format
  console.error('[Referral Automation Error]', JSON.stringify(logEntry, null, 2));

  // In production, this could also send to error monitoring service
  // Example: Sentry, DataDog, CloudWatch, etc.
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with error monitoring service
    // Example: Sentry.captureException(new Error(errorLog.error), { extra: logEntry });
  }
}

/**
 * Log successful referral completion for monitoring
 * Requirement 7.2: Add comprehensive logging
 */
function logReferralSuccess(data: {
  referralCode: string;
  newUserId: string;
  referrerId: string;
  completionId: string;
  pointsAwarded: number;
  processingTime?: number;
}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: 'referral_completion_success',
    service: 'referral-automation',
    ...data,
  };

  console.log('[Referral Automation Success]', JSON.stringify(logEntry, null, 2));
}

/**
 * Performance monitoring data structure
 * Requirement 8.2: Monitor database query performance
 */
interface PerformanceMetrics {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

/**
 * Log performance metrics for monitoring
 * Requirement 8.2: Ensure processing completes within 500ms target
 * Requirement 8.5: Monitor database query performance
 */
function logPerformanceMetrics(metrics: PerformanceMetrics): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: 'referral_performance_metric',
    service: 'referral-automation',
    ...metrics,
  };

  // Log with appropriate level based on duration
  if (metrics.duration > 500) {
    // Exceeds target - log as warning (Requirement 8.2)
    console.warn('[Referral Automation Performance Warning]', JSON.stringify(logEntry, null, 2));
  } else {
    console.log('[Referral Automation Performance]', JSON.stringify(logEntry, null, 2));
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to monitoring service (e.g., DataDog, CloudWatch)
    // Example: metrics.recordTiming('referral.processing', metrics.duration);
  }
}

/**
 * Create a performance timer for monitoring operations
 * Requirement 8.2: Add timing logs for referral processing
 */
function createPerformanceTimer(operation: string) {
  const startTime = Date.now();
  
  return {
    end: (success: boolean, metadata?: Record<string, any>) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      logPerformanceMetrics({
        operation,
        startTime,
        endTime,
        duration,
        success,
        metadata,
      });
      
      return duration;
    },
  };
}

/**
 * Process referral task completion for a successful registration
 * 
 * This function is called after a new user successfully registers with a referral code.
 * It finds pending referral tasks for the referrer and completes the oldest one.
 * 
 * @param referralCode - The referral code used during registration
 * @param newUserId - The ID of the newly registered user (referee)
 * @returns Result of the referral processing
 * 
 * Requirements:
 * - 3.1: Identify referrer by invitedBy field
 * - 3.2: Query for pending referral task completions
 * - 3.7: Process within same transaction context
 * - 3.8: Rollback on transaction failure
 * - 4.1: Validate referral code format
 * - 4.2: Verify referral code exists in database
 * - 4.4: Only process completions for users with valid invitedBy
 * - 4.5: Prevent duplicate completions
 * - 7.1: Registration succeeds even if referral fails
 * - 7.2: Log errors with full context
 * - 7.5: Handle database connection errors
 */
export async function processReferralCompletion(
  referralCode: string,
  newUserId: string
): Promise<ReferralCompletionResult> {
  // Start overall performance timer (Requirement 8.2)
  const overallTimer = createPerformanceTimer('referral_completion_overall');
  const startTime = Date.now();
  
  try {
    // Validate inputs (Requirement 4.1)
    if (!referralCode || !newUserId) {
      logReferralError({
        timestamp: new Date(),
        errorType: ReferralErrorType.INVALID_PARAMETERS,
        referralCode,
        newUserId,
        error: 'Missing required parameters: referralCode and newUserId',
      });
      
      overallTimer.end(false, { reason: 'invalid_parameters' });
      
      return {
        success: false,
        error: 'Invalid parameters: referralCode and newUserId are required',
      };
    }

    // Validate referral code format (Requirement 4.1)
    if (!isValidReferralCode(referralCode)) {
      logReferralError({
        timestamp: new Date(),
        errorType: ReferralErrorType.INVALID_REFERRAL_CODE,
        referralCode,
        newUserId,
        error: 'Invalid referral code format',
        context: { codeLength: referralCode.length },
      });
      
      overallTimer.end(false, { reason: 'invalid_referral_code' });
      
      return {
        success: false,
        error: 'Invalid referral code format',
      };
    }

    // Check for duplicate completion attempts (Requirement 4.5)
    const duplicateCheckTimer = createPerformanceTimer('duplicate_check');
    const existingCompletion = await checkDuplicateCompletion(newUserId);
    duplicateCheckTimer.end(true, { found: !!existingCompletion });
    
    if (existingCompletion) {
      logReferralError({
        timestamp: new Date(),
        errorType: ReferralErrorType.DUPLICATE_COMPLETION,
        referralCode,
        newUserId,
        completionId: existingCompletion.id,
        error: 'Duplicate completion attempt detected',
        context: { existingCompletionId: existingCompletion.id },
      });
      
      overallTimer.end(false, { reason: 'duplicate_completion' });
      
      return {
        success: false,
        error: 'Referral already processed for this user',
      };
    }

    // Find the referrer by referral code (Requirement 3.1, 4.2)
    const findReferrerTimer = createPerformanceTimer('find_referrer');
    const referrer = await findUserByReferralCode(referralCode);
    findReferrerTimer.end(true, { found: !!referrer });
    
    if (!referrer) {
      // Referral code doesn't exist - this is not an error, just skip processing
      console.log(`[Referral Automation] Referral code not found: ${referralCode}`);
      overallTimer.end(true, { reason: 'no_referrer' });
      return {
        success: true,
        message: 'No referrer found for code',
      };
    }

    // Prevent self-referral (edge case)
    if (referrer.id === newUserId) {
      logReferralError({
        timestamp: new Date(),
        errorType: ReferralErrorType.INVALID_PARAMETERS,
        referralCode,
        newUserId,
        referrerId: referrer.id,
        error: 'Self-referral attempt detected',
      });
      
      overallTimer.end(false, { reason: 'self_referral' });
      
      return {
        success: false,
        error: 'Cannot refer yourself',
      };
    }

    // Find pending referral task completions for the referrer (Requirement 3.2)
    const findPendingTimer = createPerformanceTimer('find_pending_completions');
    const pendingCompletions = await findPendingReferralCompletions(referrer.id);
    findPendingTimer.end(true, { count: pendingCompletions.length });
    
    if (pendingCompletions.length === 0) {
      // No pending referral tasks - this is not an error
      console.log(`[Referral Automation] No pending referral tasks for user ${referrer.id}`);
      overallTimer.end(true, { reason: 'no_pending_tasks' });
      return {
        success: true,
        message: 'No pending referral tasks',
      };
    }

    // Complete the oldest pending referral task (Requirement 3.3, 3.4, 4.3)
    const oldestCompletion = pendingCompletions[0];
    
    // Execute completion in a transaction (Requirement 3.7, 3.8)
    const completeTaskTimer = createPerformanceTimer('complete_referral_task');
    await completeReferralTask(
      oldestCompletion.id,
      oldestCompletion.task.points,
      referrer.id,
      newUserId
    );
    completeTaskTimer.end(true, { 
      completionId: oldestCompletion.id,
      points: oldestCompletion.task.points 
    });

    const processingTime = Date.now() - startTime;

    // Log successful completion
    logReferralSuccess({
      referralCode,
      newUserId,
      referrerId: referrer.id,
      completionId: oldestCompletion.id,
      pointsAwarded: oldestCompletion.task.points,
      processingTime,
    });

    // Log overall performance (Requirement 8.2)
    overallTimer.end(true, { 
      processingTime,
      completionId: oldestCompletion.id,
      pointsAwarded: oldestCompletion.task.points,
      withinTarget: processingTime <= 500,
    });

    console.log(`[Referral Automation] Processing completed in ${processingTime}ms`);

    return {
      success: true,
      completionId: oldestCompletion.id,
      pointsAwarded: oldestCompletion.task.points,
      message: 'Referral task completed successfully',
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    // Determine error type
    const errorType = determineErrorType(error);
    
    // Log error with full context for debugging (Requirement 7.2, 7.5)
    logReferralError({
      timestamp: new Date(),
      errorType,
      referralCode,
      newUserId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        processingTime,
      },
    });

    // Log performance metrics for failed operation (Requirement 8.2)
    overallTimer.end(false, { 
      processingTime,
      errorType,
      error: error instanceof Error ? error.message : String(error),
    });

    // Attempt error recovery (Requirement 7.5)
    const recoveryResult = await attemptErrorRecovery(error, referralCode, newUserId);
    if (recoveryResult.recovered) {
      console.log('[Referral Automation] Error recovered successfully');
      return recoveryResult.result!;
    }

    // Return error but don't throw - registration should succeed (Requirement 7.1)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if a referee already has a completed referral
 * Prevents duplicate completions for the same referee (Requirement 4.5)
 * 
 * @param refereeId - The new user's ID
 * @returns Existing completion if found, null otherwise
 */
async function checkDuplicateCompletion(refereeId: string) {
  const queryTimer = createPerformanceTimer('db_query_check_duplicate');
  
  try {
    // Check if this referee has already triggered a referral completion
    const existingCompletion = await prisma.completion.findFirst({
      where: {
        userAgent: `referee:${refereeId}`,
        status: 'APPROVED',
        task: {
          taskType: 'REFERRAL',
        },
      },
      select: {
        id: true,
        userId: true,
        completedAt: true,
      },
    });

    queryTimer.end(true, { 
      refereeId, 
      found: !!existingCompletion,
    });

    return existingCompletion;
  } catch (error) {
    queryTimer.end(false, { 
      refereeId,
      error: error instanceof Error ? error.message : String(error),
    });
    
    logReferralError({
      timestamp: new Date(),
      errorType: ReferralErrorType.DATABASE_ERROR,
      newUserId: refereeId,
      error: 'Failed to check for duplicate completion',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return null to allow processing to continue
    // Better to risk a duplicate than block legitimate referrals
    return null;
  }
}

/**
 * Determine the type of error that occurred
 * 
 * @param error - The error object
 * @returns ReferralErrorType
 */
function determineErrorType(error: unknown): ReferralErrorType {
  if (!(error instanceof Error)) {
    return ReferralErrorType.UNKNOWN_ERROR;
  }

  const errorMessage = error.message.toLowerCase();

  // Database connection errors
  if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
    return ReferralErrorType.DATABASE_ERROR;
  }

  // Transaction errors
  if (errorMessage.includes('transaction') || errorMessage.includes('deadlock')) {
    return ReferralErrorType.TRANSACTION_FAILED;
  }

  // Concurrent modification errors
  if (errorMessage.includes('concurrent') || errorMessage.includes('conflict')) {
    return ReferralErrorType.CONCURRENT_MODIFICATION;
  }

  return ReferralErrorType.UNKNOWN_ERROR;
}

/**
 * Attempt to recover from errors
 * Requirement 7.5: Create error recovery mechanisms
 * 
 * @param error - The error that occurred
 * @param referralCode - The referral code
 * @param newUserId - The new user's ID
 * @returns Recovery result
 */
async function attemptErrorRecovery(
  error: unknown,
  referralCode: string,
  newUserId: string
): Promise<{ recovered: boolean; result?: ReferralCompletionResult }> {
  const errorType = determineErrorType(error);

  // Only attempt recovery for specific error types
  if (errorType === ReferralErrorType.DATABASE_ERROR || 
      errorType === ReferralErrorType.TRANSACTION_FAILED) {
    
    console.log('[Referral Automation] Attempting error recovery...');
    
    // Wait a short time before retry
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Retry the operation once
      const referrer = await findUserByReferralCode(referralCode);
      
      if (!referrer) {
        return { recovered: false };
      }

      const pendingCompletions = await findPendingReferralCompletions(referrer.id);
      
      if (pendingCompletions.length === 0) {
        return {
          recovered: true,
          result: {
            success: true,
            message: 'No pending referral tasks',
          },
        };
      }

      const oldestCompletion = pendingCompletions[0];
      
      await completeReferralTask(
        oldestCompletion.id,
        oldestCompletion.task.points,
        referrer.id,
        newUserId
      );

      logReferralSuccess({
        referralCode,
        newUserId,
        referrerId: referrer.id,
        completionId: oldestCompletion.id,
        pointsAwarded: oldestCompletion.task.points,
      });

      return {
        recovered: true,
        result: {
          success: true,
          completionId: oldestCompletion.id,
          pointsAwarded: oldestCompletion.task.points,
          message: 'Referral task completed successfully (recovered)',
        },
      };
    } catch (retryError) {
      console.error('[Referral Automation] Recovery attempt failed:', retryError);
      return { recovered: false };
    }
  }

  return { recovered: false };
}

/**
 * Find pending referral task completions for a user
 * 
 * Queries the database for PENDING completions of REFERRAL type tasks
 * belonging to the specified user, ordered by completion date (oldest first).
 * 
 * @param userId - The referrer's user ID
 * @returns Array of pending referral completions with task details
 * 
 * Requirements:
 * - 3.2: Query for pending referral task completions
 * - 4.3: Handle multiple pending tasks (complete oldest first)
 * - 8.1: Execute queries with indexed fields
 * - 8.5: Limit results to prevent performance degradation
 */
async function findPendingReferralCompletions(userId: string) {
  const queryTimer = createPerformanceTimer('db_query_find_pending_completions');
  
  try {
    const completions = await prisma.completion.findMany({
      where: {
        userId: userId,
        status: 'PENDING',
        task: {
          taskType: 'REFERRAL',
          isActive: true,
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            points: true,
            taskType: true,
          },
        },
      },
      orderBy: {
        completedAt: 'asc', // Oldest first (Requirement 4.3)
      },
      take: 10, // Limit results for performance (Requirement 8.5)
    });

    queryTimer.end(true, { 
      userId, 
      resultCount: completions.length,
      usesCompositeIndex: true, // Uses userId + status + taskId composite index
    });

    return completions;
  } catch (error) {
    queryTimer.end(false, { 
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    
    logReferralError({
      timestamp: new Date(),
      errorType: ReferralErrorType.DATABASE_ERROR,
      referrerId: userId,
      error: 'Failed to find pending completions',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Complete a referral task and award points
 * 
 * Updates the completion status to APPROVED, sets points awarded,
 * increments the user's total points, and records the completion timestamp.
 * All operations are executed in a single database transaction with
 * optimistic locking to handle concurrent registrations safely.
 * 
 * @param completionId - The completion record to approve
 * @param taskPoints - Points to award
 * @param userId - The referrer's user ID
 * @param refereeId - The new user's ID (for audit trail)
 * 
 * Requirements:
 * - 3.3: Update oldest pending completion to APPROVED
 * - 3.4: Set pointsAwarded to task's point value
 * - 3.5: Increment referrer's totalPoints
 * - 3.6: Set completedAt timestamp
 * - 3.7: Process within database transaction
 * - 3.8: Rollback on failure
 * - 4.6: Log referee's user ID for audit
 * - 7.3: Handle concurrent registrations safely
 * - 7.4: Validate referral code format and existence
 * - 8.3: Handle concurrent completions safely
 * - 8.4: Use database transactions for consistency
 */
async function completeReferralTask(
  completionId: string,
  taskPoints: number,
  userId: string,
  refereeId: string
): Promise<void> {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const transactionTimer = createPerformanceTimer('db_transaction_complete_referral');
    
    try {
      // Execute all updates in a single transaction (Requirements 3.7, 3.8, 8.3, 8.4)
      await executeTransaction(async (tx) => {
        // First, verify the completion is still PENDING (optimistic locking)
        // This prevents concurrent modifications (Requirement 7.3)
        const completion = await tx.completion.findUnique({
          where: { id: completionId },
          select: { status: true, userId: true },
        });

        if (!completion) {
          throw new Error(`Completion ${completionId} not found`);
        }

        if (completion.status !== 'PENDING') {
          throw new Error(
            `Completion ${completionId} is not PENDING (current status: ${completion.status})`
          );
        }

        if (completion.userId !== userId) {
          throw new Error(
            `Completion ${completionId} does not belong to user ${userId}`
          );
        }

        // Update completion status to APPROVED (Requirement 3.3)
        // Set pointsAwarded (Requirement 3.4)
        // Set completedAt timestamp (Requirement 3.6)
        await tx.completion.update({
          where: { 
            id: completionId,
            status: 'PENDING', // Additional check for concurrent safety
          },
          data: {
            status: 'APPROVED',
            pointsAwarded: taskPoints,
            completedAt: new Date(),
            verificationStatus: 'VERIFIED',
            // Store referee ID in userAgent field for audit trail (Requirement 4.6)
            // This is a workaround since we don't have a dedicated refereeId field
            userAgent: `referee:${refereeId}`,
          },
        });

        // Increment referrer's total points (Requirement 3.5)
        await tx.user.update({
          where: { id: userId },
          data: {
            totalPoints: {
              increment: taskPoints,
            },
          },
        });
      });

      // Log successful transaction (Requirement 8.2)
      transactionTimer.end(true, {
        completionId,
        userId,
        refereeId,
        taskPoints,
        attempt: attempt + 1,
      });

      console.log(
        `[Referral Automation] Completed referral task in transaction: ` +
        `completion=${completionId}, user=${userId}, referee=${refereeId}, points=${taskPoints}`
      );
      
      return; // Success, exit function
    } catch (error) {
      attempt++;
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log failed transaction (Requirement 8.2)
      transactionTimer.end(false, {
        completionId,
        userId,
        refereeId,
        taskPoints,
        attempt,
        error: errorMessage,
      });
      
      // Check if this is a concurrent modification error
      if (errorMessage.includes('not PENDING') || errorMessage.includes('not found')) {
        logReferralError({
          timestamp: new Date(),
          errorType: ReferralErrorType.CONCURRENT_MODIFICATION,
          completionId,
          referrerId: userId,
          newUserId: refereeId,
          error: errorMessage,
          context: { attempt, maxRetries },
        });
        
        // Don't retry for these errors
        throw error;
      }

      // For other errors, retry if we haven't exceeded max attempts
      if (attempt < maxRetries) {
        console.warn(
          `[Referral Automation] Transaction failed (attempt ${attempt}/${maxRetries}), retrying...`
        );
        
        // Exponential backoff: 50ms, 100ms, 200ms
        await new Promise(resolve => setTimeout(resolve, 50 * Math.pow(2, attempt - 1)));
        continue;
      }

      // Max retries exceeded
      logReferralError({
        timestamp: new Date(),
        errorType: ReferralErrorType.TRANSACTION_FAILED,
        completionId,
        referrerId: userId,
        newUserId: refereeId,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        context: { attempt, maxRetries },
      });
      
      throw error;
    }
  }
}

/**
 * Get referral completion statistics for a user
 * 
 * Returns information about completed and pending referral tasks.
 * Useful for admin monitoring and user dashboards.
 * 
 * @param userId - The user ID to get stats for
 * @returns Referral completion statistics
 */
export async function getReferralCompletionStats(userId: string) {
  try {
    const [completedCount, pendingCount, totalPointsEarned] = await Promise.all([
      // Count completed referral tasks
      prisma.completion.count({
        where: {
          userId,
          status: 'APPROVED',
          task: {
            taskType: 'REFERRAL',
          },
        },
      }),
      
      // Count pending referral tasks
      prisma.completion.count({
        where: {
          userId,
          status: 'PENDING',
          task: {
            taskType: 'REFERRAL',
          },
        },
      }),
      
      // Sum total points earned from referrals
      prisma.completion.aggregate({
        where: {
          userId,
          status: 'APPROVED',
          task: {
            taskType: 'REFERRAL',
          },
        },
        _sum: {
          pointsAwarded: true,
        },
      }),
    ]);

    return {
      completedCount,
      pendingCount,
      totalPointsEarned: totalPointsEarned._sum.pointsAwarded || 0,
    };
  } catch (error) {
    console.error('[Referral Automation] Error getting referral stats:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Export all functions
export const ReferralAutomation = {
  processCompletion: processReferralCompletion,
  getStats: getReferralCompletionStats,
};

export default ReferralAutomation;
