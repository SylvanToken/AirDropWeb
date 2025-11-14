/**
 * Twitter Token Manager
 * 
 * Handles secure encryption, decryption, and management of Twitter OAuth tokens.
 * Uses AES-256-GCM encryption for maximum security.
 * 
 * Requirements: 5.1, 5.2, 5.3, 10.1, 10.2
 */

import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const SALT_LENGTH = 32; // 32 bytes for key derivation
const TAG_LENGTH = 16; // 16 bytes for authentication tag
const KEY_LENGTH = 32; // 32 bytes for AES-256

/**
 * Error types for token management
 */
export enum TokenErrorType {
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  INVALID_KEY = 'INVALID_KEY',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * Custom error class for token operations
 */
export class TokenError extends Error {
  constructor(
    public type: TokenErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'TokenError';
  }
}

/**
 * Get encryption key from environment
 * Requirement 10.2: Secure key management
 */
function getEncryptionKey(): Buffer {
  const key = process.env.TWITTER_TOKEN_ENCRYPTION_KEY;
  
  if (!key) {
    throw new TokenError(
      TokenErrorType.INVALID_KEY,
      'TWITTER_TOKEN_ENCRYPTION_KEY environment variable is not set'
    );
  }
  
  // Key must be 32 bytes (64 hex characters) for AES-256
  if (key.length !== 64) {
    throw new TokenError(
      TokenErrorType.INVALID_KEY,
      'Encryption key must be 32 bytes (64 hex characters)'
    );
  }
  
  try {
    return Buffer.from(key, 'hex');
  } catch (error) {
    throw new TokenError(
      TokenErrorType.INVALID_KEY,
      'Invalid encryption key format',
      error as Error
    );
  }
}

/**
 * Encrypt a token using AES-256-GCM
 * Requirement 5.1: Encrypt access tokens before storing
 * 
 * @param token - Plain text token to encrypt
 * @returns Encrypted token in format: iv:encrypted:authTag (hex encoded)
 */
export function encryptToken(token: string): string {
  try {
    const key = getEncryptionKey();
    
    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the token
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:encrypted:authTag (all hex encoded)
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  } catch (error) {
    // Never log the actual token
    console.error('[Token Manager] Encryption failed:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    throw new TokenError(
      TokenErrorType.ENCRYPTION_FAILED,
      'Failed to encrypt token',
      error as Error
    );
  }
}

/**
 * Decrypt a token using AES-256-GCM
 * Requirement 5.2: Decrypt tokens for use
 * 
 * @param encryptedToken - Encrypted token in format: iv:encrypted:authTag
 * @returns Decrypted plain text token
 */
export function decryptToken(encryptedToken: string): string {
  try {
    const key = getEncryptionKey();
    
    // Parse the encrypted token
    const parts = encryptedToken.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }
    
    const [ivHex, encryptedHex, authTagHex] = parts;
    
    // Convert from hex
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Validate lengths
    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }
    if (authTag.length !== TAG_LENGTH) {
      throw new Error('Invalid auth tag length');
    }
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the token
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    // Never log the encrypted token or decrypted result
    console.error('[Token Manager] Decryption failed:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    throw new TokenError(
      TokenErrorType.DECRYPTION_FAILED,
      'Failed to decrypt token',
      error as Error
    );
  }
}

/**
 * Check if a token is expired
 * Requirement 5.3: Check token expiration
 * 
 * @param expiresAt - Token expiration date
 * @returns True if token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt;
}

/**
 * Store encrypted tokens in database
 * Requirement 5.1, 5.2: Store tokens securely
 * 
 * @param userId - User ID
 * @param twitterId - Twitter user ID
 * @param username - Twitter username
 * @param accessToken - Plain text access token
 * @param refreshToken - Plain text refresh token
 * @param expiresIn - Token expiration time in seconds
 * @param scope - OAuth scope
 * @param displayName - Twitter display name (optional)
 * @param profileImageUrl - Twitter profile image URL (optional)
 */
