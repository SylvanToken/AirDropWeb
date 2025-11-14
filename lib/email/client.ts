/**
 * ============================================================================
 * Email Client - Resend API Integration
 * ============================================================================
 * 
 * This module provides the core email sending functionality using Resend API.
 * It handles email rendering, validation, security checks, and delivery.
 * 
 * MIGRATION FROM GMAIL SMTP
 * -------------------------
 * This module replaced the old Gmail SMTP implementation to support custom
 * sender addresses. Key improvements:
 * 
 * 1. Custom Sender Domain: Emails sent from noreply@sylvantoken.org
 * 2. Better Deliverability: Resend provides better inbox placement
 * 3. Webhook Support: Real-time delivery status updates
 * 4. Analytics: Built-in open and click tracking
 * 5. Template Support: React Email components for beautiful emails
 * 
 * CONFIGURATION
 * -------------
 * Environment variables (see .env.example):
 * 
 * Required:
 * - RESEND_API_KEY: Your Resend API key from https://resend.com/api-keys
 * 
 * Optional (with defaults):
 * - EMAIL_FROM: Sender email address (default: noreply@sylvantoken.org)
 * - EMAIL_FROM_NAME: Sender display name (default: Sylvan Token)
 * - EMAIL_REPLY_TO: Reply-to address (default: support@sylvantoken.org)
 * 
 * USAGE
 * -----
 * This module is typically used through the queue system (lib/email/queue.ts)
 * rather than directly. For direct usage:
 * 
 * ```typescript
 * import { sendEmail } from '@/lib/email/client';
 * 
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   html: '<h1>Welcome</h1>',
 *   text: 'Welcome'
 * });
 * ```
 * 
 * SECURITY FEATURES
 * -----------------
 * All emails are automatically validated and sanitized:
 * - Email address format validation
 * - Rate limiting per recipient
 * - HTML content sanitization
 * - Email size validation (max 100KB)
 * - Spam indicator detection
 * 
 * SENDER ADDRESS
 * --------------
 * All emails are sent from the configured sender address in emailConfig.
 * The sender address is constructed from environment variables:
 * 
 * Format: "{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
 * Example: "Sylvan Token <noreply@sylvantoken.org>"
 * 
 * Reply-to is set to EMAIL_REPLY_TO for user responses.
 * 
 * ============================================================================
 */

import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { logEmail, logEmailFailure } from './logger';
import {
  validateEmailAddress,
  validateEmailAddresses,
  sanitizeHtmlContent,
  sanitizeUserText,
  checkEmailRateLimit,
  validateEmailSize,
  checkSpamIndicators,
  logSecurityEvent,
} from './security';

/**
 * Validate email environment variables on startup
 * Checks for required variables and logs warnings for missing optional ones
 */
export function validateEmailEnvironment(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY is required but not configured. Get your API key from https://resend.com/api-keys');
  }

  // Check optional variables and provide warnings
  if (!process.env.EMAIL_FROM) {
    warnings.push('EMAIL_FROM is not set, using default: noreply@sylvantoken.org');
  }

  if (!process.env.EMAIL_FROM_NAME) {
    warnings.push('EMAIL_FROM_NAME is not set, using default: Sylvan Token');
  }

  if (!process.env.EMAIL_REPLY_TO) {
    warnings.push('EMAIL_REPLY_TO is not set, using default: support@sylvantoken.org');
  }

  // Log results
  if (errors.length > 0) {
    console.error('❌ Email configuration errors:');
    errors.forEach((error) => console.error(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Email configuration warnings:');
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Email configuration validated successfully');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate environment on module load (but don't throw errors)
const envValidation = validateEmailEnvironment();

// Initialize Resend client only if configuration is valid
// If invalid, set to null and handle gracefully in sendEmail function
export const resend = envValidation.isValid && process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email configuration constants
// Reads from environment variables with fallback values for backward compatibility
export const emailConfig = {
  from: `${process.env.EMAIL_FROM_NAME || 'Sylvan Token'} <${process.env.EMAIL_FROM || 'noreply@sylvantoken.org'}>`,
  replyTo: process.env.EMAIL_REPLY_TO || 'support@sylvantoken.org',
  defaultLocale: 'en',
  supportedLocales: ['en', 'tr', 'de', 'zh', 'ru'],
  maxRetries: 3,
  retryDelay: 2000, // milliseconds
  maxEmailSizeKb: 100,
  rateLimitPerHour: 10,
} as const;

// Email options interface
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  locale?: string;
  template?: string;
  data?: Record<string, any>;
  skipValidation?: boolean; // For internal/admin emails
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
    cid?: string; // Content-ID for inline images
  }>;
}

