/**
 * Twitter OAuth Authorization Endpoint
 * 
 * Initiates OAuth flow by generating authorization URL
 * Requirement 1.1: Redirect user to Twitter authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAuthorizationUrl } from '@/lib/twitter/oauth-manager';

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
    
    // Generate OAuth authorization URL
    const { url, state } = await getAuthorizationUrl(session.user.id);
    
    // Return authorization URL
    return NextResponse.json({
      authorizationUrl: url,
      state,
    });
  } catch (error) {
    console.error('[Twitter OAuth] Authorization failed:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to generate authorization URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
