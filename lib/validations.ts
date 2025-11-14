import { z } from 'zod'

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms of Use and Privacy Policy',
  }),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Task validation schemas
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be at most 500 characters'),
  titleTr: z.string().max(100).optional(),
  descriptionTr: z.string().max(500).optional(),
  titleDe: z.string().max(100).optional(),
  descriptionDe: z.string().max(500).optional(),
  titleZh: z.string().max(100).optional(),
  descriptionZh: z.string().max(500).optional(),
  titleRu: z.string().max(100).optional(),
  descriptionRu: z.string().max(500).optional(),
  points: z.number().int().positive('Points must be a positive number'),
  taskType: z.enum(['TWITTER_FOLLOW', 'TWITTER_LIKE', 'TWITTER_RETWEET', 'TELEGRAM_JOIN', 'REFERRAL', 'CUSTOM']),
  taskUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  campaignId: z.string().min(1, 'Campaign ID is required'),
  isTimeLimited: z.boolean().optional(),
  duration: z.number().int().min(1, 'Duration must be at least 1 hour').max(24, 'Duration cannot exceed 24 hours').optional(),
})

export const completionSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
})

// Admin login validation schema
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Task update schema (allows partial updates)
export const taskUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters').optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be at most 500 characters').optional(),
  points: z.number().int().positive('Points must be a positive number').optional(),
  taskType: z.enum(['TWITTER_FOLLOW', 'TWITTER_LIKE', 'TWITTER_RETWEET', 'TELEGRAM_JOIN', 'REFERRAL', 'CUSTOM']).optional(),
  taskUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

// User ID parameter validation
export const userIdSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
})

// Task ID parameter validation
export const taskIdSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
})

// Wallet address validation schema
export const walletAddressSchema = z.object({
  walletAddress: z
    .string()
    .min(1, 'Wallet address is required')
    .regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid BEP-20 wallet address format. Must start with 0x followed by 40 hexadecimal characters'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>
export type CompletionInput = z.infer<typeof completionSchema>
export type AdminLoginInput = z.infer<typeof adminLoginSchema>
export type UserIdInput = z.infer<typeof userIdSchema>
export type TaskIdInput = z.infer<typeof taskIdSchema>
export type WalletAddressInput = z.infer<typeof walletAddressSchema>

// Timer validation schemas
export const timerStartSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  duration: z.number().int().positive('Duration must be a positive number').max(86400, 'Duration cannot exceed 24 hours'),
})

export const timerUpdateSchema = z.object({
  status: z.enum(['active', 'paused', 'expired', 'completed']),
  remainingTime: z.number().int().min(0, 'Remaining time cannot be negative'),
  deadline: z.string().datetime('Invalid deadline format'),
})

export type TimerStartInput = z.infer<typeof timerStartSchema>
export type TimerUpdateInput = z.infer<typeof timerUpdateSchema>

// Twitter URL validation helpers
export function validateTwitterUsername(username: string): boolean {
  // Twitter usernames: 1-15 characters, alphanumeric and underscore
  const usernameRegex = /^[a-zA-Z0-9_]{1,15}$/;
  return usernameRegex.test(username);
}

export function validateTwitterUrl(url: string, taskType: string): { valid: boolean; error?: string } {
  try {
    const urlObj = new URL(url);
    
    // Check if it's a Twitter URL
    if (!['twitter.com', 'x.com', 'www.twitter.com', 'www.x.com'].includes(urlObj.hostname)) {
      return { valid: false, error: 'URL must be from twitter.com or x.com' };
    }

    if (taskType === 'TWITTER_FOLLOW') {
      // For follow tasks, URL should be a profile: https://twitter.com/username
      const pathMatch = urlObj.pathname.match(/^\/([a-zA-Z0-9_]{1,15})$/);
      if (!pathMatch) {
        return { valid: false, error: 'Invalid Twitter profile URL. Format: https://twitter.com/username' };
      }
      return { valid: true };
    }

    if (taskType === 'TWITTER_LIKE' || taskType === 'TWITTER_RETWEET') {
      // For like/retweet tasks, URL should be a tweet: https://twitter.com/username/status/1234567890
      const pathMatch = urlObj.pathname.match(/^\/([a-zA-Z0-9_]{1,15})\/status\/(\d+)$/);
      if (!pathMatch) {
        return { valid: false, error: 'Invalid tweet URL. Format: https://twitter.com/username/status/1234567890' };
      }
      return { valid: true };
    }

    return { valid: false, error: 'Invalid task type' };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export function extractTweetId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/status\/(\d+)/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
}

export function extractTwitterUsername(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/^\/([a-zA-Z0-9_]{1,15})/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
}
