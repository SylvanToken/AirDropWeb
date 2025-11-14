import crypto from 'crypto';
import { z } from 'zod';

/**
 * Email Security Utilities
 * 
 * This module provides security features for the email system including:
 * - Email address validation
 * - Content sanitization
 * - Data encryption
 * - Security token generation
 */

// Email validation schema using Zod
export const emailAddressSchema = z
  .string()
  .email('Invalid email address format')
  .min(5, 'Email address too short')
  .max(254, 'Email address too long') // RFC 5321
  .refine(
    (email) => {
      // Additional validation: no consecutive dots
      return !email.includes('..');
    },
    { message: 'Email address contains invalid consecutive dots' }
  )
  .refine(
    (email) => {
      // Additional validation: no leading/trailing dots in local part
      const [localPart] = email.split('@');
      return localPart && !localPart.startsWith('.') && !localPart.endsWith('.');
    },
    { message: 'Email address has invalid format' }
  );

/**
 * Validate email address with comprehensive checks
 */
export function validateEmailAddress(email: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    emailAddressSchema.parse(email);
    
    // Additional security checks
    const [localPart, domain] = email.split('@');
    
    // Check for suspicious patterns
    if (localPart.length > 64) {
      return { isValid: false, error: 'Local part exceeds maximum length' };
    }
    
    // Check domain has valid TLD
    if (!domain.includes('.')) {
      return { isValid: false, error: 'Invalid domain format' };
    }
    
    // Check for common disposable email domains (basic list)
    const disposableDomains = [
      'tempmail.com',
      'throwaway.email',
      'guerrillamail.com',
      '10minutemail.com',
    ];
    
    if (disposableDomains.some((d) => domain.toLowerCase().endsWith(d))) {
      return { isValid: false, error: 'Disposable email addresses are not allowed' };
    }
    
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || 'Invalid email' };
    }
    return { isValid: false, error: 'Email validation failed' };
  }
}

/**
 * Validate multiple email addresses
 */
export function validateEmailAddresses(emails: string[]): {
  valid: string[];
  invalid: Array<{ email: string; error: string }>;
} {
  const valid: string[] = [];
  const invalid: Array<{ email: string; error: string }> = [];
  
  emails.forEach((email) => {
    const result = validateEmailAddress(email);
    if (result.isValid) {
      valid.push(email);
    } else {
      invalid.push({ email, error: result.error || 'Invalid email' });
    }
  });
  
  return { valid, invalid };
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtmlContent(html: string): string {
  // Remove dangerous tags and attributes
  let sanitized = html;
  
  // Remove script tags and content
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
  
  // Remove iframe tags
  sanitized = sanitized.replace(
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ''
  );
  
  // Remove object tags
  sanitized = sanitized.replace(
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    ''
  );
  
  // Remove embed tags
  sanitized = sanitized.replace(
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ''
  );
  
  // Remove form tags
  sanitized = sanitized.replace(
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    ''
  );
  
  // Remove dangerous event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  return sanitized;
}

/**
 * Sanitize user-provided text for email content
 */
export function sanitizeUserText(text: string): string {
  // Escape HTML special characters
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize URL to prevent injection
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '#';
    }
    
    return parsed.toString();
  } catch {
    return '#';
  }
}

/**
 * Encryption key derivation
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.EMAIL_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('Encryption key not configured');
  }
  
  // Derive a 32-byte key from the secret
  return crypto.scryptSync(secret, 'email-salt', 32);
}

/**
 * Encrypt sensitive data for database storage
 */
