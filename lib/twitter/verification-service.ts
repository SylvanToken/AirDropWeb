/**
 * Twitter Verification Service
 * 
 * Orchestrates Twitter task verification by coordinating API client,
 * token management, and database operations.
 * 
 * Requirements: 2.5, 3.5, 4.5, 9.1, 9.2, 11.1, 11.2
 */

import { prisma } from '@/lib/prisma';
import { getValidAccessToken } from './oauth-manager';
import {
  checkFollowing,
  checkLiked,
  checkRetweeted,
  lookupUser,
  extractTweetId,
  extractUsername,
  TwitterAPIError,
  TwitterAPIErrorType,
} from './api-client';

/**
 * Verification result types
 */
export type VerificationResultType = 'APPROVED' | 'REJECTED' | 'ERROR';

/**
 * Verification result interface
 */
export interface VerificationResult {
  verified: boolean;
  result: VerificationResultType;
  reason?: string;
  apiResponse?: any;
  verificationTime: number;
  apiCallCount: number;
  cacheHit: boolean;
}

/**
 * Performance timer utility
 * Requirement 9.1: Track verification time
 */
function createTimer() {
  const start = Date.now();
  return {
    end: () => Date.now() - start,
  };
}

/**
 * Simple in-memory cache for verification results
 * Requirement 9.4: Cache responses for 60 seconds
 */
const verificationCache = new Map<string, {
  result: VerificationResult;
  timestamp: number;
}>();

const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * Get cached verification result
 */
function getCachedResult(cacheKey: string): VerificationResult | null {
  const cached = verificationCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    verificationCache.delete(cacheKey);
    return null;
  }
  
  return {
    ...cached.result,
    cacheHit: true,
  };
}

/**
 * Set cache for verification result
 */
function setCachedResult(cacheKey: string, result: VerificationResult): void {
  verificationCache.set(cacheKey, {
    result,
    timestamp: Date.now(),
  });
}

/**
 * Clean up expired cache entries
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verificationCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      verificationCache.delete(key);
    }
  }
}, 60 * 1000); // Run every minute

/**
 * Verify follow task
 * Requirement 2.1, 2.2, 2.3, 2.4: Verify user follows target
 */
export async function verifyFollow(
  userId: string,
  targetUsername: string
): Promise<VerificationResult> {
  const timer = createTimer();
  let apiCallCount = 0;
  
  // Check cache
  const cacheKey = `follow:${userId}:${targetUsername}`;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    console.log('[Verification Service] Cache hit for follow verification');
    return cached;
  }
  
  try {
    // Get valid access token
    const accessToken = await getValidAccessToken(userId);
    apiCallCount++;
    
    // Get user's Twitter ID
    const userTokens = await prisma.twitterConnection.findUnique({
      where: { userId },
      select: { twitterId: true },
    });
    
    if (!userTokens) {
      return {
        verified: false,
        result: 'ERROR',
        reason: 'Twitter connection not found',
        verificationTime: timer.end(),
        apiCallCount,
        cacheHit: false,
      };
    }
    
    // Extract username from URL or handle
    const cleanUsername = extractUsername(targetUsername);
    if (!cleanUsername) {
      return {
        verified: false,
        result: 'ERROR',
        reason: 'Invalid Twitter username format',
        verificationTime: timer.end(),
        apiCallCount,
        cacheHit: false,
      };
    }
    
    // Lookup target user to get their ID
    const targetUser = await lookupUser(accessToken, cleanUsername);
    apiCallCount++;
    
    // Check if user follows target
    const isFollowing = await checkFollowing(
      accessToken,
      userTokens.twitterId,
      targetUser.id
    );
    apiCallCount++;
    
    const result: VerificationResult = {
      verified: isFollowing,
      result: isFollowing ? 'APPROVED' : 'REJECTED',
      reason: isFollowing 
        ? `User follows @${targetUser.username}`
        : `User does not follow @${targetUser.username}`,
      verificationTime: timer.end(),
      apiCallCount,
      cacheHit: false,
    };
    
    // Cache the result
    setCachedResult(cacheKey, result);
    
    return result;
  } catch (error) {
    const verificationTime = timer.end();
    
    console.error('[Verification Service] Follow verification failed:', {
      userId,
      targetUsername,
      error: error instanceof Error ? error.message : String(error),
      verificationTime,
    });
    
    return {
      verified: false,
      result: 'ERROR',
      reason: error instanceof TwitterAPIError 
        ? error.message 
        : 'Verification failed due to an error',
      verificationTime,
      apiCallCount,
      cacheHit: false,
    };
  }
}

/**
 * Verify like task
 * Requirement 3.1, 3.2, 3.3, 3.4: Verify user liked tweet
 */
