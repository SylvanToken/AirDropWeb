/**
 * ============================================================================
 * Modern Email Queue System
 * ============================================================================
 * 
 * This is the recommended way to send emails in the application. It provides
 * queuing, retry logic, logging, and webhook support.
 * 
 * USAGE EXAMPLES
 * --------------
 * 
 * 1. Send a simple email:
 * ```typescript
 * import { queueEmail } from '@/lib/email/queue';
 * 
 * await queueEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   html: '<h1>Welcome to Sylvan Token</h1>',
 *   text: 'Welcome to Sylvan Token'
 * });
 * ```
 * 
 * 2. Send email with React Email template:
 * ```typescript
 * await queueEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   template: 'welcome',
 *   data: { username: 'John', locale: 'en' },
 *   locale: 'en'
 * });
 * ```
 * 
 * 3. Send welcome email (convenience function):
 * ```typescript
 * import { queueWelcomeEmail } from '@/lib/email/queue';
 * 
 * await queueWelcomeEmail(
 *   userId,
 *   'user@example.com',
 *   'John',
 *   'en'
 * );
 * ```
 * 
 * 4. Send task completion email:
 * ```typescript
 * import { queueTaskCompletionEmail } from '@/lib/email/queue';
 * 
 * await queueTaskCompletionEmail(
 *   userId,
 *   'user@example.com',
 *   'John',
 *   'Complete Profile',
 *   100,
 *   500,
 *   'en'
 * );
 * ```
 * 
 * QUEUE BEHAVIOR
 * --------------
 * - With Redis (USE_REDIS=true): Emails are queued and processed in background
 * - Without Redis: Emails are sent immediately (synchronous)
 * - Automatic retry with exponential backoff (3 attempts)
 * - Failed emails are logged to database for debugging
 * 
 * SENDER CONFIGURATION
 * --------------------
 * All emails are sent from the configured sender address:
 * - From: "Sylvan Token <noreply@sylvantoken.org>"
 * - Reply-To: "support@sylvantoken.org"
 * 
 * These can be customized via environment variables:
 * - EMAIL_FROM: Sender email address
 * - EMAIL_FROM_NAME: Sender display name
 * - EMAIL_REPLY_TO: Reply-to address
 * 
 * ============================================================================
 */

import Queue, { QueueOptions } from 'bull';
import { sendEmail, EmailOptions, emailConfig } from './client';
import { prisma } from '@/lib/prisma';
import { logEmail, logEmailFailure } from './logger';

// Check if Redis should be used
const useRedis = process.env.USE_REDIS === 'true';

// Configure Redis connection only if enabled
const redisConfig: string | QueueOptions['redis'] | undefined = useRedis
  ? (process.env.REDIS_URL 
      ? process.env.REDIS_URL 
      : {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0', 10),
        })
  : undefined;

// Initialize Bull queue with Redis configuration or in-memory fallback
export const emailQueue = useRedis && redisConfig
  ? new Queue('emails', redisConfig as any, {
      defaultJobOptions: {
        attempts: emailConfig.maxRetries,
        backoff: {
          type: 'exponential',
          delay: emailConfig.retryDelay,
        },
        removeOnComplete: true,
        removeOnFail: false,
        timeout: 30000,
      },
      settings: {
        stalledInterval: 30000,
        maxStalledCount: 2,
      },
    })
  : null as any;

/**
 * Render template and send email
 */
