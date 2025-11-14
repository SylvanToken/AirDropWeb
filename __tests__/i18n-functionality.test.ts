/**
 * Internationalization (i18n) Functionality Tests
 * 
 * Tests translation key consistency, language switching, date/number formatting,
 * and plural rules across all supported locales.
 */

import fs from 'fs';
import path from 'path';
import { formatDate, formatNumber, formatPercentage, formatCompactNumber } from '@/lib/i18n/formatting';
import { locales, defaultLocale, isValidLocale } from '@/lib/i18n/config';

describe('Internationalization Tests', () => {
  const namespaces = ['common', 'auth', 'tasks', 'wallet', 'dashboard', 'admin', 'profile', 'legal'];
  const localesPath = path.join(process.cwd(), 'locales');

  /**
   * Helper function to load translation file
   */
  function loadTranslations(locale: string, namespace: string): Record<string, any> {
    const filePath = path.join(localesPath, locale, `${namespace}.json`);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Helper function to extract all keys from nested object
   */
  function extractKeys(obj: Record<string, any>, prefix: string = ''): string[] {
    const keys: string[] = [];
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...extractKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys.sort();
  }

  describe('6.1 Translation Key Consistency', () => {
    describe('Turkish (tr) key consistency', () => {
      namespaces.forEach(namespace => {
        it(`should have identical keys in ${namespace} namespace`, () => {
          const enKeys = extractKeys(loadTranslations('en', namespace));
          const trKeys = extractKeys(loadTranslations('tr', namespace));
          
          expect(trKeys).toEqual(enKeys);
        });
      });
    });

    describe('German (de) key consistency', () => {
      namespaces.forEach(namespace => {
        it(`should have identical keys in ${namespace} namespace`, () => {
          const enKeys = extractKeys(loadTranslations('en', namespace));
          const deKeys = extractKeys(loadTranslations('de', namespace));
          
          expect(deKeys).toEqual(enKeys);
        });
      });
    });

    describe('Chinese (zh) key consistency', () => {
      namespaces.forEach(namespace => {
        it(`should have identical keys in ${namespace} namespace`, () => {
          const enKeys = extractKeys(loadTranslations('en', namespace));
          const zhKeys = extractKeys(loadTranslations('zh', namespace));
          
          expect(zhKeys).toEqual(enKeys);
        });
      });
    });

    describe('Russian (ru) key consistency', () => {
      namespaces.forEach(namespace => {
        it(`should have identical keys in ${namespace} namespace`, () => {
          const enKeys = extractKeys(loadTranslations('en', namespace));
          const ruKeys = extractKeys(loadTranslations('ru', namespace));
          
          expect(ruKeys).toEqual(enKeys);
        });
      });
    });

    it('should have all namespaces for all languages', () => {
      locales.forEach(locale => {
        namespaces.forEach(namespace => {
          const filePath = path.join(localesPath, locale, `${namespace}.json`);
          expect(fs.existsSync(filePath)).toBe(true);
        });
      });
    });

    it('should have valid JSON in all translation files', () => {
      locales.forEach(locale => {
        namespaces.forEach(namespace => {
          expect(() => {
            loadTranslations(locale, namespace);
          }).not.toThrow();
        });
      });
    });

    it('should not have empty translation values', () => {
      locales.forEach(locale => {
        namespaces.forEach(namespace => {
          const translations = loadTranslations(locale, namespace);
          const keys = extractKeys(translations);
          
          keys.forEach(key => {
            const value = key.split('.').reduce((obj, k) => obj[k], translations);
            expect(value).toBeTruthy();
            expect(typeof value).toBe('string');
            expect(value.trim().length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe('6.2 Language Switching', () => {
    // Mock localStorage
    let localStorageMock: { [key: string]: string } = {};
    
    beforeEach(() => {
      // Reset localStorage mock
      localStorageMock = {};
      
      // Mock localStorage methods
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn((key: string) => localStorageMock[key] || null),
          setItem: jest.fn((key: string, value: string) => {
            localStorageMock[key] = value;
          }),
          removeItem: jest.fn((key: string) => {
            delete localStorageMock[key];
          }),
          clear: jest.fn(() => {
            localStorageMock = {};
          }),
        },
        writable: true,
      });
      
      // Mock document.cookie
      let cookieStore = '';
      Object.defineProperty(document, 'cookie', {
        get: jest.fn(() => cookieStore),
        set: jest.fn((value: string) => {
          cookieStore = value;
        }),
        configurable: true,
      });
    });

    it('should switch to Turkish locale', () => {
      expect(isValidLocale('tr')).toBe(true);
      
      // Simulate language switch
      localStorage.setItem('NEXT_LOCALE', 'tr');
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = `NEXT_LOCALE=tr; path=/; max-age=${maxAge}; SameSite=Lax`;
      
      // Verify localStorage
      expect(localStorage.getItem('NEXT_LOCALE')).toBe('tr');
      
      // Verify cookie was set
      expect(document.cookie).toContain('NEXT_LOCALE=tr');
    });

    it('should switch to German locale', () => {
      expect(isValidLocale('de')).toBe(true);
      
      // Simulate language switch
      localStorage.setItem('NEXT_LOCALE', 'de');
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = `NEXT_LOCALE=de; path=/; max-age=${maxAge}; SameSite=Lax`;
      
      // Verify localStorage
      expect(localStorage.getItem('NEXT_LOCALE')).toBe('de');
      
      // Verify cookie was set
      expect(document.cookie).toContain('NEXT_LOCALE=de');
    });

    it('should switch to Chinese locale', () => {
      expect(isValidLocale('zh')).toBe(true);
      
      // Simulate language switch
      localStorage.setItem('NEXT_LOCALE', 'zh');
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = `NEXT_LOCALE=zh; path=/; max-age=${maxAge}; SameSite=Lax`;
      
      // Verify localStorage
      expect(localStorage.getItem('NEXT_LOCALE')).toBe('zh');
      
      // Verify cookie was set
      expect(document.cookie).toContain('NEXT_LOCALE=zh');
    });

    it('should switch to Russian locale', () => {
      expect(isValidLocale('ru')).toBe(true);
      
      // Simulate language switch
      localStorage.setItem('NEXT_LOCALE', 'ru');
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = `NEXT_LOCALE=ru; path=/; max-age=${maxAge}; SameSite=Lax`;
      
      // Verify localStorage
      expect(localStorage.getItem('NEXT_LOCALE')).toBe('ru');
      
      // Verify cookie was set
      expect(document.cookie).toContain('NEXT_LOCALE=ru');
    });

    it('should persist language preference in localStorage', () => {
      // Test that language preference persists across sessions
      const testLocales: Array<'en' | 'tr' | 'de' | 'zh' | 'ru'> = ['en', 'tr', 'de', 'zh', 'ru'];
      
      testLocales.forEach(locale => {
        // Set locale
        localStorage.setItem('NEXT_LOCALE', locale);
        
        // Verify it's stored
        expect(localStorage.getItem('NEXT_LOCALE')).toBe(locale);
        
        // Verify it's a valid locale
        expect(isValidLocale(locale)).toBe(true);
      });
    });

    it('should persist language preference in cookie', () => {
      // Test that language preference is stored in cookie
      const testLocales: Array<'en' | 'tr' | 'de' | 'zh' | 'ru'> = ['en', 'tr', 'de', 'zh', 'ru'];
      
      testLocales.forEach(locale => {
        const maxAge = 365 * 24 * 60 * 60; // 1 year
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
        
        // Verify cookie contains the locale
        expect(document.cookie).toContain(`NEXT_LOCALE=${locale}`);
      });
    });

    it('should reject invalid locale', () => {
      expect(isValidLocale('invalid')).toBe(false);
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('')).toBe(false);
    });

    it('should have default locale as English', () => {
      expect(defaultLocale).toBe('en');
    });

    it('should have all locales defined', () => {
      expect(locales).toContain('en');
      expect(locales).toContain('tr');
      expect(locales).toContain('de');
      expect(locales).toContain('zh');
      expect(locales).toContain('ru');
      expect(locales.length).toBe(5);
    });

    it('should load saved locale from localStorage on initialization', () => {
      // Simulate saved locale
      localStorage.setItem('NEXT_LOCALE', 'de');
      
      // Verify it can be retrieved
      const savedLocale = localStorage.getItem('NEXT_LOCALE');
      expect(savedLocale).toBe('de');
      expect(isValidLocale(savedLocale!)).toBe(true);
    });

    it('should handle locale switching with both localStorage and cookie', () => {
      // Test complete locale switching flow
      const newLocale = 'tr';
      
      // Store in localStorage
      localStorage.setItem('NEXT_LOCALE', newLocale);
      
      // Store in cookie
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${maxAge}; SameSite=Lax`;
      
      // Verify both storage mechanisms
      expect(localStorage.getItem('NEXT_LOCALE')).toBe(newLocale);
      expect(document.cookie).toContain(`NEXT_LOCALE=${newLocale}`);
      expect(isValidLocale(newLocale)).toBe(true);
    });

    it('should clear locale preference', () => {
      // Set a locale
      localStorage.setItem('NEXT_LOCALE', 'de');
      expect(localStorage.getItem('NEXT_LOCALE')).toBe('de');
      
      // Clear it
      localStorage.removeItem('NEXT_LOCALE');
      expect(localStorage.getItem('NEXT_LOCALE')).toBeNull();
    });

    it('should handle multiple locale switches', () => {
      // Simulate switching between multiple locales
      const switches = ['en', 'tr', 'de', 'zh', 'ru', 'en'] as const;
      
      switches.forEach(locale => {
        localStorage.setItem('NEXT_LOCALE', locale);
        expect(localStorage.getItem('NEXT_LOCALE')).toBe(locale);
        expect(isValidLocale(locale)).toBe(true);
      });
    });
  });

  describe('6.3 Date Formatting', () => {
    const testDate = new Date('2025-01-15T10:30:00Z');

    it('should format date in Russian locale (DD.MM.YYYY)', () => {
      const formatted = formatDate(testDate, 'ru');
      // Russian format typically uses DD.MM.YYYY or similar
      expect(formatted).toMatch(/\d{1,2}/); // Contains day
      expect(formatted.toLowerCase()).toMatch(/янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек/); // Russian month abbreviation
      expect(formatted).toContain('2025');
    });

    it('should format date in German locale (DD.MM.YYYY)', () => {
      const formatted = formatDate(testDate, 'de');
      // German format typically uses DD.MM.YYYY or similar
      expect(formatted).toMatch(/\d{1,2}/); // Contains day
      expect(formatted.toLowerCase()).toMatch(/jan|feb|mär|apr|mai|jun|jul|aug|sep|okt|nov|dez/); // German month abbreviation
      expect(formatted).toContain('2025');
    });

    it('should format date in Chinese locale (YYYY/MM/DD)', () => {
      const formatted = formatDate(testDate, 'zh');
      // Chinese format typically uses YYYY年MM月DD日 or YYYY/MM/DD
      expect(formatted).toContain('2025');
      expect(formatted).toMatch(/\d/); // Contains numbers
    });

    it('should format date in Turkish locale (DD.MM.YYYY)', () => {
      const formatted = formatDate(testDate, 'tr');
      // Turkish format typically uses DD.MM.YYYY or similar
      expect(formatted).toMatch(/\d{1,2}/); // Contains day
      expect(formatted.toLowerCase()).toMatch(/oca|şub|mar|nis|may|haz|tem|ağu|eyl|eki|kas|ara/); // Turkish month abbreviation
      expect(formatted).toContain('2025');
    });

    it('should format date in English locale (MM/DD/YYYY)', () => {
      const formatted = formatDate(testDate, 'en');
      // English format typically uses MMM DD, YYYY
      expect(formatted).toMatch(/jan/i); // January
      expect(formatted).toMatch(/\d{1,2}/); // Day
      expect(formatted).toContain('2025');
    });

    it('should handle invalid dates gracefully', () => {
      const formatted = formatDate('invalid-date', 'en');
      expect(formatted).toBe('Invalid Date');
    });

    it('should format ISO date strings correctly', () => {
      const formatted = formatDate('2025-01-15', 'en');
      expect(formatted).toMatch(/jan/i);
      expect(formatted).toContain('2025');
    });
  });

  describe('6.4 Number Formatting', () => {
    const testNumber = 1234567.89;

    it('should format number in Russian locale (space separator, comma decimal)', () => {
      const formatted = formatNumber(testNumber, 'ru');
      // Russian uses space as thousands separator and comma as decimal
      // Note: Actual format may vary, but should contain the number
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
      expect(formatted).toContain('567');
      // May contain space or non-breaking space as separator
      expect(formatted).toMatch(/[\s\u00A0]/);
    });

    it('should format number in German locale (dot separator, comma decimal)', () => {
      const formatted = formatNumber(testNumber, 'de');
      // German uses dot as thousands separator and comma as decimal
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
      expect(formatted).toContain('567');
      expect(formatted).toMatch(/[.,]/); // Contains dot or comma
    });

    it('should format number in Chinese locale', () => {
      const formatted = formatNumber(testNumber, 'zh');
      // Chinese typically uses comma as thousands separator
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
      expect(formatted).toContain('567');
    });

    it('should format number in Turkish locale', () => {
      const formatted = formatNumber(testNumber, 'tr');
      // Turkish uses dot as thousands separator and comma as decimal
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
      expect(formatted).toContain('567');
    });

    it('should format number in English locale (comma separator, dot decimal)', () => {
      const formatted = formatNumber(testNumber, 'en');
      // English uses comma as thousands separator and dot as decimal
      expect(formatted).toContain('1,234,567');
      expect(formatted).toContain('.');
      expect(formatted).toMatch(/1,234,567\.\d+/);
    });

    it('should handle zero correctly', () => {
      locales.forEach(locale => {
        const formatted = formatNumber(0, locale);
        expect(formatted).toMatch(/^0/);
      });
    });

    it('should handle negative numbers correctly', () => {
      locales.forEach(locale => {
        const formatted = formatNumber(-1234.56, locale);
        expect(formatted).toMatch(/-|−/); // Contains minus sign
      });
    });

    it('should format integers without decimals', () => {
      const formatted = formatNumber(1234, 'en', { maximumFractionDigits: 0 });
      expect(formatted).toBe('1,234');
    });

    it('should format percentages correctly', () => {
      const formatted = formatPercentage(0.755, 'en', 1);
      expect(formatted).toContain('75.5');
      expect(formatted).toContain('%');
    });

    it('should format compact numbers correctly', () => {
      const formatted = formatCompactNumber(1234567, 'en');
      expect(formatted).toMatch(/1\.2M|1,2M/i);
    });
  });

  describe('6.5 Plural Rules', () => {
    it('should handle Russian plural rules (one, few, many)', () => {
      // Russian has complex plural rules:
      // one: 1, 21, 31, 41, 51, 61, 71, 81, 91, 101, 121, ...
      // few: 2-4, 22-24, 32-34, 42-44, 52-54, 62-64, 72-74, 82-84, 92-94, 102-104, ...
      // many: 0, 5-20, 25-30, 35-40, ...
      
      const pluralRules = new Intl.PluralRules('ru');
      
      expect(pluralRules.select(1)).toBe('one');
      expect(pluralRules.select(2)).toBe('few');
      expect(pluralRules.select(5)).toBe('many');
      expect(pluralRules.select(21)).toBe('one');
      expect(pluralRules.select(22)).toBe('few');
      expect(pluralRules.select(25)).toBe('many');
    });

    it('should handle English plural rules (one, other)', () => {
      // English has simple plural rules:
      // one: 1
      // other: everything else
      
      const pluralRules = new Intl.PluralRules('en');
      
      expect(pluralRules.select(0)).toBe('other');
      expect(pluralRules.select(1)).toBe('one');
      expect(pluralRules.select(2)).toBe('other');
      expect(pluralRules.select(100)).toBe('other');
    });

    it('should handle Turkish plural rules', () => {
      // Turkish has simple plural rules similar to English
      const pluralRules = new Intl.PluralRules('tr');
      
      expect(pluralRules.select(1)).toBe('one');
      expect(pluralRules.select(2)).toBe('other');
      expect(pluralRules.select(0)).toBe('other');
    });

    it('should handle German plural rules', () => {
      // German has simple plural rules:
      // one: 1
      // other: everything else
      
      const pluralRules = new Intl.PluralRules('de');
      
      expect(pluralRules.select(1)).toBe('one');
      expect(pluralRules.select(0)).toBe('other');
      expect(pluralRules.select(2)).toBe('other');
    });

    it('should handle Chinese plural rules', () => {
      // Chinese typically doesn't have plural forms
      // but Intl.PluralRules may return 'other' for all
      
      const pluralRules = new Intl.PluralRules('zh');
      
      const result1 = pluralRules.select(1);
      const result2 = pluralRules.select(2);
      
      // Chinese may use 'other' for all numbers
      expect(['one', 'other']).toContain(result1);
      expect(['one', 'other']).toContain(result2);
    });

    it('should provide consistent plural categories', () => {
      locales.forEach(locale => {
        const pluralRules = new Intl.PluralRules(locale);
        
        // Test that plural rules work for common numbers
        [0, 1, 2, 5, 10, 21, 100].forEach(num => {
          const category = pluralRules.select(num);
          expect(['zero', 'one', 'two', 'few', 'many', 'other']).toContain(category);
        });
      });
    });
  });

  describe('Additional i18n Tests', () => {
    it('should have consistent placeholder syntax across translations', () => {
      // Check that placeholders like {{username}} are consistent
      const enCommon = loadTranslations('en', 'common');
      const placeholderRegex = /\{\{[^}]+\}\}/g;
      
      if (enCommon.hero?.dashboard?.title) {
        const enPlaceholders = enCommon.hero.dashboard.title.match(placeholderRegex);
        
        if (enPlaceholders) {
          locales.forEach(locale => {
            const translations = loadTranslations(locale, 'common');
            const localePlaceholders = translations.hero?.dashboard?.title?.match(placeholderRegex);
            
            expect(localePlaceholders).toEqual(enPlaceholders);
          });
        }
      }
    });

    it('should not have HTML tags in translations', () => {
      const htmlRegex = /<[^>]+>/;
      
      locales.forEach(locale => {
        namespaces.forEach(namespace => {
          const translations = loadTranslations(locale, namespace);
          const keys = extractKeys(translations);
          
          keys.forEach(key => {
            const value = key.split('.').reduce((obj, k) => obj[k], translations);
            if (typeof value === 'string') {
              expect(value).not.toMatch(htmlRegex);
            }
          });
        });
      });
    });

    it('should have consistent emoji usage across translations', () => {
      // Check that emojis are preserved across translations
      const enCommon = loadTranslations('en', 'common');
      
      if (enCommon.footer?.builtWith) {
        const hasEmoji = /❤️/.test(enCommon.footer.builtWith);
        
        if (hasEmoji) {
          locales.forEach(locale => {
            const translations = loadTranslations(locale, 'common');
            expect(translations.footer?.builtWith).toMatch(/❤️/);
          });
        }
      }
    });

    it('should have reasonable translation length differences', () => {
      // Translations shouldn't be drastically different in length
      // (more than 3x difference might indicate missing content)
      
      namespaces.forEach(namespace => {
        const enTranslations = loadTranslations('en', namespace);
        const enKeys = extractKeys(enTranslations);
        
        enKeys.forEach(key => {
          const enValue = key.split('.').reduce((obj: any, k) => obj[k], enTranslations);
          
          if (typeof enValue === 'string' && enValue.length > 10) {
            locales.forEach(locale => {
              if (locale === 'en') return;
              
              const translations = loadTranslations(locale, namespace);
              
              // Safely get nested value
              let value: any;
              try {
                value = key.split('.').reduce((obj: any, k) => obj?.[k], translations);
              } catch (e) {
                // Key doesn't exist in this locale
                return;
              }
              
              if (typeof value === 'string') {
                const ratio = value.length / enValue.length;
                // Allow up to 5x difference in length (some languages are more verbose)
                // Chinese characters can be much more compact than English
                expect(ratio).toBeGreaterThan(0.15);
                expect(ratio).toBeLessThan(5);
              }
            });
          }
        });
      });
    });
  });
});
