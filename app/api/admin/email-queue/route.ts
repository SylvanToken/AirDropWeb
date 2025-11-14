import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getQueueStats,
  clearCompletedJobs,
  clearFailedJobs,
  pauseQueue,
  resumeQueue,
  emailQueue,
} from '@/lib/email/queue';

/**
 * GET /api/admin/email-queue
 * Get email queue statistics and status
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get queue statistics
    const stats = await getQueueStats();
    
    // Get queue status
    const isPaused = await emailQueue.isPaused();
    
    // Get recent failed jobs
    const failedJobs = await emailQueue.getFailed(0, 10);
    const failedJobsData = await Promise.all(
      failedJobs.map(async (job: any) => ({
        id: job.id,
        to: job.data.to,
        subject: job.data.subject,
        template: job.data.template,
        error: job.failedReason,
        attempts: job.attemptsMade,
        timestamp: job.timestamp,
      }))
    );
    
    // Get recent completed jobs
    const completedJobs = await emailQueue.getCompleted(0, 10);
    const completedJobsData = await Promise.all(
      completedJobs.map(async (job: any) => ({
        id: job.id,
        to: job.data.to,
        subject: job.data.subject,
        template: job.data.template,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
      }))
    );
    
    return NextResponse.json({
      stats,
      status: {
        isPaused,
        isReady: true,
      },
      recentFailed: failedJobsData,
      recentCompleted: completedJobsData,
    });
  } catch (error) {
    console.error('Failed to get email queue stats:', error);
    return NextResponse.json(
      { error: 'Failed to get queue statistics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email-queue
 * Perform queue management actions
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'clear-completed':
        await clearCompletedJobs();
        return NextResponse.json({ message: 'Completed jobs cleared' });
        
      case 'clear-failed':
        await clearFailedJobs();
        return NextResponse.json({ message: 'Failed jobs cleared' });
        
      case 'pause':
        await pauseQueue();
        return NextResponse.json({ message: 'Queue paused' });
        
      case 'resume':
        await resumeQueue();
        return NextResponse.json({ message: 'Queue resumed' });
        
      case 'retry-failed':
        const failedJobs = await emailQueue.getFailed();
        let retriedCount = 0;
        
        for (const job of failedJobs) {
          await job.retry();
          retriedCount++;
        }
        
        return NextResponse.json({
          message: `Retried ${retriedCount} failed jobs`,
          count: retriedCount,
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to perform queue action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
