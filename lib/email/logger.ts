import { prisma } from '@/lib/prisma';

/**
 * Email logging utility for tracking email delivery and engagement
 * 
 * This module provides comprehensive logging for all email operations including:
 * - Email sending attempts
 * - Delivery status tracking
 * - Open and click event tracking
 * - Error logging for failed emails
 */

// Email log status types
export type EmailStatus = 
  | 'queued'       // Email added to queue
  | 'processing'   // Email being processed
  | 'sent'         // Email sent to provider
  | 'delivered'    // Email delivered to recipient
  | 'failed'       // Email failed to send
  | 'bounced'      // Email bounced
  | 'opened'       // Email opened by recipient
  | 'clicked';     // Link clicked in email

// Email log data interface
export interface EmailLogData {
  to: string | string[];
  subject: string;
  template: string;
  status: EmailStatus;
  error?: string;
  metadata?: Record<string, any>;
}

// Email event data interface
export interface EmailEventData {
  emailId: string;
  eventType: 'opened' | 'clicked';
  timestamp?: Date;
  metadata?: Record<string, any>;
}

/**
 * Log email to database
 * 
 * Creates a new email log entry with the provided data.
 * This is the primary function for logging all email operations.
 * 
 * @param data - Email log data
 * @returns The created email log ID, or null if logging failed
 */
export async function logEmail(data: EmailLogData): Promise<string | null> {
  try {
    // Normalize recipient email(s) to string
    const recipientEmail = Array.isArray(data.to) 
      ? data.to.join(',') 
      : data.to;

    // Create email log entry
    const emailLog = await prisma.emailLog.create({
      data: {
        to: recipientEmail,
        subject: data.subject,
        template: data.template,
        status: data.status,
        error: data.error,
        sentAt: new Date(),
      },
    });

    console.log(`Email logged: ${emailLog.id} (${data.status}) - ${data.subject}`);
    return emailLog.id;
  } catch (error) {
    console.error('Failed to log email:', error);
    // Don't throw - logging failures shouldn't break email sending
    return null;
  }
}

/**
 * Update email log status
 * 
 * Updates an existing email log entry with a new status.
 * Used for tracking email lifecycle (sent -> delivered -> opened -> clicked).
 * 
 * @param emailId - Email log ID
 * @param status - New status
 * @param error - Optional error message
 * @returns true if update succeeded, false otherwise
 */
export async function updateEmailStatus(
  emailId: string,
  status: EmailStatus,
  error?: string
): Promise<boolean> {
  try {
    await prisma.emailLog.update({
      where: { id: emailId },
      data: {
        status,
        error,
      },
    });

    console.log(`Email status updated: ${emailId} -> ${status}`);
    return true;
  } catch (error) {
    console.error('Failed to update email status:', error);
    return false;
  }
}

/**
 * Log email delivery
 * 
 * Marks an email as delivered. This is typically called from webhook handlers
 * when the email provider confirms delivery.
 * 
 * @param emailId - Email log ID
 * @returns true if update succeeded, false otherwise
 */
export async function logEmailDelivery(emailId: string): Promise<boolean> {
  try {
    await prisma.emailLog.update({
      where: { id: emailId },
      data: {
        status: 'delivered',
      },
    });

    console.log(`Email delivered: ${emailId}`);
    return true;
  } catch (error) {
    console.error('Failed to log email delivery:', error);
    return false;
  }
}

/**
 * Log email bounce
 * 
 * Marks an email as bounced. This is typically called from webhook handlers
 * when the email provider reports a bounce.
 * 
 * @param emailId - Email log ID
 * @param bounceReason - Reason for bounce
 * @returns true if update succeeded, false otherwise
 */
export async function logEmailBounce(
  emailId: string,
  bounceReason?: string
): Promise<boolean> {
  try {
    await prisma.emailLog.update({
      where: { id: emailId },
      data: {
        status: 'bounced',
        error: bounceReason,
      },
    });

    console.log(`Email bounced: ${emailId} - ${bounceReason || 'Unknown reason'}`);
    return true;
  } catch (error) {
    console.error('Failed to log email bounce:', error);
    return false;
  }
}

/**
 * Log email open event
 * 
 * Records when a recipient opens an email. This is typically called from
 * webhook handlers when the email provider tracks an open event.
 * 
 * @param emailId - Email log ID
 * @returns true if update succeeded, false otherwise
 */
export async function logEmailOpen(emailId: string): Promise<boolean> {
  try {
    // Get current email log to check if already opened
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailId },
      select: { openedAt: true },
    });

    // Only update if not already opened (track first open)
    if (!emailLog?.openedAt) {
      await prisma.emailLog.update({
        where: { id: emailId },
        data: {
          status: 'opened',
          openedAt: new Date(),
        },
      });

      console.log(`Email opened: ${emailId}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to log email open:', error);
    return false;
  }
}

/**
 * Log email click event
 * 
 * Records when a recipient clicks a link in an email. This is typically called
 * from webhook handlers when the email provider tracks a click event.
 * 
 * @param emailId - Email log ID
 * @returns true if update succeeded, false otherwise
 */
export async function logEmailClick(emailId: string): Promise<boolean> {
  try {
    // Get current email log to check if already clicked
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailId },
      select: { clickedAt: true },
    });

    // Only update if not already clicked (track first click)
    if (!emailLog?.clickedAt) {
      await prisma.emailLog.update({
        where: { id: emailId },
        data: {
          status: 'clicked',
          clickedAt: new Date(),
        },
      });

      console.log(`Email clicked: ${emailId}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to log email click:', error);
    return false;
  }
}

