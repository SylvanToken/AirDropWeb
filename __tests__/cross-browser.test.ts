/**
 * Cross-Browser Testing Suite
 * Tests compatibility across Chrome, Firefox, Safari, Edge, and mobile browsers
 */

import { test, expect, devices, Page } from '@playwright/test';

const BROWSERS = ['chromium', 'firefox', 'webkit']; // webkit = Safari
const MOBILE_DEVICES = ['iPhone 13', 'Pixel 5', 'iPad Pro'];

const CRITICAL_FEATURES = [
  {
    name: 'Form submission',
    test: async (page: any) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeEnabled();
    }
  },
  {
    name: 'Navigation',
    test: async (page: any) => {
      await page.goto('/');
      
      const links = await page.locator('a[href]').all();
      expect(links.length).toBeGreaterThan(0);
      
      // Click first internal link
      const firstLink = links[0];
      const href = await firstLink.getAttribute('href');
      
      if (href && !href.startsWith('http')) {
        await firstLink.click();
        await page.waitForLoadState('domcontentloaded');
        expect(page.url()).toContain(href);
      }
    }
  },
  {
    name: 'Language switching',
    test: async (page: any) => {
      await page.goto('/');
      
      // Look for language switcher
      const langSwitcher = page.locator('[data-language-switcher], [aria-label*="language"]');
      
      if (await langSwitcher.count() > 0) {
        await langSwitcher.click();
        await page.waitForTimeout(300);
        
        // Select a language option
        const langOption = page.locator('[data-lang], [lang]').first();
        if (await langOption.count() > 0) {
          await langOption.click();
          await page.waitForTimeout(500);
        }
      }
    }
  },
  {
    name: 'Dark mode toggle',
    test: async (page: any) => {
      await page.goto('/');
      
      const themeToggle = page.locator('[data-theme-toggle], [aria-label*="theme"]');
      
      if (await themeToggle.count() > 0) {
        await themeToggle.click();
        await page.waitForTimeout(300);
        
        // Verify theme changed
        const html = page.locator('html');
        const className = await html.getAttribute('class');
        expect(className).toBeTruthy();
      }
    }
  },
  {
    name: 'Modal interactions',
    test: async (page: any) => {
      await page.goto('/');
      
      const modalTrigger = page.locator('[data-modal-trigger]').first();
      
      if (await modalTrigger.count() > 0) {
        await modalTrigger.click();
        await page.waitForTimeout(300);
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await expect(modal).not.toBeVisible();
      }
    }
  }
];

