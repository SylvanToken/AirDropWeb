# Testing Installation Guide

This guide will help you set up the testing environment for the Sylvan Token Airdrop Platform.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (for version control)

## Installation Steps

### 1. Install Dependencies

First, install all npm dependencies including the new testing packages:

```bash
npm install
```

This will install:
- `@playwright/test` - Playwright testing framework
- `@axe-core/playwright` - Accessibility testing with axe-core
- `playwright-lighthouse` - Performance testing with Lighthouse

### 2. Install Playwright Browsers

Playwright needs to download browser binaries for testing:

```bash
npx playwright install
```

This will download:
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

**Note**: This may take a few minutes and requires ~1GB of disk space.

### 3. Install System Dependencies (Linux only)

If you're on Linux, you may need to install system dependencies:

```bash
npx playwright install-deps
```

### 4. Verify Installation

Check that everything is installed correctly:

```bash
# Check Playwright version
npx playwright --version

# List installed browsers
npx playwright list-browsers
```

## Quick Test

Run a quick test to verify everything works:

```bash
# Start dev server in one terminal
npm run dev

# In another terminal, run a simple test
npx playwright test --project=chromium --grep "Home page"
```

If the test passes, your installation is complete! ✅

## Troubleshooting

### Issue: "Cannot find module '@playwright/test'"

**Solution**: Make sure you ran `npm install` successfully.

```bash
npm install
```

### Issue: "browserType.launch: Executable doesn't exist"

**Solution**: Install Playwright browsers.

```bash
npx playwright install
```

### Issue: "Error: Failed to launch browser"

**Solution** (Linux): Install system dependencies.

```bash
npx playwright install-deps
```

### Issue: "Port 3000 is already in use"

**Solution**: Kill the process using port 3000 or use a different port.

```bash
# Kill process on port 3000
npx kill-port 3000

# Or run dev server on different port
npm run dev -- -p 3001
```

### Issue: TypeScript errors in test files

**Solution**: These are expected before installation. They will be resolved after running `npm install`.

## Next Steps

After installation:

1. **Read the documentation**:
   - [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Comprehensive guide
   - [TESTING_QUICK_START.md](./TESTING_QUICK_START.md) - Quick reference

2. **Run your first test suite**:
   ```bash
   npm run test:visual
   ```

3. **View the test report**:
   ```bash
   npm run test:report
   ```

4. **Explore test files**:
   - `__tests__/visual-regression.test.ts`
   - `__tests__/accessibility.test.ts`
   - `__tests__/performance.test.ts`
   - `__tests__/cross-browser.test.ts`
   - `__tests__/internationalization.test.ts`

## Development Workflow

### Before Committing
```bash
npm run test:unit
npm run lint
```

### Before Pull Request
```bash
npm run test:all
```

### After UI Changes
```bash
npm run test:visual
npm run test:a11y
```

### After Translation Updates
```bash
npm run test:i18n
```

### After Performance Optimization
```bash
npm run test:perf
```

## CI/CD Setup

For continuous integration, add this to your workflow:

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run tests
        run: npm run test:all
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
      
      - name: Upload test report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Disk Space Requirements

- Node modules: ~500MB
- Playwright browsers: ~1GB
- Test results/screenshots: ~100MB (varies)
- **Total**: ~1.6GB

## System Requirements

### Minimum
- CPU: 2 cores
- RAM: 4GB
- Disk: 2GB free space

### Recommended
- CPU: 4+ cores
- RAM: 8GB+
- Disk: 5GB+ free space

## Browser Versions

Playwright will install these browser versions:

- **Chromium**: Latest stable
- **Firefox**: Latest stable
- **WebKit**: Latest stable

These are updated regularly with Playwright releases.

## Environment Variables

Optional environment variables for testing:

```bash
# Base URL for tests (default: http://localhost:3000)
BASE_URL=http://localhost:3000

# Run tests in CI mode
CI=true

# Playwright options
PWDEBUG=1  # Enable debug mode
```

## Updating

To update Playwright and browsers:

```bash
# Update npm packages
npm update @playwright/test @axe-core/playwright playwright-lighthouse

# Update browsers
npx playwright install
```

## Uninstalling

To remove Playwright browsers:

```bash
# Remove browsers
npx playwright uninstall

# Remove npm packages
npm uninstall @playwright/test @axe-core/playwright playwright-lighthouse
```

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review [TESTING_GUIDE.md](./TESTING_GUIDE.md)
3. Check Playwright documentation: https://playwright.dev
4. Search GitHub issues: https://github.com/microsoft/playwright/issues

## Resources

- [Playwright Documentation](https://playwright.dev)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Success Checklist

- ✅ npm dependencies installed
- ✅ Playwright browsers installed
- ✅ Dev server starts successfully
- ✅ Can run a simple test
- ✅ Test report opens in browser
- ✅ No TypeScript errors in test files

Once all items are checked, you're ready to start testing! 🎉
