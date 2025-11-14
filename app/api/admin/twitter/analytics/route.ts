import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/twitter/analytics
 * 
 * Get Twitter verification analytics (admin only)
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get all verification logs
    const logs = await prisma.twitterVerificationLog.findMany({
      include: {
        task: {
          select: {
            taskType: true,
          },
        },
      },
    });

    const totalVerifications = logs.length;
    const approvedCount = logs.filter(log => log.verificationResult === 'APPROVED').length;
    const errorCount = logs.filter(log => log.verificationResult === 'ERROR').length;
    
    const successRate = totalVerifications > 0 
      ? (approvedCount / totalVerifications) * 100 
      : 0;
    
    const errorRate = totalVerifications > 0
      ? (errorCount / totalVerifications) * 100
      : 0;

    const totalTime = logs.reduce((sum, log) => sum + log.verificationTime, 0);
    const averageVerificationTime = totalVerifications > 0
      ? Math.round(totalTime / totalVerifications)
      : 0;

    // Group by task type
    const byTaskType = {
      TWITTER_FOLLOW: { total: 0, approved: 0 },
      TWITTER_LIKE: { total: 0, approved: 0 },
      TWITTER_RETWEET: { total: 0, approved: 0 },
    };

    logs.forEach(log => {
      const taskType = log.task.taskType as keyof typeof byTaskType;
      if (taskType in byTaskType) {
        byTaskType[taskType].total++;
        if (log.verificationResult === 'APPROVED') {
          byTaskType[taskType].approved++;
        }
      }
    });

    return NextResponse.json({
      totalVerifications,
      successRate,
      averageVerificationTime,
      errorRate,
      byTaskType,
    });
  } catch (error) {
    console.error('[Admin Twitter Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
