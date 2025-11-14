/**
 * Performance Testing Suite
 * Tests Lighthouse scores, Core Web Vitals, bundle sizes, and network performance
 */

import { test, expect, Page } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' }
];

const LIGHTHOUSE_THRESHOLDS = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 90
};

const CORE_WEB_VITALS_THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1   // Cumulative Layout Shift
};

test.describe('Performance Testing', () => {
  
  test.describe('Lighthouse Audits', () => {
    
    test('Home page Lighthouse scores', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const result = await playAudit({
        page,
        thresholds: LIGHTHOUSE_THRESHOLDS,
        port: 9222
      });
      
      expect((result.lhr.categories.performance.score ?? 0) * 100).toBeGreaterThanOrEqual(
        LIGHTHOUSE_THRESHOLDS.performance
      );
      expect((result.lhr.categories.accessibility.score ?? 0) * 100).toBeGreaterThanOrEqual(
        LIGHTHOUSE_THRESHOLDS.accessibility
      );
      expect((result.lhr.categories['best-practices'].score ?? 0) * 100).toBeGreaterThanOrEqual(
        LIGHTHOUSE_THRESHOLDS['best-practices']
      );
      expect((result.lhr.categories.seo.score ?? 0) * 100).toBeGreaterThanOrEqual(
        LIGHTHOUSE_THRESHOLDS.seo
      );
    });
  });

  test.describe('Core Web Vitals', () => {
    
    test('Largest Contentful Paint (LCP)', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve((lastEntry as any).renderTime || (lastEntry as any).loadTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Timeout after 10 seconds
          setTimeout(() => resolve(0), 10000);
        });
      });
      
      expect(lcp).toBeLessThan(CORE_WEB_VITALS_THRESHOLDS.LCP);
    });

    test('Cumulative Layout Shift (CLS)', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Wait 3 seconds to collect shifts
          setTimeout(() => resolve(clsValue), 3000);
        });
      });
      
      expect(cls).toBeLessThan(CORE_WEB_VITALS_THRESHOLDS.CLS);
    });

    test('First Contentful Paint (FCP)', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const fcp = await page.evaluate(() => {
        const perfEntries = performance.getEntriesByType('paint');
        const fcpEntry = perfEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry?.startTime || 0;
      });
      
      expect(fcp).toBeLessThan(1800); // Good FCP is < 1.8s
    });

    test('Time to Interactive (TTI)', async ({ page }: { page: Page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const tti = Date.now() - startTime;
      
      expect(tti).toBeLessThan(3800); // Good TTI is < 3.8s
    });
  });

  test.describe('Network Performance', () => {
    
    test('Page load on slow 3G', async ({ page }: { page: Page }) => {
      // Emulate slow 3G
      await page.route('**/*', async (route: any) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      // Should load critical content within 3 seconds even on slow connection
      expect(loadTime).toBeLessThan(3000);
    });

    test('Image lazy loading', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      // Get all images
      const images = await page.locator('img').all();
      
      let lazyLoadedCount = 0;
      for (const img of images) {
        const loading = await img.getAttribute('loading');
        if (loading === 'lazy') {
          lazyLoadedCount++;
        }
      }
      
      // At least some images should be lazy loaded
      expect(lazyLoadedCount).toBeGreaterThan(0);
    });

    test('Resource compression', async ({ page }: { page: Page }) => {
      const responses: any[] = [];
      
      page.on('response', (response: any) => {
        responses.push({
          url: response.url(),
          headers: response.headers()
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for compression on text resources
      const textResources = responses.filter(r => 
        r.url.endsWith('.js') || 
        r.url.endsWith('.css') || 
        r.url.endsWith('.html')
      );
      
      for (const resource of textResources) {
        const encoding = resource.headers['content-encoding'];
        // Should be compressed with gzip or brotli
        expect(['gzip', 'br', 'deflate']).toContain(encoding);
      }
    });

    test('Caching headers', async ({ page }: { page: Page }) => {
      const responses: any[] = [];
      
      page.on('response', (response: any) => {
        responses.push({
          url: response.url(),
          headers: response.headers()
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for cache headers on static assets
      const staticAssets = responses.filter(r => 
        r.url.includes('/_next/static/') ||
        r.url.includes('/assets/')
      );
      
      for (const asset of staticAssets) {
        const cacheControl = asset.headers['cache-control'];
        // Static assets should have long cache times
        expect(cacheControl).toBeTruthy();
      }
    });
  });

  test.describe('Bundle Size Analysis', () => {
    
    test('JavaScript bundle size', async ({ page }: { page: Page }) => {
      const jsResources: any[] = [];
      
      page.on('response', async (response: any) => {
        if (response.url().endsWith('.js')) {
          const buffer = await response.body();
          jsResources.push({
            url: response.url(),
            size: buffer.length
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const totalJsSize = jsResources.reduce((sum, r) => sum + r.size, 0);
      const totalJsSizeKB = totalJsSize / 1024;
      
      // Total JS should be under 500KB (compressed)
      expect(totalJsSizeKB).toBeLessThan(500);
    });

    test('CSS bundle size', async ({ page }: { page: Page }) => {
      const cssResources: any[] = [];
      
      page.on('response', async (response: any) => {
        if (response.url().endsWith('.css')) {
          const buffer = await response.body();
          cssResources.push({
            url: response.url(),
            size: buffer.length
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const totalCssSize = cssResources.reduce((sum, r) => sum + r.size, 0);
      const totalCssSizeKB = totalCssSize / 1024;
      
      // Total CSS should be under 100KB (compressed)
      expect(totalCssSizeKB).toBeLessThan(100);
    });

    test('Image optimization', async ({ page }: { page: Page }) => {
      const imageResources: any[] = [];
      
      page.on('response', async (response: any) => {
        const contentType = response.headers()['content-type'];
        if (contentType?.startsWith('image/')) {
          const buffer = await response.body();
          imageResources.push({
            url: response.url(),
            size: buffer.length,
            type: contentType
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for modern image formats
      const modernFormats = imageResources.filter(r => 
        r.type.includes('webp') || r.type.includes('avif')
      );
      
      // At least some images should use modern formats
      expect(modernFormats.length).toBeGreaterThan(0);
    });
  });

  test.describe('Runtime Performance', () => {
    
    test('No memory leaks on navigation', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const initialMetrics = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Navigate multiple times
      for (let i = 0; i < 5; i++) {
        await page.goto('/login');
        await page.goto('/register');
        await page.goto('/');
      }
      
      const finalMetrics = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Memory shouldn't grow significantly (allow 50% increase)
      if (initialMetrics > 0) {
        expect(finalMetrics).toBeLessThan(initialMetrics * 1.5);
      }
    });

    test('Smooth animations (60fps)', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      // Trigger animation
      const button = page.locator('button').first();
      await button.hover();
      
      // Measure frame rate
      const fps = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frames = 0;
          const startTime = performance.now();
          
          function countFrame() {
            frames++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrame);
            } else {
              resolve(frames);
            }
          }
          
          requestAnimationFrame(countFrame);
        });
      });
      
      // Should maintain close to 60fps
      expect(fps).toBeGreaterThan(50);
    });

    test('No long tasks blocking main thread', async ({ page }: { page: Page }) => {
      await page.goto('/');
      
      const longTasks = await page.evaluate(() => {
        return new Promise((resolve) => {
          const tasks: any[] = [];
          
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) { // Tasks longer than 50ms
                tasks.push({
                  duration: entry.duration,
                  startTime: entry.startTime
                });
              }
            }
          }).observe({ entryTypes: ['longtask'] });
          
          setTimeout(() => resolve(tasks), 5000);
        });
      });
      
      // Should have minimal long tasks
      expect((longTasks as any[]).length).toBeLessThan(5);
    });
  });

  test.describe('Code Splitting', () => {
    
    test('Route-based code splitting', async ({ page }: { page: Page }) => {
      const jsFiles = new Set<string>();
      
      page.on('response', (response: any) => {
        if (response.url().endsWith('.js')) {
          jsFiles.add(response.url());
        }
      });
      
      await page.goto('/');
      const homeJsFiles = new Set(jsFiles);
      
      jsFiles.clear();
      
      await page.goto('/login');
      const loginJsFiles = new Set(jsFiles);
      
      // Login page should load different chunks
      const uniqueToLogin = [...loginJsFiles].filter(f => !homeJsFiles.has(f));
      expect(uniqueToLogin.length).toBeGreaterThan(0);
    });
  });
});






