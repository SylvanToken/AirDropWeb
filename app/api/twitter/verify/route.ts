/**
 * Twitter Verification Endpoint
 * 
 * Verifies Twitter task completion
 * Requirements: All verification requirements
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyCompletion } from '@/lib/twitter/verification-service';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { completionId } = body;
    
    if (!completionId) {
      return NextResponse.json(
        { error: 'Completion ID is required' },
        { status: 400 }
      );
    }
    
    // Verify the completion
    const result = await verifyCompletion(completionId);
    
    return NextResponse.json({
      success: true,
      verified: result.verified,
      result: result.result,
      reason: result.reason,
      verificationTime: result.verificationTime,
      pointsAwarded: result.result === 'APPROVED' ? undefined : 0,
    });
  } catch (error) {
    console.error('[Twitter Verification] Verification failed:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { 
        error: 'Verification failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
