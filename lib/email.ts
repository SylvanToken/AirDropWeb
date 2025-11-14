/**
 * ============================================================================
 * Email Service - Legacy Compatibility Layer
 * ============================================================================
 * 
 * @deprecated This module provides backward compatibility for legacy email functions.
 * All functions now delegate to the modern Resend-based email system in lib/email/.
 * 
 * ⚠️  MIGRATION NOTICE ⚠️
 * 
 * This module was migrated from Gmail SMTP to Resend API to support custom sender
 * addresses. All emails are now sent from noreply@sylvantoken.org instead of
 * sylvantoken@gmail.com.
 * 
 * WHY THE MIGRATION?
 * ------------------
 * Gmail SMTP enforces that the "from" address must match the authenticated account,
 * which prevented us from using our custom domain email address. Resend API allows
 * full control over sender addresses while providing better deliverability, tracking,
 * and webhook support.
 * 
 * WHAT CHANGED?
 * -------------
 * 1. Email delivery now uses Resend API instead of Gmail SMTP
 * 2. All emails are sent from "Sylvan Token <noreply@sylvantoken.org>"
 * 3. Reply-to address is set to "support@sylvantoken.org"
 * 4. Emails are queued using Bull/Redis for better reliability (optional)
 * 5. Email logging and analytics are built-in
 * 6. Webhook support for delivery tracking
 * 
 * BACKWARD COMPATIBILITY
 * ----------------------
 * All existing functions maintain their original signatures and behavior.
 * Rate limiting is preserved through the legacy email-limiter module.
 * No code changes are required in calling code.
 * 
 * MIGRATION GUIDE FOR NEW CODE
 * -----------------------------
 * For new code, use the modern email system directly from lib/email/:
 * 
 * OLD WAY (deprecated):
 * ```typescript
 * import { sendEmail } from '@/lib/email';
 * await sendEmail({ to, subject, html });
 * ```
 * 
 * NEW WAY (recommended):
 * ```typescript
 * import { queueEmail } from '@/lib/email/queue';
 * await queueEmail({ to, subject, html });
 * ```
 * 
 * FUNCTION MIGRATION MAP
 * ----------------------
 * 
 * 1. sendEmail() -> queueEmail()
 *    OLD: import { sendEmail } from '@/lib/email';
 *    NEW: import { queueEmail } from '@/lib/email/queue';
 * 
 * 2. sendWelcomeEmail() -> queueWelcomeEmail()
 *    OLD: await sendWelcomeEmail(to, username, userId);
 *    NEW: await queueWelcomeEmail(userId, to, username, locale);
 * 
 * 3. sendVerificationEmail() -> queueEmail() with template
 *    OLD: await sendVerificationEmail(to, token, userId);
 *    NEW: await queueEmail({
 *           to,
 *           subject: 'Verify Your Email',
 *           template: 'email-verification',
 *           data: { verifyUrl: `${baseUrl}/verify?token=${token}` },
 *           locale: 'en'
 *         });
 * 
 * 4. sendPasswordResetEmail() -> queueEmail() with template
 *    OLD: await sendPasswordResetEmail(to, token, userId);
 *    NEW: await queueEmail({
 *           to,
 *           subject: 'Reset Your Password',
 *           template: 'password-reset',
 *           data: { resetUrl: `${baseUrl}/reset?token=${token}` },
 *           locale: 'en'
 *         });
 * 
 * 5. sendTaskCompletionEmail() -> queueTaskCompletionEmail()
 *    OLD: await sendTaskCompletionEmail(to, taskTitle, points, userId);
 *    NEW: await queueTaskCompletionEmail(userId, to, username, taskTitle, points, totalPoints, locale);
 * 
 * MODERN SYSTEM FEATURES
 * ----------------------
 * The modern email system (lib/email/) provides:
 * 
 * - Email Queue (lib/email/queue.ts):
 *   * Automatic retry with exponential backoff
 *   * Background processing with Bull/Redis
 *   * Priority queue support
 *   * Job status tracking
 * 
 * - Email Client (lib/email/client.ts):
 *   * Resend API integration
 *   * React Email template rendering
 *   * Multi-language support
 *   * Custom sender configuration
 * 
 * - Email Security (lib/email/security.ts):
 *   * Email address validation
 *   * Rate limiting per recipient
 *   * HTML content sanitization
 *   * Email size validation
 *   * Spam indicator detection
 * 
 * - Email Logging (lib/email/logger.ts):
 *   * Database logging of all emails
 *   * Delivery status tracking
 *   * Open and click tracking
 *   * Email analytics
 * 
 * - Email Webhooks (app/api/webhooks/email/route.ts):
 *   * Real-time delivery status updates
 *   * Bounce and complaint handling
 *   * Open and click tracking
 * 
 * CONFIGURATION
 * -------------
 * Required environment variables:
 * 
 * RESEND_API_KEY=re_xxxxxxxxxxxxx          # Required: Resend API key
 * EMAIL_FROM=noreply@sylvantoken.org       # Optional: Sender email (default shown)
 * EMAIL_FROM_NAME=Sylvan Token             # Optional: Sender name (default shown)
 * EMAIL_REPLY_TO=support@sylvantoken.org   # Optional: Reply-to address (default shown)
 * 
 * Optional for production queue:
 * USE_REDIS=true                           # Enable Redis queue
 * REDIS_URL=redis://localhost:6379         # Redis connection URL
 * 
 * TESTING
 * -------
 * Test the email configuration:
 * ```bash
 * npx tsx scripts/test-email-sender.ts your-email@example.com
 * ```
 * 
 * TROUBLESHOOTING
 * ---------------
 * 1. Emails not sending?
 *    - Check RESEND_API_KEY is set correctly
 *    - Verify domain is configured in Resend dashboard
 *    - Check email logs in database for error details
 * 
 * 2. Wrong sender address?
 *    - Verify EMAIL_FROM environment variable
 *    - Check Resend domain verification status
 *    - Review email logs for actual sender used
 * 
 * 3. Rate limiting issues?
 *    - Check email-limiter.ts for rate limit settings
 *    - Review email/security.ts for modern rate limits
 *    - Check email logs for rate limit errors
 * 
 * FUTURE DEPRECATION
 * ------------------
 * This compatibility layer will be maintained for backward compatibility but
 * may be removed in a future major version. Please migrate to the modern
 * email system at your earliest convenience.
 * 
 * For questions or issues, see:
 * - docs/EMAIL_SYSTEM.md - Comprehensive email system documentation
 * - docs/EMAIL_TROUBLESHOOTING.md - Troubleshooting guide
 * - lib/email/README.md - Modern email system API reference
 * 
 * ============================================================================
 */