async function renderAndSendTemplate(options: EmailOptions): Promise<void> {
  const { template, data, locale = 'en', to, subject, replyTo } = options;
  
  if (!template || !data) {
    throw new Error('Template and data are required');
  }

  // Import render function and React
  const { render } = await import('@react-email/components');
  const React = await import('react');
  
  // Dynamically import and render the template
  let html: string;
  
  switch (template) {
    case 'welcome': {
      const WelcomeEmail = (await import('@/emails/welcome')).default;
      html = await render(React.createElement(WelcomeEmail, data as any));
      break;
    }
    case 'task-completion': {
      const TaskCompletionEmail = (await import('@/emails/task-completion')).default;
      html = await render(React.createElement(TaskCompletionEmail, data as any));
      break;
    }
    case 'wallet-pending': {
      const WalletPendingEmail = (await import('@/emails/wallet-pending')).default;
      html = await render(React.createElement(WalletPendingEmail, data as any));
      break;
    }
    case 'wallet-approved': {
      const WalletApprovedEmail = (await import('@/emails/wallet-approved')).default;
      html = await render(React.createElement(WalletApprovedEmail, data as any));
      break;
    }
    case 'wallet-rejected': {
      const WalletRejectedEmail = (await import('@/emails/wallet-rejected')).default;
      html = await render(React.createElement(WalletRejectedEmail, data as any));
      break;
    }
    case 'admin-review-needed': {
      const AdminReviewNeededEmail = (await import('@/emails/admin-review-needed')).default;
      html = await render(React.createElement(AdminReviewNeededEmail, data as any));
      break;
    }
    case 'admin-fraud-alert': {
      const AdminFraudAlertEmail = (await import('@/emails/admin-fraud-alert')).default;
      html = await render(React.createElement(AdminFraudAlertEmail, data as any));
      break;
    }
    case 'admin-daily-digest': {
      const AdminDailyDigestEmail = (await import('@/emails/admin-daily-digest')).default;
      html = await render(React.createElement(AdminDailyDigestEmail, data as any));
      break;
    }
    case 'admin-error-alert': {
      const AdminErrorAlertEmail = (await import('@/emails/admin-error-alert')).default;
      html = await render(React.createElement(AdminErrorAlertEmail, data as any));
      break;
    }
    case 'email-verification': {
      const EmailVerificationEmail = (await import('@/emails/email-verification')).default;
      html = await render(React.createElement(EmailVerificationEmail, data as any));
      break;
    }
    case 'password-reset': {
      const PasswordResetEmail = (await import('@/emails/password-reset')).default;
      html = await render(React.createElement(PasswordResetEmail, data as any));
      break;
    }
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
  
  await sendEmail({
    to,
    subject,
    html,
    replyTo,
    template,
    locale,
  });
}

/**
 * Queue email for async sending
 */
export async function queueEmail(options: EmailOptions): Promise<void> {
  // Check if email system is configured
  if (!process.env.RESEND_API_KEY) {
    const errorMsg = 'Email system is not configured (RESEND_API_KEY missing). Email will not be sent.';
    console.warn('⚠️ ', errorMsg);
    
    // Log the failed attempt without throwing
    await logEmailFailure({
      to: options.to,
      subject: options.subject,
      template: options.template || 'unknown',
      error: errorMsg,
      metadata: {
        jobId: 'configuration-missing',
        attemptNumber: 0,
        locale: options.locale,
        reason: 'missing_resend_api_key',
      },
    });
    
    // Don't throw error - fail gracefully
    console.log('📧 Email would have been sent to:', options.to);
    console.log('📧 Subject:', options.subject);
    return;
  }
  
  // If Redis is not enabled, send email directly
  if (!useRedis || !emailQueue) {
    console.log('Redis not enabled, sending email directly:', options.subject);
    try {
      if (options.template && options.data) {
        await renderAndSendTemplate(options);
      } else {
        await sendEmail(options);
      }
      
      await logEmail({
        to: options.to,
        subject: options.subject,
        template: options.template || 'unknown',
        status: 'sent',
        metadata: {
          jobId: 'direct-send',
          attemptNumber: 1,
          locale: options.locale,
        },
      });
      
      console.log('Email sent directly (no queue):', options.subject);
    } catch (error) {
      await logEmailFailure({
        to: options.to,
        subject: options.subject,
        template: options.template || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          jobId: 'direct-send-failed',
          attemptNumber: 1,
          locale: options.locale,
        },
      });
      
      console.error('Failed to send email directly:', error);
      
      // If it's a configuration error, don't throw - fail gracefully
      if (error instanceof Error && error.message.includes('not configured')) {
        console.warn('⚠️  Email system configuration error - continuing without sending email');
        return;
      }
      
      throw error;
    }
    return;
  }
  
  // Use queue if Redis is enabled
  try {
    const job = await emailQueue.add(options, {
      priority: options.template?.includes('admin') ? 1 : 10,
      attempts: emailConfig.maxRetries,
      backoff: {
        type: 'exponential',
        delay: emailConfig.retryDelay,
      },
    });
    
    await logEmail({
      to: options.to,
      subject: options.subject,
      template: options.template || 'unknown',
      status: 'queued',
      metadata: {
        jobId: job.id?.toString() || 'unknown',
        attemptNumber: 1,
        locale: options.locale,
      },
    });
    
    console.log(`Email queued successfully (Job ID: ${job.id}):`, options.subject);
  } catch (error) {
    console.error('Failed to queue email:', error);
    
    await logEmailFailure({
      to: options.to,
      subject: options.subject,
      template: options.template || 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        jobId: 'failed-to-queue',
        attemptNumber: 1,
        locale: options.locale,
      },
    });
    
    throw error;
  }
}

