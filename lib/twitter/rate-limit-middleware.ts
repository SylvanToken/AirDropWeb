/**
 * Rate Limiting Middleware for Twitter Verification
 * 
 * Prevents abuse of verification endpoints
 * Requirements: 6.1, 6.2
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter
// In production, use Redis or similar
const rateLimitStore = new Map<string, {
  count: number;
  resetAt: number;
}>();

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

/**
 * Rate limit configuration
 */
const RATE_LIMITS = {
  perUser: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  perIP: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
};

/**
 * Check rate limit for a key
 */
function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetAt) {
    // Create new entry
    const resetAt = now + windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetAt,
    });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt,
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Apply rate limiting to verification requests
 */
export function applyRateLimit(
  request: NextRequest,
  userId?: string
): NextResponse | null {
  // Get IP address
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Check IP-based rate limit
  const ipLimit = checkRateLimit(
    `ip:${ip}`,
    RATE_LIMITS.perIP.maxRequests,
    RATE_LIMITS.perIP.windowMs
  );
  
  if (!ipLimit.allowed) {
    const retryAfter = Math.ceil((ipLimit.resetAt - Date.now()) / 1000);
    
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        retryAfter,
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': RATE_LIMITS.perIP.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': ipLimit.resetAt.toString(),
        },
      }
    );
  }
  
  // Check user-based rate limit if userId provided
  if (userId) {
    const userLimit = checkRateLimit(
      `user:${userId}`,
      RATE_LIMITS.perUser.maxRequests,
      RATE_LIMITS.perUser.windowMs
    );
    
    if (!userLimit.allowed) {
      const retryAfter = Math.ceil((userLimit.resetAt - Date.now()) / 1000);
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMITS.perUser.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': userLimit.resetAt.toString(),
          },
        }
      );
    }
  }
  
  // Rate limit passed
  return null;
}
