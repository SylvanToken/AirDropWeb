/**
 * Twitter Connection Status Endpoint
 * 
 * Returns user's Twitter connection status
 * Requirement 1.5: Display connection status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getConnectionStatus } from '@/lib/twitter/oauth-manager';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get connection status
    const status = await getConnectionStatus(session.user.id);
    
    if (!status || !status.connected) {
      return NextResponse.json({
        connected: false,
      });
    }
    
    return NextResponse.json({
      connected: true,
      username: status.username,
      twitterId: status.twitterId,
      tokenExpired: status.tokenExpired,
    });
  } catch (error) {
    console.error('[Twitter OAuth] Status check failed:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to check connection status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
