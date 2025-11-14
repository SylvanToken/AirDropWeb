/**
 * Twitter OAuth Manager
 * 
 * Handles OAuth 2.0 authorization flow with PKCE for Twitter API.
 * Manages authorization, token exchange, refresh, and disconnection.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 5.3, 5.4, 10.3, 10.4
 */

import crypto from 'crypto';
import { TwitterApi } from 'twitter-api-v2';
import { storeTokens, updateAccessToken, deleteTokens, getTokens } from './token-manager';
import { getUserInfo } from './api-client';

/**
 * OAuth configuration from environment
 */
function getOAuthConfig() {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const callbackUrl = process.env.TWITTER_CALLBACK_URL || 'http://localhost:3000/api/auth/twitter/callback';
  
  if (!clientId) {
    throw new Error('TWITTER_CLIENT_ID environment variable is not set');
  }
  
  // Client secret is optional for PKCE flow but recommended
  if (!clientSecret) {
    console.warn('[OAuth Manager] TWITTER_CLIENT_SECRET not set. Using PKCE-only flow.');
  }
  
  return {
    clientId,
    clientSecret,
    callbackUrl,
  };
}

/**
 * OAuth state storage (in-memory for now, should use Redis in production)
 * Maps state -> { userId, codeVerifier, createdAt }
 */
const stateStore = new Map<string, {
  userId: string;
  codeVerifier: string;
  createdAt: number;
}>();

/**
 * Clean up expired states (older than 10 minutes)
 */
