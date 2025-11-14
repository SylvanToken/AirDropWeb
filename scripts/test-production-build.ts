/**
 * Production Build Testing Script
 * Tests critical user flows and routes in production mode
 */

import { chromium, Browser, Page } from '@playwright/test';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

interface RouteTest {
  path: string;
  name: string;
  expectedTitle?: string;
  checkElements?: string[];
}

const BASE_URL = 'http://localhost:3333';
const TIMEOUT = 30000;

// Critical routes to test
const ROUTES: RouteTest[] = [
  { path: '/', name: 'Home Page', checkElements: ['h1', 'nav'] },
  { path: '/en', name: 'English Home', checkElements: ['h1'] },
  { path: '/tr', name: 'Turkish Home', checkElements: ['h1'] },
  { path: '/login', name: 'Login Page', checkElements: ['form', 'input[type="email"]'] },
  { path: '/register', name: 'Register Page', checkElements: ['form', 'input[type="email"]'] },
  { path: '/countdown', name: 'Countdown Page', checkElements: ['body'] },
  { path: '/api/health', name: 'Health Check API' },
];

class ProductionTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];
  private consoleErrors: string[] = [];
  private consoleWarnings: string[] = [];

  async initialize(): Promise<void> {
    console.log('🚀 Initializing browser...');
    this.browser = await chromium.launch({ headless: true });
    const context = await this.browser.newContext();
    this.page = await context.newPage();

    // Capture console errors and warnings
    this.page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        this.consoleErrors.push(text);
        console.log(`❌ Console Error: ${text}`);
      } else if (type === 'warning') {
        this.consoleWarnings.push(text);
      }
    });

    // Capture page errors
    this.page.on('pageerror', (error) => {
      this.consoleErrors.push(error.message);
      console.log(`❌ Page Error: ${error.message}`);
    });
  }

  async testRoute(route: RouteTest): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      name: route.name,
      passed: false,
      duration: 0,
    };

    try {
      if (!this.page) throw new Error('Page not initialized');

      console.log(`\n📍 Testing: ${route.name} (${route.path})`);
      
      const url = route.path.startsWith('/api') 
        ? `${BASE_URL}${route.path}`
        : `${BASE_URL}${route.path}`;

      // Navigate to the route
      const response = await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: TIMEOUT,
      });

      if (!response) {
        throw new Error('No response received');
      }

      const status = response.status();
      console.log(`   Status: ${status}`);

      // Check status code
      if (status >= 400) {
        throw new Error(`HTTP ${status} error`);
      }

      // For API routes, just check status
      if (route.path.startsWith('/api')) {
        result.passed = status === 200;
        result.duration = Date.now() - startTime;
        console.log(`   ✅ API route responded successfully`);
        return result;
      }

      // For pages, check elements
      if (route.checkElements) {
        for (const selector of route.checkElements) {
          const element = await this.page.$(selector);
          if (!element) {
            throw new Error(`Element not found: ${selector}`);
          }
          console.log(`   ✓ Found element: ${selector}`);
        }
      }

      // Check for hydration errors
      const hydrationErrors = await this.page.evaluate(() => {
        const errors: string[] = [];
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_COMMENT
        );
        
        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent?.includes('Hydration')) {
            errors.push(node.textContent);
          }
        }
        return errors;
      });

      if (hydrationErrors.length > 0) {
        console.log(`   ⚠️  Hydration warnings found: ${hydrationErrors.length}`);
      }

      result.passed = true;
      result.duration = Date.now() - startTime;
      console.log(`   ✅ Passed (${result.duration}ms)`);
    } catch (error) {
      result.passed = false;
      result.error = error instanceof Error ? error.message : String(error);
      result.duration = Date.now() - startTime;
      console.log(`   ❌ Failed: ${result.error}`);
    }

    return result;
  }

  async testCriticalUserFlows(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('\n🔄 Testing Critical User Flows...\n');

    // Flow 1: Home to Login
    try {
      console.log('📝 Flow 1: Home → Login');
      await this.page.goto(`${BASE_URL}/en`, { waitUntil: 'networkidle' });
      
      // Look for login link
      const loginLink = await this.page.$('a[href*="login"]');
      if (loginLink) {
        await loginLink.click();
        await this.page.waitForURL('**/login', { timeout: 5000 });
        console.log('   ✅ Navigation to login successful');
      } else {
        console.log('   ⚠️  Login link not found on home page');
      }
    } catch (error) {
      console.log(`   ❌ Flow failed: ${error}`);
    }

    // Flow 2: Language switching
    try {
      console.log('\n📝 Flow 2: Language Switching');
      await this.page.goto(`${BASE_URL}/en`, { waitUntil: 'networkidle' });
      
      // Try to find language switcher
      const langSwitcher = await this.page.$('[data-testid="language-switcher"], select[name="language"]');
      if (langSwitcher) {
        console.log('   ✅ Language switcher found');
      } else {
        console.log('   ⚠️  Language switcher not found (may be in dropdown)');
      }
    } catch (error) {
      console.log(`   ❌ Flow failed: ${error}`);
    }

    // Flow 3: Register page form validation
    try {
      console.log('\n📝 Flow 3: Register Form Validation');
      await this.page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
      
      const emailInput = await this.page.$('input[type="email"]');
      const passwordInput = await this.page.$('input[type="password"]');
      
      if (emailInput && passwordInput) {
        console.log('   ✅ Form inputs found');
      } else {
        console.log('   ⚠️  Form inputs not found');
      }
    } catch (error) {
      console.log(`   ❌ Flow failed: ${error}`);
    }
  }

  async checkPerformance(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('\n⚡ Checking Performance Metrics...\n');

    try {
      await this.page.goto(`${BASE_URL}/en`, { waitUntil: 'networkidle' });
      
      const metrics = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive - navigation.fetchStart,
        };
      });

      console.log(`   DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`);
      console.log(`   Load Complete: ${metrics.loadComplete.toFixed(2)}ms`);
      console.log(`   DOM Interactive: ${metrics.domInteractive.toFixed(2)}ms`);

      if (metrics.domInteractive < 3000) {
        console.log('   ✅ Performance is good');
      } else {
        console.log('   ⚠️  Performance could be improved');
      }
    } catch (error) {
      console.log(`   ❌ Performance check failed: ${error}`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  generateReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRODUCTION BUILD TEST REPORT');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`\n✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`   - ${r.name}: ${r.error}`);
        });
    }

    console.log(`\n🐛 Console Errors: ${this.consoleErrors.length}`);
    if (this.consoleErrors.length > 0) {
      console.log('   Errors:');
      [...new Set(this.consoleErrors)].slice(0, 10).forEach(err => {
        console.log(`   - ${err.substring(0, 100)}`);
      });
      if (this.consoleErrors.length > 10) {
        console.log(`   ... and ${this.consoleErrors.length - 10} more`);
      }
    }

    console.log(`\n⚠️  Console Warnings: ${this.consoleWarnings.length}`);

    console.log('\n' + '='.repeat(60));
    
    if (failed === 0 && this.consoleErrors.length === 0) {
      console.log('✅ ALL TESTS PASSED - Production build is ready!');
    } else if (failed === 0 && this.consoleErrors.length > 0) {
      console.log('⚠️  Tests passed but console errors detected');
    } else {
      console.log('❌ TESTS FAILED - Issues need to be addressed');
    }
    console.log('='.repeat(60) + '\n');
  }

  async run(): Promise<boolean> {
    try {
      await this.initialize();

      // Test all routes
      console.log('🧪 Testing Routes...');
      for (const route of ROUTES) {
        const result = await this.testRoute(route);
        this.results.push(result);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Test critical user flows
      await this.testCriticalUserFlows();

      // Check performance
      await this.checkPerformance();

      // Generate report
      this.generateReport();

      await this.cleanup();

      // Return success if all tests passed and no critical errors
      return this.results.every(r => r.passed) && this.consoleErrors.length === 0;
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      await this.cleanup();
      return false;
    }
  }
}

// Main execution
async function main() {
  console.log('🏗️  Production Build Testing\n');
  console.log(`Testing server at: ${BASE_URL}`);
  console.log('Make sure the production server is running with: npm start\n');

  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  const tester = new ProductionTester();
  const success = await tester.run();

  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