/**
 * Notify admins about permanent email failure
 */
async function notifyAdminsOfEmailFailure(data: {
  jobId: string;
  to: string | string[];
  subject: string;
  template?: string;
  error: string;
  attempts: number;
}): Promise<void> {
  try {
    console.error('ADMIN NOTIFICATION: Email permanently failed', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to notify admins of email failure:', error);
  }
}

// Process email queue
if (emailQueue && typeof emailQueue.process === 'function') {
  emailQueue.process(async (job: any) => {
    const options = job.data as EmailOptions;
    const attemptNumber = job.attemptsMade + 1;
  
    console.log(`Processing email job ${job.id} (attempt ${attemptNumber}/${emailConfig.maxRetries}):`, options.subject);
  
    try {
      await logEmail({
        to: options.to,
        subject: options.subject,
        template: options.template || 'unknown',
        status: 'processing',
        metadata: {
          jobId: job.id?.toString() || 'unknown',
          attemptNumber,
          locale: options.locale,
        },
      });
    
      if (options.template && options.data) {
        await renderAndSendTemplate(options);
      } else {
        await sendEmail(options);
      }
    
      console.log(`Email job ${job.id} completed successfully (attempt ${attemptNumber})`);
    } catch (error) {
      await logEmailFailure({
        to: options.to,
        subject: options.subject,
        template: options.template || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          jobId: job.id?.toString() || 'unknown',
          attemptNumber,
          locale: options.locale,
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      });
    
      console.error(`Email job ${job.id} failed (attempt ${attemptNumber}):`, error);
      throw error;
    }
  });
}

// Handle failed email jobs
if (emailQueue && typeof emailQueue.on === 'function') {
  emailQueue.on('failed', async (job: any, err: any) => {
    console.error(`Email job ${job.id} failed after ${job.attemptsMade} attempts:`, err);
  
    await logEmailFailure({
      to: job.data.to,
      subject: job.data.subject,
      template: job.data.template || 'unknown',
      error: err.message,
      metadata: {
        jobId: job.id?.toString() || 'unknown',
        attemptNumber: job.attemptsMade,
        locale: job.data.locale,
      },
    });
  
    if (job.attemptsMade >= emailConfig.maxRetries) {
      console.error('Email permanently failed after all retry attempts:', {
        jobId: job.id,
        to: job.data.to,
        subject: job.data.subject,
        template: job.data.template,
        error: err.message,
        attempts: job.attemptsMade,
      });
    
      await logEmailFailure({
        to: job.data.to,
        subject: job.data.subject,
        template: job.data.template || 'unknown',
        error: `Failed after ${job.attemptsMade} attempts: ${err.message}`,
        metadata: {
          jobId: job.id?.toString() || 'unknown',
          attemptNumber: job.attemptsMade,
          locale: job.data.locale,
          permanentFailure: true,
        },
      });
    
      if (job.data.template?.includes('admin') || job.data.template === 'welcome') {
        await notifyAdminsOfEmailFailure({
          jobId: job.id?.toString() || 'unknown',
          to: job.data.to,
          subject: job.data.subject,
          template: job.data.template,
          error: err.message,
          attempts: job.attemptsMade,
        });
      }
    }
  });

  emailQueue.on('completed', async (job: any) => {
    console.log(`Email job ${job.id} completed successfully:`, job.data.subject);
  });

  emailQueue.on('stalled', async (job: any) => {
    console.warn(`Email job ${job.id} stalled (will be retried):`, job.data.subject);
  
    await logEmailFailure({
      to: job.data.to,
      subject: job.data.subject,
      template: job.data.template || 'unknown',
      error: 'Job stalled and will be retried',
      metadata: {
        jobId: job.id?.toString() || 'unknown',
        attemptNumber: job.attemptsMade,
        locale: job.data.locale,
        stalled: true,
      },
    });
  });

  emailQueue.on('error', (error: any) => {
    console.error('Email queue error:', error);
  });

  emailQueue.on('ready', () => {
    console.log('Email queue is ready and connected to Redis');
  });

  emailQueue.on('active', (job: any) => {
    console.log(`Email job ${job.id} started processing:`, job.data.subject);
  });

  emailQueue.on('waiting', (jobId: any) => {
    console.log(`Email job ${jobId} is waiting in queue`);
  });

  emailQueue.on('progress', (job: any, progress: any) => {
    console.log(`Email job ${job.id} progress: ${progress}%`);
  });
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  if (!useRedis || !emailQueue) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      total: 0,
    };
  }
  
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

