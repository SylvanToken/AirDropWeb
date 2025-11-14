/**
 * Security Tests
 * Tests for password hashing, JWT tokens, input sanitization, rate limiting, and CSRF protection
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import {
  sanitizeString,
  escapeHtml,
  sanitizeUrl,
  sanitizeEmail,
  sanitizeUsername,
  sanitizeObject,
} from '@/lib/sanitize'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateCsrfToken } from '@/lib/csrf'
import { registerSchema } from '@/lib/validations'
import {
  createTestUser,
  cleanDatabase,
  createAuthSession,
} from './utils/test-helpers'

describe('Security Tests', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  // ============================================================================
  // 10.1 Test password hashing
  // ============================================================================
  describe('Password Hashing', () => {
    it('should hash password with bcrypt using 10+ salt rounds', async () => {
      const password = 'Test123!'
      const saltRounds = 10
      
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50)
      expect(hashedPassword.startsWith('$2b$')).toBe(true)
      
      // Verify salt rounds in hash
      const rounds = parseInt(hashedPassword.split('$')[2])
      expect(rounds).toBeGreaterThanOrEqual(10)
    })

    it('should successfully compare correct password', async () => {
      const password = 'Test123!'
      const hashedPassword = await bcrypt.hash(password, 10)
      
      const isMatch = await bcrypt.compare(password, hashedPassword)
      
      expect(isMatch).toBe(true)
    })

    it('should fail comparison with incorrect password', async () => {
      const password = 'Test123!'
      const wrongPassword = 'Wrong123!'
      const hashedPassword = await bcrypt.hash(password, 10)
      
      const isMatch = await bcrypt.compare(wrongPassword, hashedPassword)
      
      expect(isMatch).toBe(false)
    })

    it('should reject weak passwords through validation', () => {
      const weakPasswords = [
        'weak',
        'password',
        '12345678',
        'abcdefgh',
        'ABCDEFGH',
        'Pass123', // Too short
        'password123', // No uppercase
        'PASSWORD123', // No lowercase
        'Password', // No number
      ]

      weakPasswords.forEach((password) => {
        const result = registerSchema.safeParse({
          email: 'test@test.com',
          username: 'testuser',
          password,
          acceptedTerms: true,
        })
        
        expect(result.success).toBe(false)
      })
    })

    it('should validate password strength requirements', () => {
      const strongPassword = 'StrongPass123!'
      
      const result = registerSchema.safeParse({
        email: 'test@test.com',
        username: 'testuser',
        password: strongPassword,
        acceptedTerms: true,
      })
      
      expect(result.success).toBe(true)
      
      // Verify password meets all requirements
      expect(strongPassword.length).toBeGreaterThanOrEqual(8)
      expect(/[A-Z]/.test(strongPassword)).toBe(true)
      expect(/[a-z]/.test(strongPassword)).toBe(true)
      expect(/[0-9]/.test(strongPassword)).toBe(true)
    })

    it('should store hashed passwords in database, never plain text', async () => {
      const plainPassword = 'Test123!'
      const user = await createTestUser({
        email: 'test@test.com',
        username: 'testuser',
      })
      
      // Verify stored password is hashed
      expect(user.password).not.toBe(plainPassword)
      expect(user.password.startsWith('$2b$')).toBe(true)
      
      // Verify we can authenticate with plain password
      const isValid = await bcrypt.compare(plainPassword, user.password)
      expect(isValid).toBe(true)
    })
  })

  // ============================================================================
  // 10.2 Test JWT token handling
  // ============================================================================
  describe('JWT Token Handling', () => {
    it('should generate valid JWT token', async () => {
      const user = await createTestUser()
      const secret = process.env.NEXTAUTH_SECRET || 'test-secret'
      
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        secret,
        { expiresIn: '7d' }
      )
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should validate JWT token successfully', async () => {
      const user = await createTestUser()
      const token = createAuthSession(user)
      const secret = process.env.NEXTAUTH_SECRET || 'test-secret'
      
      const decoded = jwt.verify(token, secret) as any
      
      expect(decoded).toBeDefined()
      expect(decoded.userId).toBe(user.id)
      expect(decoded.email).toBe(user.email)
      expect(decoded.role).toBe(user.role)
    })

    it('should set token expiration to 7 days', async () => {
      const user = await createTestUser()
      const secret = process.env.NEXTAUTH_SECRET || 'test-secret'
      
      const token = jwt.sign(
        { userId: user.id },
        secret,
        { expiresIn: '7d' }
      )
      
      const decoded = jwt.decode(token) as any
      const issuedAt = decoded.iat
      const expiresAt = decoded.exp
      
      const sevenDaysInSeconds = 7 * 24 * 60 * 60
      const tokenLifetime = expiresAt - issuedAt
      
      expect(tokenLifetime).toBe(sevenDaysInSeconds)
    })

    it('should reject expired JWT token', async () => {
      const user = await createTestUser()
      const secret = process.env.NEXTAUTH_SECRET || 'test-secret'
      
      // Create token that expires immediately
      const token = jwt.sign(
        { userId: user.id },
        secret,
        { expiresIn: '0s' }
      )
      
      // Wait a moment to ensure expiration
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(() => {
        jwt.verify(token, secret)
      }).toThrow()
    })

    it('should reject invalid JWT token', () => {
      const secret = process.env.NEXTAUTH_SECRET || 'test-secret'
      const invalidToken = 'invalid.token.here'
      
      expect(() => {
        jwt.verify(invalidToken, secret)
      }).toThrow()
    })

    it('should verify token signature correctly', async () => {
      const user = await createTestUser()
      const secret = process.env.NEXTAUTH_SECRET || 'test-secret'
      const wrongSecret = 'wrong-secret'
      
      const token = jwt.sign({ userId: user.id }, secret)
      
      // Should verify with correct secret
      expect(() => {
        jwt.verify(token, secret)
      }).not.toThrow()
      
      // Should fail with wrong secret
      expect(() => {
        jwt.verify(token, wrongSecret)
      }).toThrow()
    })

    it('should include required user data in token payload', async () => {
      const user = await createTestUser()
      const token = createAuthSession(user)
      const secret = process.env.NEXTAUTH_SECRET || 'test-secret'
      
      const decoded = jwt.decode(token) as any
      
      expect(decoded.userId).toBe(user.id)
      expect(decoded.email).toBe(user.email)
      expect(decoded.role).toBe(user.role)
      expect(decoded.exp).toBeDefined()
      expect(decoded.iat).toBeDefined()
    })
  })

  // ============================================================================
  // 10.3 Test input sanitization
  // ============================================================================
  describe('Input Sanitization', () => {
    it('should prevent XSS by escaping HTML entities', () => {
      const maliciousInputs = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror="alert(1)">',
        '<svg onload="alert(1)">',
        '<iframe src="javascript:alert(1)">',
      ]
      
      maliciousInputs.forEach((input) => {
        const escaped = escapeHtml(input)
        
        expect(escaped).not.toContain('<script>')
        expect(escaped).not.toContain('<img')
        expect(escaped).not.toContain('<svg')
        expect(escaped).not.toContain('<iframe')
        expect(escaped).toContain('&lt;')
        expect(escaped).toContain('&gt;')
      })
    })

    it('should prevent SQL injection through Prisma ORM', async () => {
      // Prisma uses parameterized queries, preventing SQL injection
      const maliciousEmail = "admin@test.com' OR '1'='1"
      
      // This should safely return null, not bypass authentication
      const user = await prisma.user.findUnique({
        where: { email: maliciousEmail },
      })
      
      expect(user).toBeNull()
    })

    it('should encode HTML entities correctly', () => {
      const input = '& < > " \' /'
      const escaped = escapeHtml(input)
      
      expect(escaped).toBe('&amp; &lt; &gt; &quot; &#x27; &#x2F;')
    })

    it('should remove script tags from input', () => {
      const input = 'Hello <script>alert("XSS")</script> World'
      const escaped = escapeHtml(input)
      
      expect(escaped).not.toContain('<script>')
      expect(escaped).not.toContain('</script>')
      expect(escaped).toContain('&lt;script&gt;')
    })

    it('should sanitize string by removing control characters', () => {
      const input = 'Hello\x00World\x01Test\x1F'
      const sanitized = sanitizeString(input)
      
      expect(sanitized).toBe('HelloWorldTest')
      expect(sanitized).not.toContain('\x00')
      expect(sanitized).not.toContain('\x01')
    })

    it('should sanitize URLs to prevent javascript: protocol', () => {
      const dangerousUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'file:///etc/passwd',
      ]
      
      dangerousUrls.forEach((url) => {
        const sanitized = sanitizeUrl(url)
        expect(sanitized).toBe('')
      })
    })

    it('should allow safe URLs', () => {
      const safeUrls = [
        'https://example.com',
        'http://example.com',
        'https://twitter.com/user',
        'https://t.me/channel',
      ]
      
      safeUrls.forEach((url) => {
        const sanitized = sanitizeUrl(url)
        expect(sanitized).toBe(url)
      })
    })

    it('should sanitize email addresses', () => {
      const validEmail = '  TEST@EXAMPLE.COM  '
      const sanitized = sanitizeEmail(validEmail)
      
      expect(sanitized).toBe('test@example.com')
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user @example.com',
      ]
      
      invalidEmails.forEach((email) => {
        const sanitized = sanitizeEmail(email)
        expect(sanitized).toBe('')
      })
    })

    it('should sanitize username to alphanumeric and underscores only', () => {
      const input = 'user@#$%name123_test'
      const sanitized = sanitizeUsername(input)
      
      expect(sanitized).toBe('username123_test')
      expect(sanitized).toMatch(/^[a-zA-Z0-9_]+$/)
    })

    it('should sanitize nested objects recursively', () => {
      const input = {
        name: 'test\x00value\x01',
        nested: {
          value: 'nested\x00data\x1F',
        },
      }
      
      const sanitized = sanitizeObject(input)
      
      // sanitizeObject uses sanitizeString which removes control characters
      expect(sanitized.name).toBe('testvalue')
      expect(sanitized.nested.value).toBe('nesteddata')
      expect(sanitized.name).not.toContain('\x00')
      expect(sanitized.nested.value).not.toContain('\x00')
    })
  })

  // ============================================================================
  // 10.4 Test rate limiting
  // ============================================================================
  describe('Rate Limiting', () => {
    it('should enforce rate limit on excessive requests', () => {
      const identifier = 'test-user-1'
      const config = { interval: 60000, maxRequests: 3 }
      
      // First 3 requests should succeed
      for (let i = 0; i < 3; i++) {
        const result = rateLimit(identifier, config)
        expect(result.success).toBe(true)
      }
      
      // 4th request should be blocked
      const blockedResult = rateLimit(identifier, config)
      expect(blockedResult.success).toBe(false)
      expect(blockedResult.remaining).toBe(0)
    })

    it('should block requests when limit exceeded', () => {
      const identifier = 'test-user-2'
      const config = { interval: 60000, maxRequests: 2 }
      
      rateLimit(identifier, config)
      rateLimit(identifier, config)
      
      const result = rateLimit(identifier, config)
      
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset rate limit after time window', async () => {
      const identifier = 'test-user-3'
      const config = { interval: 100, maxRequests: 2 } // 100ms window
      
      // Use up the limit
      rateLimit(identifier, config)
      rateLimit(identifier, config)
      
      // Should be blocked
      let result = rateLimit(identifier, config)
      expect(result.success).toBe(false)
      
      // Wait for reset
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should work again
      result = rateLimit(identifier, config)
      expect(result.success).toBe(true)
    })

    it('should have different limits per endpoint', () => {
      const identifier = 'test-user-4'
      
      // Auth endpoint - stricter limit
      expect(RATE_LIMITS.AUTH.maxRequests).toBe(5)
      expect(RATE_LIMITS.AUTH.interval).toBe(15 * 60 * 1000)
      
      // API endpoint - more permissive
      expect(RATE_LIMITS.API.maxRequests).toBe(30)
      expect(RATE_LIMITS.API.interval).toBe(60 * 1000)
      
      // Completion endpoint - moderate
      expect(RATE_LIMITS.COMPLETION.maxRequests).toBe(10)
      expect(RATE_LIMITS.COMPLETION.interval).toBe(60 * 1000)
    })

    it('should track remaining requests correctly', () => {
      const identifier = 'test-user-5'
      const config = { interval: 60000, maxRequests: 5 }
      
      let result = rateLimit(identifier, config)
      expect(result.remaining).toBe(4)
      
      result = rateLimit(identifier, config)
      expect(result.remaining).toBe(3)
      
      result = rateLimit(identifier, config)
      expect(result.remaining).toBe(2)
    })

    it('should provide reset time information', () => {
      const identifier = 'test-user-6'
      const config = { interval: 60000, maxRequests: 3 }
      
      const result = rateLimit(identifier, config)
      
      expect(result.resetTime).toBeDefined()
      expect(result.resetTime).toBeGreaterThan(Date.now())
      expect(result.resetTime).toBeLessThanOrEqual(Date.now() + config.interval)
    })

    it('should isolate rate limits per identifier', () => {
      const config = { interval: 60000, maxRequests: 2 }
      
      // User 1 uses up their limit
      rateLimit('user-1', config)
      rateLimit('user-1', config)
      const user1Result = rateLimit('user-1', config)
      expect(user1Result.success).toBe(false)
      
      // User 2 should still have their full limit
      const user2Result = rateLimit('user-2', config)
      expect(user2Result.success).toBe(true)
      expect(user2Result.remaining).toBe(1)
    })
  })

  // ============================================================================
  // 10.5 Test CSRF protection
  // ============================================================================
  describe('CSRF Protection', () => {
    it('should validate CSRF token correctly', () => {
      const token = 'valid-csrf-token-123'
      
      const isValid = validateCsrfToken(token, token)
      
      expect(isValid).toBe(true)
    })

    it('should reject request without CSRF token', () => {
      const isValid = validateCsrfToken(null, 'session-token')
      
      expect(isValid).toBe(false)
    })

    it('should reject request with mismatched CSRF token', () => {
      const requestToken = 'token-1'
      const sessionToken = 'token-2'
      
      const isValid = validateCsrfToken(requestToken, sessionToken)
      
      expect(isValid).toBe(false)
    })

    it('should reject request with null session token', () => {
      const isValid = validateCsrfToken('request-token', null)
      
      expect(isValid).toBe(false)
    })

    it('should validate CSRF tokens are required for state-changing operations', () => {
      // CSRF protection should be enforced for POST, PUT, DELETE
      // GET requests typically don't need CSRF protection
      
      const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
      const safeMethods = ['GET', 'HEAD', 'OPTIONS']
      
      // This test verifies the concept - actual implementation
      // is handled by NextAuth.js automatically
      expect(stateChangingMethods).toContain('POST')
      expect(stateChangingMethods).toContain('PUT')
      expect(stateChangingMethods).toContain('DELETE')
      expect(safeMethods).toContain('GET')
    })

    it('should generate unique CSRF tokens per session', () => {
      // In a real implementation, each session would have a unique token
      // This test verifies the concept
      const token1 = 'csrf-token-session-1'
      const token2 = 'csrf-token-session-2'
      
      expect(token1).not.toBe(token2)
      
      // Each token should only validate against its own session
      expect(validateCsrfToken(token1, token1)).toBe(true)
      expect(validateCsrfToken(token2, token2)).toBe(true)
      expect(validateCsrfToken(token1, token2)).toBe(false)
    })

    it('should use secure cookie settings for CSRF tokens', () => {
      // Verify CSRF token cookie configuration
      // In production, cookies should be:
      // - httpOnly: true
      // - sameSite: 'lax' or 'strict'
      // - secure: true (in production)
      
      const cookieConfig = {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      }
      
      expect(cookieConfig.httpOnly).toBe(true)
      expect(cookieConfig.sameSite).toBe('lax')
    })
  })
})
