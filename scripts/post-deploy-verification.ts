#!/usr/bin/env tsx

/**
 * Post-Deployment Verification Script
 * 
 * Verifies the deployed application is working correctly
 */

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  url?: string;
  statusCode?: number;
}

const results: TestResult[] = [];

// Get deployment URL from command line or environment
const DEPLOYMENT_URL = process.argv[2] || process.env.VERCEL_URL || 'http://localhost:3333';

console.log(`🔍 Testing deployment at: ${DEPLOYMENT_URL}\n`);

/**
 * Test a URL and return result
 */
async function testUrl(
  name: string,
  path: string,
  expectedStatus: number,
  expectedRedirect?: string
): Promise<TestResult> {
  const url = `${DEPLOYMENT_URL}${path}`;
  
  try {
    console.log(`Testing ${name}...`);
    
    const response = await fetch(url, {
      redirect: 'manual', // Don't follow redirects automatically
    });

    // Check for redirect
    if (expectedRedirect) {
      const location = response.headers.get('location');
      if (response.status === 307 || response.status === 308) {
        if (location?.includes(expectedRedirect)) {
          return {
            name,
            passed: true,
            message: `Redirects to ${expectedRedirect}`,
            url,
            statusCode: response.status,
          };
        } else {
          return {
            name,
            passed: false,
            message: `Expected redirect to ${expectedRedirect}, got ${location}`,
            url,
            statusCode: response.status,
          };
        }
      } else {
        return {
          name,
          passed: false,
          message: `Expected redirect (307/308), got ${response.status}`,
          url,
          statusCode: response.status,
        };
      }
    }

    // Check status code
    if (response.status === expectedStatus) {
      return {
        name,
        passed: true,
        message: `Status ${response.status} OK`,
        url,
        statusCode: response.status,
      };
    } else {
      return {
        name,
        passed: false,
        message: `Expected status ${expectedStatus}, got ${response.status}`,
        url,
        statusCode: response.status,
      };
    }
  } catch (error) {
    return {
      name,
      passed: false,
      message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      url,
    };
  }
}

/**
 * Test countdown page
 */
async function testCountdownPage(): Promise<TestResult> {
  return testUrl('Countdown Page', '/countdown', 200);
}

/**
 * Test root redirect
 */
async function testRootRedirect(): Promise<TestResult> {
  return testUrl('Root Redirect', '/', 307, '/countdown');
}

/**
 * Test admin access (if TEST_ACCESS_KEY is available)
 */
async function testAdminAccess(): Promise<TestResult> {
  const accessKey = process.env.TEST_ACCESS_KEY;
  
  if (!accessKey) {
    return {
      name: 'Admin Access',
      passed: false,
      message: 'TEST_ACCESS_KEY not set, skipping test',
    };
  }

  return testUrl('Admin Access', `/?access=${accessKey}`, 307, '/dashboard');
}

/**
 * Test static assets
 */
async function testStaticAssets(): Promise<TestResult> {
  return testUrl('Static Assets', '/favicon.ico', 200);
}

/**
 * Test 404 page
 */
async function test404Page(): Promise<TestResult> {
  return testUrl('404 Page', '/non-existent-page', 404);
}

/**
 * Print summary
 */
function printSummary(results: TestResult[]): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const status = result.statusCode ? ` [${result.statusCode}]` : '';
    console.log(`${icon} ${result.name}${status}: ${result.message}`);
    if (result.url) {
      console.log(`   URL: ${result.url}`);
    }
  });

  console.log('='.repeat(60));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n❌ Verification failed! Some tests did not pass.');
    process.exit(1);
  } else {
    console.log('\n✅ All verifications passed! Deployment is working correctly.');
    process.exit(0);
  }
}

/**
 * Main verification function
 */
async function main() {
  console.log('🚀 Starting Post-Deployment Verification...\n');

  // Run tests
  results.push(await testCountdownPage());
  results.push(await testRootRedirect());
  results.push(await testAdminAccess());
  results.push(await testStaticAssets());
  results.push(await test404Page());

  // Print summary
  printSummary(results);
}

// Run verification
main().catch(error => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});