/**
 * Clear completed jobs from queue
 */
export async function clearCompletedJobs(): Promise<void> {
  if (!useRedis || !emailQueue) {
    console.log('Queue not available (Redis disabled)');
    return;
  }
  await emailQueue.clean(0, 'completed');
  console.log('Cleared completed email jobs');
}

/**
 * Clear failed jobs from queue
 */
export async function clearFailedJobs(): Promise<void> {
  if (!useRedis || !emailQueue) {
    console.log('Queue not available (Redis disabled)');
    return;
  }
  await emailQueue.clean(0, 'failed');
  console.log('Cleared failed email jobs');
}

/**
 * Pause email queue processing
 */
export async function pauseQueue(): Promise<void> {
  if (!useRedis || !emailQueue) {
    console.log('Queue not available (Redis disabled)');
    return;
  }
  await emailQueue.pause();
  console.log('Email queue paused');
}

/**
 * Resume email queue processing
 */
export async function resumeQueue(): Promise<void> {
  if (!useRedis || !emailQueue) {
    console.log('Queue not available (Redis disabled)');
    return;
  }
  await emailQueue.resume();
  console.log('Email queue resumed');
}

/**
 * Close email queue connection
 */
export async function closeQueue(): Promise<void> {
  if (!useRedis || !emailQueue) {
    console.log('Queue not available (Redis disabled)');
    return;
  }
  await emailQueue.close();
  console.log('Email queue closed');
}

/**
 * Get localized welcome email subject
 */
function getWelcomeEmailSubject(locale: string): string {
  const subjects: Record<string, string> = {
    en: 'Welcome to Sylvan Token! 🌿',
    tr: 'Sylvan Token\'a Hoş Geldiniz! 🌿',
    de: 'Willkommen bei Sylvan Token! 🌿',
    zh: '欢迎来到 Sylvan Token！🌿',
    ru: 'Добро пожаловать в Sylvan Token! 🌿',
  };
  
  return subjects[locale] || subjects.en;
}

/**
 * Queue welcome email for new user
 */
export async function queueWelcomeEmail(
  userId: string,
  email: string,
  username: string,
  locale: string = 'en'
): Promise<void> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
    const dashboardUrl = `${baseUrl}/${locale}/dashboard`;
    
    await queueEmail({
      to: email,
      subject: getWelcomeEmailSubject(locale),
      html: '',
      template: 'welcome',
      locale,
      data: {
        username,
        dashboardUrl,
        locale,
      },
    });
    
    console.log(`Welcome email queued for user ${userId} (${email})`);
  } catch (error) {
    // Log error but don't throw - email failures shouldn't break user registration
    console.error('Failed to queue welcome email:', error);
    if (error instanceof Error && !error.message.includes('not configured')) {
      console.error('Error details:', error.message);
    }
  }
}

