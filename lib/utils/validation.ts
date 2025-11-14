/**
 * Validation Utility Functions
 * 
 * Centralized utilities for common validation operations.
 */

/**
 * Check if a string is a valid email address
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Check if a string is a valid URL
 * @param url - URL to validate
 * @returns true if valid URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid BEP20 wallet address
 * @param address - Wallet address to validate
 * @returns true if valid BEP20 address format
 */
export function isValidBEP20Address(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // BEP20 addresses are 42 characters long and start with 0x
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address.trim());
}

/**
 * Check if a string is not empty (after trimming)
 * @param value - String to check
 * @returns true if string is not empty
 */
export function isNotEmpty(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if a string has minimum length
 * @param value - String to check
 * @param minLength - Minimum length required
 * @returns true if string meets minimum length
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return typeof value === 'string' && value.length >= minLength;
}

/**
 * Check if a string has maximum length
 * @param value - String to check
 * @param maxLength - Maximum length allowed
 * @returns true if string is within maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return typeof value === 'string' && value.length <= maxLength;
}

/**
 * Check if a string is within length range
 * @param value - String to check
 * @param minLength - Minimum length required
 * @param maxLength - Maximum length allowed
 * @returns true if string is within length range
 */
export function isLengthInRange(value: string, minLength: number, maxLength: number): boolean {
  return hasMinLength(value, minLength) && hasMaxLength(value, maxLength);
}

/**
 * Check if a value is a valid number
 * @param value - Value to check
 * @returns true if value is a valid number
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if a number is within range
 * @param value - Number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if number is within range
 */
export function isNumberInRange(value: number, min: number, max: number): boolean {
  return isValidNumber(value) && value >= min && value <= max;
}

/**
 * Check if a number is positive
 * @param value - Number to check
 * @returns true if number is positive
 */
export function isPositive(value: number): boolean {
  return isValidNumber(value) && value > 0;
}

/**
 * Check if a number is non-negative
 * @param value - Number to check
 * @returns true if number is non-negative
 */
export function isNonNegative(value: number): boolean {
  return isValidNumber(value) && value >= 0;
}

/**
 * Check if a string contains only alphanumeric characters
 * @param value - String to check
 * @returns true if string is alphanumeric
 */
export function isAlphanumeric(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(value);
}

/**
 * Check if a string contains only letters
 * @param value - String to check
 * @returns true if string contains only letters
 */
export function isAlpha(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const alphaRegex = /^[a-zA-Z]+$/;
  return alphaRegex.test(value);
}

/**
 * Check if a string contains only digits
 * @param value - String to check
 * @returns true if string contains only digits
 */
export function isNumeric(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const numericRegex = /^[0-9]+$/;
  return numericRegex.test(value);
}

/**
 * Check if a string matches a regex pattern
 * @param value - String to check
 * @param pattern - Regex pattern to match
 * @returns true if string matches pattern
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  return pattern.test(value);
}

/**
 * Check if a date is valid
 * @param date - Date to check
 * @returns true if date is valid
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns true if date is in the past
 */
export function isDateInPast(date: Date): boolean {
  return isValidDate(date) && date.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns true if date is in the future
 */
export function isDateInFuture(date: Date): boolean {
  return isValidDate(date) && date.getTime() > Date.now();
}

/**
 * Check if an array is not empty
 * @param array - Array to check
 * @returns true if array is not empty
 */
export function isArrayNotEmpty<T>(array: T[]): boolean {
  return Array.isArray(array) && array.length > 0;
}

/**
 * Check if an object is not empty
 * @param obj - Object to check
 * @returns true if object has at least one property
 */
export function isObjectNotEmpty(obj: any): boolean {
  return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0;
}

/**
 * Sanitize a string by removing HTML tags
 * @param value - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value.replace(/<[^>]*>/g, '');
}

/**
 * Trim and normalize whitespace in a string
 * @param value - String to normalize
 * @returns Normalized string
 */
export function normalizeWhitespace(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Check if a value is null or undefined
 * @param value - Value to check
 * @returns true if value is null or undefined
 */
export function isNullOrUndefined(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if a value is defined (not null or undefined)
 * @param value - Value to check
 * @returns true if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Validate multiple conditions and return first error
 * @param validations - Array of validation functions that return error message or null
 * @returns First error message or null if all validations pass
 */
export function validateAll(validations: Array<() => string | null>): string | null {
  for (const validation of validations) {
    const error = validation();
    if (error) {
      return error;
    }
  }
  return null;
}

/**
 * Create a validation function that checks if value is required
 * @param fieldName - Name of the field for error message
 * @returns Validation function
 */
export function required(fieldName: string) {
  return (value: any): string | null => {
    if (isNullOrUndefined(value) || (typeof value === 'string' && !isNotEmpty(value))) {
      return `${fieldName} is required`;
    }
    return null;
  };
}

/**
 * Create a validation function that checks minimum length
 * @param fieldName - Name of the field for error message
 * @param minLength - Minimum length required
 * @returns Validation function
 */
export function minLength(fieldName: string, minLength: number) {
  return (value: string): string | null => {
    if (!hasMinLength(value, minLength)) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return null;
  };
}

/**
 * Create a validation function that checks maximum length
 * @param fieldName - Name of the field for error message
 * @param maxLength - Maximum length allowed
 * @returns Validation function
 */
export function maxLength(fieldName: string, maxLength: number) {
  return (value: string): string | null => {
    if (!hasMaxLength(value, maxLength)) {
      return `${fieldName} must be at most ${maxLength} characters`;
    }
    return null;
  };
}

/**
 * Create a validation function that checks email format
 * @param fieldName - Name of the field for error message
 * @returns Validation function
 */
export function email(fieldName: string) {
  return (value: string): string | null => {
    if (!isValidEmail(value)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  };
}
