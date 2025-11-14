import { emailConfig } from './client';
import { generateSecureToken, verifySecureToken, sanitizeUserText } from './security';

/**
 * Generate unsubscribe token for user (secure version)
 */
export function generateUnsubscribeToken(userId: string, emailType: string): string {
  return generateSecureToken(userId, emailType);
}

/**
 * Parse unsubscribe token (secure version)
 */
export function parseUnsubscribeToken(token: string): {
  userId: string;
  emailType: string;
  timestamp: number;
} | null {
  return verifySecureToken(token);
}

/**
 * Generate unsubscribe URL
 */
export function generateUnsubscribeUrl(
  userId: string,
  emailType: string,
  locale: string = emailConfig.defaultLocale
): string {
  const token = generateUnsubscribeToken(userId, emailType);
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
  return `${baseUrl}/email/unsubscribe?token=${token}`;
}

/**
 * Generate resubscribe/manage preferences URL
 */
export function generateManagePreferencesUrl(
  locale: string = emailConfig.defaultLocale
): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
  return `${baseUrl}/profile`;
}

/**
 * Mask email address for privacy
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  const visibleChars = Math.min(3, Math.floor(localPart.length / 2));
  const masked = localPart.substring(0, visibleChars) + '***';
  return `${masked}@${domain}`;
}

/**
 * Mask wallet address for privacy
 */
export function maskWalletAddress(address: string): string {
  if (address.length <= 10) return address;
  
  const start = address.substring(0, 6);
  const end = address.substring(address.length - 4);
  return `${start}...${end}`;
}

/**
 * Format points with locale-specific formatting
 */
export function formatPoints(points: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale).format(points);
}

/**
 * Format date with locale-specific formatting
 */
export function formatDate(date: Date, locale: string = 'en'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format date and time with locale-specific formatting
 */
export function formatDateTime(date: Date, locale: string = 'en'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get email subject with locale
 */
export function getLocalizedSubject(
  key: string,
  locale: string,
  variables?: Record<string, string>
): string {
  // This will be replaced with actual translation system
  // For now, return a placeholder
  let subject = key;
  
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      subject = subject.replace(`{{${key}}}`, value);
    });
  }
  
  return subject;
}

/**
 * Validate locale is supported
 */
export function isValidLocale(locale: string): boolean {
  return emailConfig.supportedLocales.includes(locale as any);
}

/**
 * Get default locale if provided locale is invalid
 */
export function getValidLocale(locale?: string): string {
  if (!locale || !isValidLocale(locale)) {
    return emailConfig.defaultLocale;
  }
  return locale;
}

/**
 * Generate email tracking pixel URL
 */
export function generateTrackingPixelUrl(emailLogId: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
  return `${baseUrl}/api/email/track/open?id=${emailLogId}`;
}

/**
 * Generate email click tracking URL
 */
export function generateClickTrackingUrl(
  emailLogId: string,
  originalUrl: string
): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${baseUrl}/api/email/track/click?id=${emailLogId}&url=${encodedUrl}`;
}

/**
 * Extract plain text from HTML
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Get email priority based on type
 */
export function getEmailPriority(template: string): number {
  // Lower number = higher priority
  if (template.includes('admin')) return 1;
  if (template.includes('verification') || template.includes('security')) return 2;
  if (template.includes('welcome')) return 3;
  return 10; // Default priority
}

/**
 * Check if email should be sent based on user preferences
 */
export async function shouldSendEmail(
  userId: string,
  emailType: string
): Promise<boolean> {
  // This will be implemented when email preferences are added
  // For now, return true for all emails
  return true;
}

/**
 * Batch emails by domain to prevent rate limiting
 */
export function batchEmailsByDomain(
  emails: string[],
  batchSize: number = 50
): string[][] {
  const domainGroups = new Map<string, string[]>();
  
  // Group by domain
  emails.forEach((email) => {
    const domain = email.split('@')[1] || 'unknown';
    if (!domainGroups.has(domain)) {
      domainGroups.set(domain, []);
    }
    domainGroups.get(domain)!.push(email);
  });
  
  // Create batches
  const batches: string[][] = [];
  domainGroups.forEach((domainEmails) => {
    for (let i = 0; i < domainEmails.length; i += batchSize) {
      batches.push(domainEmails.slice(i, i + batchSize));
    }
  });
  
  return batches;
}