import { queueEmail, queueWelcomeEmail, queueTaskCompletionEmail } from './email/queue';
import { canSendEmail, recordEmailSent } from './email-limiter';
import { prisma } from './prisma';

/**
 * Send a generic email
 * 
 * @deprecated Use queueEmail from lib/email/queue instead
 * 
 * This function maintains backward compatibility by delegating to the modern
 * queue system. All emails are now sent via Resend API from noreply@sylvantoken.org.
 * 
 * @param options - Email options
 * @returns Promise with success status and message ID
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: any }> {
  try {
    await queueEmail({
      to,
      subject,
      html: html || '',
      text,
    });
    
    return { success: true, messageId: 'queued' };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome email to new user
 * 
 * @deprecated Use queueWelcomeEmail from lib/email/queue instead
 * 
 * This function maintains backward compatibility by delegating to the modern
 * queue system while preserving rate limiting behavior.
 * 
 * @param to - Recipient email address
 * @param username - User's username
 * @param userId - User's ID for rate limiting
 * @returns Promise with success status and message ID
 */
export async function sendWelcomeEmail(
  to: string,
  username: string,
  userId: string
): Promise<{ success: boolean; messageId?: string; error?: any; retryAfter?: number }> {
  // Rate limit check using legacy limiter for backward compatibility
  const limitCheck = canSendEmail(userId, 'welcome');
  if (!limitCheck.allowed) {
    console.warn(`⚠️  Welcome email blocked for ${userId}: ${limitCheck.reason}`);
    return { 
      success: false, 
      error: limitCheck.reason, 
      retryAfter: limitCheck.retryAfter 
    };
  }
  
  try {
    // Delegate to modern queue system
    await queueWelcomeEmail(userId, to, username, 'en');
    
    // Record email sent for rate limiting
    recordEmailSent(userId, 'welcome');
    
    console.log('✅ Welcome email queued:', to);
    return { success: true, messageId: 'queued' };
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return { success: false, error };
  }
}

/**
 * Send email verification email
 * 
 * @deprecated Use queueEmail from lib/email/queue with 'email-verification' template instead
 * 
 * This function maintains backward compatibility by delegating to the modern
 * queue system while preserving rate limiting behavior.
 * 
 * @param to - Recipient email address
 * @param token - Verification token
 * @param userId - User's ID for rate limiting
 * @returns Promise with success status and message ID
 */