/**
 * Get localized task completion email subject
 */
function getTaskCompletionEmailSubject(locale: string, points: number): string {
  const subjects: Record<string, string> = {
    en: `Congratulations! You earned ${points} points 🎉`,
    tr: `Tebrikler! ${points} puan kazandınız 🎉`,
    de: `Glückwunsch! Sie haben ${points} Punkte verdient 🎉`,
    zh: `恭喜！您获得了 ${points} 积分 🎉`,
    ru: `Поздравляем! Вы заработали ${points} баллов 🎉`,
  };
  
  return subjects[locale] || subjects.en;
}

/**
 * Check if user has enabled email notifications for a specific type
 */
async function checkEmailPreference(
  userId: string,
  emailType: 'taskCompletions' | 'walletVerifications' | 'adminNotifications' | 'marketingEmails'
): Promise<boolean> {
  try {
    if (!('emailPreference' in prisma)) {
      const defaults = {
        taskCompletions: true,
        walletVerifications: true,
        adminNotifications: true,
        marketingEmails: false,
      };
      return defaults[emailType];
    }
    
    const preferences = await (prisma as any).emailPreference.findUnique({
      where: { userId },
    });
    
    if (!preferences) {
      const defaults = {
        taskCompletions: true,
        walletVerifications: true,
        adminNotifications: true,
        marketingEmails: false,
      };
      return defaults[emailType];
    }
    
    return preferences[emailType];
  } catch (error) {
    console.error('Failed to check email preference:', error);
    return true;
  }
}

/**
 * Queue task completion email for user
 */
export async function queueTaskCompletionEmail(
  userId: string,
  email: string,
  username: string,
  taskName: string,
  points: number,
  totalPoints: number,
  locale: string = 'en'
): Promise<void> {
  try {
    const hasPreference = await checkEmailPreference(userId, 'taskCompletions');
    
    if (!hasPreference) {
      console.log(`Task completion email skipped for user ${userId} (disabled by preference)`);
      return;
    }
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
    const dashboardUrl = `${baseUrl}/${locale}/dashboard`;
    
    await queueEmail({
      to: email,
      subject: getTaskCompletionEmailSubject(locale, points),
      html: '',
      template: 'task-completion',
      locale,
      data: {
        username,
        taskName,
        points,
        totalPoints,
        dashboardUrl,
        locale,
      },
    });
    
    console.log(`Task completion email queued for user ${userId} (${email})`);
  } catch (error) {
    // Log error but don't throw - email failures shouldn't break task completion
    console.error('Failed to queue task completion email:', error);
    if (error instanceof Error && !error.message.includes('not configured')) {
      console.error('Error details:', error.message);
    }
  }
}

/**
 * Get localized wallet pending email subject
 */
function getWalletPendingEmailSubject(locale: string): string {
  const subjects: Record<string, string> = {
    en: 'Wallet Verification Pending ⏳',
    tr: 'Cüzdan Doğrulama Beklemede ⏳',
    de: 'Wallet-Verifizierung ausstehend ⏳',
    zh: '钱包验证待处理 ⏳',
    ru: 'Верификация кошелька ожидает рассмотрения ⏳',
  };
  
  return subjects[locale] || subjects.en;
}

/**
 * Queue wallet pending verification email for user
 */
export async function queueWalletPendingEmail(
  userId: string,
  email: string,
  username: string,
  walletAddress: string,
  locale: string = 'en'
): Promise<void> {
  try {
    const hasPreference = await checkEmailPreference(userId, 'walletVerifications');
    
    if (!hasPreference) {
      console.log(`Wallet pending email skipped for user ${userId} (disabled by preference)`);
      return;
    }
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
    const walletStatusUrl = `${baseUrl}/${locale}/wallet`;
    
    await queueEmail({
      to: email,
      subject: getWalletPendingEmailSubject(locale),
      html: '',
      template: 'wallet-pending',
      locale,
      data: {
        username,
        walletAddress,
        walletStatusUrl,
        locale,
      },
    });
    
    console.log(`Wallet pending email queued for user ${userId} (${email})`);
  } catch (error) {
    console.error('Failed to queue wallet pending email:', error);
  }
}

