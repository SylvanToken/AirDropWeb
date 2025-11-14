/**
 * Twitter API Client
 * 
 * Wrapper around twitter-api-v2 for verification operations.
 * Handles follow, like, and retweet checks with rate limiting and retry logic.
 * 
 * Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 6.1, 6.2, 9.3
 */

import { TwitterApi, ApiResponseError } from 'twitter-api-v2';

/**
 * Twitter API error types
 */
export enum TwitterAPIErrorType {
  RATE_LIMIT = 'RATE_LIMIT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for Twitter API operations
 */
export class TwitterAPIError extends Error {
  constructor(
    public type: TwitterAPIErrorType,
    message: string,
    public statusCode?: number,
    public retryAfter?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'TwitterAPIError';
  }
}

/**
 * Twitter user information
 */
export interface TwitterUserInfo {
  id: string;
  username: string;
  name: string;
  profileImageUrl?: string;
}

/**
 * Rate limit information
 */
interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

/**
 * Create Twitter API client with access token
 * Requirement 9.3: Connection pooling
 */
function createClient(accessToken: string): TwitterApi {
  return new TwitterApi(accessToken);
}

/**
 * Handle Twitter API errors
 * Requirement 6.1, 6.2: Rate limiting and error handling
 */
function handleTwitterError(error: unknown): never {
  if (error instanceof ApiResponseError) {
    const { code, data, rateLimit } = error;
    const statusCode = (error as any).statusCode || (error as any).code || 500;
    
    // Rate limit error
    if (statusCode === 429) {
      const retryAfter = rateLimit?.reset 
        ? Math.ceil((rateLimit.reset * 1000 - Date.now()) / 1000)
        : 900; // Default 15 minutes
      
      throw new TwitterAPIError(
        TwitterAPIErrorType.RATE_LIMIT,
        `Rate limit exceeded. Retry after ${retryAfter} seconds`,
        statusCode,
        retryAfter,
        error
      );
    }
    
    // Unauthorized
    if (statusCode === 401) {
      throw new TwitterAPIError(
        TwitterAPIErrorType.UNAUTHORIZED,
        'Invalid or expired access token',
        statusCode,
        undefined,
        error
      );
    }
    
    // Forbidden
    if (statusCode === 403) {
      throw new TwitterAPIError(
        TwitterAPIErrorType.FORBIDDEN,
        'Access forbidden. Check OAuth permissions',
        statusCode,
        undefined,
        error
      );
    }
    
    // Not found
    if (statusCode === 404) {
      throw new TwitterAPIError(
        TwitterAPIErrorType.NOT_FOUND,
        'Resource not found',
        statusCode,
        undefined,
        error
      );
    }
    
    // Other API errors
    throw new TwitterAPIError(
      TwitterAPIErrorType.UNKNOWN_ERROR,
      `Twitter API error: ${data?.detail || error.message}`,
      statusCode,
      undefined,
      error
    );
  }
  
  // Network or other errors
  throw new TwitterAPIError(
    TwitterAPIErrorType.NETWORK_ERROR,
    error instanceof Error ? error.message : 'Unknown network error',
    undefined,
    undefined,
    error as Error
  );
}

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Retry a function with exponential backoff
 * Requirement 6.2: Exponential backoff retry
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempt: number = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Don't retry on certain errors
    if (error instanceof TwitterAPIError) {
      if (
        error.type === TwitterAPIErrorType.UNAUTHORIZED ||
        error.type === TwitterAPIErrorType.FORBIDDEN ||
        error.type === TwitterAPIErrorType.NOT_FOUND
      ) {
        throw error;
      }
      
      // For rate limit, throw immediately with retry info
      if (error.type === TwitterAPIErrorType.RATE_LIMIT) {
        throw error;
      }
    }
    
