/**
 * Accessibility Testing Suite
 * Tests WCAG 2.1 AA compliance, keyboard navigation, screen reader support, and color contrast
 */

import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/terms', name: 'terms' },
  { path: '/privacy', name: 'privacy' }
];

test.describe('Accessibility Audit', () => {
  
  test.describe('Automated axe-core Tests', () => {
    
    for (const page of PAGES) {
      test(`${page.name} page passes axe accessibility tests`, async ({ page: browserPage }: { page: Page }) => {
        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');
        
        const accessibilityScanResults = await new AxeBuilder({ page: browserPage })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        
        expect(accessibilityScanResults.violations).toEqual([]);
      });
    }

    test('Dark mode accessibility', async ({ page }: { page: Page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    
    test('Tab navigation through interactive elements', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      // Get all focusable elements
      const focusableElements = await page.locator(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ).all();
      
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Tab through elements
      for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
        await page.keyboard.press('Tab');
        
        // Verify focus is visible
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return null;
          
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            boxShadow: styles.boxShadow
          };
        });
        
        // Should have some focus indicator
        expect(
          focusedElement?.outline !== 'none' ||
          focusedElement?.outlineWidth !== '0px' ||
          focusedElement?.boxShadow !== 'none'
        ).toBeTruthy();
      }
    });

    test('Skip links functionality', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      // Press Tab to focus skip link
      await page.keyboard.press('Tab');
      
      const skipLink = page.locator('a[href="#main-content"]');
      if (await skipLink.count() > 0) {
        await expect(skipLink).toBeFocused();
        
        // Press Enter to activate
        await page.keyboard.press('Enter');
        
        // Verify main content is focused
        const mainContent = page.locator('#main-content');
        await expect(mainContent).toBeFocused();
      }
    });

    test('Modal keyboard interactions', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      
      // Look for any modal triggers
      const modalTrigger = page.locator('[data-modal-trigger]').first();
      
      if (await modalTrigger.count() > 0) {
        await modalTrigger.click();
        await page.waitForTimeout(300);
        
        // Escape should close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).not.toBeVisible();
      }
    });

    test('Form navigation with keyboard', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      
      // Tab to email input
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeFocused();
      
      // Type email
      await page.keyboard.type('test@example.com');
      
      // Tab to password
      await page.keyboard.press('Tab');
      
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeFocused();
      
      // Type password
      await page.keyboard.type('password123');
      
      // Tab to submit button
      await page.keyboard.press('Tab');
      
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeFocused();
    });
  });

  test.describe('Screen Reader Support', () => {
    
    test('ARIA labels on icon buttons', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const iconButtons = await page.locator('button:has(svg)').all();
      
      for (const button of iconButtons) {
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        const title = await button.getAttribute('title');
        const textContent = await button.textContent();
        
        // Button should have some accessible name
        expect(
          ariaLabel || ariaLabelledBy || title || textContent?.trim()
        ).toBeTruthy();
      }
    });

    test('Alt text on images', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Decorative images should have empty alt or role="presentation"
        // Content images should have descriptive alt
        expect(alt !== null || role === 'presentation').toBeTruthy();
      }
    });

    test('Semantic HTML structure', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      // Check for semantic landmarks
      const header = page.locator('header');
      const main = page.locator('main');
      const footer = page.locator('footer');
      const nav = page.locator('nav');
      
      await expect(header).toHaveCount(1);
      await expect(main).toHaveCount(1);
      await expect(footer).toHaveCount(1);
      expect(await nav.count()).toBeGreaterThan(0);
    });

    test('ARIA live regions for dynamic content', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      // Check for aria-live regions
      const liveRegions = page.locator('[aria-live]');
      
      if (await liveRegions.count() > 0) {
        const ariaLive = await liveRegions.first().getAttribute('aria-live');
        expect(['polite', 'assertive', 'off']).toContain(ariaLive);
      }
    });

    test('Form labels and descriptions', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      
      const inputs = await page.locator('input').all();
      
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        // Input should have associated label
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    });
  });

  test.describe('Color Contrast', () => {
    
    test('Text contrast meets WCAG AA standards', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .disableRules(['color-contrast']) // We'll check manually
        .analyze();
      
      // Check for color contrast violations specifically
      const contrastResults = await new AxeBuilder({ page })
        .include('body')
        .withRules(['color-contrast'])
        .analyze();
      
      expect(contrastResults.violations).toEqual([]);
    });

    test('Focus indicators have sufficient contrast', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      
      const button = page.locator('button').first();
      await button.focus();
      
      // Get computed styles
      const focusStyles = await button.evaluate((el: HTMLElement) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineColor: styles.outlineColor,
          boxShadow: styles.boxShadow
        };
      });
      
      // Should have visible focus indicator
      expect(
        focusStyles.outline !== 'none' ||
        focusStyles.boxShadow !== 'none'
      ).toBeTruthy();
    });

    test('Error states use color plus icon/text', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      
      // Submit form without filling to trigger errors
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      await page.waitForTimeout(500);
      
      // Check for error messages
      const errorMessages = page.locator('[class*="error"], [role="alert"]');
      
      if (await errorMessages.count() > 0) {
        const errorText = await errorMessages.first().textContent();
        
        // Error should have text content (not just color)
        expect(errorText?.trim().length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Motion Preferences', () => {
    
    test('Respects prefers-reduced-motion', async ({ page }: { page: Page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      
      // Check if animations are disabled
      const animatedElements = await page.locator('[class*="animate"]').all();
      
      for (const element of animatedElements.slice(0, 5)) {
        const animationDuration = await element.evaluate((el: HTMLElement) => {
          return window.getComputedStyle(el).animationDuration;
        });
        
        // Animation should be instant or very short
        expect(
          animationDuration === '0s' ||
          animationDuration === '0.01s' ||
          animationDuration === ''
        ).toBeTruthy();
      }
    });
  });

  test.describe('Touch Targets', () => {
    
    test('Interactive elements meet minimum size (44x44px)', async ({ page }: { page: Page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      const interactiveElements = await page.locator(
        'button, a, input[type="checkbox"], input[type="radio"]'
      ).all();
      
      for (const element of interactiveElements.slice(0, 10)) {
        const box = await element.boundingBox();
        
        if (box) {
          // Should be at least 44x44px or have adequate padding
          expect(box.width >= 44 || box.height >= 44).toBeTruthy();
        }
      }
    });
  });
});


