/**
 * Utility Functions Index
 * 
 * Central export point for all utility functions.
 * Import utilities like: import { storage, time, validation } from '@/lib/utils'
 */

import * as storage from './storage';
import * as time from './time';
import * as validation from './validation';

export { storage, time, validation };

// Re-export commonly used functions for convenience
export {
  // Storage utilities
  getItem,
  getJSON,
  setItem,
  setJSON,
  removeItem,
  clear,
  isAvailable as isStorageAvailable,
} from './storage';

export {
  // Time utilities
  formatTime,
  formatDuration,
  formatDurationCompact,
  formatRemainingTime,
  parseTime,
  getTimeAgo,
  getTimeUntil,
  isPast,
  isFuture,
  addSeconds,
  getSecondsBetween,
} from './time';

export {
  // Validation utilities
  isValidEmail,
  isValidUrl,
  isValidBEP20Address,
  isNotEmpty,
  hasMinLength,
  hasMaxLength,
  isLengthInRange,
  isValidNumber,
  isNumberInRange,
  isPositive,
  isNonNegative,
  isAlphanumeric,
  isAlpha,
  isNumeric,
  matchesPattern,
  isValidDate,
  isDateInPast,
  isDateInFuture,
  isArrayNotEmpty,
  isObjectNotEmpty,
  sanitizeHtml,
  normalizeWhitespace,
  isNullOrUndefined,
  isDefined,
  validateAll,
  required,
  minLength,
  maxLength,
  email,
} from './validation';
