import { NextRequest, NextResponse } from 'next/server';
import { autoApprovePendingCompletions } from '@/lib/fraud-detection';

// This endpoint should be called by a cron job every hour
// You can use services like Vercel Cron, GitHub Actions, or external cron services
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a trusted source (optional)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const approvedCount = await autoApprovePendingCompletions();
    
    return NextResponse.json({
      success: true,
      message: `Auto-approved ${approvedCount} completions`,
      approvedCount
    });
  } catch (error) {
    console.error('Auto-approval cron job failed:', error);
    return NextResponse.json(
      { error: 'Auto-approval failed' },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