/**
 * Get localized wallet approved email subject
 */
function getWalletApprovedEmailSubject(locale: string): string {
  const subjects: Record<string, string> = {
    en: 'Wallet Verified! ✅',
    tr: 'Cüzdan Doğrulandı! ✅',
    de: 'Wallet verifiziert! ✅',
    zh: '钱包已验证！✅',
    ru: 'Кошелек верифицирован! ✅',
  };
  
  return subjects[locale] || subjects.en;
}

/**
 * Queue wallet approved email for user
 */
export async function queueWalletApprovedEmail(
  userId: string,
  email: string,
  username: string,
  walletAddress: string,
  locale: string = 'en'
): Promise<void> {
  try {
    const hasPreference = await checkEmailPreference(userId, 'walletVerifications');
    
    if (!hasPreference) {
      console.log(`Wallet approved email skipped for user ${userId} (disabled by preference)`);
      return;
    }
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
    const dashboardUrl = `${baseUrl}/${locale}/dashboard`;
    
    await queueEmail({
      to: email,
      subject: getWalletApprovedEmailSubject(locale),
      html: '',
      template: 'wallet-approved',
      locale,
      data: {
        username,
        walletAddress,
        dashboardUrl,
        locale,
      },
    });
    
    console.log(`Wallet approved email queued for user ${userId} (${email})`);
  } catch (error) {
    console.error('Failed to queue wallet approved email:', error);
  }
}

/**
 * Get localized wallet rejected email subject
 */
function getWalletRejectedEmailSubject(locale: string): string {
  const subjects: Record<string, string> = {
    en: 'Wallet Verification Issue ⚠️',
    tr: 'Cüzdan Doğrulama Sorunu ⚠️',
    de: 'Problem bei der Wallet-Verifizierung ⚠️',
    zh: '钱包验证问题 ⚠️',
    ru: 'Проблема с верификацией кошелька ⚠️',
  };
  
  return subjects[locale] || subjects.en;
}

/**
 * Queue wallet rejected email for user
 */
export async function queueWalletRejectedEmail(
  userId: string,
  email: string,
  username: string,
  walletAddress: string,
  rejectionReason: string,
  locale: string = 'en'
): Promise<void> {
  try {
    const hasPreference = await checkEmailPreference(userId, 'walletVerifications');
    
    if (!hasPreference) {
      console.log(`Wallet rejected email skipped for user ${userId} (disabled by preference)`);
      return;
    }
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
    const updateWalletUrl = `${baseUrl}/${locale}/wallet`;
    
    await queueEmail({
      to: email,
      subject: getWalletRejectedEmailSubject(locale),
      html: '',
      template: 'wallet-rejected',
      locale,
      data: {
        username,
        walletAddress,
        rejectionReason,
        updateWalletUrl,
        locale,
      },
    });
    
    console.log(`Wallet rejected email queued for user ${userId} (${email})`);
  } catch (error) {
    console.error('Failed to queue wallet rejected email:', error);
  }
}

/**
 * Get admin email addresses from environment or database
 */
async function getAdminEmails(): Promise<string[]> {
  const envAdminEmails = process.env.ADMIN_EMAILS;
  if (envAdminEmails) {
    return envAdminEmails.split(',').map(email => email.trim()).filter(Boolean);
  }
  
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
      select: {
        email: true,
      },
    });
    
    return admins
      .map(admin => admin.email)
      .filter((email): email is string => email !== null && email !== undefined);
  } catch (error) {
    console.error('Failed to fetch admin emails from database:', error);
    return [];
  }
}

/**
 * Get localized admin review needed email subject
 */
function getAdminReviewNeededEmailSubject(locale: string): string {
  const subjects: Record<string, string> = {
    en: 'Manual Review Required 📋',
    tr: 'Manuel İnceleme Gerekli 📋',
    de: 'Manuelle Überprüfung erforderlich 📋',
    zh: '需要人工审核 📋',
    ru: 'Требуется ручная проверка 📋',
  };
  
  return subjects[locale] || subjects.en;
}

