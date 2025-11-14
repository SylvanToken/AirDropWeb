import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/utils';

/**
 * Cron job endpoint to auto-reject pending completions older than 48 hours
 * Should be called periodically (e.g., every hour)
 * 
 * Security: Verify cron secret to prevent unauthorized access
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Find all PENDING completions older than 48 hours
    const expiredPending = await prisma.completion.findMany({
      where: {
        status: 'PENDING',
        completedAt: {
          lt: fortyEightHoursAgo,
        },
      },
      select: {
        id: true,
        userId: true,
        taskId: true,
        completedAt: true,
      },
    });

    if (expiredPending.length === 0) {
      return NextResponse.json({
        message: 'No expired pending completions found',
        rejected: 0,
      });
    }

    // Update all expired pending completions to REJECTED
    const result = await prisma.completion.updateMany({
      where: {
        id: {
          in: expiredPending.map(c => c.id),
        },
      },
      data: {
        status: 'REJECTED',
        verificationStatus: 'REJECTED',
        rejectionReason: 'Automatically rejected after 48 hours without approval',
        missedAt: new Date(),
      },
    });

    console.log(`[Auto-Reject Cron] Rejected ${result.count} expired pending completions`);

    return NextResponse.json({
      message: 'Successfully rejected expired pending completions',
      rejected: result.count,
      completions: expiredPending.map(c => ({
        id: c.id,
        userId: c.userId,
        taskId: c.taskId,
        completedAt: c.completedAt,
      })),
    });
  } catch (error) {
    console.error('[Auto-Reject Cron] Error:', error);
    return handleApiError(error);
  }
}