export async function verifyLike(
  userId: string,
  tweetUrl: string
): Promise<VerificationResult> {
  const timer = createTimer();
  let apiCallCount = 0;
  
  // Check cache
  const cacheKey = `like:${userId}:${tweetUrl}`;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    console.log('[Verification Service] Cache hit for like verification');
    return cached;
  }
  
  try {
    // Extract tweet ID from URL
    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) {
      return {
        verified: false,
        result: 'ERROR',
        reason: 'Invalid tweet URL format',
        verificationTime: timer.end(),
        apiCallCount,
        cacheHit: false,
      };
    }
    
    // Get valid access token
    const accessToken = await getValidAccessToken(userId);
    apiCallCount++;
    
    // Get user's Twitter ID
    const userTokens = await prisma.twitterConnection.findUnique({
      where: { userId },
      select: { twitterId: true },
    });
    
    if (!userTokens) {
      return {
        verified: false,
        result: 'ERROR',
        reason: 'Twitter connection not found',
        verificationTime: timer.end(),
        apiCallCount,
        cacheHit: false,
      };
    }
    
    // Check if user liked the tweet
    const hasLiked = await checkLiked(
      accessToken,
      userTokens.twitterId,
      tweetId
    );
    apiCallCount++;
    
    const result: VerificationResult = {
      verified: hasLiked,
      result: hasLiked ? 'APPROVED' : 'REJECTED',
      reason: hasLiked 
        ? 'User has liked the tweet'
        : 'User has not liked the tweet',
      verificationTime: timer.end(),
      apiCallCount,
      cacheHit: false,
    };
    
    // Cache the result
    setCachedResult(cacheKey, result);
    
    return result;
  } catch (error) {
    const verificationTime = timer.end();
    
    console.error('[Verification Service] Like verification failed:', {
      userId,
      tweetUrl,
      error: error instanceof Error ? error.message : String(error),
      verificationTime,
    });
    
    return {
      verified: false,
      result: 'ERROR',
      reason: error instanceof TwitterAPIError 
        ? error.message 
        : 'Verification failed due to an error',
      verificationTime,
      apiCallCount,
      cacheHit: false,
    };
  }
}

/**
 * Verify retweet task
 * Requirement 4.1, 4.2, 4.3, 4.4, 4.5: Verify user retweeted tweet
 */
export async function verifyRetweet(
  userId: string,
  tweetUrl: string
): Promise<VerificationResult> {
  const timer = createTimer();
  let apiCallCount = 0;
  
  // Check cache
  const cacheKey = `retweet:${userId}:${tweetUrl}`;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    console.log('[Verification Service] Cache hit for retweet verification');
    return cached;
  }
  
  try {
    // Extract tweet ID from URL
    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) {
      return {
        verified: false,
        result: 'ERROR',
        reason: 'Invalid tweet URL format',
        verificationTime: timer.end(),
        apiCallCount,
        cacheHit: false,
      };
    }
    
    // Get valid access token
    const accessToken = await getValidAccessToken(userId);
    apiCallCount++;
    
    // Get user's Twitter ID
    const userTokens = await prisma.twitterConnection.findUnique({
      where: { userId },
      select: { twitterId: true },
    });
    
    if (!userTokens) {
      return {
        verified: false,
        result: 'ERROR',
        reason: 'Twitter connection not found',
        verificationTime: timer.end(),
        apiCallCount,
        cacheHit: false,
      };
    }
    
    // Check if user retweeted the tweet
    const hasRetweeted = await checkRetweeted(
      accessToken,
      userTokens.twitterId,
      tweetId
    );
    apiCallCount++;
    
    const result: VerificationResult = {
      verified: hasRetweeted,
      result: hasRetweeted ? 'APPROVED' : 'REJECTED',
      reason: hasRetweeted 
        ? 'User has retweeted the tweet'
        : 'User has not retweeted the tweet',
      verificationTime: timer.end(),
      apiCallCount,
      cacheHit: false,
    };
    
    // Cache the result
    setCachedResult(cacheKey, result);
    
    return result;
  } catch (error) {
    const verificationTime = timer.end();
    
    console.error('[Verification Service] Retweet verification failed:', {
      userId,
      tweetUrl,
      error: error instanceof Error ? error.message : String(error),
      verificationTime,
    });
    
    return {
      verified: false,
      result: 'ERROR',
      reason: error instanceof TwitterAPIError 
        ? error.message 
        : 'Verification failed due to an error',
      verificationTime,
      apiCallCount,
      cacheHit: false,
    };
  }
}

/**
 * Verify completion (orchestrator)
 * Routes to appropriate verification method based on task type
 * Requirement: All verification requirements
 */
