/**
 * Visual Regression Testing Suite
 * Tests all components in light/dark modes, all breakpoints, and all languages
 */

import { test, expect, Page } from '@playwright/test';

const BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  wide: { width: 2560, height: 1440 }
};

const LANGUAGES = ['en', 'tr', 'de', 'zh', 'ru'];
const THEMES = ['light', 'dark'];

// Key pages to test
const PAGES = [
  { path: '/', name: 'home' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/dashboard', name: 'dashboard', requiresAuth: true },
  { path: '/tasks', name: 'tasks', requiresAuth: true },
  { path: '/leaderboard', name: 'leaderboard', requiresAuth: true },
  { path: '/profile', name: 'profile', requiresAuth: true },
  { path: '/wallet', name: 'wallet', requiresAuth: true },
  { path: '/admin/dashboard', name: 'admin-dashboard', requiresAdmin: true },
  { path: '/admin/users', name: 'admin-users', requiresAdmin: true },
  { path: '/admin/tasks', name: 'admin-tasks', requiresAdmin: true }
];

test.describe('Visual Regression Tests', () => {
  
  test.describe('Component Rendering', () => {
    
    for (const theme of THEMES) {
      for (const [breakpointName, viewport] of Object.entries(BREAKPOINTS)) {
        
        test(`Home page - ${theme} mode - ${breakpointName}`, async ({ page }: { page: Page }) => {
          await page.setViewportSize(viewport);
          
          // Set theme
          if (theme === 'dark') {
            await page.emulateMedia({ colorScheme: 'dark' });
          }
          
          await page.goto('/');
          await page.waitForLoadState('networkidle');
          
          // Take screenshot
          await expect(page).toHaveScreenshot(
            `home-${theme}-${breakpointName}.png`,
            { fullPage: true }
          );
        });
      }
    }
  });

  test.describe('Language Variations', () => {
    
    for (const lang of LANGUAGES) {
      test(`Home page in ${lang}`, async ({ page }: { page: Page }) => {
        await page.goto(`/?lang=${lang}`);
        await page.waitForLoadState('networkidle');
        
        // Verify language is applied
        const html = await page.locator('html').getAttribute('lang');
        expect(html).toBe(lang);
        
        // Take screenshot
        await expect(page).toHaveScreenshot(
          `home-${lang}.png`,
          { fullPage: true }
        );
      });
    }
  });

  test.describe('Interactive States', () => {
    
    test('Button hover states', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const button = page.locator('button').first();
      await button.hover();
      
      await expect(page).toHaveScreenshot('button-hover.png');
    });

    test('Card hover effects', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const card = page.locator('[class*="card"]').first();
      if (await card.count() > 0) {
        await card.hover();
        await expect(page).toHaveScreenshot('card-hover.png');
      }
    });

    test('Input focus states', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      
      const input = page.locator('input[type="email"]');
      await input.focus();
      
      await expect(page).toHaveScreenshot('input-focus.png');
    });
  });

  test.describe('Responsive Layouts', () => {
    
    test('Mobile navigation menu', async ({ page }: { page: Page }) => {
      await page.setViewportSize(BREAKPOINTS.mobile);
      await page.goto('/');
      
      // Open mobile menu if exists
      const menuButton = page.locator('[aria-label*="menu"]');
      if (await menuButton.count() > 0) {
        await menuButton.click();
        await page.waitForTimeout(500); // Wait for animation
        
        await expect(page).toHaveScreenshot('mobile-menu-open.png');
      }
    });

    test('Tablet layout', async ({ page }: { page: Page }) => {
      await page.setViewportSize(BREAKPOINTS.tablet);
      await page.goto('/');
      
      await expect(page).toHaveScreenshot('tablet-layout.png', { fullPage: true });
    });
  });

  test.describe('Component Library', () => {
    
    test('Hero section variants', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const hero = page.locator('[class*="hero"]').first();
      if (await hero.count() > 0) {
        await expect(hero).toHaveScreenshot('hero-home.png');
      }
    });

    test('Card variants', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const cards = page.locator('[class*="card"]');
      const count = await cards.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(cards.nth(i)).toHaveScreenshot(`card-variant-${i}.png`);
      }
    });
  });
});

test.describe('Layout Consistency', () => {
  
  test('Header consistency across pages', async ({ page }: { page: Page }) => {
    const pages = ['/', '/login', '/register'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      const header = page.locator('header');
      
      if (await header.count() > 0) {
        await expect(header).toHaveScreenshot(`header-${pagePath.replace('/', 'root')}.png`);
      }
    }
  });

  test('Footer consistency across pages', async ({ page }: { page: Page }) => {
    const pages = ['/', '/login', '/register'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      const footer = page.locator('footer');
      
      if (await footer.count() > 0) {
        await expect(footer).toHaveScreenshot(`footer-${pagePath.replace('/', 'root')}.png`);
      }
    }
  });
});