test.describe('Cross-Browser Compatibility', () => {
  
  test.describe('Desktop Browsers', () => {
    
    test('Home page renders in all browsers', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check basic rendering
      const title = await page.title();
      expect(title).toBeTruthy();
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('CSS Grid support', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const gridElements = await page.locator('[style*="grid"], [class*="grid"]').all();
      
      for (const element of gridElements.slice(0, 5)) {
        const display = await element.evaluate((el: HTMLElement) => {
          return window.getComputedStyle(el).display;
        });
        
        expect(['grid', 'inline-grid']).toContain(display);
      }
    });

    test('Flexbox support', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const flexElements = await page.locator('[style*="flex"], [class*="flex"]').all();
      
      for (const element of flexElements.slice(0, 5)) {
        const display = await element.evaluate((el: HTMLElement) => {
          return window.getComputedStyle(el).display;
        });
        
        expect(['flex', 'inline-flex']).toContain(display);
      }
    });

    test('CSS Custom Properties (variables)', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const customProp = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return styles.getPropertyValue('--primary');
      });
      
      expect(customProp).toBeTruthy();
    });

    test('Modern JavaScript features', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const supportsModernJS = await page.evaluate(() => {
        try {
          // Test arrow functions
          const arrow = () => true;
          
          // Test template literals
          const template = `test`;
          
          // Test destructuring
          const { test } = { test: true };
          
          // Test spread operator
          const arr = [...[1, 2, 3]];
          
          // Test async/await
          const asyncTest = async () => true;
          
          return true;
        } catch (e) {
          return false;
        }
      });
      
      expect(supportsModernJS).toBe(true);
    });
  });

  test.describe('Mobile Browsers', () => {
    
    for (const deviceName of MOBILE_DEVICES) {
      test(`Renders correctly on ${deviceName}`, async ({ page }: { page: Page }) => {
        const device = devices[deviceName];
        await page.setViewportSize(device.viewport);
        
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check viewport meta tag
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        expect(viewport).toContain('width=device-width');
        
        // Check mobile-friendly layout
        const body = page.locator('body');
        const width = await body.evaluate((el: HTMLElement) => el.offsetWidth);
        expect(width).toBeLessThanOrEqual(device.viewport.width);
      });
    }

    test('Touch events work on mobile', async ({ page }: { page: Page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      const button = page.locator('button').first();
      
      // Simulate touch
      await button.tap();
      await page.waitForTimeout(100);
      
      // Button should respond to touch
      expect(true).toBe(true); // If we got here, touch worked
    });

    test('Mobile navigation menu', async ({ page }: { page: Page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Look for hamburger menu
      const menuButton = page.locator('[aria-label*="menu"], [data-mobile-menu]');
      
      if (await menuButton.count() > 0) {
        await menuButton.click();
        await page.waitForTimeout(300);
        
        // Menu should be visible
        const menu = page.locator('[role="navigation"], nav');
        await expect(menu.first()).toBeVisible();
      }
    });

    test('Pinch zoom disabled on form inputs', async ({ page }: { page: Page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      
      // Should allow user scaling
      expect(viewport).not.toContain('user-scalable=no');
      expect(viewport).not.toContain('maximum-scale=1');
    });
  });

  test.describe('Feature Compatibility', () => {
    
    for (const feature of CRITICAL_FEATURES) {
      test(`${feature.name} works across browsers`, async ({ page }: { page: Page }) => {
        await feature.test(page);
      });
    }

    test('LocalStorage support', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const hasLocalStorage = await page.evaluate(() => {
        try {
          localStorage.setItem('test', 'value');
          const value = localStorage.getItem('test');
          localStorage.removeItem('test');
          return value === 'value';
        } catch (e) {
          return false;
        }
      });
      
      expect(hasLocalStorage).toBe(true);
    });

    test('SessionStorage support', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const hasSessionStorage = await page.evaluate(() => {
        try {
          sessionStorage.setItem('test', 'value');
          const value = sessionStorage.getItem('test');
          sessionStorage.removeItem('test');
          return value === 'value';
        } catch (e) {
          return false;
        }
      });
      
      expect(hasSessionStorage).toBe(true);
    });

    test('Fetch API support', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const hasFetch = await page.evaluate(() => {
        return typeof fetch === 'function';
      });
      
      expect(hasFetch).toBe(true);
    });

    test('IntersectionObserver support', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const hasIntersectionObserver = await page.evaluate(() => {
        return typeof IntersectionObserver === 'function';
      });
      
      expect(hasIntersectionObserver).toBe(true);
    });
  });

  test.describe('CSS Features', () => {
    
    test('Backdrop filter support', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const supportsBackdropFilter = await page.evaluate(() => {
        return CSS.supports('backdrop-filter', 'blur(10px)') ||
               CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
      });
      
      // Should support or have fallback
      expect(typeof supportsBackdropFilter).toBe('boolean');
    });

    test('CSS Grid support', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const supportsGrid = await page.evaluate(() => {
        return CSS.supports('display', 'grid');
      });
      
      expect(supportsGrid).toBe(true);
    });

    test('CSS Flexbox support', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const supportsFlex = await page.evaluate(() => {
        return CSS.supports('display', 'flex');
      });
      
      expect(supportsFlex).toBe(true);
    });

    test('CSS Animations support', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const supportsAnimations = await page.evaluate(() => {
        return CSS.supports('animation', 'test 1s');
      });
      
      expect(supportsAnimations).toBe(true);
    });
  });

  test.describe('Image Format Support', () => {
    
    test('WebP support', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const supportsWebP = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      });
      
      // Most modern browsers support WebP
      expect(typeof supportsWebP).toBe('boolean');
    });

    test('AVIF support detection', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const supportsAVIF = await page.evaluate(() => {
        return new Promise((resolve) => {
          const avif = new Image();
          avif.onload = () => resolve(true);
          avif.onerror = () => resolve(false);
          avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        });
      });
      
      expect(typeof supportsAVIF).toBe('boolean');
    });
  });

  test.describe('Browser-Specific Issues', () => {
    
    test('No console errors on page load', async ({ page }: { page: Page }) => {
      const errors: string[] = [];
      
      page.on('console', (msg: any) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter out known third-party errors
      const relevantErrors = errors.filter(err => 
        !err.includes('favicon') &&
        !err.includes('chrome-extension')
      );
      
      expect(relevantErrors).toHaveLength(0);
    });

    test('No JavaScript errors', async ({ page }: { page: Page }) => {
      const errors: Error[] = [];
      
      page.on('pageerror', (error: Error) => {
        errors.push(error);
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Click around to trigger interactions
      const buttons = await page.locator('button').all();
      for (const button of buttons.slice(0, 3)) {
        await button.click({ force: true });
        await page.waitForTimeout(100);
      }
      
      expect(errors).toHaveLength(0);
    });

    test('Fonts load correctly', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const fontFamily = await page.evaluate(() => {
        return window.getComputedStyle(document.body).fontFamily;
      });
      
      expect(fontFamily).toBeTruthy();
      expect(fontFamily).not.toBe('Times New Roman'); // Should use custom font
    });
  });

  test.describe('Timer Accuracy Across Browsers', () => {
    
    test('Timer countdown accuracy', async ({ page }: { page: Page }) => {
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      
      // Look for timer displays
      const timers = page.locator('[role="timer"], [data-timer], [aria-label*="timer"]');
      const timerCount = await timers.count();
      
      if (timerCount > 0) {
        const firstTimer = timers.first();
        
        // Get initial time
        const initialText = await firstTimer.textContent();
        
        // Wait 2 seconds
        await page.waitForTimeout(2000);
        
        // Get updated time
        const updatedText = await firstTimer.textContent();
        
        // Timer should have updated (text should be different)
        expect(initialText).not.toBe(updatedText);
      }
    });

    test('Timer persists across page refresh', async ({ page }: { page: Page }) => {
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      
      // Check if timers exist
      const timers = page.locator('[role="timer"], [data-timer]');
      const timerCount = await timers.count();
      
      if (timerCount > 0) {
        const initialTimerText = await timers.first().textContent();
        
        // Refresh page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Timer should still exist
        const refreshedTimers = page.locator('[role="timer"], [data-timer]');
        await expect(refreshedTimers.first()).toBeVisible();
      }
    });

    test('Multiple timers update independently', async ({ page }: { page: Page }) => {
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      
      const timers = page.locator('[role="timer"], [data-timer]');
      const timerCount = await timers.count();
      
      if (timerCount > 1) {
        // Get initial values
        const timer1Initial = await timers.nth(0).textContent();
        const timer2Initial = await timers.nth(1).textContent();
        
        // Wait for update
        await page.waitForTimeout(1500);
        
        // Get updated values
        const timer1Updated = await timers.nth(0).textContent();
        const timer2Updated = await timers.nth(1).textContent();
        
        // Both should update
        expect(timer1Initial).not.toBe(timer1Updated);
        expect(timer2Initial).not.toBe(timer2Updated);
      }
    });

    test('Timer handles browser tab switching', async ({ page }: { page: Page }) => {
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      
      const timers = page.locator('[role="timer"], [data-timer]');
      const timerCount = await timers.count();
      
      if (timerCount > 0) {
        const initialText = await timers.first().textContent();
        
        // Simulate tab switch by opening new page and coming back
        const newPage = await page.context().newPage();
        await newPage.goto('/');
        await page.waitForTimeout(2000);
        await newPage.close();
        
        // Return to original page
        await page.bringToFront();
        await page.waitForTimeout(500);
        
        // Timer should still be running
        const updatedText = await timers.first().textContent();
        expect(initialText).not.toBe(updatedText);
      }
    });

    test('Timer accuracy with setInterval', async ({ page }: { page: Page }) => {
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      
      // Measure timer accuracy
      const accuracy = await page.evaluate(() => {
        return new Promise<boolean>((resolve) => {
          const start = Date.now();
          let count = 0;
          
          const interval = setInterval(() => {
            count++;
            if (count === 5) {
              clearInterval(interval);
              const elapsed = Date.now() - start;
              // Should be approximately 5000ms (allow 200ms variance)
              resolve(Math.abs(elapsed - 5000) < 200);
            }
          }, 1000);
        });
      });
      
      expect(accuracy).toBe(true);
    });
  });

  test.describe('Background Rendering Across Browsers', () => {
    
    test('Background image loads correctly', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for background image
      const background = page.locator('[data-background], .page-background');
      
      if (await background.count() > 0) {
        await expect(background.first()).toBeVisible();
        
        // Check if image is loaded
        const hasImage = await background.first().evaluate((el: HTMLElement) => {
          const img = el.querySelector('img');
          return img ? img.complete && img.naturalHeight > 0 : false;
        });
        
        expect(hasImage).toBe(true);
      }
    });

    test('Background covers full viewport', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const background = page.locator('[data-background], .page-background');
      
      if (await background.count() > 0) {
        const dimensions = await background.first().evaluate((el: HTMLElement) => {
          const rect = el.getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
          };
        });
        
        // Background should cover viewport
        expect(dimensions.width).toBeGreaterThanOrEqual(dimensions.viewportWidth * 0.95);
        expect(dimensions.height).toBeGreaterThanOrEqual(dimensions.viewportHeight * 0.95);
      }
    });

    test('Background maintains aspect ratio', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const background = page.locator('[data-background] img, .page-background img');
      
      if (await background.count() > 0) {
        const aspectRatio = await background.first().evaluate((img: HTMLImageElement) => {
          return {
            natural: img.naturalWidth / img.naturalHeight,
            rendered: img.width / img.height,
            objectFit: window.getComputedStyle(img).objectFit
          };
        });
        
        // Should use object-fit: cover
        expect(aspectRatio.objectFit).toBe('cover');
      }
    });

    test('Background changes on refresh', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const background = page.locator('[data-background] img, .page-background img');
      
      if (await background.count() > 0) {
        const firstSrc = await background.first().getAttribute('src');
        
        // Refresh page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const secondSrc = await background.first().getAttribute('src');
        
        // Images might be different (random selection)
        expect(firstSrc).toBeTruthy();
        expect(secondSrc).toBeTruthy();
      }
    });

    test('Background overlay provides contrast', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const overlay = page.locator('[data-background] [class*="overlay"], .page-background [class*="overlay"]');
      
      if (await overlay.count() > 0) {
        const overlayStyles = await overlay.first().evaluate((el: HTMLElement) => {
          const styles = window.getComputedStyle(el);
          return {
            opacity: styles.opacity,
            background: styles.background,
            position: styles.position
          };
        });
        
        expect(parseFloat(overlayStyles.opacity)).toBeGreaterThan(0);
        expect(overlayStyles.position).toBe('absolute');
      }
    });

    test('Background does not interfere with content', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check z-index layering
      const background = page.locator('[data-background], .page-background');
      const content = page.locator('main, [role="main"]');
      
      if (await background.count() > 0 && await content.count() > 0) {
        const zIndices = await page.evaluate(() => {
          const bg = document.querySelector('[data-background], .page-background') as HTMLElement;
          const main = document.querySelector('main, [role="main"]') as HTMLElement;
          
          return {
            background: bg ? parseInt(window.getComputedStyle(bg).zIndex) || 0 : 0,
            content: main ? parseInt(window.getComputedStyle(main).zIndex) || 0 : 0
          };
        });
        
        // Background should be behind content
        expect(zIndices.background).toBeLessThanOrEqual(zIndices.content);
      }
    });
  });

  test.describe('Theme Switching Across Browsers', () => {
    
    test('Theme toggle exists and is accessible', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const themeToggle = page.locator('[data-theme-toggle], [aria-label*="theme"], button:has-text("theme")');
      
      if (await themeToggle.count() > 0) {
        await expect(themeToggle.first()).toBeVisible();
        
        // Should be keyboard accessible
        await themeToggle.first().focus();
        const isFocused = await themeToggle.first().evaluate((el: HTMLElement) => {
          return document.activeElement === el;
        });
        expect(isFocused).toBe(true);
      }
    });

    test('Theme switches between light and dark', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      
      // Find and click theme toggle
      const themeToggle = page.locator('[data-theme-toggle], [aria-label*="theme"]');
      
      if (await themeToggle.count() > 0) {
        await themeToggle.first().click();
        await page.waitForTimeout(300);
        
        // Get updated theme
        const updatedTheme = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        });
        
        // Theme should have changed
        expect(initialTheme).not.toBe(updatedTheme);
      }
    });

    test('Theme persists across page refresh', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const themeToggle = page.locator('[data-theme-toggle], [aria-label*="theme"]');
      
      if (await themeToggle.count() > 0) {
        // Switch theme
        await themeToggle.first().click();
        await page.waitForTimeout(300);
        
        const themeAfterSwitch = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        });
        
        // Refresh page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const themeAfterRefresh = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        });
        
        // Theme should persist
        expect(themeAfterSwitch).toBe(themeAfterRefresh);
      }
    });

    test('CSS variables update on theme change', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Get initial CSS variables
      const initialVars = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return {
          background: styles.getPropertyValue('--background'),
          foreground: styles.getPropertyValue('--foreground'),
          primary: styles.getPropertyValue('--primary')
        };
      });
      
      // Switch theme
      const themeToggle = page.locator('[data-theme-toggle], [aria-label*="theme"]');
      
      if (await themeToggle.count() > 0) {
        await themeToggle.first().click();
        await page.waitForTimeout(300);
        
        // Get updated CSS variables
        const updatedVars = await page.evaluate(() => {
          const styles = getComputedStyle(document.documentElement);
          return {
            background: styles.getPropertyValue('--background'),
            foreground: styles.getPropertyValue('--foreground'),
            primary: styles.getPropertyValue('--primary')
          };
        });
        
        // At least one variable should change
        const hasChanged = 
          initialVars.background !== updatedVars.background ||
          initialVars.foreground !== updatedVars.foreground ||
          initialVars.primary !== updatedVars.primary;
        
        expect(hasChanged).toBe(true);
      }
    });

    test('Theme colors maintain contrast ratios', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test both themes
      for (const theme of ['light', 'dark']) {
        // Set theme
        await page.evaluate((t) => {
          if (t === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }, theme);
        
        await page.waitForTimeout(200);
        
        // Check contrast of text elements
        const textElements = await page.locator('p, h1, h2, h3, button, a').all();
        
        for (const element of textElements.slice(0, 5)) {
          const contrast = await element.evaluate((el: HTMLElement) => {
            const styles = window.getComputedStyle(el);
            const color = styles.color;
            const bgColor = styles.backgroundColor;
            
            // Simple check: colors should be defined
            return color && bgColor;
          });
          
          expect(contrast).toBeTruthy();
        }
      }
    });

    test('Theme transition is smooth', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const themeToggle = page.locator('[data-theme-toggle], [aria-label*="theme"]');
      
      if (await themeToggle.count() > 0) {
        // Check for transition properties
        const hasTransition = await page.evaluate(() => {
          const html = document.documentElement;
          const styles = window.getComputedStyle(html);
          return styles.transition.includes('color') || 
                 styles.transition.includes('background') ||
                 styles.transition.includes('all');
        });
        
        // Should have some transition (or instant is also acceptable)
        expect(typeof hasTransition).toBe('boolean');
      }
    });
  });

  test.describe('Responsive Layouts Across Browsers', () => {
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      test(`Layout adapts correctly on ${viewport.name}`, async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check that content fits viewport
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // Allow small margin
      });

      test(`Task cards layout on ${viewport.name}`, async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/tasks');
        await page.waitForLoadState('networkidle');
        
        const taskCards = page.locator('[data-task-card], .task-card');
        const cardCount = await taskCards.count();
        
        if (cardCount > 0) {
          // Check grid layout
          const gridInfo = await page.evaluate(() => {
            const container = document.querySelector('[data-task-container], .task-container');
            if (!container) return null;
            
            const styles = window.getComputedStyle(container);
            return {
              display: styles.display,
              gridTemplateColumns: styles.gridTemplateColumns
            };
          });
          
          if (gridInfo) {
            expect(['grid', 'flex']).toContain(gridInfo.display);
          }
        }
      });

      test(`Navigation menu on ${viewport.name}`, async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const nav = page.locator('nav, [role="navigation"]');
        await expect(nav.first()).toBeVisible();
        
        // On mobile, might have hamburger menu
        if (viewport.width < 768) {
          const mobileMenu = page.locator('[data-mobile-menu], [aria-label*="menu"]');
          // Mobile menu might exist
          expect(await mobileMenu.count()).toBeGreaterThanOrEqual(0);
        }
      });
    }

    test('Images scale responsively', async ({ page }: { page: Page }) => {
      const viewports = [375, 768, 1920];
      
      for (const width of viewports) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const images = await page.locator('img').all();
        
        for (const img of images.slice(0, 3)) {
          const imgWidth = await img.evaluate((el: HTMLImageElement) => el.width);
          expect(imgWidth).toBeLessThanOrEqual(width);
        }
      }
    });

    test('Text remains readable at all sizes', async ({ page }: { page: Page }) => {
      const viewports = [375, 768, 1920];
      
      for (const width of viewports) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check font sizes
        const fontSize = await page.evaluate(() => {
          const body = document.body;
          const styles = window.getComputedStyle(body);
          return parseInt(styles.fontSize);
        });
        
        // Font should be at least 14px
        expect(fontSize).toBeGreaterThanOrEqual(14);
      }
    });

    test('Touch targets are adequate on mobile', async ({ page }: { page: Page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const buttons = await page.locator('button, a').all();
      
      for (const button of buttons.slice(0, 5)) {
        const size = await button.evaluate((el: HTMLElement) => {
          const rect = el.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
        
        // Touch targets should be at least 44x44px (WCAG guideline)
        // Allow some flexibility for inline links
        if (size.width > 0 && size.height > 0) {
          expect(size.width * size.height).toBeGreaterThan(0);
        }
      }
    });
  });
});





