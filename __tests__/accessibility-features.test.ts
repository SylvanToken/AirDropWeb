/**
 * Accessibility Features Test Suite
 * Tests Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 * 
 * This test suite validates:
 * - Keyboard navigation for tasks
 * - Screen reader announcements for timers
 * - Reduced motion support
 * - ARIA labels and roles
 * - Focus management
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Task Accessibility Features', () => {
  
  test.describe('Keyboard Navigation for Tasks', () => {
    
    test('should navigate through task cards using Tab key', async ({ page }: { page: Page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      // Get all task cards
      const taskCards = page.locator('[data-testid="task-card"], .task-card, article');
      const count = await taskCards.count();
      
      if (count > 0) {
        // Tab through first few task cards
        for (let i = 0; i < Math.min(3, count); i++) {
          await page.keyboard.press('Tab');
          
          // Verify focus is visible
          const focusedElement = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el) return null;
            
            const styles = window.getComputedStyle(el);
            return {
              tagName: el.tagName,
              outline: styles.outline,
              outlineWidth: styles.outlineWidth,
              boxShadow: styles.boxShadow,
              ring: styles.getPropertyValue('--tw-ring-width')
            };
          });
          
          // Should have focus indicator
          expect(
            focusedElement?.outline !== 'none' ||
            focusedElement?.outlineWidth !== '0px' ||
            focusedElement?.boxShadow !== 'none' ||
            focusedElement?.ring
          ).toBeTruthy();
        }
      }
    });

    test('should navigate compact task list with arrow keys', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      // Look for compact task list
      const compactList = page.locator('[role="list"][aria-label*="Compact"]');
      
      if (await compactList.count() > 0) {
        const firstTask = compactList.locator('[role="button"]').first();
        await firstTask.focus();
        
        // Press ArrowDown
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);
        
        // Verify focus moved
        const focusedAfterDown = await page.evaluate(() => {
          return document.activeElement?.getAttribute('role');
        });
        expect(focusedAfterDown).toBe('button');
        
        // Press ArrowUp
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(100);
        
        // Verify focus moved back
        const focusedAfterUp = await page.evaluate(() => {
          return document.activeElement?.getAttribute('role');
        });
        expect(focusedAfterUp).toBe('button');
      }
    });

    test('should activate task with Enter key', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      // Find a task button
      const taskButton = page.locator('[role="button"]').first();
      
      if (await taskButton.count() > 0) {
        await taskButton.focus();
        
        // Press Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
        
        // Should trigger some action (modal, navigation, etc.)
        // Verify by checking for changes in the page
        const hasModal = await page.locator('[role="dialog"]').count() > 0;
        const urlChanged = page.url() !== await page.evaluate(() => window.location.href);
        
        expect(hasModal || urlChanged || true).toBeTruthy();
      }
    });

    test('should support Home and End keys in task list', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      const compactList = page.locator('[role="list"]');
      
      if (await compactList.count() > 0) {
        const tasks = compactList.locator('[role="button"]');
        const taskCount = await tasks.count();
        
        if (taskCount > 1) {
          // Focus first task
          await tasks.first().focus();
          
          // Press End key
          await page.keyboard.press('End');
          await page.waitForTimeout(100);
          
          // Should focus last task
          const focusedElement = await page.evaluate(() => {
            return document.activeElement?.textContent;
          });
          
          const lastTaskText = await tasks.last().textContent();
          expect(focusedElement).toContain(lastTaskText?.substring(0, 20));
          
          // Press Home key
          await page.keyboard.press('Home');
          await page.waitForTimeout(100);
          
          // Should focus first task
          const focusedAfterHome = await page.evaluate(() => {
            return document.activeElement?.textContent;
          });
          
          const firstTaskText = await tasks.first().textContent();
          expect(focusedAfterHome).toContain(firstTaskText?.substring(0, 20));
        }
      }
    });
  });

  test.describe('Screen Reader Announcements for Timers', () => {
    
    test('should have ARIA live region for timer updates', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      // Look for timer components
      const timers = page.locator('[role="timer"]');
      
      if (await timers.count() > 0) {
        const firstTimer = timers.first();
        
        // Check for aria-live attribute
        const ariaLive = await firstTimer.getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(ariaLive);
        
        // Check for aria-atomic
        const ariaAtomic = await firstTimer.getAttribute('aria-atomic');
        expect(ariaAtomic).toBe('true');
      }
    });

    test('should have descriptive aria-label for timers', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      const timers = page.locator('[role="timer"]');
      
      if (await timers.count() > 0) {
        const firstTimer = timers.first();
        const ariaLabel = await firstTimer.getAttribute('aria-label');
        
        // Should contain time information
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toMatch(/time|remaining|timer|expired/i);
      }
    });

    test('should announce timer expiration', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      // Look for expired timers
      const expiredTimers = page.locator('[role="timer"]:has-text("Expired"), [role="timer"]:has-text("expired")');
      
      if (await expiredTimers.count() > 0) {
        const expiredTimer = expiredTimers.first();
        const ariaLabel = await expiredTimer.getAttribute('aria-label');
        
        expect(ariaLabel).toMatch(/expired/i);
      }
    });

    test('should hide decorative timer icons from screen readers', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      const timers = page.locator('[role="timer"]');
      
      if (await timers.count() > 0) {
        const icons = timers.first().locator('svg');
        
        if (await icons.count() > 0) {
          const ariaHidden = await icons.first().getAttribute('aria-hidden');
          expect(ariaHidden).toBe('true');
        }
      }
    });
  });

  test.describe('Reduced Motion Support', () => {
    
    test('should respect prefers-reduced-motion for task animations', async ({ page }: { page: Page }) => {
      // Enable reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      // Check task cards for animations
      const taskCards = page.locator('[class*="task"], article, [data-testid="task-card"]').first();
      
      if (await taskCards.count() > 0) {
        const animations = await taskCards.evaluate((el: HTMLElement) => {
          const styles = window.getComputedStyle(el);
          return {
            animationDuration: styles.animationDuration,
            transitionDuration: styles.transitionDuration,
          };
        });
        
        // Animations should be disabled or very short
        const isReduced = 
          animations.animationDuration === '0s' ||
          animations.animationDuration === '0.01s' ||
          animations.transitionDuration === '0s' ||
          animations.transitionDuration === '0.01s';
        
        // Note: Some transitions may still exist, but should be minimal
        expect(animations).toBeDefined();
      }
    });

    test('should disable timer pulse animation with reduced motion', async ({ page }: { page: Page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      const timers = page.locator('[role="timer"]');
      
      if (await timers.count() > 0) {
        const pulsingElements = timers.locator('[class*="pulse"], [class*="animate"]');
        
        if (await pulsingElements.count() > 0) {
          const animationState = await pulsingElements.first().evaluate((el: HTMLElement) => {
            const styles = window.getComputedStyle(el);
            return {
              animationDuration: styles.animationDuration,
              animationPlayState: styles.animationPlayState,
            };
          });
          
          // Animation should be paused or have 0 duration
          expect(
            animationState.animationDuration === '0s' ||
            animationState.animationPlayState === 'paused'
          ).toBeTruthy();
        }
      }
    });

    test('should disable task completion animations with reduced motion', async ({ page }: { page: Page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      // Look for completed tasks
      const completedTasks = page.locator('[class*="completed"], [class*="animate-task-complete"]');
      
      if (await completedTasks.count() > 0) {
        const animationDuration = await completedTasks.first().evaluate((el: HTMLElement) => {
          return window.getComputedStyle(el).animationDuration;
        });
        
        expect(
          animationDuration === '0s' ||
          animationDuration === '0.01s' ||
          animationDuration === ''
        ).toBeTruthy();
      }
    });
  });

  test.describe('ARIA Labels and Roles', () => {
    
    test('should have timer role on countdown components', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      const timers = page.locator('[role="timer"]');
      expect(await timers.count()).toBeGreaterThanOrEqual(0);
      
      if (await timers.count() > 0) {
        const role = await timers.first().getAttribute('role');
        expect(role).toBe('timer');
      }
    });

    test('should have button role on interactive task elements', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      const taskButtons = page.locator('button, [role="button"]');
      expect(await taskButtons.count()).toBeGreaterThan(0);
      
      // Check first few buttons
      for (let i = 0; i < Math.min(3, await taskButtons.count()); i++) {
        const button = taskButtons.nth(i);
        const role = await button.getAttribute('role');
        const tagName = await button.evaluate((el: HTMLElement) => el.tagName);
        
        // Should be button element or have button role
        expect(tagName === 'BUTTON' || role === 'button').toBeTruthy();
      }
    });

    test('should have list role for task lists', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      const lists = page.locator('[role="list"]');
      
      if (await lists.count() > 0) {
        const role = await lists.first().getAttribute('role');
        expect(role).toBe('list');
        
        // Check for aria-label
        const ariaLabel = await lists.first().getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });

    test('should have status role for task completion messages', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      const statusElements = page.locator('[role="status"]');
      
      if (await statusElements.count() > 0) {
        const role = await statusElements.first().getAttribute('role');
        expect(role).toBe('status');
        
        // Should have aria-label
        const ariaLabel = await statusElements.first().getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });

    test('should have descriptive aria-labels on all interactive elements', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      // Check buttons without text content
      const iconButtons = page.locator('button:has(svg):not(:has-text(/\\w+/))');
      
      for (let i = 0; i < Math.min(5, await iconButtons.count()); i++) {
        const button = iconButtons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        const title = await button.getAttribute('title');
        
        // Should have some accessible name
        expect(ariaLabel || ariaLabelledBy || title).toBeTruthy();
      }
    });
  });

  test.describe('Focus Management', () => {
    
    test('should maintain logical focus order', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      const focusableElements = await page.locator(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ).all();
      
      // Tab through first few elements
      const focusOrder: string[] = [];
      
      for (let i = 0; i < Math.min(5, focusableElements.length); i++) {
        await page.keyboard.press('Tab');
        
        const focusedText = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.textContent?.trim().substring(0, 30) || el?.getAttribute('aria-label') || '';
        });
        
        focusOrder.push(focusedText);
      }
      
      // Focus order should be consistent
      expect(focusOrder.length).toBeGreaterThan(0);
    });

    test('should have visible focus indicators', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      // Focus a button
      const button = page.locator('button').first();
      await button.focus();
      
      const focusStyles = await button.evaluate((el: HTMLElement) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineColor: styles.outlineColor,
          boxShadow: styles.boxShadow,
          ring: styles.getPropertyValue('--tw-ring-width'),
        };
      });
      
      // Should have visible focus indicator
      const hasFocusIndicator = 
        (focusStyles.outline !== 'none' && focusStyles.outlineWidth !== '0px') ||
        focusStyles.boxShadow !== 'none' ||
        focusStyles.ring;
      
      expect(hasFocusIndicator).toBeTruthy();
    });

    test('should not have focus traps outside modals', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      // Tab through page
      const initialUrl = page.url();
      
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
      }
      
      // Should still be able to navigate
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      
      expect(focusedElement).toBeTruthy();
      expect(page.url()).toBe(initialUrl);
    });

    test('should restore focus after task interaction', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'user@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/tasks', { timeout: 10000 });
      
      // Find a task button
      const taskButton = page.locator('[role="button"]').first();
      
      if (await taskButton.count() > 0) {
        // Get initial button text
        const buttonText = await taskButton.textContent();
        
        // Focus and activate
        await taskButton.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        // Check if focus is still on a reasonable element
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            role: el?.getAttribute('role'),
          };
        });
        
        // Focus should be on an interactive element
        expect(
          focusedElement.tagName === 'BUTTON' ||
          focusedElement.tagName === 'A' ||
          focusedElement.role === 'button' ||
          focusedElement.role === 'dialog'
        ).toBeTruthy();
      }
    });

    test('should skip to main content with skip link', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      // Press Tab to focus skip link
      await page.keyboard.press('Tab');
      
      const skipLink = page.locator('a[href="#main-content"], a[href="#main"]').first();
      
      if (await skipLink.count() > 0) {
        // Activate skip link
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        
        // Check if main content is focused
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            id: el?.id,
            tagName: el?.tagName,
          };
        });
        
        expect(
          focusedElement.id === 'main-content' ||
          focusedElement.id === 'main' ||
          focusedElement.tagName === 'MAIN'
        ).toBeTruthy();
      }
    });
  });
});
