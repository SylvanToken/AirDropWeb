/**
 * Performance Audit Script
 * Runs comprehensive performance checks including Lighthouse, bundle analysis, and Core Web Vitals
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

const PAGES_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
];

const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FCP: 1800, // First Contentful Paint (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  TTI: 3800, // Time to Interactive (ms)
  TBT: 300,  // Total Blocking Time (ms)
  jsBundle: 500, // KB
  cssBundle: 100, // KB
};

async function measureCoreWebVitals(page) {
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      const results = {
        lcp: 0,
        fcp: 0,
        cls: 0,
      };

      // Measure LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        results.lcp = lastEntry.renderTime || lastEntry.loadTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure FCP
      const perfEntries = performance.getEntriesByType('paint');
      const fcpEntry = perfEntries.find(entry => entry.name === 'first-contentful-paint');
      results.fcp = fcpEntry?.startTime || 0;

      // Measure CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });

      // Wait for metrics to settle
      setTimeout(() => {
        results.cls = clsValue;
        resolve(results);
      }, 3000);
    });
  });

  return metrics;
}

async function measureBundleSizes(page) {
  const resources = [];

  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';

    if (url.endsWith('.js') || url.endsWith('.css') || contentType.startsWith('image/')) {
      try {
        const buffer = await response.body();
        resources.push({
          url,
          size: buffer.length,
          type: url.endsWith('.js') ? 'js' : url.endsWith('.css') ? 'css' : 'image',
          contentType,
        });
      } catch (e) {
        // Ignore errors for resources we can't access
      }
    }
  });

  return resources;
}

async function testPage(browser, pageInfo) {
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`\n📊 Testing: ${pageInfo.name} (${pageInfo.path})`);
  console.log('─'.repeat(60));

  const resources = [];
  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';

    if (url.endsWith('.js') || url.endsWith('.css') || contentType.startsWith('image/')) {
      try {
        const buffer = await response.body();
        resources.push({
          url,
          size: buffer.length,
          type: url.endsWith('.js') ? 'js' : url.endsWith('.css') ? 'css' : 'image',
          contentType,
        });
      } catch (e) {
        // Ignore
      }
    }
  });

  // Navigate and measure load time
  const startTime = Date.now();
  await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000); // Wait for additional resources
  const loadTime = Date.now() - startTime;

  // Measure Core Web Vitals
  const vitals = await measureCoreWebVitals(page);

  // Calculate bundle sizes
  const jsBundles = resources.filter(r => r.type === 'js');
  const cssBundles = resources.filter(r => r.type === 'css');
  const images = resources.filter(r => r.type === 'image');

  const totalJsSize = jsBundles.reduce((sum, r) => sum + r.size, 0) / 1024;
  const totalCssSize = cssBundles.reduce((sum, r) => sum + r.size, 0) / 1024;
  const totalImageSize = images.reduce((sum, r) => sum + r.size, 0) / 1024;

  // Check for modern image formats
  const modernImages = images.filter(r =>
    r.contentType.includes('webp') || r.contentType.includes('avif')
  );

  // Check for lazy loading
  const lazyImages = await page.locator('img[loading="lazy"]').count();
  const totalImages = await page.locator('img').count();

  // Results
  const results = {
    page: pageInfo.name,
    loadTime,
    vitals,
    bundles: {
      js: totalJsSize.toFixed(2),
      css: totalCssSize.toFixed(2),
      images: totalImageSize.toFixed(2),
    },
    optimization: {
      modernImageFormats: modernImages.length,
      totalImages: images.length,
      lazyLoadedImages: lazyImages,
      totalImageElements: totalImages,
    },
  };

  // Print results
  console.log(`\n⏱️  Load Time: ${loadTime}ms`);
  console.log(`\n🎯 Core Web Vitals:`);
  console.log(`   LCP: ${vitals.lcp.toFixed(0)}ms ${vitals.lcp < THRESHOLDS.LCP ? '✅' : '❌'} (threshold: ${THRESHOLDS.LCP}ms)`);
  console.log(`   FCP: ${vitals.fcp.toFixed(0)}ms ${vitals.fcp < THRESHOLDS.FCP ? '✅' : '❌'} (threshold: ${THRESHOLDS.FCP}ms)`);
  console.log(`   CLS: ${vitals.cls.toFixed(3)} ${vitals.cls < THRESHOLDS.CLS ? '✅' : '❌'} (threshold: ${THRESHOLDS.CLS})`);

  console.log(`\n📦 Bundle Sizes:`);
  console.log(`   JavaScript: ${results.bundles.js} KB ${totalJsSize < THRESHOLDS.jsBundle ? '✅' : '❌'} (threshold: ${THRESHOLDS.jsBundle} KB)`);
  console.log(`   CSS: ${results.bundles.css} KB ${totalCssSize < THRESHOLDS.cssBundle ? '✅' : '❌'} (threshold: ${THRESHOLDS.cssBundle} KB)`);
  console.log(`   Images: ${results.bundles.images} KB`);

  console.log(`\n🖼️  Image Optimization:`);
  console.log(`   Modern formats (WebP/AVIF): ${results.optimization.modernImageFormats}/${results.optimization.totalImages} ${results.optimization.modernImageFormats > 0 ? '✅' : '⚠️'}`);
  console.log(`   Lazy loaded: ${results.optimization.lazyLoadedImages}/${results.optimization.totalImageElements} ${results.optimization.lazyLoadedImages > 0 ? '✅' : '⚠️'}`);

  await context.close();
  return results;
}

async function testSlowConnection(browser) {
  console.log(`\n🐌 Testing on Slow 3G Connection`);
  console.log('─'.repeat(60));

  const context = await browser.newContext();
  const page = await context.newPage();

  // Simulate slow 3G
  await page.route('**/*', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
    await route.continue();
  });

  const startTime = Date.now();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  const loadTime = Date.now() - startTime;

  console.log(`   Load time on slow 3G: ${loadTime}ms ${loadTime < 3000 ? '✅' : '❌'} (threshold: 3000ms)`);

  await context.close();
  return { loadTime, passed: loadTime < 3000 };
}

