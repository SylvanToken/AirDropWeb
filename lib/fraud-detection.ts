/**
 * Fraud Detection System
 * Calculates risk score and determines if completion needs manual review
 */

import { prisma } from './prisma';
import { queueAdminFraudAlertEmail } from './email/queue';

interface FraudCheckParams {
  userId: string;
  taskId: string;
  ipAddress?: string;
  userAgent?: string;
}

interface FraudCheckResult {
  fraudScore: number;
  needsReview: boolean;
  reasons: string[];
  autoApproveAt: Date;
}

/**
 * Calculate fraud score (0-100)
 * Higher score = more suspicious
 */
export async function calculateFraudScore(params: FraudCheckParams): Promise<FraudCheckResult> {
  const { userId, taskId, ipAddress } = params;
  let score = 0;
  const reasons: string[] = [];

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      completions: {
        orderBy: { completedAt: 'desc' },
        take: 100,
      },
    },
  });

  if (!user) {
    return {
      fraudScore: 100,
      needsReview: true,
      reasons: ['User not found'],
      autoApproveAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    };
  }

  // 1. Check account age (max 20 points)
  const accountAge = Date.now() - user.createdAt.getTime();
  const hoursOld = accountAge / (1000 * 60 * 60);
  
  if (hoursOld < 1) {
    score += 20;
    reasons.push('Very new account (< 1 hour)');
  } else if (hoursOld < 24) {
    score += 10;
    reasons.push('New account (< 24 hours)');
  } else if (hoursOld < 72) {
    score += 5;
    reasons.push('Recent account (< 3 days)');
  }

  // 2. Check wallet verification (max 15 points)
  if (!user.walletVerified) {
    score += 15;
    reasons.push('Wallet not verified');
  }

  // 3. Check social media verification (max 10 points)
  if (!user.twitterVerified && !user.telegramVerified) {
    score += 10;
    reasons.push('No social media verified');
  }

  // 4. Check completion speed (max 20 points)
  const recentCompletions = user.completions.filter(
    (c) => Date.now() - c.completedAt.getTime() < 60 * 1000 // Last minute
  );
  
  if (recentCompletions.length > 5) {
    score += 20;
    reasons.push('Too many completions in 1 minute');
  } else if (recentCompletions.length > 3) {
    score += 10;
    reasons.push('Fast completion rate');
  }

  // 5. Check daily completion count (max 15 points)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayCompletions = user.completions.filter(
    (c) => c.completedAt >= today
  );
  
  if (todayCompletions.length > 50) {
    score += 15;
    reasons.push('Excessive daily completions (> 50)');
  } else if (todayCompletions.length > 30) {
    score += 10;
    reasons.push('High daily completions (> 30)');
  }

  // 6. Check IP address patterns (max 10 points)
  if (ipAddress) {
    const sameIPCompletions = await prisma.completion.count({
      where: {
        ipAddress,
        userId: { not: userId },
        completedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (sameIPCompletions > 10) {
      score += 10;
      reasons.push('Multiple accounts from same IP');
    } else if (sameIPCompletions > 5) {
      score += 5;
      reasons.push('Shared IP detected');
    }
  }

  // 7. Check for duplicate task attempts (max 10 points)
  const duplicateAttempts = await prisma.completion.count({
    where: {
      userId,
      taskId,
    },
  });

  if (duplicateAttempts > 0) {
    score += 10;
    reasons.push('Duplicate task completion attempt');
  }

  // Determine if needs review
  // Random 20% chance OR high fraud score
  const randomCheck = Math.random() < 0.20; // 20% random review
  const highRisk = score >= 40;
  const needsReview = randomCheck || highRisk;

  if (randomCheck && !highRisk) {
    reasons.push('Random verification check');
  }

  // Calculate auto-approve time
  // Higher risk = longer wait time
  let hoursToWait = 24; // Default 24 hours
  
  if (score >= 60) {
    hoursToWait = 48; // High risk: 48 hours
  } else if (score >= 40) {
    hoursToWait = 36; // Medium risk: 36 hours
  }

  const autoApproveAt = new Date(Date.now() + hoursToWait * 60 * 60 * 1000);

  // Send fraud alert email for high-risk users (Requirements: 4.2, 4.5)
  if (score >= 60) {
    const riskLevel = score >= 90 ? 'CRITICAL' : 'HIGH';
    
    // Queue fraud alert email asynchronously (don't await to avoid blocking)
    queueAdminFraudAlertEmail(
      user.username || 'Unknown User',
      userId,
      user.email || 'no-email@example.com',
      Math.min(score, 100),
      riskLevel,
      reasons,
      'en' // Default to English for admin emails
    ).catch(err => {
      console.error('Failed to queue fraud alert email:', err);
    });
  }

  return {
    fraudScore: Math.min(score, 100), // Cap at 100
    needsReview,
    reasons,
    autoApproveAt,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Auto-approve pending completions that have passed their auto-approve time
 */
export async function autoApprovePendingCompletions(): Promise<number> {
  const now = new Date();
  
  // Find all pending completions that are ready for auto-approval
  const pendingCompletions = await prisma.completion.findMany({
    where: {
      status: 'PENDING',
      needsReview: false,
      autoApproveAt: {
        lte: now
      }
    },
    include: {
      user: true,
      task: true
    }
  });

  let approvedCount = 0;

  // Process each completion
  for (const completion of pendingCompletions) {
    try {
      await prisma.$transaction(async (tx) => {
        // Update completion status
        await tx.completion.update({
          where: { id: completion.id },
          data: {
            status: 'AUTO_APPROVED',
            verificationStatus: 'VERIFIED'
          }
        });

        // Award points if not already awarded
        if (completion.pointsAwarded === 0) {
          await tx.user.update({
            where: { id: completion.userId },
            data: {
              totalPoints: {
                increment: completion.task.points
              }
            }
          });

          // Update points awarded
          await tx.completion.update({
            where: { id: completion.id },
            data: {
              pointsAwarded: completion.task.points
            }
          });
        }
      });

      approvedCount++;
    } catch (error) {
      console.error(`Failed to auto-approve completion ${completion.id}:`, error);
    }
  }

  return approvedCount;
}

/**
 * Get fraud risk level description
 */
export function getFraudRiskLevel(score: number): {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  color: string;
  description: string;
} {
  if (score < 20) {
    return {
      level: 'LOW',
      color: 'text-green-600',
      description: 'Low risk - likely legitimate'
    };
  } else if (score < 40) {
    return {
      level: 'MEDIUM',
      color: 'text-yellow-600',
      description: 'Medium risk - monitor closely'
    };
  } else if (score < 70) {
    return {
      level: 'HIGH',
      color: 'text-orange-600',
      description: 'High risk - requires review'
    };
  } else {
    return {
      level: 'CRITICAL',
      color: 'text-red-600',
      description: 'Critical risk - likely fraudulent'
    };
  }
}