function cleanupExpiredStates() {
  const now = Date.now();
  const expirationTime = 10 * 60 * 1000; // 10 minutes
  
  for (const [state, data] of stateStore.entries()) {
    if (now - data.createdAt > expirationTime) {
      stateStore.delete(state);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredStates, 60 * 1000);

/**
 * Generate cryptographically random string
 */
function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Generate PKCE code verifier
 * Requirement 10.3: PKCE for security
 */
function generateCodeVerifier(): string {
  // Code verifier: 43-128 characters, base64url encoded
  return generateRandomString(64); // 64 bytes = ~86 characters base64url
}

/**
 * Generate PKCE code challenge from verifier
 * Requirement 10.3: SHA-256 code challenge
 */
function generateCodeChallenge(codeVerifier: string): string {
  return crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
}

/**
 * Generate OAuth state parameter
 * Requirement 10.3: CSRF protection
 */
function generateState(): string {
  return generateRandomString(32); // 32 bytes = ~43 characters
}

/**
 * OAuth error types
 */
export enum OAuthErrorType {
  INVALID_STATE = 'INVALID_STATE',
  STATE_EXPIRED = 'STATE_EXPIRED',
  TOKEN_EXCHANGE_FAILED = 'TOKEN_EXCHANGE_FAILED',
  REFRESH_FAILED = 'REFRESH_FAILED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  USER_DENIED = 'USER_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for OAuth operations
 */
export class OAuthError extends Error {
  constructor(
    public type: OAuthErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

/**
 * Generate Twitter OAuth authorization URL
 * Requirement 1.1: Redirect user to Twitter authorization
 * Requirement 10.3: PKCE and CSRF protection
 * 
 * @param userId - User ID to associate with this OAuth flow
 * @returns Authorization URL and state parameter
 */
export async function getAuthorizationUrl(userId: string): Promise<{
  url: string;
  state: string;
}> {
  try {
    const config = getOAuthConfig();
    
    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();
    
    // Store state for verification in callback
    stateStore.set(state, {
      userId,
      codeVerifier,
      createdAt: Date.now(),
    });
    
    // OAuth 2.0 scopes we need
    const scopes = [
      'tweet.read',      // Read tweets
      'users.read',      // Read user profile
      'follows.read',    // Check following
      'like.read',       // Check likes
      'offline.access',  // Get refresh token
    ];
    
    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.callbackUrl,
      scope: scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    
    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    
    console.log('[OAuth Manager] Authorization URL generated:', {
      userId,
      state,
      timestamp: new Date().toISOString(),
    });
    
    return {
      url: authUrl,
      state,
    };
  } catch (error) {
    console.error('[OAuth Manager] Failed to generate authorization URL:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    throw new OAuthError(
      OAuthErrorType.INVALID_CONFIG,
      'Failed to generate authorization URL',
      error as Error
    );
  }
}

/**
 * Handle OAuth callback and exchange code for tokens
 * Requirement 1.2: Receive authorization code
 * Requirement 1.3: Exchange code for tokens
 * Requirement 1.4: Store tokens
 * 
 * @param code - Authorization code from Twitter
 * @param state - State parameter for CSRF verification
 * @returns User ID and Twitter user info
 */
export async function handleCallback(
  code: string,
  state: string
): Promise<{
  userId: string;
  twitterId: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
}> {
  try {
    // Verify state parameter (CSRF protection)
    const stateData = stateStore.get(state);
    
    if (!stateData) {
      throw new OAuthError(
        OAuthErrorType.INVALID_STATE,
        'Invalid or expired state parameter'
      );
    }
    
    // Check if state is expired (10 minutes)
    const stateAge = Date.now() - stateData.createdAt;
    if (stateAge > 10 * 60 * 1000) {
      stateStore.delete(state);
      throw new OAuthError(
        OAuthErrorType.STATE_EXPIRED,
        'State parameter has expired'
      );
    }
    
    const { userId, codeVerifier } = stateData;
    
    // Clean up state (one-time use)
    stateStore.delete(state);
    
    const config = getOAuthConfig();
    
    // Exchange authorization code for tokens
    const client = new TwitterApi({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
    
    const {
      client: loggedClient,
      accessToken,
      refreshToken,
      expiresIn,
    } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: config.callbackUrl,
    });
    
    if (!accessToken || !refreshToken) {
      throw new OAuthError(
        OAuthErrorType.TOKEN_EXCHANGE_FAILED,
        'Failed to obtain tokens from Twitter'
      );
    }
    
    // Get user information
    const userInfo = await getUserInfo(accessToken);
    
    // Store encrypted tokens in database
    await storeTokens({
      userId,
      twitterId: userInfo.id,
      username: userInfo.username,
      displayName: userInfo.name,
      profileImageUrl: userInfo.profileImageUrl,
      accessToken,
      refreshToken,
      expiresIn: expiresIn || 7200, // Default 2 hours
      scope: 'tweet.read users.read follows.read like.read offline.access',
    });
    
    console.log('[OAuth Manager] OAuth callback successful:', {
      userId,
      twitterId: userInfo.id,
      username: userInfo.username,
      timestamp: new Date().toISOString(),
    });
    
    return {
      userId,
      twitterId: userInfo.id,
      username: userInfo.username,
      displayName: userInfo.name,
      profileImageUrl: userInfo.profileImageUrl,
    };
  } catch (error) {
    console.error('[OAuth Manager] OAuth callback failed:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    if (error instanceof OAuthError) {
      throw error;
    }
    
    throw new OAuthError(
      OAuthErrorType.TOKEN_EXCHANGE_FAILED,
      'Failed to complete OAuth flow',
      error as Error
    );
  }
}

/**
 * Refresh expired access token
 * Requirement 5.3: Automatic token refresh
 * 
 * @param userId - User ID
 * @returns New access token
 */
export async function refreshAccessToken(userId: string): Promise<string> {
  try {
    // Get current tokens
    const tokens = await getTokens(userId);
    
    if (!tokens.isExpired) {
      // Token is still valid, return it
      return tokens.accessToken;
    }
    
    const config = getOAuthConfig();
    
    // Create client for token refresh
    const client = new TwitterApi({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
    
    // Refresh the token
    const {
      client: refreshedClient,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    } = await client.refreshOAuth2Token(tokens.refreshToken);
    
    if (!newAccessToken) {
      throw new OAuthError(
        OAuthErrorType.REFRESH_FAILED,
        'Failed to refresh access token'
      );
    }
    
    // Update stored tokens
    await updateAccessToken(userId, newAccessToken, expiresIn || 7200);
    
    // If we got a new refresh token, we should update that too
    // (Twitter may rotate refresh tokens)
    if (newRefreshToken && newRefreshToken !== tokens.refreshToken) {
      // For now, we only update access token
      // Full token update would require modifying token-manager
      console.log('[OAuth Manager] New refresh token received (not stored yet)');
    }
    
    console.log('[OAuth Manager] Access token refreshed:', {
      userId,
      timestamp: new Date().toISOString(),
    });
    
    return newAccessToken;
  } catch (error) {
    console.error('[OAuth Manager] Token refresh failed:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    if (error instanceof OAuthError) {
      throw error;
    }
    
    throw new OAuthError(
      OAuthErrorType.REFRESH_FAILED,
      'Failed to refresh access token',
      error as Error
    );
  }
}

/**
 * Get valid access token (auto-refresh if expired)
 * Requirement 5.3: Automatic token refresh
 * 
 * @param userId - User ID
 * @returns Valid access token
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  try {
    const tokens = await getTokens(userId);
    
    // If token is expired or will expire in next 5 minutes, refresh it
    const expiresIn = tokens.expiresAt.getTime() - Date.now();
    const shouldRefresh = expiresIn < 5 * 60 * 1000; // 5 minutes
    
    if (shouldRefresh) {
      console.log('[OAuth Manager] Token expired or expiring soon, refreshing...', {
        userId,
        expiresIn: Math.floor(expiresIn / 1000),
      });
      
      return await refreshAccessToken(userId);
    }
    
    return tokens.accessToken;
  } catch (error) {
    console.error('[OAuth Manager] Failed to get valid access token:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    throw error;
  }
}

/**
 * Disconnect Twitter account
 * Requirement 10.4: Allow users to disconnect
 * Requirement 10.5: Delete tokens when disconnecting
 * 
 * @param userId - User ID
 */
export async function disconnect(userId: string): Promise<void> {
  try {
    // Delete tokens from database
    await deleteTokens(userId);
    
    console.log('[OAuth Manager] Twitter account disconnected:', {
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[OAuth Manager] Failed to disconnect:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    throw new OAuthError(
      OAuthErrorType.UNKNOWN_ERROR,
      'Failed to disconnect Twitter account',
      error as Error
    );
  }
}

/**
 * Revoke tokens with Twitter (optional, for complete cleanup)
 * This is not required but recommended for security
 * 
 * @param userId - User ID
 */
export async function revokeTokens(userId: string): Promise<void> {
  try {
    const tokens = await getTokens(userId);
    const config = getOAuthConfig();
    
    // Revoke the access token
    const client = new TwitterApi({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
    
    await client.revokeOAuth2Token(tokens.accessToken, 'access_token');
    
    console.log('[OAuth Manager] Tokens revoked with Twitter:', {
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Don't throw error if revocation fails
    // We still want to delete local tokens
    console.warn('[OAuth Manager] Failed to revoke tokens with Twitter:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Get OAuth connection status
 * 
 * @param userId - User ID
 * @returns Connection status and info
 */
export async function getConnectionStatus(userId: string): Promise<{
  connected: boolean;
  username?: string;
  twitterId?: string;
  connectedAt?: Date;
  tokenExpired?: boolean;
} | null> {
  try {
    const tokens = await getTokens(userId);
    
    return {
      connected: true,
      username: tokens.username,
      twitterId: tokens.twitterId,
      connectedAt: undefined, // Would need to query database for this
      tokenExpired: tokens.isExpired,
    };
  } catch (error) {
    // User not connected
    return {
      connected: false,
    };
  }
}