/**
 * Send email using Resend with security checks
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const {
    to,
    subject,
    html,
    text,
    replyTo = emailConfig.replyTo,
    template = 'unknown',
    skipValidation = false,
  } = options;

  try {
    // Validate email configuration
    if (!process.env.RESEND_API_KEY || !resend) {
      const errorMsg = 'Email system is not configured. Please set RESEND_API_KEY environment variable. Get your API key from https://resend.com/api-keys';
      console.error('❌ Email configuration error:', errorMsg);
      
      // Log the failed attempt
      await logEmailFailure({
        to,
        subject,
        template,
        error: errorMsg,
        metadata: {
          locale: options.locale,
          timestamp: new Date().toISOString(),
          reason: 'missing_configuration',
        },
      });
      
      throw new Error(errorMsg);
    }

    // Convert to array for consistent processing
    const recipients = Array.isArray(to) ? to : [to];

    // Security: Validate email addresses
    if (!skipValidation) {
      const validation = validateEmailAddresses(recipients);
      
      if (validation.invalid.length > 0) {
        const errors = validation.invalid.map((i) => `${i.email}: ${i.error}`).join(', ');
        
        logSecurityEvent({
          action: 'email_validation_failed',
          recipient: recipients.join(', '),
          result: 'blocked',
          reason: errors,
        });
        
        throw new Error(`Invalid email addresses: ${errors}`);
      }

      // Security: Check rate limits for each recipient
      for (const recipient of recipients) {
        const rateLimit = checkEmailRateLimit(
          recipient,
          emailConfig.rateLimitPerHour
        );
        
        if (!rateLimit.allowed) {
          logSecurityEvent({
            action: 'rate_limit_exceeded',
            recipient,
            result: 'blocked',
            reason: `Rate limit exceeded, resets at ${new Date(rateLimit.resetAt!).toISOString()}`,
          });
          
          throw new Error(`Rate limit exceeded for ${recipient}`);
        }
      }

      // Security: Validate email size
      const sizeValidation = validateEmailSize(html, emailConfig.maxEmailSizeKb);
      if (!sizeValidation.isValid) {
        logSecurityEvent({
          action: 'email_size_exceeded',
          recipient: recipients.join(', '),
          result: 'blocked',
          reason: sizeValidation.error,
          metadata: { sizeKb: sizeValidation.sizeKb },
        });
        
        throw new Error(sizeValidation.error);
      }

      // Security: Check for spam indicators
      const spamCheck = checkSpamIndicators(subject, html);
      if (spamCheck.isSpammy) {
        logSecurityEvent({
          action: 'spam_detected',
          recipient: recipients.join(', '),
          result: 'blocked',
          reason: `Spam score: ${spamCheck.score}`,
          metadata: { indicators: spamCheck.indicators },
        });
        
        console.warn('Email flagged as potentially spammy:', spamCheck.indicators);
        // Don't block, but log for review
      }
    }

    // Security: Sanitize HTML content
    const sanitizedHtml = sanitizeHtmlContent(html);

    // Send email via Resend
    const result = await resend.emails.send({
      from: emailConfig.from,
      to: recipients,
      subject,
      html: sanitizedHtml,
      text,
      replyTo,
      attachments: options.attachments,
    });

    // Log successful send with comprehensive data
    await logEmail({
      to,
      subject,
      template,
      status: 'sent',
      metadata: {
        resendId: result.data?.id,
        locale: options.locale,
        timestamp: new Date().toISOString(),
        recipientCount: recipients.length,
      },
    });

    logSecurityEvent({
      action: 'email_sent',
      recipient: recipients.join(', '),
      result: 'success',
      metadata: {
        template,
        resendId: result.data?.id,
      },
    });

    console.log('Email sent successfully:', result);
  } catch (error) {
    // Log failed send with error details
    await logEmailFailure({
      to,
      subject,
      template,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        locale: options.locale,
        timestamp: new Date().toISOString(),
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    });

    logSecurityEvent({
      action: 'email_send_failed',
      recipient: Array.isArray(to) ? to.join(', ') : to,
      result: 'failed',
      reason: error instanceof Error ? error.message : 'Unknown error',
    });

    console.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * Validate email address format
 * @deprecated Use validateEmailAddress from security module instead
 */
export function isValidEmail(email: string): boolean {
  const result = validateEmailAddress(email);
  return result.isValid;
}

/**
 * Sanitize email content to prevent injection
 * @deprecated Use sanitizeHtmlContent from security module instead
 */
export function sanitizeEmailContent(content: string): string {
  return sanitizeHtmlContent(content);
}

/**
 * Render and send email template
 * 
 * @param template - React Email component
 * @param props - Props for the template
 * @param options - Email sending options
 */
export async function sendEmailTemplate<T extends Record<string, any>>(
  template: React.ComponentType<T>,
  props: T,
  options: {
    to: string | string[];
    subject: string;
    replyTo?: string;
    templateName?: string;
  }
): Promise<void> {
  try {
    // Render the React Email template to HTML
    const html = await render(React.createElement(template, props));
    
    // Send the email
    await sendEmail({
      to: options.to,
      subject: options.subject,
      html,
      replyTo: options.replyTo,
      template: options.templateName,
      locale: (props as any).locale,
    });
  } catch (error) {
    console.error('Failed to render and send email template:', error);
    throw error;
  }
}