export async function verifyCompletion(
  completionId: string
): Promise<VerificationResult> {
  const timer = createTimer();
  
  try {
    // Load completion with task details
    const completion = await prisma.completion.findUnique({
      where: { id: completionId },
      include: {
        task: {
          select: {
            id: true,
            taskType: true,
            taskUrl: true,
            title: true,
            points: true,
          },
        },
        user: {
          select: {
            id: true,
            twitterConnection: {
              select: {
                id: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
    
    if (!completion) {
      return {
        verified: false,
        result: 'ERROR',
        reason: 'Completion not found',
        verificationTime: timer.end(),
        apiCallCount: 0,
        cacheHit: false,
      };
    }
    
    // Check if user has Twitter connected
    if (!completion.user.twitterConnection?.isActive) {
      return {
        verified: false,
        result: 'ERROR',
        reason: 'Twitter account not connected',
        verificationTime: timer.end(),
        apiCallCount: 0,
        cacheHit: false,
      };
    }
    
    // Route to appropriate verification method
    let result: VerificationResult;
    
    switch (completion.task.taskType) {
      case 'TWITTER_FOLLOW':
        if (!completion.task.taskUrl) {
          return {
            verified: false,
            result: 'ERROR',
            reason: 'Task URL not configured',
            verificationTime: timer.end(),
            apiCallCount: 0,
            cacheHit: false,
          };
        }
        result = await verifyFollow(completion.userId, completion.task.taskUrl);
        break;
        
      case 'TWITTER_LIKE':
        if (!completion.task.taskUrl) {
          return {
            verified: false,
            result: 'ERROR',
            reason: 'Task URL not configured',
            verificationTime: timer.end(),
            apiCallCount: 0,
            cacheHit: false,
          };
        }
        result = await verifyLike(completion.userId, completion.task.taskUrl);
        break;
        
      case 'TWITTER_RETWEET':
        if (!completion.task.taskUrl) {
          return {
            verified: false,
            result: 'ERROR',
            reason: 'Task URL not configured',
            verificationTime: timer.end(),
            apiCallCount: 0,
            cacheHit: false,
          };
        }
        result = await verifyRetweet(completion.userId, completion.task.taskUrl);
        break;
        
      default:
        return {
          verified: false,
          result: 'ERROR',
          reason: `Task type ${completion.task.taskType} is not a Twitter task`,
          verificationTime: timer.end(),
          apiCallCount: 0,
          cacheHit: false,
        };
    }
    
    // Update completion status based on result
    await updateCompletionStatus(
      completionId,
      completion.userId,
      completion.taskId,
      completion.task.taskType,
      completion.task.points,
      result
    );
    
    // Log verification
    await logVerification(
      completionId,
      completion.userId,
      completion.taskId,
      completion.task.taskType,
      result
    );
    
    return result;
  } catch (error) {
    const verificationTime = timer.end();
    
    console.error('[Verification Service] Completion verification failed:', {
      completionId,
      error: error instanceof Error ? error.message : String(error),
      verificationTime,
    });
    
    return {
      verified: false,
      result: 'ERROR',
      reason: 'Verification failed due to an error',
      verificationTime,
      apiCallCount: 0,
      cacheHit: false,
    };
  }
}

/**
 * Update completion status based on verification result
 */
async function updateCompletionStatus(
  completionId: string,
  userId: string,
  taskId: string,
  taskType: string,
  taskPoints: number,
  result: VerificationResult
): Promise<void> {
  try {
    if (result.result === 'APPROVED') {
      // Approve completion and award points
      await prisma.$transaction([
        prisma.completion.update({
          where: { id: completionId },
          data: {
            status: 'APPROVED',
            verificationStatus: 'VERIFIED',
            pointsAwarded: taskPoints,
            reviewedAt: new Date(),
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            totalPoints: {
              increment: taskPoints,
            },
          },
        }),
      ]);
      
      console.log('[Verification Service] Completion approved:', {
        completionId,
        userId,
        taskId,
        pointsAwarded: taskPoints,
      });
    } else if (result.result === 'REJECTED') {
      // Reject completion
      await prisma.completion.update({
        where: { id: completionId },
        data: {
          status: 'REJECTED',
          verificationStatus: 'VERIFIED',
          rejectionReason: result.reason,
          reviewedAt: new Date(),
        },
      });
      
      console.log('[Verification Service] Completion rejected:', {
        completionId,
        userId,
        taskId,
        reason: result.reason,
      });
    } else {
      // Error - mark as pending for manual review
      await prisma.completion.update({
        where: { id: completionId },
        data: {
          status: 'PENDING',
          needsReview: true,
          rejectionReason: result.reason,
        },
      });
      
      console.log('[Verification Service] Completion marked for review:', {
        completionId,
        userId,
        taskId,
        reason: result.reason,
      });
    }
  } catch (error) {
    console.error('[Verification Service] Failed to update completion status:', {
      completionId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Log verification attempt
 * Requirement 11.1, 11.2: Audit logging
 */
async function logVerification(
  completionId: string,
  userId: string,
  taskId: string,
  taskType: string,
  result: VerificationResult
): Promise<void> {
  try {
    await prisma.twitterVerificationLog.create({
      data: {
        completionId,
        userId,
        taskId,
        taskType,
        verificationResult: result.result,
        twitterApiResponse: result.apiResponse 
          ? JSON.stringify(result.apiResponse) 
          : null,
        errorMessage: result.result === 'ERROR' ? result.reason : null,
        rejectionReason: result.result === 'REJECTED' ? result.reason : null,
        verificationTime: result.verificationTime,
        apiCallCount: result.apiCallCount,
        cacheHit: result.cacheHit,
      },
    });
  } catch (error) {
    // Don't throw - logging failure shouldn't break verification
    console.error('[Verification Service] Failed to log verification:', {
      completionId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
