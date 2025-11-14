/**
 * Utility functions for time-limited task expiration calculations
 */

/**
 * Calculate expiration timestamp based on duration in hours
 * @param duration - Duration in hours (1-24)
 * @returns Expiration timestamp
 */
export function calculateExpiration(duration: number): Date {
  const now = new Date()
  return new Date(now.getTime() + duration * 60 * 60 * 1000)
}

/**
 * Format expiration time for display
 * @param expiresAt - Expiration timestamp
 * @returns Formatted string like "in 2 hours" or "at 3:45 PM"
 */
export function formatExpirationTime(expiresAt: Date): string {
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffHours < 1) {
    return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`
  } else if (diffHours < 24) {
    return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`
  } else {
    return `at ${expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }
}

/**
 * Check if a task has expired
 * @param expiresAt - Expiration timestamp
 * @returns True if expired, false otherwise
 */
export function isTaskExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false
  return new Date() > expiresAt
}

/**
 * Mark a task completion as missed due to expiration
 * @param userId - User ID
 * @param taskId - Task ID
 * @param expiresAt - Expiration timestamp
 * @returns Completion record with missedAt timestamp
 */
export async function markTaskAsMissed(
  userId: string,
  taskId: string,
  expiresAt: Date
): Promise<{ userId: string; taskId: string; missedAt: Date }> {
  return {
    userId,
    taskId,
    missedAt: expiresAt,
  }
}

/**
 * Check if a user can complete a task (not expired)
 * @param expiresAt - Expiration timestamp
 * @returns Object with canComplete flag and reason
 */
export function canCompleteTask(expiresAt: Date | null | undefined): {
  canComplete: boolean
  reason?: string
} {
  if (!expiresAt) {
    return { canComplete: true }
  }

  if (isTaskExpired(expiresAt)) {
    return {
      canComplete: false,
      reason: 'Task has expired and can no longer be completed',
    }
  }

  return { canComplete: true }
}
