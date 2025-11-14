/**
 * Error Monitoring System
 * 
 * Monitors and reports critical system errors to admins.
 * Integrates with admin error alert emails.
 * 
 * Requirements: 4.4, 4.5
 */

import { queueAdminErrorAlertEmail } from './email/queue';

export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface MonitoredError {
  type: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  affectedUsers?: number;
  endpoint?: string;
  metadata?: Record<string, any>;
}

/**
 * Report error to monitoring system
 * 
 * @param error - Error object or monitored error details
 * @param severity - Error severity level
 * @param context - Additional context about the error
 */
export async function reportError(
  error: Error | MonitoredError,
  severity: ErrorSeverity = 'MEDIUM',
  context?: {
    affectedUsers?: number;
    endpoint?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    let errorDetails: MonitoredError;
    
    if (error instanceof Error) {
      errorDetails = {
        type: error.name || 'Error',
        message: error.message,
        stack: error.stack,
        severity,
        affectedUsers: context?.affectedUsers,
        endpoint: context?.endpoint,
        metadata: context?.metadata,
      };
    } else {
      errorDetails = error;
    }
    
    // Log to console
    console.error('[Error Monitor]', {
      severity: errorDetails.severity,
      type: errorDetails.type,
      message: errorDetails.message,
      endpoint: errorDetails.endpoint,
      affectedUsers: errorDetails.affectedUsers,
    });
    
    // Send email alert for HIGH and CRITICAL errors
    if (errorDetails.severity === 'HIGH' || errorDetails.severity === 'CRITICAL') {
      await queueAdminErrorAlertEmail(
        errorDetails.type,
        errorDetails.message,
        errorDetails.stack,
        errorDetails.severity,
        errorDetails.affectedUsers,
        errorDetails.endpoint,
        'en' // Default to English for admin emails
      );
    }
    
    // TODO: Integrate with external monitoring services (Sentry, DataDog, etc.)
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(error);
    // }
  } catch (monitoringError) {
    // Don't let monitoring errors break the application
    console.error('Failed to report error to monitoring system:', monitoringError);
  }
}

/**
 * Report database error
 */
export async function reportDatabaseError(
  error: Error,
  operation: string,
  affectedUsers?: number
): Promise<void> {
  await reportError(error, 'HIGH', {
    endpoint: `Database: ${operation}`,
    affectedUsers,
    metadata: { operation },
  });
}

/**
 * Report API error
 */
export async function reportApiError(
  error: Error,
  endpoint: string,
  severity: ErrorSeverity = 'MEDIUM'
): Promise<void> {
  await reportError(error, severity, {
    endpoint,
  });
}

/**
 * Report authentication error
 */
export async function reportAuthError(
  error: Error,
  context: string
): Promise<void> {
  await reportError(error, 'HIGH', {
    endpoint: `Auth: ${context}`,
  });
}

/**
 * Report payment/wallet error
 */
export async function reportWalletError(
  error: Error,
  userId: string,
  operation: string
): Promise<void> {
  await reportError(error, 'HIGH', {
    endpoint: `Wallet: ${operation}`,
    affectedUsers: 1,
    metadata: { userId, operation },
  });
}

/**
 * Report email delivery error
 */
export async function reportEmailError(
  error: Error,
  recipient: string,
  template: string
): Promise<void> {
  await reportError(error, 'MEDIUM', {
    endpoint: `Email: ${template}`,
    metadata: { recipient, template },
  });
}

/**
 * Report critical system error
 */
export async function reportCriticalError(
  error: Error,
  context: string,
  affectedUsers?: number
): Promise<void> {
  await reportError(error, 'CRITICAL', {
    endpoint: context,
    affectedUsers,
  });
}

/**
 * Create error monitoring middleware for API routes
 */
export function withErrorMonitoring<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  endpoint: string
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Report error
      if (error instanceof Error) {
        await reportApiError(error, endpoint, 'HIGH');
      }
      
      // Re-throw to let the caller handle it
      throw error;
    }
  }) as T;
}

/**
 * Test error monitoring system
 * 
 * Use this function to test if error alerts are working correctly.
 * Should only be called in development/testing environments.
 */
export async function testErrorMonitoring(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Error monitoring test should not be run in production');
    return;
  }
  
  console.log('Testing error monitoring system...');
  
  // Test LOW severity (should not send email)
  await reportError(
    new Error('Test low severity error'),
    'LOW',
    { endpoint: '/test' }
  );
  
  // Test MEDIUM severity (should not send email)
  await reportError(
    new Error('Test medium severity error'),
    'MEDIUM',
    { endpoint: '/test' }
  );
  
  // Test HIGH severity (should send email)
  await reportError(
    new Error('Test high severity error'),
    'HIGH',
    { endpoint: '/test', affectedUsers: 5 }
  );
  
  // Test CRITICAL severity (should send email)
  await reportError(
    new Error('Test critical severity error'),
    'CRITICAL',
    { endpoint: '/test', affectedUsers: 100 }
  );
  
  console.log('Error monitoring test completed. Check admin emails.');
}