export async function sendVerificationEmail(
  to: string,
  token: string,
  userId: string
): Promise<{ success: boolean; messageId?: string; error?: any; retryAfter?: number }> {
  // Rate limit check using legacy limiter for backward compatibility
  const limitCheck = canSendEmail(userId, 'verification');
  if (!limitCheck.allowed) {
    console.warn(`⚠️  Verification email blocked for ${userId}: ${limitCheck.reason}`);
    return { 
      success: false, 
      error: limitCheck.reason, 
      retryAfter: limitCheck.retryAfter 
    };
  }
  
  try {
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
    
    // Delegate to modern queue system with React Email template
    await queueEmail({
      to,
      subject: 'Verify Your Email - Sylvan Token',
      html: '', // Will be replaced by template rendering
      template: 'email-verification',
      data: {
        verifyUrl,
        locale: 'en',
      },
      locale: 'en',
    });
    
    // Record email sent for rate limiting
    recordEmailSent(userId, 'verification');
    
    console.log('✅ Verification email queued:', to);
    return { success: true, messageId: 'queued' };
  } catch (error) {
    console.error('❌ Verification email error:', error);
    return { success: false, error };
  }
}

/**
 * Send password reset email
 * 
 * @deprecated Use queueEmail from lib/email/queue with 'password-reset' template instead
 * 
 * This function maintains backward compatibility by delegating to the modern
 * queue system while preserving rate limiting behavior.
 * 
 * @param to - Recipient email address
 * @param token - Password reset token
 * @param userId - User's ID for rate limiting
 * @returns Promise with success status and message ID
 */
export async function sendPasswordResetEmail(
  to: string,
  token: string,
  userId: string
): Promise<{ success: boolean; messageId?: string; error?: any; retryAfter?: number }> {
  // Rate limit check using legacy limiter for backward compatibility
  const limitCheck = canSendEmail(userId, 'passwordReset');
  if (!limitCheck.allowed) {
    console.warn(`⚠️  Password reset email blocked for ${userId}: ${limitCheck.reason}`);
    return { 
      success: false, 
      error: limitCheck.reason, 
      retryAfter: limitCheck.retryAfter 
    };
  }
  
  try {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    
    // Delegate to modern queue system with React Email template
    await queueEmail({
      to,
      subject: 'Reset Your Password - Sylvan Token',
      html: '', // Will be replaced by template rendering
      template: 'password-reset',
      data: {
        resetUrl,
        locale: 'en',
      },
      locale: 'en',
    });
    
    // Record email sent for rate limiting
    recordEmailSent(userId, 'passwordReset');
    
    console.log('✅ Password reset email queued:', to);
    return { success: true, messageId: 'queued' };
  } catch (error) {
    console.error('❌ Password reset email error:', error);
    return { success: false, error };
  }
}

/**
 * Send task completion notification email
 * 
 * @deprecated Use queueTaskCompletionEmail from lib/email/queue instead
 * 
 * This function maintains backward compatibility by delegating to the modern
 * queue system while preserving rate limiting behavior.
 * 
 * @param to - Recipient email address
 * @param taskTitle - Title of the completed task
 * @param points - Points earned
 * @param userId - User's ID for rate limiting
 * @returns Promise with success status and message ID
 */
export async function sendTaskCompletionEmail(
  to: string,
  taskTitle: string,
  points: number,
  userId: string
): Promise<{ success: boolean; messageId?: string; error?: any; retryAfter?: number }> {
  // Rate limit check using legacy limiter for backward compatibility
  const limitCheck = canSendEmail(userId, 'taskCompletion');
  if (!limitCheck.allowed) {
    console.warn(`⚠️  Task completion email blocked for ${userId}: ${limitCheck.reason}`);
    return { 
      success: false, 
      error: limitCheck.reason, 
      retryAfter: limitCheck.retryAfter 
    };
  }
  
  try {
    // Fetch user data to get username and total points
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        username: true,
        totalPoints: true 
      },
    });
    
    const username = user?.username || 'User';
    const totalPoints = user?.totalPoints || points;
    
    // Delegate to modern queue system
    await queueTaskCompletionEmail(
      userId,
      to,
      username,
      taskTitle,
      points,
      totalPoints,
      'en'
    );
    
    // Record email sent for rate limiting
    recordEmailSent(userId, 'taskCompletion');
    
    console.log('✅ Task completion email queued:', to);
    return { success: true, messageId: 'queued' };
  } catch (error) {
    console.error('❌ Task completion email error:', error);
    return { success: false, error };
  }
}

/**
 * Send test email
 * 
 * @deprecated Use queueEmail from lib/email/queue instead
 * 
 * This function is useful for testing email configuration.
 * 
 * @param to - Recipient email address
 * @returns Promise with success status and message ID
 */
export async function sendTestEmail(
  to: string
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  return sendEmail({
    to,
    subject: 'Test Email - Sylvan Token',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Test Email</h1>
        <p>This is a test email from Sylvan Token.</p>
        <p>If you received this, the email system is working correctly! ✅</p>
        <p>Emails are now sent via Resend from <strong>noreply@sylvantoken.org</strong></p>
        <p>Best regards,<br>Sylvan Token Team</p>
      </div>
    `,
    text: 'Test email from Sylvan Token. Email system is working!',
  });
}
