/**
 * Locale-aware formatting utilities
 * 
 * Provides comprehensive formatting functions for dates, numbers, currencies,
 * and relative times across all supported locales.
 */

import { type Locale } from "./config";

/**
 * Format a date according to the specified locale
 * 
 * @param date - Date object or ISO string
 * @param locale - Locale code (en, tr, de, zh, ru)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 * 
 * @example
 * formatDate(new Date(), 'en') // "Jan 15, 2025"
 * formatDate(new Date(), 'de') // "15. Jan. 2025"
 */
export function formatDate(date: Date | string, locale: string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('[Formatting] Invalid date:', date);
    return 'Invalid Date';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.error('[Formatting] Error formatting date:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format a date and time according to the specified locale
 * 
 * @param date - Date object or ISO string
 * @param locale - Locale code
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date and time string
 * 
 * @example
 * formatDateTime(new Date(), 'en') // "Jan 15, 2025, 10:30 AM"
 */
export function formatDateTime(date: Date | string, locale: string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('[Formatting] Invalid date:', date);
    return 'Invalid Date';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.error('[Formatting] Error formatting datetime:', error);
    return dateObj.toLocaleString();
  }
}

/**
 * Format a time according to the specified locale
 * 
 * @param date - Date object or ISO string
 * @param locale - Locale code
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 * 
 * @example
 * formatTime(new Date(), 'en') // "10:30 AM"
 */
export function formatTime(date: Date | string, locale: string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('[Formatting] Invalid date:', date);
    return 'Invalid Time';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.error('[Formatting] Error formatting time:', error);
    return dateObj.toLocaleTimeString();
  }
}

/**
 * Format a number according to the specified locale
 * 
 * @param value - Number to format
 * @param locale - Locale code
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string
 * 
 * @example
 * formatNumber(1234.56, 'en') // "1,234.56"
 * formatNumber(1234.56, 'de') // "1.234,56"
 */
export function formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions): string {
  if (typeof value !== 'number' || isNaN(value)) {
    console.error('[Formatting] Invalid number:', value);
    return '0';
  }

  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    console.error('[Formatting] Error formatting number:', error);
    return value.toString();
  }
}

/**
 * Format a percentage according to the specified locale
 * 
 * @param value - Number to format (0.5 = 50%)
 * @param locale - Locale code
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 * 
 * @example
 * formatPercentage(0.5, 'en') // "50%"
 * formatPercentage(0.755, 'en', 1) // "75.5%"
 */
export function formatPercentage(value: number, locale: string, decimals: number = 0): string {
  if (typeof value !== 'number' || isNaN(value)) {
    console.error('[Formatting] Invalid percentage value:', value);
    return '0%';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    console.error('[Formatting] Error formatting percentage:', error);
    return `${(value * 100).toFixed(decimals)}%`;
  }
}

/**
 * Format a currency value according to the specified locale
 * 
 * @param value - Amount to format
 * @param locale - Locale code
 * @param currency - Currency code (USD, EUR, etc.)
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56, 'en', 'USD') // "$1,234.56"
 * formatCurrency(1234.56, 'de', 'EUR') // "1.234,56 €"
 */
export function formatCurrency(value: number, locale: string, currency: string = 'USD'): string {
  if (typeof value !== 'number' || isNaN(value)) {
    console.error('[Formatting] Invalid currency value:', value);
    return '0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch (error) {
    console.error('[Formatting] Error formatting currency:', error);
    return `${currency} ${value.toFixed(2)}`;
  }
}

/**
 * Format a compact number (e.g., 1.2K, 3.4M) according to the specified locale
 * 
 * @param value - Number to format
 * @param locale - Locale code
 * @returns Formatted compact number string
 * 
 * @example
 * formatCompactNumber(1234, 'en') // "1.2K"
 * formatCompactNumber(1234567, 'en') // "1.2M"
 */
export function formatCompactNumber(value: number, locale: string): string {
  if (typeof value !== 'number' || isNaN(value)) {
    console.error('[Formatting] Invalid number:', value);
    return '0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  } catch (error) {
    console.error('[Formatting] Error formatting compact number:', error);
    return value.toString();
  }
}

/**
 * Format a relative time (e.g., "2 days ago") according to the specified locale
 * 
 * @param date - Date object or ISO string
 * @param locale - Locale code
 * @returns Formatted relative time string
 * 
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000), 'en') // "1 hour ago"
 * formatRelativeTime(new Date(Date.now() - 86400000), 'de') // "vor 1 Tag"
 */
export function formatRelativeTime(date: Date | string, locale: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('[Formatting] Invalid date:', date);
    return 'Invalid Date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    // Handle future dates
    if (diffInSeconds < 0) {
      const absDiff = Math.abs(diffInSeconds);
      if (absDiff < 60) {
        return rtf.format(Math.ceil(absDiff), 'second');
      } else if (absDiff < 3600) {
        return rtf.format(Math.ceil(absDiff / 60), 'minute');
      } else if (absDiff < 86400) {
        return rtf.format(Math.ceil(absDiff / 3600), 'hour');
      } else if (absDiff < 2592000) {
        return rtf.format(Math.ceil(absDiff / 86400), 'day');
      } else if (absDiff < 31536000) {
        return rtf.format(Math.ceil(absDiff / 2592000), 'month');
      } else {
        return rtf.format(Math.ceil(absDiff / 31536000), 'year');
      }
    }

    // Handle past dates
    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  } catch (error) {
    console.error('[Formatting] Error formatting relative time:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format a list of items according to the specified locale
 * 
 * @param items - Array of strings to format
 * @param locale - Locale code
 * @param type - List type ('conjunction', 'disjunction', or 'unit')
 * @returns Formatted list string
 * 
 * @example
 * formatList(['apples', 'oranges', 'bananas'], 'en') // "apples, oranges, and bananas"
 * formatList(['apples', 'oranges'], 'en', 'disjunction') // "apples or oranges"
 */
export function formatList(
  items: string[], 
  locale: string, 
  type: 'conjunction' | 'disjunction' | 'unit' = 'conjunction'
): string {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  try {
    const formatter = new Intl.ListFormat(locale, { style: 'long', type });
    return formatter.format(items);
  } catch (error) {
    console.error('[Formatting] Error formatting list:', error);
    return items.join(', ');
  }
}

/**
 * Format a date range according to the specified locale
 * 
 * @param startDate - Start date
 * @param endDate - End date
 * @param locale - Locale code
 * @returns Formatted date range string
 * 
 * @example
 * formatDateRange(new Date('2025-01-01'), new Date('2025-01-15'), 'en') // "Jan 1 – 15, 2025"
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string, locale: string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('[Formatting] Invalid date range:', startDate, endDate);
    return 'Invalid Date Range';
  }

  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return formatter.formatRange(start, end);
  } catch (error) {
    console.error('[Formatting] Error formatting date range:', error);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }
}
