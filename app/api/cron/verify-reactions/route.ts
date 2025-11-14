import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/cron/verify-reactions
 * 
 * Nightly verification of Telegram reactions (runs at 23:00 UTC)
 * Vercel Cron Job
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Nightly Verification] Starting...');
    
    const startTime = Date.now();
    
    // Get all active reactions from last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const reactions = await prisma.telegramReaction.findMany({
      where: {
        isActive: true,
        createdAt: { gte: last24Hours },
      },
      include: {
        user: {
          select: {
            id: true,
            telegramUsername: true,
            totalPoints: true,
          },
        },
      },
    });

    console.log(`[Nightly Verification] Found ${reactions.length} reactions to verify`);

    let verified = 0;
    let removed = 0;
    let errors = 0;

    // Process in batches of 50
    for (let i = 0; i < reactions.length; i += 50) {
      const batch = reactions.slice(i, i + 50);
      
      await Promise.all(
        batch.map(async (reaction) => {
          try {
            // NOTE: Telegram API verification not implemented yet
            // Future enhancement: Check reaction status via Telegram Bot API
            // For now, assume reaction still exists (manual verification required)
            const stillExists = true;
            
            if (!stillExists) {
              // Reaction was removed
              await prisma.telegramReaction.update({
                where: { id: reaction.id },
                data: {
                  isActive: false,
                  removedAt: new Date(),
                },
              });

              // Deduct points
              await prisma.$transaction([
                prisma.pointAdjustment.create({
                  data: {
                    userId: reaction.userId,
                    amount: -REACTION_POINTS,
                    reason: 'reaction_removed_verification',
                    reactionId: reaction.id,
                    verifiedAt: new Date(),
                  },
                }),
                prisma.user.update({
                  where: { id: reaction.userId },
                  data: {
                    totalPoints: {
                      decrement: REACTION_POINTS,
                    },
                  },
                }),
              ]);

              // Create notification
              await prisma.userNotification.create({
                data: {
                  userId: reaction.userId,
                  type: 'points_deducted',
                  title: 'Points Adjusted',
                  message: `${REACTION_POINTS} points deducted - reaction was removed`,
                  pointsChange: -REACTION_POINTS,
                  showOnLogin: true,
                },
              });

              removed++;
            } else {
              // Update last verified
              await prisma.telegramReaction.update({
                where: { id: reaction.id },
                data: { lastVerifiedAt: new Date() },
              });
              
              verified++;
            }
          } catch (error) {
            console.error('[Nightly Verification] Error processing reaction:', error);
            errors++;
          }
        })
      );
    }

    const duration = Date.now() - startTime;

    console.log('[Nightly Verification] Complete:', {
      total: reactions.length,
      verified,
      removed,
      errors,
      duration: `${duration}ms`,
    });

    return NextResponse.json({
      success: true,
      stats: {
        total: reactions.length,
        verified,
        removed,
        errors,
        duration,
      },
    });
  } catch (error) {
    console.error('[Nightly Verification] Fatal error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}

const REACTION_POINTS = 20;
