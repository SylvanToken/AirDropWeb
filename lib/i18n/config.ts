/**
 * Internationalization Configuration
 * 
 * Supported Languages:
 * - English (en) - Default
 * - Turkish (tr)
 * - German (de)
 * - Chinese (zh) - Simplified
 * - Russian (ru)
 * - Spanish (es)
 * - Arabic (ar)
 * - Korean (ko)
 */

export const locales = ['en', 'tr', 'de', 'zh', 'ru', 'es', 'ar', 'ko'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
  de: 'Deutsch',
  zh: '中文',
  ru: 'Русский',
  es: 'Español',
  ar: 'العربية',
  ko: '한국어',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧', // UK flag for English
  tr: '🇹🇷', // Turkish flag
  de: '🇩🇪', // German flag
  zh: '🇨🇳', // Chinese flag
  ru: '🇷🇺', // Russian flag
  es: '🇪🇸', // Spanish flag
  ar: '🇸🇦', // Saudi Arabia flag for Arabic
  ko: '🇰🇷', // South Korea flag
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }
  
  return null;
}
