/**
 * Visual Regression Testing Helper Script
 * Manages baseline screenshots and runs visual regression tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASELINE_DIR = path.join(__dirname, '..', '__tests__', '__screenshots__');
const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

const commands = {
  // Update baseline screenshots
  update: () => {
    console.log('📸 Updating baseline screenshots...\n');
    try {
      execSync(
        'npx playwright test nature-theme-visual.test.ts --update-snapshots',
        { stdio: 'inherit' }
      );
      console.log('\n✅ Baseline screenshots updated successfully!');
    } catch (error) {
      console.error('\n❌ Failed to update baseline screenshots');
      process.exit(1);
    }
  },

  // Run visual regression tests
  test: () => {
    console.log('🧪 Running visual regression tests...\n');
    try {
      execSync(
        'npx playwright test nature-theme-visual.test.ts',
        { stdio: 'inherit' }
      );
      console.log('\n✅ Visual regression tests passed!');
    } catch (error) {
      console.error('\n❌ Visual regression tests failed');
      console.log('\n📊 View the report with: npm run test:report');
      process.exit(1);
    }
  },

  // Run tests for specific theme
  'test-light': () => {
    console.log('🌞 Running light mode visual tests...\n');
    try {
      execSync(
        'npx playwright test nature-theme-visual.test.ts -g "light"',
        { stdio: 'inherit' }
      );
      console.log('\n✅ Light mode tests passed!');
    } catch (error) {
      console.error('\n❌ Light mode tests failed');
      process.exit(1);
    }
  },

  'test-dark': () => {
    console.log('🌙 Running dark mode visual tests...\n');
    try {
      execSync(
        'npx playwright test nature-theme-visual.test.ts -g "dark"',
        { stdio: 'inherit' }
      );
      console.log('\n✅ Dark mode tests passed!');
    } catch (error) {
      console.error('\n❌ Dark mode tests failed');
      process.exit(1);
    }
  },

  // Run tests for specific page
  'test-home': () => {
    console.log('🏠 Running home page visual tests...\n');
    try {
      execSync(
        'npx playwright test nature-theme-visual.test.ts -g "Home Page"',
        { stdio: 'inherit' }
      );
      console.log('\n✅ Home page tests passed!');
    } catch (error) {
      console.error('\n❌ Home page tests failed');
      process.exit(1);
    }
  },

  'test-profile': () => {
    console.log('👤 Running profile page visual tests...\n');
    try {
      execSync(
        'npx playwright test nature-theme-visual.test.ts -g "User Dashboard"',
        { stdio: 'inherit' }
      );
      console.log('\n✅ Profile page tests passed!');
    } catch (error) {
      console.error('\n❌ Profile page tests failed');
      process.exit(1);
    }
  },

  'test-admin': () => {
    console.log('⚙️ Running admin dashboard visual tests...\n');
    try {
      execSync(
        'npx playwright test nature-theme-visual.test.ts -g "Admin Dashboard"',
        { stdio: 'inherit' }
      );
      console.log('\n✅ Admin dashboard tests passed!');
    } catch (error) {
      console.error('\n❌ Admin dashboard tests failed');
      process.exit(1);
    }
  },

  'test-grid': () => {
    console.log('📊 Running task grid visual tests...\n');
    try {
      execSync(
        'npx playwright test nature-theme-visual.test.ts -g "Task Grid"',
        { stdio: 'inherit' }
      );
      console.log('\n✅ Task grid tests passed!');
    } catch (error) {
      console.error('\n❌ Task grid tests failed');
      process.exit(1);
    }
  },

  // Show test report
  report: () => {
    console.log('📊 Opening test report...\n');
    try {
      execSync('npx playwright show-report', { stdio: 'inherit' });
    } catch (error) {
      console.error('\n❌ Failed to open report');
      process.exit(1);
    }
  },

  // Clean up test results
  clean: () => {
    console.log('🧹 Cleaning up test results...\n');
    try {
      if (fs.existsSync(RESULTS_DIR)) {
        fs.rmSync(RESULTS_DIR, { recursive: true, force: true });
        console.log('✅ Test results cleaned');
      }
      console.log('✅ Cleanup complete');
    } catch (error) {
      console.error('❌ Failed to clean up:', error.message);
      process.exit(1);
    }
  },

  // Show help
  help: () => {
    console.log(`
📸 Visual Regression Testing Helper

Usage: node scripts/visual-regression.js [command]

Commands:
  update          Update baseline screenshots
  test            Run all visual regression tests
  test-light      Run light mode tests only
  test-dark       Run dark mode tests only
  test-home       Run home page tests only
  test-profile    Run profile page tests only
  test-admin      Run admin dashboard tests only
  test-grid       Run task grid tests only
  report          Show test report
  clean           Clean up test results
  help            Show this help message

Examples:
  node scripts/visual-regression.js update
  node scripts/visual-regression.js test
  node scripts/visual-regression.js test-home
  node scripts/visual-regression.js report
    `);
  },
};

// Parse command line arguments
const command = process.argv[2] || 'help';

if (commands[command]) {
  commands[command]();
} else {
  console.error(`❌ Unknown command: ${command}\n`);
  commands.help();
  process.exit(1);
}