export async function storeTokens(params: {
  userId: string;
  twitterId: string;
  username: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
  displayName?: string;
  profileImageUrl?: string;
}): Promise<void> {
  try {
    const {
      userId,
      twitterId,
      username,
      accessToken,
      refreshToken,
      expiresIn,
      scope,
      displayName,
      profileImageUrl,
    } = params;
    
    // Encrypt tokens
    const encryptedAccessToken = encryptToken(accessToken);
    const encryptedRefreshToken = encryptToken(refreshToken);
    
    // Calculate expiration date
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    
    // Store in database (upsert to handle reconnections)
    await prisma.twitterConnection.upsert({
      where: { userId },
      create: {
        userId,
        twitterId,
        username,
        displayName,
        profileImageUrl,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt,
        scope,
        isActive: true,
        lastVerifiedAt: new Date(),
      },
      update: {
        twitterId,
        username,
        displayName,
        profileImageUrl,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt,
        scope,
        isActive: true,
        lastVerifiedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    console.log('[Token Manager] Tokens stored successfully:', {
      userId,
      twitterId,
      username,
      expiresAt: tokenExpiresAt.toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Token Manager] Failed to store tokens:', {
      userId: params.userId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    throw new TokenError(
      TokenErrorType.DATABASE_ERROR,
      'Failed to store tokens in database',
      error as Error
    );
  }
}

/**
 * Get decrypted tokens from database
 * Requirement 5.2: Retrieve and decrypt tokens
 * 
 * @param userId - User ID
 * @returns Decrypted tokens and metadata
 */
export async function getTokens(userId: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  twitterId: string;
  username: string;
  isExpired: boolean;
}> {
  try {
    const connection = await prisma.twitterConnection.findUnique({
      where: { userId },
      select: {
        accessToken: true,
        refreshToken: true,
        tokenExpiresAt: true,
        twitterId: true,
        username: true,
        isActive: true,
      },
    });
    
    if (!connection) {
      throw new TokenError(
        TokenErrorType.TOKEN_NOT_FOUND,
        'Twitter connection not found for user'
      );
    }
    
    if (!connection.isActive) {
      throw new TokenError(
        TokenErrorType.TOKEN_NOT_FOUND,
        'Twitter connection is inactive'
      );
    }
    
    // Decrypt tokens
    const accessToken = decryptToken(connection.accessToken);
    const refreshToken = decryptToken(connection.refreshToken);
    
    return {
      accessToken,
      refreshToken,
      expiresAt: connection.tokenExpiresAt,
      twitterId: connection.twitterId,
      username: connection.username,
      isExpired: isTokenExpired(connection.tokenExpiresAt),
    };
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }
    
    console.error('[Token Manager] Failed to get tokens:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    throw new TokenError(
      TokenErrorType.DATABASE_ERROR,
      'Failed to retrieve tokens from database',
      error as Error
    );
  }
}

/**
 * Update access token after refresh
 * Requirement 5.3: Update tokens after refresh
 * 
 * @param userId - User ID
 * @param newAccessToken - New access token
 * @param expiresIn - New expiration time in seconds
 */
export async function updateAccessToken(
  userId: string,
  newAccessToken: string,
  expiresIn: number
): Promise<void> {
  try {
    const encryptedAccessToken = encryptToken(newAccessToken);
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    
    await prisma.twitterConnection.update({
      where: { userId },
      data: {
        accessToken: encryptedAccessToken,
        tokenExpiresAt,
        lastVerifiedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    console.log('[Token Manager] Access token updated:', {
      userId,
      expiresAt: tokenExpiresAt.toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Token Manager] Failed to update access token:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    throw new TokenError(
      TokenErrorType.DATABASE_ERROR,
      'Failed to update access token',
      error as Error
    );
  }
}

/**
 * Delete tokens (disconnect)
 * Requirement 10.5: Delete tokens when disconnecting
 * 
 * @param userId - User ID
 */
export async function deleteTokens(userId: string): Promise<void> {
  try {
    await prisma.twitterConnection.delete({
      where: { userId },
    });
    
    console.log('[Token Manager] Tokens deleted:', {
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Token Manager] Failed to delete tokens:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    throw new TokenError(
      TokenErrorType.DATABASE_ERROR,
      'Failed to delete tokens',
      error as Error
    );
  }
}

/**
 * Check if user has active Twitter connection
 * 
 * @param userId - User ID
 * @returns True if user has active connection
 */
export async function hasActiveConnection(userId: string): Promise<boolean> {
  try {
    const connection = await prisma.twitterConnection.findUnique({
      where: { userId },
      select: { isActive: true },
    });
    
    return connection?.isActive ?? false;
  } catch (error) {
    console.error('[Token Manager] Failed to check connection:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return false;
  }
}

/**
 * Generate a secure encryption key (for setup)
 * This should be run once during initial setup
 * 
 * @returns 32-byte hex encoded key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

// Export types
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  twitterId: string;
  username: string;
  isExpired: boolean;
}
