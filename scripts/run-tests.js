#!/usr/bin/env node

/**
 * Test Runner Script
 * Runs different test suites based on command line arguments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const testType = args[0] || 'all';

const TEST_SUITES = {
  visual: {
    name: 'Visual Regression Tests',
    command: 'npx playwright test visual-regression.test.ts',
    description: 'Tests component rendering in different modes, breakpoints, and languages'
  },
  accessibility: {
    name: 'Accessibility Tests',
    command: 'npx playwright test accessibility.test.ts',
    description: 'Tests WCAG compliance, keyboard navigation, and screen reader support'
  },
  performance: {
    name: 'Performance Tests',
    command: 'npx playwright test performance.test.ts',
    description: 'Tests Lighthouse scores, Core Web Vitals, and bundle sizes'
  },
  browser: {
    name: 'Cross-Browser Tests',
    command: 'npx playwright test cross-browser.test.ts',
    description: 'Tests compatibility across Chrome, Firefox, Safari, and Edge'
  },
  i18n: {
    name: 'Internationalization Tests',
    command: 'npx playwright test internationalization.test.ts',
    description: 'Tests translation completeness, formatting, and language switching'
  },
  unit: {
    name: 'Unit Tests',
    command: 'npm run test:unit',
    description: 'Runs Jest unit tests'
  }
};

function printHeader(text) {
  console.log('\n' + '='.repeat(80));
  console.log(text);
  console.log('='.repeat(80) + '\n');
}

function printSuccess(text) {
  console.log('\x1b[32m✓\x1b[0m ' + text);
}

function printError(text) {
  console.log('\x1b[31m✗\x1b[0m ' + text);
}

function printInfo(text) {
  console.log('\x1b[36mℹ\x1b[0m ' + text);
}

function runTest(suite) {
  printHeader(`Running ${suite.name}`);
  printInfo(suite.description);
  
  try {
    execSync(suite.command, { stdio: 'inherit' });
    printSuccess(`${suite.name} completed successfully`);
    return true;
  } catch (error) {
    printError(`${suite.name} failed`);
    return false;
  }
}

function showHelp() {
  console.log('Test Runner - Sylvan Token Airdrop Platform\n');
  console.log('Usage: node scripts/run-tests.js [test-type]\n');
  console.log('Available test types:');
  
  Object.entries(TEST_SUITES).forEach(([key, suite]) => {
    console.log(`  ${key.padEnd(15)} - ${suite.description}`);
  });
  
  console.log('  all            - Run all test suites');
  console.log('  help           - Show this help message\n');
  
  console.log('Examples:');
  console.log('  node scripts/run-tests.js visual');
  console.log('  node scripts/run-tests.js accessibility');
  console.log('  node scripts/run-tests.js all\n');
}

function generateReport() {
  printHeader('Test Summary Report');
  
  const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
  
  if (fs.existsSync(resultsPath)) {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    
    console.log(`Total Tests: ${results.stats?.expected || 0}`);
    console.log(`Passed: ${results.stats?.passed || 0}`);
    console.log(`Failed: ${results.stats?.failed || 0}`);
    console.log(`Skipped: ${results.stats?.skipped || 0}`);
    console.log(`Duration: ${((results.stats?.duration || 0) / 1000).toFixed(2)}s\n`);
    
    if (results.stats?.failed > 0) {
      printError('Some tests failed. Check the HTML report for details.');
      console.log('Run: npx playwright show-report\n');
    } else {
      printSuccess('All tests passed!');
    }
  } else {
    printInfo('No test results found. Run tests first.');
  }
}

// Main execution
if (testType === 'help' || testType === '--help' || testType === '-h') {
  showHelp();
  process.exit(0);
}

if (testType === 'report') {
  generateReport();
  process.exit(0);
}

printHeader('Sylvan Token Airdrop Platform - Test Suite');

if (testType === 'all') {
  printInfo('Running all test suites...\n');
  
  const results = [];
  
  for (const [key, suite] of Object.entries(TEST_SUITES)) {
    const success = runTest(suite);
    results.push({ name: suite.name, success });
  }
  
  printHeader('Final Results');
  
  results.forEach(result => {
    if (result.success) {
      printSuccess(result.name);
    } else {
      printError(result.name);
    }
  });
  
  const allPassed = results.every(r => r.success);
  
  if (allPassed) {
    printSuccess('\nAll test suites passed!');
    process.exit(0);
  } else {
    printError('\nSome test suites failed');
    process.exit(1);
  }
} else if (TEST_SUITES[testType]) {
  const success = runTest(TEST_SUITES[testType]);
  process.exit(success ? 0 : 1);
} else {
  printError(`Unknown test type: ${testType}`);
  console.log('Run with "help" to see available options\n');
  process.exit(1);
}
