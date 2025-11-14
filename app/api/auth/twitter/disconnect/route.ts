/**
 * Twitter Disconnect Endpoint
 * 
 * Disconnects user's Twitter account and deletes tokens
 * Requirements: 10.4, 10.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { disconnect, revokeTokens } from '@/lib/twitter/oauth-manager';

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Try to revoke tokens with Twitter (optional, best effort)
    try {
      await revokeTokens(session.user.id);
    } catch (error) {
      // Don't fail if revocation fails
      console.warn('[Twitter OAuth] Token revocation failed (continuing):', {
        userId: session.user.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    
    // Delete tokens from database
    await disconnect(session.user.id);
    
    console.log('[Twitter OAuth] Account disconnected:', {
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      message: 'Twitter account disconnected successfully',
    });
  } catch (error) {
    console.error('[Twitter OAuth] Disconnect failed:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to disconnect Twitter account',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