export function encryptSensitiveData(data: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypt sensitive data from database
 */
export function decryptSensitiveData(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const [ivHex, encrypted] = encryptedData.split(':');
    
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * Generate secure token for unsubscribe links
 */
export function generateSecureToken(userId: string, emailType: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('Secret not configured');
  }
  
  const timestamp = Date.now();
  const data = `${userId}:${emailType}:${timestamp}`;
  
  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  const signature = hmac.digest('hex');
  
  // Combine data and signature
  const token = Buffer.from(`${data}:${signature}`).toString('base64url');
  
  return token;
}

/**
 * Verify and parse secure token
 */
export function verifySecureToken(
  token: string
): { userId: string; emailType: string; timestamp: number } | null {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error('Secret not configured');
    }
    
    // Decode token
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length !== 4) {
      return null;
    }
    
    const [userId, emailType, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    
    // Verify signature
    const data = `${userId}:${emailType}:${timestampStr}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Check token age (valid for 30 days)
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (Date.now() - timestamp > maxAge) {
      return null;
    }
    
    return { userId, emailType, timestamp };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Rate limiting for email sending
 */
const emailRateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkEmailRateLimit(
  recipient: string,
  maxEmails: number = 10,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): { allowed: boolean; resetAt?: number } {
  const now = Date.now();
  const limit = emailRateLimits.get(recipient);
  
  if (!limit || now > limit.resetAt) {
    // Create new limit window
    emailRateLimits.set(recipient, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true };
  }
  
  if (limit.count >= maxEmails) {
    return { allowed: false, resetAt: limit.resetAt };
  }
  
  // Increment count
  limit.count++;
  return { allowed: true };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, limit] of emailRateLimits.entries()) {
    if (now > limit.resetAt) {
      emailRateLimits.delete(key);
    }
  }
}

/**
 * Validate email content size
 */
export function validateEmailSize(html: string, maxSizeKb: number = 100): {
  isValid: boolean;
  sizeKb: number;
  error?: string;
} {
  const sizeBytes = Buffer.byteLength(html, 'utf8');
  const sizeKb = sizeBytes / 1024;
  
  if (sizeKb > maxSizeKb) {
    return {
      isValid: false,
      sizeKb,
      error: `Email size (${sizeKb.toFixed(2)}KB) exceeds maximum (${maxSizeKb}KB)`,
    };
  }
  
  return { isValid: true, sizeKb };
}

/**
 * Check for spam indicators in email content
 */
export function checkSpamIndicators(subject: string, content: string): {
  isSpammy: boolean;
  score: number;
  indicators: string[];
} {
  const indicators: string[] = [];
  let score = 0;
  
  // Check for excessive capitalization
  const capsRatio = (subject.match(/[A-Z]/g) || []).length / subject.length;
  if (capsRatio > 0.5) {
    indicators.push('Excessive capitalization in subject');
    score += 2;
  }
  
  // Check for excessive exclamation marks
  const exclamationCount = (subject.match(/!/g) || []).length;
  if (exclamationCount > 2) {
    indicators.push('Too many exclamation marks');
    score += 1;
  }
  
  // Check for spam keywords
  const spamKeywords = [
    'free money',
    'click here now',
    'limited time',
    'act now',
    'congratulations you won',
  ];
  
  const lowerContent = content.toLowerCase();
  spamKeywords.forEach((keyword) => {
    if (lowerContent.includes(keyword)) {
      indicators.push(`Contains spam keyword: "${keyword}"`);
      score += 3;
    }
  });
  
  return {
    isSpammy: score >= 5,
    score,
    indicators,
  };
}

/**
 * Generate SPF record recommendation
 */
export function generateSPFRecord(domain: string): string {
  return `v=spf1 include:_spf.resend.com ~all`;
}

/**
 * Generate DMARC record recommendation
 */
export function generateDMARCRecord(domain: string, reportEmail: string): string {
  return `v=DMARC1; p=quarantine; rua=mailto:${reportEmail}; ruf=mailto:${reportEmail}; fo=1`;
}

/**
 * Security audit log entry
 */
export interface SecurityAuditEntry {
  timestamp: Date;
  action: string;
  recipient: string;
  result: 'success' | 'blocked' | 'failed';
  reason?: string;
  metadata?: Record<string, any>;
}

const securityAuditLog: SecurityAuditEntry[] = [];

/**
 * Log security event
 */
export function logSecurityEvent(entry: Omit<SecurityAuditEntry, 'timestamp'>): void {
  securityAuditLog.push({
    ...entry,
    timestamp: new Date(),
  });
  
  // Keep only last 1000 entries in memory
  if (securityAuditLog.length > 1000) {
    securityAuditLog.shift();
  }
  
  // Log to console for monitoring
  console.log('[Email Security]', entry);
}

/**
 * Get recent security events
 */
export function getSecurityAuditLog(limit: number = 100): SecurityAuditEntry[] {
  return securityAuditLog.slice(-limit);
}
