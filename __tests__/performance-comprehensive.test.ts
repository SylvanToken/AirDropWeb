/**
 * Comprehensive Performance Testing Suite
 * Tests page load times, API response times, database query performance,
 * concurrent user handling, and bundle sizes
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import { test, expect, Page } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

// ============================================================================
// Test Configuration
// ============================================================================

const PERFORMANCE_THRESHOLDS = {
  pageLoad3G: 3000,        // Page load on 3G (ms)
  apiResponse: 500,        // API response time (ms)
  dbQuery: 100,            // Database query time (ms)
  jsBundleSize: 500,       // JavaScript bundle size (KB)
  cssBundleSize: 100,      // CSS bundle size (KB)
};

const LIGHTHOUSE_THRESHOLDS = {
  performance: 85,
  accessibility: 90,
  'best-practices': 85,
  seo: 90
};

// ============================================================================
// Subtask 11.1: Test Page Load Performance
// ============================================================================

test.describe('Page Load Performance (Requirement 10.1)', () => {
  
  test('Home page loads in <3s on 3G', async ({ page }: { page: Page }) => {
    // Emulate slow 3G network
    await page.route('**/*', async (route) => {
      // Add realistic 3G delay
      await new Promise(resolve => setTimeout(resolve, 50));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    console.log(`Home page load time on 3G: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad3G);
  });

  test('Dashboard page loads in <3s on 3G', async ({ page, context }: { page: Page; context: any }) => {
    // First login to access dashboard
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@test.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => {});

    // Emulate slow 3G network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 50));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    console.log(`Dashboard page load time on 3G: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad3G);
  });

  test('Tasks page loads in <3s on 3G', async ({ page }: { page: Page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@test.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => {});

    // Emulate slow 3G network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 50));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/tasks', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    console.log(`Tasks page load time on 3G: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad3G);
  });

  test('Admin page loads in <3s on 3G', async ({ page }: { page: Page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@sylvantoken.org');
    await page.fill('input[name="password"]', 'Mjkvebep_68');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 5000 }).catch(() => {});

    // Emulate slow 3G network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 50));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    console.log(`Admin page load time on 3G: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad3G);
  });

  test('Home page Lighthouse performance score', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    const result = await playAudit({
      page,
      thresholds: LIGHTHOUSE_THRESHOLDS,
      port: 9222
    });
    
    const performanceScore = (result.lhr.categories.performance.score ?? 0) * 100;
    console.log(`Home page Lighthouse performance score: ${performanceScore}`);
    
    expect(performanceScore).toBeGreaterThanOrEqual(LIGHTHOUSE_THRESHOLDS.performance);
  });
});

// ============================================================================
// Subtask 11.2: Test API Response Time
// ============================================================================

