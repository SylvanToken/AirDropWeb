/**
 * Task Error Handler Utility
 * 
 * Provides error handling and retry mechanisms for task operations
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
}

export class TaskError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'TaskError';
  }
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof TaskError) {
    return error.retryable;
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Network errors are retryable
    return true;
  }
  
  // Check for specific HTTP status codes that are retryable
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const statusCode = (error as any).statusCode;
    return statusCode === 408 || statusCode === 429 || statusCode >= 500;
  }
  
  return false;
}

/**
 * Parse API error response
 */
export async function parseApiError(response: Response): Promise<TaskError> {
  let message = 'An error occurred';
  let code = 'UNKNOWN_ERROR';
  
  try {
    const data = await response.json();
    message = data.message || data.error || message;
    code = data.code || code;
  } catch {
    // If response is not JSON, use status text
    message = response.statusText || message;
  }
  
  const retryable = response.status === 408 || 
                    response.status === 429 || 
                    response.status >= 500;
  
  return new TaskError(message, code, response.status, retryable);
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    onRetry
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt or error is not retryable
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      
      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1);
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, retryDelay * Math.pow(2, attempt))
      );
    }
  }
  
  throw lastError;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof TaskError) {
    return error.message;
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get error code for analytics/logging
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof TaskError) {
    return error.code;
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'NETWORK_ERROR';
  }
  
  if (error instanceof Error) {
    return error.name;
  }
  
  return 'UNKNOWN_ERROR';
}