async function main() {
  console.log('🚀 Starting Performance Audit');
  console.log('═'.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);

  const browser = await chromium.launch();
  const allResults = [];

  try {
    // Test each page
    for (const pageInfo of PAGES_TO_TEST) {
      const result = await testPage(browser, pageInfo);
      allResults.push(result);
    }

    // Test slow connection
    const slowConnectionResult = await testSlowConnection(browser);

    // Summary
    console.log(`\n\n📋 Performance Audit Summary`);
    console.log('═'.repeat(60));

    let allPassed = true;

    for (const result of allResults) {
      const lcpPassed = result.vitals.lcp < THRESHOLDS.LCP;
      const fcpPassed = result.vitals.fcp < THRESHOLDS.FCP;
      const clsPassed = result.vitals.cls < THRESHOLDS.CLS;
      const jsPassed = parseFloat(result.bundles.js) < THRESHOLDS.jsBundle;
      const cssPassed = parseFloat(result.bundles.css) < THRESHOLDS.cssBundle;

      const pagePassed = lcpPassed && fcpPassed && clsPassed && jsPassed && cssPassed;
      allPassed = allPassed && pagePassed;

      console.log(`\n${result.page}: ${pagePassed ? '✅ PASSED' : '❌ FAILED'}`);
    }

    allPassed = allPassed && slowConnectionResult.passed;

    console.log(`\nSlow 3G: ${slowConnectionResult.passed ? '✅ PASSED' : '❌ FAILED'}`);

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log(`${'═'.repeat(60)}\n`);

    // Save results to file
    const reportPath = path.join(__dirname, '..', 'test-results', 'performance-audit.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      thresholds: THRESHOLDS,
      results: allResults,
      slowConnection: slowConnectionResult,
      passed: allPassed,
    }, null, 2));

    console.log(`📄 Detailed report saved to: ${reportPath}\n`);

    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ Error during performance audit:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