    // Retry if we haven't exceeded max attempts
    if (attempt < RETRY_CONFIG.maxAttempts) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
        RETRY_CONFIG.maxDelay
      );
      
      console.log(`[Twitter API] Retry attempt ${attempt}/${RETRY_CONFIG.maxAttempts} after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, attempt + 1);
    }
    
    throw error;
  }
}

/**
 * Get authenticated user information
 * Requirement 1.5: Display connected Twitter username
 */
export async function getUserInfo(accessToken: string): Promise<TwitterUserInfo> {
  try {
    return await retryWithBackoff(async () => {
      const client = createClient(accessToken);
      const me = await client.v2.me({
        'user.fields': ['profile_image_url'],
      });
      
      if (!me.data) {
        throw new Error('No user data returned from Twitter API');
      }
      
      return {
        id: me.data.id,
        username: me.data.username,
        name: me.data.name,
        profileImageUrl: me.data.profile_image_url,
      };
    });
  } catch (error) {
    console.error('[Twitter API] Failed to get user info:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    handleTwitterError(error);
  }
}

/**
 * Lookup user by username to get user ID
 * Requirement 2.1: Convert username to user ID
 */
export async function lookupUser(
  accessToken: string,
  username: string
): Promise<{ id: string; username: string }> {
  try {
    return await retryWithBackoff(async () => {
      const client = createClient(accessToken);
      
      // Remove @ if present
      const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
      
      const user = await client.v2.userByUsername(cleanUsername);
      
      if (!user.data) {
        throw new TwitterAPIError(
          TwitterAPIErrorType.NOT_FOUND,
          `User @${cleanUsername} not found`
        );
      }
      
      return {
        id: user.data.id,
        username: user.data.username,
      };
    });
  } catch (error) {
    console.error('[Twitter API] Failed to lookup user:', {
      username,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    handleTwitterError(error);
  }
}

/**
 * Check if user follows a target account
 * Requirement 2.1, 2.2: Verify follow action
 */
export async function checkFollowing(
  accessToken: string,
  userId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    return await retryWithBackoff(async () => {
      const client = createClient(accessToken);
      
      // Get user's following list (paginated)
      const following = await client.v2.following(userId, {
        max_results: 1000, // Max allowed per request
      });
      
      // Check if target is in the list
      if (following.data) {
        const isFollowing = following.data.some(user => user.id === targetUserId);
        if (isFollowing) {
          return true;
        }
      }
      
      // If we have more pages, check them too
      // Note: This is expensive, but necessary for accuracy
      let hasMore: boolean = !!following.meta?.next_token;
      let nextToken: string | undefined = following.meta?.next_token;
      
      while (hasMore && nextToken) {
        const nextPage = await client.v2.following(userId, {
          max_results: 1000,
          pagination_token: nextToken,
        });
        
        if (nextPage.data) {
          const isFollowing = nextPage.data.some(user => user.id === targetUserId);
          if (isFollowing) {
            return true;
          }
        }
        
        nextToken = nextPage.meta?.next_token;
        hasMore = !!nextToken;
      }
      
      return false;
    });
  } catch (error) {
    console.error('[Twitter API] Failed to check following:', {
      userId,
      targetUserId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    handleTwitterError(error);
  }
}

/**
 * Check if user has liked a tweet
 * Requirement 3.1, 3.2: Verify like action
 */
export async function checkLiked(
  accessToken: string,
  userId: string,
  tweetId: string
): Promise<boolean> {
  try {
    return await retryWithBackoff(async () => {
      const client = createClient(accessToken);
      
      // Get user's liked tweets
      const likedTweets = await client.v2.userLikedTweets(userId, {
        max_results: 100, // Check recent likes
      });
      
      // Check if tweet is in the list
      if (likedTweets.data && Array.isArray(likedTweets.data.data)) {
        const hasLiked = likedTweets.data.data.some((tweet: any) => tweet.id === tweetId);
        if (hasLiked) {
          return true;
        }
      }
      
      // Check more pages if needed (up to 500 recent likes)
      let hasMore: boolean = !!likedTweets.meta?.next_token;
      let nextToken: string | undefined = likedTweets.meta?.next_token;
      let pagesChecked = 1;
      const maxPages = 5; // Check up to 500 likes
      
      while (hasMore && nextToken && pagesChecked < maxPages) {
        const nextPage = await client.v2.userLikedTweets(userId, {
          max_results: 100,
          pagination_token: nextToken,
        });
        
        if (nextPage.data && Array.isArray(nextPage.data.data)) {
          const hasLiked = nextPage.data.data.some((tweet: any) => tweet.id === tweetId);
          if (hasLiked) {
            return true;
          }
        }
        
        nextToken = nextPage.meta?.next_token;
        hasMore = !!nextToken;
        pagesChecked++;
      }
      
      return false;
    });
  } catch (error) {
    console.error('[Twitter API] Failed to check liked:', {
      userId,
      tweetId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    handleTwitterError(error);
  }
}

/**
 * Check if user has retweeted a tweet
 * Requirement 4.1, 4.2: Verify retweet action
 */
export async function checkRetweeted(
  accessToken: string,
  userId: string,
  tweetId: string
): Promise<boolean> {
  try {
    return await retryWithBackoff(async () => {
      const client = createClient(accessToken);
      
      // Get users who retweeted the tweet
      const retweeters = await client.v2.tweetRetweetedBy(tweetId, {
        max_results: 100,
      });
      
      // Check if user is in the list
      if (retweeters.data) {
        const hasRetweeted = retweeters.data.some(user => user.id === userId);
        if (hasRetweeted) {
          return true;
        }
      }
      
      // Check more pages if needed
      let hasMore: boolean = !!retweeters.meta?.next_token;
      let nextToken: string | undefined = retweeters.meta?.next_token;
      let pagesChecked = 1;
      const maxPages = 10; // Check up to 1000 retweeters
      
      while (hasMore && nextToken && pagesChecked < maxPages) {
        const nextPage = await client.v2.tweetRetweetedBy(tweetId, {
          max_results: 100,
          pagination_token: nextToken,
        });
        
        if (nextPage.data) {
          const hasRetweeted = nextPage.data.some(user => user.id === userId);
          if (hasRetweeted) {
            return true;
          }
        }
        
        nextToken = nextPage.meta?.next_token;
        hasMore = !!nextToken;
        pagesChecked++;
      }
      
      // Also check if user has quote tweeted (counts as retweet)
      // Get user's recent tweets
      const userTweets = await client.v2.userTimeline(userId, {
        max_results: 100,
        'tweet.fields': ['referenced_tweets'],
      });
      
      if (userTweets.data && Array.isArray(userTweets.data.data)) {
        const hasQuoteTweeted = userTweets.data.data.some((tweet: any) => {
          return tweet.referenced_tweets?.some((ref: any) => 
            ref.type === 'quoted' && ref.id === tweetId
          );
        });
        
        if (hasQuoteTweeted) {
          return true;
        }
      }
      
      return false;
    });
  } catch (error) {
    console.error('[Twitter API] Failed to check retweeted:', {
      userId,
      tweetId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    handleTwitterError(error);
  }
}

/**
 * Extract tweet ID from Twitter URL
 * Requirement 3.1, 4.1: Parse tweet URLs
 */
export function extractTweetId(url: string): string | null {
  try {
    // Twitter URL patterns:
    // https://twitter.com/username/status/1234567890
    // https://x.com/username/status/1234567890
    // https://mobile.twitter.com/username/status/1234567890
    
    const patterns = [
      /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i,
      /(?:mobile\.twitter\.com)\/\w+\/status\/(\d+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If it's just a number, assume it's already a tweet ID
    if (/^\d+$/.test(url)) {
      return url;
    }
    
    return null;
  } catch (error) {
    console.error('[Twitter API] Failed to extract tweet ID:', {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Extract username from Twitter URL or handle
 * Requirement 2.1: Parse Twitter usernames
 */
export function extractUsername(input: string): string | null {
  try {
    // Remove @ if present
    if (input.startsWith('@')) {
      return input.slice(1);
    }
    
    // Twitter profile URL patterns:
    // https://twitter.com/username
    // https://x.com/username
    
    const patterns = [
      /(?:twitter\.com|x\.com)\/(\w+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        // Exclude common paths
        const excluded = ['home', 'explore', 'notifications', 'messages', 'i', 'settings'];
        if (!excluded.includes(match[1].toLowerCase())) {
          return match[1];
        }
      }
    }
    
    // If it's just a username (alphanumeric + underscore)
    if (/^[\w]+$/.test(input)) {
      return input;
    }
    
    return null;
  } catch (error) {
    console.error('[Twitter API] Failed to extract username:', {
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Log API call for monitoring
 * Requirement 11.3: Monitor API usage
 */
function logAPICall(
  operation: string,
  success: boolean,
  duration: number,
  metadata?: Record<string, any>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    service: 'twitter-api-client',
    operation,
    success,
    duration,
    metadata,
  };
  
  console.log('[Twitter API Call]', JSON.stringify(logEntry));
}