/**
 * Log email failure
 * 
 * Records when an email fails to send. Includes error details for debugging.
 * 
 * @param data - Email log data with error information
 * @returns The created email log ID, or null if logging failed
 */
export async function logEmailFailure(
  data: Omit<EmailLogData, 'status'> & { error: string }
): Promise<string | null> {
  return logEmail({
    ...data,
    status: 'failed',
  });
}

/**
 * Get email logs by recipient
 * 
 * Retrieves all email logs for a specific recipient email address.
 * Useful for debugging delivery issues or viewing user email history.
 * 
 * @param email - Recipient email address
 * @param limit - Maximum number of logs to return (default: 50)
 * @returns Array of email logs
 */
export async function getEmailLogsByRecipient(
  email: string,
  limit: number = 50
) {
  try {
    const logs = await prisma.emailLog.findMany({
      where: {
        to: {
          contains: email,
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: limit,
    });

    return logs;
  } catch (error) {
    console.error('Failed to get email logs by recipient:', error);
    return [];
  }
}

/**
 * Get email logs by template
 * 
 * Retrieves all email logs for a specific template type.
 * Useful for analyzing template performance and delivery rates.
 * 
 * @param template - Email template name
 * @param limit - Maximum number of logs to return (default: 100)
 * @returns Array of email logs
 */
export async function getEmailLogsByTemplate(
  template: string,
  limit: number = 100
) {
  try {
    const logs = await prisma.emailLog.findMany({
      where: {
        template,
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: limit,
    });

    return logs;
  } catch (error) {
    console.error('Failed to get email logs by template:', error);
    return [];
  }
}

/**
 * Get email logs by status
 * 
 * Retrieves all email logs with a specific status.
 * Useful for monitoring failed emails or tracking delivery issues.
 * 
 * @param status - Email status
 * @param limit - Maximum number of logs to return (default: 100)
 * @returns Array of email logs
 */
export async function getEmailLogsByStatus(
  status: EmailStatus,
  limit: number = 100
) {
  try {
    const logs = await prisma.emailLog.findMany({
      where: {
        status,
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: limit,
    });

    return logs;
  } catch (error) {
    console.error('Failed to get email logs by status:', error);
    return [];
  }
}

/**
 * Get email statistics
 * 
 * Calculates email delivery and engagement statistics for a given time period.
 * Useful for email analytics dashboards.
 * 
 * @param startDate - Start date for statistics (optional)
 * @param endDate - End date for statistics (optional)
 * @returns Email statistics object
 */
export async function getEmailStats(
  startDate?: Date,
  endDate?: Date
) {
  try {
    // Build date filter
    const dateFilter = startDate || endDate ? {
      sentAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    } : {};

    // Get total counts by status
    const [
      totalSent,
      totalDelivered,
      totalFailed,
      totalBounced,
      totalOpened,
      totalClicked,
    ] = await Promise.all([
      prisma.emailLog.count({
        where: { ...dateFilter, status: { in: ['sent', 'delivered', 'opened', 'clicked'] } },
      }),
      prisma.emailLog.count({
        where: { ...dateFilter, status: 'delivered' },
      }),
      prisma.emailLog.count({
        where: { ...dateFilter, status: 'failed' },
      }),
      prisma.emailLog.count({
        where: { ...dateFilter, status: 'bounced' },
      }),
      prisma.emailLog.count({
        where: { ...dateFilter, openedAt: { not: null } },
      }),
      prisma.emailLog.count({
        where: { ...dateFilter, clickedAt: { not: null } },
      }),
    ]);

    // Calculate rates
    const deliveryRate = totalSent > 0 
      ? ((totalDelivered / totalSent) * 100).toFixed(2) 
      : '0.00';
    
    const openRate = totalDelivered > 0 
      ? ((totalOpened / totalDelivered) * 100).toFixed(2) 
      : '0.00';
    
    const clickRate = totalOpened > 0 
      ? ((totalClicked / totalOpened) * 100).toFixed(2) 
      : '0.00';
    
    const bounceRate = totalSent > 0 
      ? ((totalBounced / totalSent) * 100).toFixed(2) 
      : '0.00';
    
    const failureRate = totalSent > 0 
      ? ((totalFailed / totalSent) * 100).toFixed(2) 
      : '0.00';

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      totalBounced,
      totalOpened,
      totalClicked,
      deliveryRate: parseFloat(deliveryRate),
      openRate: parseFloat(openRate),
      clickRate: parseFloat(clickRate),
      bounceRate: parseFloat(bounceRate),
      failureRate: parseFloat(failureRate),
    };
  } catch (error) {
    console.error('Failed to get email stats:', error);
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalBounced: 0,
      totalOpened: 0,
      totalClicked: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      failureRate: 0,
    };
  }
}

/**
 * Get email statistics by template
 * 
 * Calculates email delivery and engagement statistics for each template type.
 * Useful for comparing template performance.
 * 
 * @param startDate - Start date for statistics (optional)
 * @param endDate - End date for statistics (optional)
 * @returns Array of template statistics
 */
export async function getEmailStatsByTemplate(
  startDate?: Date,
  endDate?: Date
) {
  try {
    // Build date filter
    const dateFilter = startDate || endDate ? {
      sentAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    } : {};

    // Get all unique templates
    const templates = await prisma.emailLog.findMany({
      where: dateFilter,
      select: { template: true },
      distinct: ['template'],
    });

    // Get stats for each template
    const templateStats = await Promise.all(
      templates.map(async ({ template }) => {
        const [
          totalSent,
          totalDelivered,
          totalFailed,
          totalBounced,
          totalOpened,
          totalClicked,
        ] = await Promise.all([
          prisma.emailLog.count({
            where: { 
              ...dateFilter, 
              template,
              status: { in: ['sent', 'delivered', 'opened', 'clicked'] },
            },
          }),
          prisma.emailLog.count({
            where: { ...dateFilter, template, status: 'delivered' },
          }),
          prisma.emailLog.count({
            where: { ...dateFilter, template, status: 'failed' },
          }),
          prisma.emailLog.count({
            where: { ...dateFilter, template, status: 'bounced' },
          }),
          prisma.emailLog.count({
            where: { ...dateFilter, template, openedAt: { not: null } },
          }),
          prisma.emailLog.count({
            where: { ...dateFilter, template, clickedAt: { not: null } },
          }),
        ]);

        // Calculate rates
        const deliveryRate = totalSent > 0 
          ? ((totalDelivered / totalSent) * 100).toFixed(2) 
          : '0.00';
        
        const openRate = totalDelivered > 0 
          ? ((totalOpened / totalDelivered) * 100).toFixed(2) 
          : '0.00';
        
        const clickRate = totalOpened > 0 
          ? ((totalClicked / totalOpened) * 100).toFixed(2) 
          : '0.00';

        return {
          template,
          totalSent,
          totalDelivered,
          totalFailed,
          totalBounced,
          totalOpened,
          totalClicked,
          deliveryRate: parseFloat(deliveryRate),
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate),
        };
      })
    );

    return templateStats;
  } catch (error) {
    console.error('Failed to get email stats by template:', error);
    return [];
  }
}

/**
 * Get recent failed emails
 * 
 * Retrieves the most recent failed emails for monitoring and debugging.
 * 
 * @param limit - Maximum number of failed emails to return (default: 20)
 * @returns Array of failed email logs
 */
export async function getRecentFailedEmails(limit: number = 20) {
  try {
    const failedEmails = await prisma.emailLog.findMany({
      where: {
        status: 'failed',
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: limit,
    });

    return failedEmails;
  } catch (error) {
    console.error('Failed to get recent failed emails:', error);
    return [];
  }
}

/**
 * Get recent bounced emails
 * 
 * Retrieves the most recent bounced emails for monitoring and debugging.
 * 
 * @param limit - Maximum number of bounced emails to return (default: 20)
 * @returns Array of bounced email logs
 */
export async function getRecentBouncedEmails(limit: number = 20) {
  try {
    const bouncedEmails = await prisma.emailLog.findMany({
      where: {
        status: 'bounced',
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: limit,
    });

    return bouncedEmails;
  } catch (error) {
    console.error('Failed to get recent bounced emails:', error);
    return [];
  }
}

/**
 * Clean up old email logs
 * 
 * Deletes email logs older than the specified number of days.
 * Useful for maintaining database size and complying with data retention policies.
 * 
 * @param daysToKeep - Number of days to keep logs (default: 90)
 * @returns Number of deleted logs
 */
export async function cleanupOldEmailLogs(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.emailLog.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned up ${result.count} email logs older than ${daysToKeep} days`);
    return result.count;
  } catch (error) {
    console.error('Failed to clean up old email logs:', error);
    return 0;
  }
}

/**
 * Find email log by Resend ID
 * 
 * Finds an email log entry by the Resend email ID.
 * This is useful for webhook handlers that receive Resend IDs.
 * 
 * Note: This requires storing the Resend ID in the email log metadata.
 * 
 * @param resendId - Resend email ID
 * @returns Email log or null if not found
 */
export async function findEmailLogByResendId(resendId: string) {
  try {
    // Since we don't have a dedicated field for Resend ID,
    // we'll need to search by subject or implement a metadata field
    // For now, return null and log a warning
    console.warn('findEmailLogByResendId: Resend ID tracking not yet implemented');
    console.warn('Consider adding a resendId field to EmailLog model');
    return null;
  } catch (error) {
    console.error('Failed to find email log by Resend ID:', error);
    return null;
  }
}
