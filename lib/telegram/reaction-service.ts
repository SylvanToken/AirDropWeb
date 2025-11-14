/**
 * Telegram Reaction Service
 * 
 * Handles Telegram reaction processing, point awards, and manipulation detection
 */

import { prisma } from '@/lib/prisma';

const REACTION_POINTS = 20;
const MANIPULATION_THRESHOLD = 3;
const COOLDOWN_HOURS = 1;

interface ReactionEvent {
  userId: string;
  telegramUserId: string;
  postId: string;
  chatId: string;
  reactionEmoji: string;
  action: 'added' | 'removed';
}

/**
 * Process a reaction event from Telegram
 */
export async function processReaction(event: ReactionEvent) {
  console.log('[Reaction Service] Processing reaction:', event);

  // Find user by Telegram user ID or referral code
  const user = await findUserByTelegramId(event.telegramUserId);
  
  if (!user) {
    console.log('[Reaction Service] User not found:', event.telegramUserId);
    return { success: false, reason: 'user_not_found' };
  }

  // Check for manipulation
  const isManipulation = await detectManipulation(user.id, event.postId);
  
  if (isManipulation) {
    console.log('[Reaction Service] Manipulation detected:', user.id);
    await createNotification(user.id, 'manipulation_warning', 0);
    return { success: false, reason: 'manipulation_detected' };
  }

  // Check cooldown
  const inCooldown = await checkCooldown(user.id, event.postId);
  
  if (inCooldown) {
    console.log('[Reaction Service] Cooldown active:', user.id);
    return { success: false, reason: 'cooldown_active' };
  }

  if (event.action === 'added') {
    return await processReactionAdded(user.id, event);
  } else {
    return await processReactionRemoved(user.id, event);
  }
}

/**
 * Process reaction added
 */
async function processReactionAdded(userId: string, event: ReactionEvent) {
  try {
    // Check if reaction already exists
    const existing = await prisma.telegramReaction.findUnique({
      where: {
        userId_postId_reactionEmoji: {
          userId,
          postId: event.postId,
          reactionEmoji: event.reactionEmoji,
        },
      },
    });

    if (existing && existing.isActive) {
      return { success: false, reason: 'already_exists' };
    }

    // Create or reactivate reaction
    const reaction = existing
      ? await prisma.telegramReaction.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            removedAt: null,
            lastVerifiedAt: new Date(),
          },
        })
      : await prisma.telegramReaction.create({
          data: {
            userId,
            telegramUserId: event.telegramUserId,
            postId: event.postId,
            chatId: event.chatId,
            reactionEmoji: event.reactionEmoji,
            pointsAwarded: REACTION_POINTS,
            isActive: true,
            lastVerifiedAt: new Date(),
          },
        });

    // Award points
    await awardPoints(userId, REACTION_POINTS, reaction.id, 'reaction_added');

    // Create notification
    await createNotification(userId, 'points_awarded', REACTION_POINTS);

    console.log('[Reaction Service] Reaction added:', reaction.id);
    
    return { success: true, reactionId: reaction.id, points: REACTION_POINTS };
  } catch (error) {
    console.error('[Reaction Service] Error adding reaction:', error);
    throw error;
  }
}

/**
 * Process reaction removed
 */
async function processReactionRemoved(userId: string, event: ReactionEvent) {
  try {
    const reaction = await prisma.telegramReaction.findUnique({
      where: {
        userId_postId_reactionEmoji: {
          userId,
          postId: event.postId,
          reactionEmoji: event.reactionEmoji,
        },
      },
    });

    if (!reaction || !reaction.isActive) {
      return { success: false, reason: 'not_found' };
    }

    // Deactivate reaction
    await prisma.telegramReaction.update({
      where: { id: reaction.id },
      data: {
        isActive: false,
        removedAt: new Date(),
      },
    });

    // Deduct points
    await deductPoints(userId, REACTION_POINTS, reaction.id, 'reaction_removed');

    // Create notification
    await createNotification(userId, 'points_deducted', -REACTION_POINTS);

    console.log('[Reaction Service] Reaction removed:', reaction.id);
    
    return { success: true, reactionId: reaction.id, points: -REACTION_POINTS };
  } catch (error) {
    console.error('[Reaction Service] Error removing reaction:', error);
    throw error;
  }
}

/**
 * Award points to user
 */
async function awardPoints(userId: string, amount: number, reactionId: string, reason: string) {
  await prisma.$transaction([
    // Create point adjustment
    prisma.pointAdjustment.create({
      data: {
        userId,
        amount,
        reason,
        reactionId,
        verifiedAt: new Date(),
      },
    }),
    // Update user total points
    prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: amount,
        },
      },
    }),
  ]);
}

/**
 * Deduct points from user
 */
async function deductPoints(userId: string, amount: number, reactionId: string, reason: string) {
  await prisma.$transaction([
    // Create point adjustment
    prisma.pointAdjustment.create({
      data: {
        userId,
        amount: -amount,
        reason,
        reactionId,
        verifiedAt: new Date(),
      },
    }),
    // Update user total points (don't go below 0)
    prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          decrement: amount,
        },
      },
    }),
  ]);
}

/**
 * Detect manipulation (add/remove cycles)
 */
async function detectManipulation(userId: string, postId: string): Promise<boolean> {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Get all adjustments for this user/post in last 24h
  const adjustments = await prisma.pointAdjustment.findMany({
    where: {
      userId,
      createdAt: { gte: last24Hours },
      reaction: {
        postId,
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Count add/remove cycles
  let cycles = 0;
  let lastReason: string | null = null;

  for (const adj of adjustments) {
    if (lastReason && lastReason !== adj.reason) {
      cycles++;
    }
    lastReason = adj.reason;
  }

  return cycles > MANIPULATION_THRESHOLD;
}

/**
 * Check if user is in cooldown period
 */
async function checkCooldown(userId: string, postId: string): Promise<boolean> {
  const cooldownTime = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000);
  
  const recentAdjustment = await prisma.pointAdjustment.findFirst({
    where: {
      userId,
      createdAt: { gte: cooldownTime },
      reaction: {
        postId,
      },
    },
  });

  return !!recentAdjustment;
}

/**
 * Create user notification
 */
async function createNotification(userId: string, type: string, pointsChange: number) {
  const titles = {
    points_awarded: 'Points Earned! 🎉',
    points_deducted: 'Points Adjusted',
    manipulation_warning: 'Warning ⚠️',
  };

  const messages = {
    points_awarded: `You earned ${pointsChange} points from a Telegram reaction!`,
    points_deducted: `${Math.abs(pointsChange)} points were deducted due to reaction removal.`,
    manipulation_warning: 'Suspicious activity detected. Please avoid repeatedly adding/removing reactions.',
  };

  await prisma.userNotification.create({
    data: {
      userId,
      type,
      title: titles[type as keyof typeof titles] || 'Notification',
      message: messages[type as keyof typeof messages] || 'You have a new notification.',
      pointsChange,
      showOnLogin: true,
    },
  });
}

/**
 * Find user by Telegram user ID
 */
async function findUserByTelegramId(telegramUserId: string) {
  // Try to find by telegram username first
  // This requires users to have their Telegram username in profile
  return await prisma.user.findFirst({
    where: {
      OR: [
        { telegramUsername: telegramUserId },
        // Could also match by other criteria
      ],
    },
  });
}