/**
 * Queue admin review needed email
 */
export async function queueAdminReviewNeededEmail(
  userName: string,
  userId: string,
  taskName: string,
  completionId: string,
  submittedAt: string,
  locale: string = 'en'
): Promise<void> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
    const reviewUrl = `${baseUrl}/admin/verifications`;
    
    const adminEmails = await getAdminEmails();
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for review notifications');
      return;
    }
    
    await queueEmail({
      to: adminEmails,
      subject: getAdminReviewNeededEmailSubject(locale),
      html: '',
      template: 'admin-review-needed',
      locale,
      data: {
        userName,
        userId,
        taskName,
        completionId,
        submittedAt,
        reviewUrl,
        locale,
      },
    });
    
    console.log(`Admin review needed email queued for completion ${completionId}`);
  } catch (error) {
    console.error('Failed to queue admin review needed email:', error);
  }
}

/**
 * Get localized admin fraud alert email subject
 */
function getAdminFraudAlertEmailSubject(locale: string, riskLevel: 'HIGH' | 'CRITICAL'): string {
  const subjects: Record<string, Record<string, string>> = {
    en: {
      HIGH: '🚨 High Fraud Alert - Immediate Review Required',
      CRITICAL: '🚨 CRITICAL Fraud Alert - Urgent Action Required',
    },
    tr: {
      HIGH: '🚨 Yüksek Dolandırıcılık Uyarısı - Acil İnceleme Gerekli',
      CRITICAL: '🚨 KRİTİK Dolandırıcılık Uyarısı - Acil Eylem Gerekli',
    },
    de: {
      HIGH: '🚨 Hoher Betrugsalarm - Sofortige Überprüfung erforderlich',
      CRITICAL: '🚨 KRITISCHER Betrugsalarm - Dringende Maßnahmen erforderlich',
    },
    zh: {
      HIGH: '🚨 高欺诈警报 - 需要立即审查',
      CRITICAL: '🚨 严重欺诈警报 - 需要紧急行动',
    },
    ru: {
      HIGH: '🚨 Высокое предупреждение о мошенничестве - Требуется немедленная проверка',
      CRITICAL: '🚨 КРИТИЧЕСКОЕ предупреждение о мошенничестве - Требуются срочные действия',
    },
  };
  
  return subjects[locale]?.[riskLevel] || subjects.en[riskLevel];
}

/**
 * Queue admin fraud alert email
 */
export async function queueAdminFraudAlertEmail(
  userName: string,
  userId: string,
  userEmail: string,
  fraudScore: number,
  riskLevel: 'HIGH' | 'CRITICAL',
  reasons: string[],
  locale: string = 'en'
): Promise<void> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
    const investigateUrl = `${baseUrl}/admin/users/${userId}`;
    
    const adminEmails = await getAdminEmails();
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for fraud alerts');
      return;
    }
    
    await queueEmail({
      to: adminEmails,
      subject: getAdminFraudAlertEmailSubject(locale, riskLevel),
      html: '',
      template: 'admin-fraud-alert',
      locale,
      data: {
        userName,
        userId,
        userEmail,
        fraudScore,
        riskLevel,
        reasons,
        investigateUrl,
        locale,
      },
    });
    
    console.log(`Admin fraud alert email queued for user ${userId} (score: ${fraudScore})`);
  } catch (error) {
    console.error('Failed to queue admin fraud alert email:', error);
  }
}

/**
 * Get localized admin daily digest email subject
 */
function getAdminDailyDigestEmailSubject(locale: string, date: string): string {
  const subjects: Record<string, string> = {
    en: `Daily Platform Summary - ${date} 📊`,
    tr: `Günlük Platform Özeti - ${date} 📊`,
    de: `Tägliche Plattformzusammenfassung - ${date} 📊`,
    zh: `每日平台摘要 - ${date} 📊`,
    ru: `Ежедневная сводка платформы - ${date} 📊`,
  };
  
  return subjects[locale] || subjects.en;
}

