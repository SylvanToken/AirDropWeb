/**
 * Internationalization (i18n) Testing Suite
 * Tests translation completeness, formatting, language switching, and text overflow
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const LANGUAGES = ['en', 'tr', 'de', 'zh', 'ru'];
const NAMESPACES = ['common', 'auth', 'tasks', 'wallet', 'dashboard', 'admin', 'profile', 'legal'];

test.describe('Internationalization Testing', () => {
  
  test.describe('Translation Completeness', () => {
    
    test('All translation files exist', () => {
      for (const lang of LANGUAGES) {
        for (const namespace of NAMESPACES) {
          const filePath = path.join(process.cwd(), 'locales', lang, `${namespace}.json`);
          const exists = fs.existsSync(filePath);
          
          expect(exists).toBe(true);
        }
      }
    });

    test('All translation files are valid JSON', () => {
      for (const lang of LANGUAGES) {
        for (const namespace of NAMESPACES) {
          const filePath = path.join(process.cwd(), 'locales', lang, `${namespace}.json`);
          
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            expect(() => JSON.parse(content)).not.toThrow();
          }
        }
      }
    });

    test('All languages have same translation keys', () => {
      const englishKeys: Record<string, Set<string>> = {};
      
      // Get all keys from English (reference language)
      for (const namespace of NAMESPACES) {
        const filePath = path.join(process.cwd(), 'locales', 'en', `${namespace}.json`);
        
        if (fs.existsSync(filePath)) {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          englishKeys[namespace] = new Set(getAllKeys(content));
        }
      }
      
      // Check other languages have same keys
      for (const lang of LANGUAGES.filter(l => l !== 'en')) {
        for (const namespace of NAMESPACES) {
          const filePath = path.join(process.cwd(), 'locales', lang, `${namespace}.json`);
          
          if (fs.existsSync(filePath)) {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const langKeys = new Set(getAllKeys(content));
            
            const englishKeySet = englishKeys[namespace];
            if (englishKeySet) {
              // Check for missing keys
              const missingKeys = [...englishKeySet].filter(k => !langKeys.has(k));
              expect(missingKeys).toHaveLength(0);
              
              // Check for extra keys
              const extraKeys = [...langKeys].filter(k => !englishKeySet.has(k));
              expect(extraKeys).toHaveLength(0);
            }
          }
        }
      }
    });

    test('No empty translation values', () => {
      for (const lang of LANGUAGES) {
        for (const namespace of NAMESPACES) {
          const filePath = path.join(process.cwd(), 'locales', lang, `${namespace}.json`);
          
          if (fs.existsSync(filePath)) {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const emptyValues = findEmptyValues(content);
            
            expect(emptyValues).toHaveLength(0);
          }
        }
      }
    });

    test('Placeholders are preserved across translations', () => {
      const placeholderPattern = /\{\{[^}]+\}\}/g;
      
      for (const namespace of NAMESPACES) {
        const enFilePath = path.join(process.cwd(), 'locales', 'en', `${namespace}.json`);
        
        if (fs.existsSync(enFilePath)) {
          const enContent = JSON.parse(fs.readFileSync(enFilePath, 'utf-8'));
          const enPlaceholders = findPlaceholders(enContent, placeholderPattern);
          
          for (const lang of LANGUAGES.filter(l => l !== 'en')) {
            const langFilePath = path.join(process.cwd(), 'locales', lang, `${namespace}.json`);
            
            if (fs.existsSync(langFilePath)) {
              const langContent = JSON.parse(fs.readFileSync(langFilePath, 'utf-8'));
              const langPlaceholders = findPlaceholders(langContent, placeholderPattern);
              
              // Check each key has same placeholders
              for (const [key, enPlaceholder] of Object.entries(enPlaceholders)) {
                const langPlaceholder = langPlaceholders[key];
                
                if (enPlaceholder && langPlaceholder) {
                  expect(enPlaceholder.sort()).toEqual(langPlaceholder.sort());
                }
              }
            }
          }
        }
      }
    });
  });

  test.describe('Language Switching', () => {
    
    for (const lang of LANGUAGES) {
      test(`Can switch to ${lang}`, async ({ page }: { page: Page }) => {
        await page.goto('/');
        
        // Look for language switcher
        const langSwitcher = page.locator('[data-language-switcher]');
        
        if (await langSwitcher.count() > 0) {
          await langSwitcher.click();
          await page.waitForTimeout(300);
          
          // Select language
          const langOption = page.locator(`[data-lang="${lang}"]`);
          
          if (await langOption.count() > 0) {
            await langOption.click();
            await page.waitForTimeout(500);
            
            // Verify language changed
            const html = await page.locator('html').getAttribute('lang');
            expect(html).toBe(lang);
          }
        }
      });
    }

    test('Language preference persists across sessions', async ({ page, context }: { page: Page; context: BrowserContext }) => {
      await page.goto('/');
      
      // Switch to Turkish
      const langSwitcher = page.locator('[data-language-switcher]');
      
      if (await langSwitcher.count() > 0) {
        await langSwitcher.click();
        await page.waitForTimeout(300);
        
        const trOption = page.locator('[data-lang="tr"]');
        if (await trOption.count() > 0) {
          await trOption.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Create new page in same context
      const newPage = await context.newPage();
      await newPage.goto('/');
      
      // Check if language persisted
      const html = await newPage.locator('html').getAttribute('lang');
      expect(html).toBe('tr');
      
      await newPage.close();
    });

    test('URL reflects current language', async ({ page }: { page: Page }) => {
      await page.goto('/?lang=de');
      await page.waitForLoadState('networkidle');
      
      const html = await page.locator('html').getAttribute('lang');
      expect(html).toBe('de');
    });
  });

  test.describe('Date and Number Formatting', () => {
    
    test('Dates formatted according to locale', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/?lang=${lang}`);
        
        // Look for date elements
        const dateElements = page.locator('[data-date], time');
        
        if (await dateElements.count() > 0) {
          const dateText = await dateElements.first().textContent();
          expect(dateText).toBeTruthy();
          
          // Date should be formatted (not ISO string)
          expect(dateText).not.toMatch(/^\d{4}-\d{2}-\d{2}/);
        }
      }
    });

    test('Numbers formatted according to locale', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/?lang=${lang}`);
        
        // Look for number elements
        const numberElements = page.locator('[data-number]');
        
        if (await numberElements.count() > 0) {
          const numberText = await numberElements.first().textContent();
          expect(numberText).toBeTruthy();
        }
      }
    });

    test('Currency formatted according to locale', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/?lang=${lang}`);
        
        // Look for currency elements
        const currencyElements = page.locator('[data-currency]');
        
        if (await currencyElements.count() > 0) {
          const currencyText = await currencyElements.first().textContent();
          expect(currencyText).toBeTruthy();
        }
      }
    });

    test('Relative time formatted according to locale', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/?lang=${lang}`);
        
        // Look for relative time elements
        const relativeTimeElements = page.locator('[data-relative-time]');
        
        if (await relativeTimeElements.count() > 0) {
          const timeText = await relativeTimeElements.first().textContent();
          expect(timeText).toBeTruthy();
        }
      }
    });
  });

  test.describe('Text Overflow and Layout', () => {
    
    test('No text overflow in buttons', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/?lang=${lang}`);
        
        const buttons = await page.locator('button').all();
        
        for (const button of buttons.slice(0, 10)) {
          const box = await button.boundingBox();
          
          if (box) {
            const isOverflowing = await button.evaluate((el: HTMLElement) => {
              return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
            });
            
            expect(isOverflowing).toBe(false);
          }
        }
      }
    });

    test('No text overflow in cards', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/?lang=${lang}`);
        
        const cards = await page.locator('[class*="card"]').all();
        
        for (const card of cards.slice(0, 5)) {
          const isOverflowing = await card.evaluate((el: HTMLElement) => {
            const children = el.querySelectorAll('*');
            
            for (const child of children) {
              if (child.scrollWidth > child.clientWidth) {
                return true;
              }
            }
            
            return false;
          });
          
          expect(isOverflowing).toBe(false);
        }
      }
    });

    test('Long translations handled gracefully', async ({ page }: { page: Page }) => {
      // German typically has longer words
      await page.goto('/?lang=de');
      
      const body = page.locator('body');
      const hasHorizontalScroll = await body.evaluate((el: HTMLElement) => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBe(false);
    });

    test('Navigation items fit in header', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/?lang=${lang}`);
        
        const header = page.locator('header');
        const nav = header.locator('nav');
        
        if (await nav.count() > 0) {
          const headerBox = await header.boundingBox();
          const navBox = await nav.boundingBox();
          
          if (headerBox && navBox) {
            expect(navBox.width).toBeLessThanOrEqual(headerBox.width);
          }
        }
      }
    });

    test('Form labels align properly', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/login?lang=${lang}`);
        
        const labels = await page.locator('label').all();
        
        for (const label of labels) {
          const box = await label.boundingBox();
          
          if (box) {
            const isOverflowing = await label.evaluate((el: HTMLElement) => {
              return el.scrollWidth > el.clientWidth;
            });
            
            expect(isOverflowing).toBe(false);
          }
        }
      }
    });
  });

  test.describe('Content Translation', () => {
    
    test('Page titles translated', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/?lang=${lang}`);
        
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      }
    });

    test('Navigation links translated', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/?lang=${lang}`);
        
        const navLinks = await page.locator('nav a').all();
        
        for (const link of navLinks) {
          const text = await link.textContent();
          expect(text?.trim().length).toBeGreaterThan(0);
        }
      }
    });

    test('Error messages translated', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/login?lang=${lang}`);
        
        // Submit empty form to trigger errors
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();
        await page.waitForTimeout(500);
        
        const errorMessages = page.locator('[class*="error"], [role="alert"]');
        
        if (await errorMessages.count() > 0) {
          const errorText = await errorMessages.first().textContent();
          expect(errorText?.trim().length).toBeGreaterThan(0);
        }
      }
    });

    test('Button labels translated', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/?lang=${lang}`);
        
        const buttons = await page.locator('button').all();
        
        for (const button of buttons.slice(0, 5)) {
          const text = await button.textContent();
          const ariaLabel = await button.getAttribute('aria-label');
          
          // Button should have text or aria-label
          expect(text?.trim() || ariaLabel).toBeTruthy();
        }
      }
    });
  });

  test.describe('Special Characters and Encoding', () => {
    
    test('Special characters render correctly', async ({ page }: { page: Page }) => {
      for (const lang of LANGUAGES) {
        await page.goto(`/?lang=${lang}`);
        
        const body = await page.locator('body').textContent();
        
        // Should not have encoding issues
        expect(body).not.toContain('�');
        expect(body).not.toContain('&amp;');
        expect(body).not.toContain('&lt;');
        expect(body).not.toContain('&gt;');
      }
    });

    test('Chinese characters render correctly', async ({ page }: { page: Page }) => {
      await page.goto('/?lang=zh');
      
      const body = await page.locator('body').textContent();
      
      // Should contain Chinese characters
      const hasChinese = /[\u4e00-\u9fa5]/.test(body || '');
      expect(hasChinese).toBe(true);
    });

    test('German umlauts render correctly', async ({ page }: { page: Page }) => {
      await page.goto('/?lang=de');
      
      const body = await page.locator('body').textContent();
      
      // Should contain German special characters
      const hasGermanChars = /[äöüßÄÖÜ]/.test(body || '');
      expect(hasGermanChars).toBe(true);
    });

    test('Turkish characters render correctly', async ({ page }: { page: Page }) => {
      await page.goto('/?lang=tr');
      
      const body = await page.locator('body').textContent();
      
      // Should contain Turkish special characters
      const hasTurkishChars = /[çğıöşüÇĞİÖŞÜ]/.test(body || '');
      expect(hasTurkishChars).toBe(true);
    });
  });
});

// Helper functions
function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

function findEmptyValues(obj: any, prefix = ''): string[] {
  let emptyKeys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      emptyKeys = emptyKeys.concat(findEmptyValues(value, fullKey));
    } else if (typeof value === 'string' && value.trim() === '') {
      emptyKeys.push(fullKey);
    }
  }
  
  return emptyKeys;
}

function findPlaceholders(obj: any, pattern: RegExp, prefix = ''): Record<string, string[]> {
  let placeholders: Record<string, string[]> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      placeholders = { ...placeholders, ...findPlaceholders(value, pattern, fullKey) };
    } else if (typeof value === 'string') {
      const matches = value.match(pattern);
      if (matches) {
        placeholders[fullKey] = matches;
      }
    }
  }
  
  return placeholders;
}




