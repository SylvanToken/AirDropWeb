/**
 * Twitter OAuth Callback Endpoint
 * 
 * Handles OAuth callback from Twitter and exchanges code for tokens
 * Requirements: 1.2, 1.3, 1.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleCallback } from '@/lib/twitter/oauth-manager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    // Check if user denied authorization
    if (error) {
      console.log('[Twitter OAuth] User denied authorization:', {
        error,
        errorDescription,
      });
      
      // Redirect to profile with error
      return NextResponse.redirect(
        new URL(
          `/profile?twitter_error=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }
    
    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          '/profile?twitter_error=Invalid callback parameters',
          request.url
        )
      );
    }
    
    // Handle OAuth callback
    const result = await handleCallback(code, state);
    
    console.log('[Twitter OAuth] Callback successful:', {
      userId: result.userId,
      twitterUsername: result.username,
      timestamp: new Date().toISOString(),
    });
    
    // Redirect to profile with success message
    return NextResponse.redirect(
      new URL(
        `/profile?twitter_connected=${encodeURIComponent(result.username)}`,
        request.url
      )
    );
  } catch (error) {
    console.error('[Twitter OAuth] Callback failed:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    // Redirect to profile with error
    return NextResponse.redirect(
      new URL(
        `/profile?twitter_error=${encodeURIComponent(
          error instanceof Error ? error.message : 'OAuth callback failed'
        )}`,
        request.url
      )
    );
  }
}
