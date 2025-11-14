/**
 * Twitter Batch Verification Endpoint
 * 
 * Verifies multiple Twitter task completions (admin only)
 * Requirement 9.5: Process concurrent verifications
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
    
    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { completionIds } = body;
    
    if (!Array.isArray(completionIds) || completionIds.length === 0) {
      return NextResponse.json(
        { error: 'Completion IDs array is required' },
        { status: 400 }
      );
    }
    
    // Limit batch size
    if (completionIds.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 completions per batch' },
        { status: 400 }
      );
    }
    
    // Verify all completions concurrently
    const results = await Promise.allSettled(
      completionIds.map(id => verifyCompletion(id))
    );
    
    // Process results
    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          completionId: completionIds[index],
          success: true,
          verified: result.value.verified,
          result: result.value.result,
          reason: result.value.reason,
          verificationTime: result.value.verificationTime,
        };
      } else {
        return {
          completionId: completionIds[index],
          success: false,
          error: result.reason instanceof Error 
            ? result.reason.message 
            : 'Verification failed',
        };
      }
    });
    
    // Calculate summary
    const summary = {
      total: completionIds.length,
      approved: processedResults.filter(r => r.result === 'APPROVED').length,
      rejected: processedResults.filter(r => r.result === 'REJECTED').length,
      errors: processedResults.filter(r => r.result === 'ERROR' || !r.success).length,
    };
    
    return NextResponse.json({
      success: true,
      results: processedResults,
      summary,
    });
  } catch (error) {
    console.error('[Twitter Verification] Batch verification failed:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { 
        error: 'Batch verification failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