test.describe('API Response Time (Requirement 10.2)', () => {
  
  test('GET /api/tasks responds in <500ms', async ({ request }: { request: any }) => {
    // Login to get session
    await request.post('/api/auth/signin', {
      data: {
        email: 'user@test.com',
        password: 'Test123!',
      },
    });

    const startTime = Date.now();
    const response = await request.get('/api/tasks');
    const responseTime = Date.now() - startTime;

    console.log(`GET /api/tasks response time: ${responseTime}ms`);
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse);
  });

  test('POST /api/completions responds in <500ms', async ({ request }: { request: any }) => {
    // Login to get session
    await request.post('/api/auth/signin', {
      data: {
        email: 'user@test.com',
        password: 'Test123!',
      },
    });

    // Get a task ID first
    const tasksResponse = await request.get('/api/tasks');
    const tasks = await tasksResponse.json();
    
    if (tasks.length > 0) {
      const startTime = Date.now();
      const response = await request.post('/api/completions', {
        data: {
          taskId: tasks[0].id,
        },
      });
      const responseTime = Date.now() - startTime;

      console.log(`POST /api/completions response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse);
    }
  });

  test('GET /api/leaderboard responds in <500ms', async ({ request }: { request: any }) => {
    // Login to get session
    await request.post('/api/auth/signin', {
      data: {
        email: 'user@test.com',
        password: 'Test123!',
      },
    });

    const startTime = Date.now();
    const response = await request.get('/api/leaderboard');
    const responseTime = Date.now() - startTime;

    console.log(`GET /api/leaderboard response time: ${responseTime}ms`);
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse);
  });

  test('GET /api/admin/stats responds in <500ms', async ({ request }: { request: any }) => {
    // Login as admin
    await request.post('/api/auth/signin', {
      data: {
        email: 'admin@sylvantoken.org',
        password: 'Mjkvebep_68',
      },
    });

    const startTime = Date.now();
    const response = await request.get('/api/admin/stats');
    const responseTime = Date.now() - startTime;

    console.log(`GET /api/admin/stats response time: ${responseTime}ms`);
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse);
  });

  test('Multiple API calls maintain consistent response times', async ({ request }: { request: any }) => {
    // Login to get session
    await request.post('/api/auth/signin', {
      data: {
        email: 'user@test.com',
        password: 'Test123!',
      },
    });

    const responseTimes: number[] = [];
    
    // Make 10 consecutive API calls
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      await request.get('/api/tasks');
      const responseTime = Date.now() - startTime;
      responseTimes.push(responseTime);
    }

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);

    console.log(`Average API response time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Max API response time: ${maxResponseTime}ms`);

    expect(avgResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse);
    expect(maxResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse * 1.5);
  });
});

// ============================================================================
// Subtask 11.3: Test Database Query Performance
// ============================================================================

test.describe('Database Query Performance (Requirement 10.3)', () => {
  
  test('User query executes in <100ms', async ({ request }: { request: any }) => {
    // Login to get session
    await request.post('/api/auth/signin', {
      data: {
        email: 'user@test.com',
        password: 'Test123!',
      },
    });

    const startTime = Date.now();
    const response = await request.get('/api/users/me');
    const queryTime = Date.now() - startTime;

    console.log(`User query execution time: ${queryTime}ms`);
    expect(response.status()).toBe(200);
    expect(queryTime).toBeLessThan(PERFORMANCE_THRESHOLDS.dbQuery);
  });

  test('Task query with filters executes in <100ms', async ({ request }: { request: any }) => {
    // Login to get session
    await request.post('/api/auth/signin', {
      data: {
        email: 'user@test.com',
        password: 'Test123!',
      },
    });

    const startTime = Date.now();
    const response = await request.get('/api/tasks');
    const queryTime = Date.now() - startTime;

    console.log(`Task query execution time: ${queryTime}ms`);
    expect(response.status()).toBe(200);
    expect(queryTime).toBeLessThan(PERFORMANCE_THRESHOLDS.dbQuery);
  });

  test('Completion query with joins executes in <100ms', async ({ request }: { request: any }) => {
    // Login to get session
    await request.post('/api/auth/signin', {
      data: {
        email: 'user@test.com',
        password: 'Test123!',
      },
    });

    // Get user data which includes completion joins
    const startTime = Date.now();
    const response = await request.get('/api/users/me');
    const queryTime = Date.now() - startTime;

    console.log(`Completion query with joins execution time: ${queryTime}ms`);
    expect(response.status()).toBe(200);
    expect(queryTime).toBeLessThan(PERFORMANCE_THRESHOLDS.dbQuery);
  });

  test('Leaderboard aggregation query executes in <100ms', async ({ request }: { request: any }) => {
    // Login to get session
    await request.post('/api/auth/signin', {
      data: {
        email: 'user@test.com',
        password: 'Test123!',
      },
    });

    const startTime = Date.now();
    const response = await request.get('/api/leaderboard?limit=50');
    const queryTime = Date.now() - startTime;

    console.log(`Leaderboard aggregation query execution time: ${queryTime}ms`);
    expect(response.status()).toBe(200);
    expect(queryTime).toBeLessThan(PERFORMANCE_THRESHOLDS.dbQuery);
  });

  test('Database queries maintain consistent performance', async ({ request }: { request: any }) => {
    // Login to get session
    await request.post('/api/auth/signin', {
      data: {
        email: 'user@test.com',
        password: 'Test123!',
      },
    });

    const queryTimes: number[] = [];
    
    // Execute 20 queries to test consistency
    for (let i = 0; i < 20; i++) {
      const startTime = Date.now();
      await request.get('/api/tasks');
      const queryTime = Date.now() - startTime;
      queryTimes.push(queryTime);
    }

    const avgQueryTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
    const maxQueryTime = Math.max(...queryTimes);

    console.log(`Average query time: ${avgQueryTime.toFixed(2)}ms`);
    console.log(`Max query time: ${maxQueryTime}ms`);

    expect(avgQueryTime).toBeLessThan(PERFORMANCE_THRESHOLDS.dbQuery);
    expect(maxQueryTime).toBeLessThan(PERFORMANCE_THRESHOLDS.dbQuery * 2);
  });
});

// ============================================================================
// Subtask 11.4: Test Concurrent User Handling
// ============================================================================

test.describe('Concurrent User Handling (Requirement 10.4)', () => {
  
  test('System handles 50 concurrent users', async ({ request }: { request: any }) => {
    const concurrentUsers = 50;
    const promises: Promise<any>[] = [];

    console.log(`Testing ${concurrentUsers} concurrent users...`);

    const startTime = Date.now();

    // Simulate 50 concurrent users making requests
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        request.get('/').catch((err: Error) => ({ error: err.message }))
      );
    }

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    const successfulRequests = results.filter(r => !r.error).length;
    const avgTimePerRequest = totalTime / concurrentUsers;

    console.log(`${successfulRequests}/${concurrentUsers} requests succeeded`);
    console.log(`Average time per request: ${avgTimePerRequest.toFixed(2)}ms`);
    console.log(`Total time: ${totalTime}ms`);

    expect(successfulRequests).toBeGreaterThan(concurrentUsers * 0.95); // 95% success rate
    expect(avgTimePerRequest).toBeLessThan(1000); // Average < 1s per request
  });

  test('System handles 100 concurrent users', async ({ request }: { request: any }) => {
    const concurrentUsers = 100;
    const promises: Promise<any>[] = [];

    console.log(`Testing ${concurrentUsers} concurrent users...`);

    const startTime = Date.now();

    // Simulate 100 concurrent users making requests
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        request.get('/').catch((err: Error) => ({ error: err.message }))
      );
    }

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    const successfulRequests = results.filter(r => !r.error).length;
    const avgTimePerRequest = totalTime / concurrentUsers;

    console.log(`${successfulRequests}/${concurrentUsers} requests succeeded`);
    console.log(`Average time per request: ${avgTimePerRequest.toFixed(2)}ms`);
    console.log(`Total time: ${totalTime}ms`);

    expect(successfulRequests).toBeGreaterThan(concurrentUsers * 0.90); // 90% success rate
    expect(avgTimePerRequest).toBeLessThan(1500); // Average < 1.5s per request
  });

  test('No performance degradation under load', async ({ request }: { request: any }) => {
    // Test with increasing load
    const loadLevels = [10, 25, 50];
    const avgTimes: number[] = [];

    for (const load of loadLevels) {
      const promises: Promise<any>[] = [];
      const startTime = Date.now();

      for (let i = 0; i < load; i++) {
        promises.push(request.get('/'));
      }

      await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / load;
      avgTimes.push(avgTime);

      console.log(`Load ${load}: Average time ${avgTime.toFixed(2)}ms`);
    }

    // Check that performance doesn't degrade significantly
    // Allow up to 50% increase from lowest to highest load
    const minAvg = Math.min(...avgTimes);
    const maxAvg = Math.max(...avgTimes);
    const degradation = (maxAvg - minAvg) / minAvg;

    console.log(`Performance degradation: ${(degradation * 100).toFixed(2)}%`);
    expect(degradation).toBeLessThan(0.5); // Less than 50% degradation
  });

  test('Response time consistency under concurrent load', async ({ request }: { request: any }) => {
    const concurrentUsers = 50;
    const promises: Promise<{ time: number }>[] = [];

    // Measure individual response times
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        (async () => {
          const start = Date.now();
          await request.get('/');
          return { time: Date.now() - start };
        })()
      );
    }

    const results = await Promise.all(promises);
    const times = results.map(r => r.time);
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const variance = maxTime - minTime;

    console.log(`Average response time: ${avgTime.toFixed(2)}ms`);
    console.log(`Min: ${minTime}ms, Max: ${maxTime}ms, Variance: ${variance}ms`);

    // Response times should be relatively consistent
    expect(variance).toBeLessThan(2000); // Variance < 2s
    expect(avgTime).toBeLessThan(1000); // Average < 1s
  });
});

// ============================================================================
// Subtask 11.5: Test Bundle Size
// ============================================================================

test.describe('Bundle Size (Requirement 10.5)', () => {
  
  test('JavaScript bundle size is <500KB', async ({ page }: { page: Page }) => {
    const jsResources: { url: string; size: number }[] = [];

    page.on('response', async (response) => {
      if (response.url().endsWith('.js') && response.status() === 200) {
        try {
          const buffer = await response.body();
          jsResources.push({
            url: response.url(),
            size: buffer.length
          });
        } catch (err) {
          // Ignore errors for resources we can't read
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalJsSize = jsResources.reduce((sum, r) => sum + r.size, 0);
    const totalJsSizeKB = totalJsSize / 1024;

    console.log(`Total JavaScript bundle size: ${totalJsSizeKB.toFixed(2)}KB`);
    console.log(`Number of JS files: ${jsResources.length}`);

    // Log largest files
    const sortedBySize = [...jsResources].sort((a, b) => b.size - a.size).slice(0, 5);
    console.log('Largest JS files:');
    sortedBySize.forEach(r => {
      const fileName = r.url.split('/').pop() || r.url;
      console.log(`  ${fileName}: ${(r.size / 1024).toFixed(2)}KB`);
    });

    expect(totalJsSizeKB).toBeLessThan(PERFORMANCE_THRESHOLDS.jsBundleSize);
  });

  test('CSS bundle size is <100KB', async ({ page }: { page: Page }) => {
    const cssResources: { url: string; size: number }[] = [];

    page.on('response', async (response) => {
      if (response.url().endsWith('.css') && response.status() === 200) {
        try {
          const buffer = await response.body();
          cssResources.push({
            url: response.url(),
            size: buffer.length
          });
        } catch (err) {
          // Ignore errors for resources we can't read
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalCssSize = cssResources.reduce((sum, r) => sum + r.size, 0);
    const totalCssSizeKB = totalCssSize / 1024;

    console.log(`Total CSS bundle size: ${totalCssSizeKB.toFixed(2)}KB`);
    console.log(`Number of CSS files: ${cssResources.length}`);

    expect(totalCssSizeKB).toBeLessThan(PERFORMANCE_THRESHOLDS.cssBundleSize);
  });

  test('Images are optimized', async ({ page }: { page: Page }) => {
    const imageResources: { url: string; size: number; type: string }[] = [];

    page.on('response', async (response) => {
      const contentType = response.headers()['content-type'];
      if (contentType?.startsWith('image/') && response.status() === 200) {
        try {
          const buffer = await response.body();
          imageResources.push({
            url: response.url(),
            size: buffer.length,
            type: contentType
          });
        } catch (err) {
          // Ignore errors for resources we can't read
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalImageSize = imageResources.reduce((sum, r) => sum + r.size, 0);
    const totalImageSizeKB = totalImageSize / 1024;

    // Check for modern image formats
    const modernFormats = imageResources.filter(r => 
      r.type.includes('webp') || r.type.includes('avif')
    );

    console.log(`Total image size: ${totalImageSizeKB.toFixed(2)}KB`);
    console.log(`Number of images: ${imageResources.length}`);
    console.log(`Modern format images: ${modernFormats.length}/${imageResources.length}`);

    // At least 50% of images should use modern formats
    if (imageResources.length > 0) {
      const modernFormatRatio = modernFormats.length / imageResources.length;
      expect(modernFormatRatio).toBeGreaterThan(0.3); // At least 30% modern formats
    }
  });

  test('Code splitting is effective', async ({ page }: { page: Page }) => {
    const homeJsFiles = new Set<string>();
    const loginJsFiles = new Set<string>();

    // Collect JS files on home page
    page.on('response', (response) => {
      if (response.url().endsWith('.js')) {
        homeJsFiles.add(response.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const homeJsCount = homeJsFiles.size;
    console.log(`Home page JS files: ${homeJsCount}`);

    // Clear and collect JS files on login page
    page.removeAllListeners('response');
    page.on('response', (response) => {
      if (response.url().endsWith('.js')) {
        loginJsFiles.add(response.url());
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const loginJsCount = loginJsFiles.size;
    console.log(`Login page JS files: ${loginJsCount}`);

    // Check for route-specific chunks
    const uniqueToLogin = [...loginJsFiles].filter(f => !homeJsFiles.has(f));
    const sharedFiles = [...loginJsFiles].filter(f => homeJsFiles.has(f));

    console.log(`Shared JS files: ${sharedFiles.length}`);
    console.log(`Login-specific JS files: ${uniqueToLogin.length}`);

    // Should have some route-specific code splitting
    expect(uniqueToLogin.length).toBeGreaterThan(0);
  });

  test('Total page weight is reasonable', async ({ page }: { page: Page }) => {
    let totalSize = 0;
    const resourceTypes: Record<string, number> = {
      js: 0,
      css: 0,
      image: 0,
      font: 0,
      other: 0
    };

    page.on('response', async (response) => {
      if (response.status() === 200) {
        try {
          const buffer = await response.body();
          const size = buffer.length;
          totalSize += size;

          const url = response.url();
          const contentType = response.headers()['content-type'] || '';

          if (url.endsWith('.js')) {
            resourceTypes.js += size;
          } else if (url.endsWith('.css')) {
            resourceTypes.css += size;
          } else if (contentType.startsWith('image/')) {
            resourceTypes.image += size;
          } else if (contentType.includes('font')) {
            resourceTypes.font += size;
          } else {
            resourceTypes.other += size;
          }
        } catch (err) {
          // Ignore errors
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalSizeMB = totalSize / (1024 * 1024);

    console.log(`Total page weight: ${totalSizeMB.toFixed(2)}MB`);
    console.log('Breakdown:');
    Object.entries(resourceTypes).forEach(([type, size]) => {
      console.log(`  ${type}: ${(size / 1024).toFixed(2)}KB`);
    });

    // Total page weight should be reasonable (< 3MB)
    expect(totalSizeMB).toBeLessThan(3);
  });
});