/**
 * Queue admin daily digest email
 */
export async function queueAdminDailyDigestEmail(
  date: string,
  stats: {
    newUsers: number;
    taskCompletions: number;
    pendingReviews: number;
    totalUsers: number;
    totalPoints: number;
    topTask?: {
      name: string;
      completions: number;
    };
  },
  locale: string = 'en'
): Promise<void> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
    const dashboardUrl = `${baseUrl}/admin/dashboard`;
    
    const adminEmails = await getAdminEmails();
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for daily digest');
      return;
    }
    
    await queueEmail({
      to: adminEmails,
      subject: getAdminDailyDigestEmailSubject(locale, date),
      html: '',
      template: 'admin-daily-digest',
      locale,
      data: {
        date,
        ...stats,
        dashboardUrl,
        locale,
      },
    });
    
    console.log(`Admin daily digest email queued for ${date}`);
  } catch (error) {
    console.error('Failed to queue admin daily digest email:', error);
  }
}

/**
 * Get localized admin error alert email subject
 */
function getAdminErrorAlertEmailSubject(locale: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string {
  const subjects: Record<string, Record<string, string>> = {
    en: {
      LOW: 'System Error - Low Priority ℹ️',
      MEDIUM: 'System Error - Medium Priority ⚠️',
      HIGH: 'System Error - High Priority 🔴',
      CRITICAL: '🚨 CRITICAL System Error - Immediate Action Required',
    },
    tr: {
      LOW: 'Sistem Hatası - Düşük Öncelik ℹ️',
      MEDIUM: 'Sistem Hatası - Orta Öncelik ⚠️',
      HIGH: 'Sistem Hatası - Yüksek Öncelik 🔴',
      CRITICAL: '🚨 KRİTİK Sistem Hatası - Acil Eylem Gerekli',
    },
    de: {
      LOW: 'Systemfehler - Niedrige Priorität ℹ️',
      MEDIUM: 'Systemfehler - Mittlere Priorität ⚠️',
      HIGH: 'Systemfehler - Hohe Priorität 🔴',
      CRITICAL: '🚨 KRITISCHER Systemfehler - Sofortige Maßnahmen erforderlich',
    },
    zh: {
      LOW: '系统错误 - 低优先级 ℹ️',
      MEDIUM: '系统错误 - 中优先级 ⚠️',
      HIGH: '系统错误 - 高优先级 🔴',
      CRITICAL: '🚨 严重系统错误 - 需要立即采取行动',
    },
    ru: {
      LOW: 'Системная ошибка - Низкий приоритет ℹ️',
      MEDIUM: 'Системная ошибка - Средний приоритет ⚠️',
      HIGH: 'Системная ошибка - Высокий приоритет 🔴',
      CRITICAL: '🚨 КРИТИЧЕСКАЯ системная ошибка - Требуются немедленные действия',
    },
  };
  
  return subjects[locale]?.[severity] || subjects.en[severity];
}

/**
 * Queue admin error alert email
 */
export async function queueAdminErrorAlertEmail(
  errorType: string,
  errorMessage: string,
  errorStack: string | undefined,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  affectedUsers?: number,
  endpoint?: string,
  locale: string = 'en'
): Promise<void> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
    const detailsUrl = `${baseUrl}/admin/logs`;
    
    const adminEmails = await getAdminEmails();
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for error alerts');
      return;
    }
    
    if (severity !== 'HIGH' && severity !== 'CRITICAL') {
      console.log(`Skipping email for ${severity} severity error`);
      return;
    }
    
    await queueEmail({
      to: adminEmails,
      subject: getAdminErrorAlertEmailSubject(locale, severity),
      html: '',
      template: 'admin-error-alert',
      locale,
      data: {
        errorType,
        errorMessage,
        errorStack,
        timestamp: new Date().toISOString(),
        severity,
        affectedUsers,
        endpoint,
        detailsUrl,
        locale,
      },
    });
    
    console.log(`Admin error alert email queued (severity: ${severity})`);
  } catch (error) {
    console.error('Failed to queue admin error alert email:', error);
  }
}
