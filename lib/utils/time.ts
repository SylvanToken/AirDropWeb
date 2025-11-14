/**
 * Time Formatting Utility Functions
 * 
 * Centralized utilities for time and duration formatting.
 */

/**
 * Format seconds to human-readable time string (HH:MM:SS or MM:SS)
 * @param seconds - Time in seconds
 * @param includeHours - Whether to always include hours (default: auto)
 * @returns Formatted time string
 */
export function formatTime(seconds: number, includeHours: boolean = false): string {
  if (seconds < 0) {
    return 'Expired';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0 || includeHours) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format duration in seconds to human-readable string (e.g., "2h 30m", "45m", "30s")
 * @param seconds - Duration in seconds
 * @param short - Use short format (h/m/s) vs long format (hours/minutes/seconds)
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number, short: boolean = true): string {
  if (seconds < 0) {
    return 'Expired';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(short ? `${hours}h` : `${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }

  if (minutes > 0) {
    parts.push(short ? `${minutes}m` : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(short ? `${secs}s` : `${secs} ${secs === 1 ? 'second' : 'seconds'}`);
  }

  return parts.join(' ');
}

/**
 * Format duration to compact string (e.g., "2:30:45", "45:30", "0:30")
 * @param seconds - Duration in seconds
 * @returns Compact duration string
 */
export function formatDurationCompact(seconds: number): string {
  if (seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format remaining time with appropriate unit (e.g., "2 hours left", "30 minutes left", "45 seconds left")
 * @param seconds - Remaining time in seconds
 * @returns Formatted remaining time string
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds < 0) {
    return 'Expired';
  }

  if (seconds === 0) {
    return 'Expiring now';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
  }

  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left`;
  }

  return `${secs} ${secs === 1 ? 'second' : 'seconds'} left`;
}

/**
 * Parse time string (HH:MM:SS or MM:SS) to seconds
 * @param timeString - Time string to parse
 * @returns Time in seconds, or null if invalid
 */
export function parseTime(timeString: string): number | null {
  const parts = timeString.split(':').map(p => parseInt(p, 10));

  if (parts.some(isNaN)) {
    return null;
  }

  if (parts.length === 3) {
    // HH:MM:SS
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    // MM:SS
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  return null;
}

/**
 * Get time ago string (e.g., "2 hours ago", "30 minutes ago", "just now")
 * @param date - Date to compare
 * @param now - Current date (default: new Date())
 * @returns Time ago string
 */
export function getTimeAgo(date: Date, now: Date = new Date()): string {
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Get time until string (e.g., "in 2 hours", "in 30 minutes", "now")
 * @param date - Future date
 * @param now - Current date (default: new Date())
 * @returns Time until string
 */
export function getTimeUntil(date: Date, now: Date = new Date()): string {
  const seconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  if (seconds <= 0) {
    return 'now';
  }

  if (seconds < 60) {
    return `in ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `in ${days} ${days === 1 ? 'day' : 'days'}`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `in ${months} ${months === 1 ? 'month' : 'months'}`;
  }

  const years = Math.floor(months / 12);
  return `in ${years} ${years === 1 ? 'year' : 'years'}`;
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @param now - Current date (default: new Date())
 * @returns true if date is in the past
 */
export function isPast(date: Date, now: Date = new Date()): boolean {
  return date.getTime() < now.getTime();
}

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @param now - Current date (default: new Date())
 * @returns true if date is in the future
 */
export function isFuture(date: Date, now: Date = new Date()): boolean {
  return date.getTime() > now.getTime();
}

/**
 * Add seconds to a date
 * @param date - Base date
 * @param seconds - Seconds to add
 * @returns New date with added seconds
 */
export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

/**
 * Get seconds between two dates
 * @param start - Start date
 * @param end - End date
 * @returns Seconds between dates
 */
export function getSecondsBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 1000);
}
