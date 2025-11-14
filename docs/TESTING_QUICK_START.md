# Testing Quick Start Guide

Quick reference for running tests on the Sylvan Token Airdrop Platform.

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Run Tests

### All Tests
```bash
npm run test:all
```

### Individual Test Suites
```bash
npm run test:visual      # Visual regression tests
npm run test:a11y        # Accessibility tests
npm run test:perf        # Performance tests
npm run test:browser     # Cross-browser tests
npm run test:i18n        # Internationalization tests
npm run test:unit        # Unit tests
```

### View Results
```bash
npm run test:report      # Open HTML report
```

## Test Coverage

| Test Suite | What It Tests | Duration |
|------------|---------------|----------|
| Visual Regression | Component rendering, themes, breakpoints | ~5 min |
| Accessibility | WCAG compliance, keyboard nav, screen readers | ~3 min |
| Performance | Lighthouse scores, Core Web Vitals, bundle sizes | ~10 min |
| Cross-Browser | Chrome, Firefox, Safari, Edge compatibility | ~8 min |
| Internationalization | Translations, formatting, text overflow | ~4 min |
| Unit Tests | Business logic, utilities | ~1 min |

## Quick Checks

### Before Committing
```bash
npm run test:unit        # Fast unit tests
npm run lint             # Code quality
```

### Before Pull Request
```bash
npm run test:all         # Full test suite
```

### After UI Changes
```bash
npm run test:visual      # Visual regression
npm run test:a11y        # Accessibility
```

### After Translation Updates
```bash
npm run test:i18n        # i18n tests
```

### After Performance Optimization
```bash
npm run test:perf        # Performance tests
```

## Common Commands

```bash
# Run specific test file
npx playwright test visual-regression.test.ts

# Run in debug mode
npx playwright test --debug

# Run with UI
npx playwright test --ui

# Update screenshots
npx playwright test --update-snapshots

# Run in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Thresholds

Tests will fail if these thresholds are not met:

- **Lighthouse Scores**: ≥ 90 (all categories)
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **JavaScript Bundle**: < 500KB
- **CSS Bundle**: < 100KB
- **Accessibility**: Zero violations
- **Touch Targets**: ≥ 44x44px

## Troubleshooting

### Tests Failing?

1. **Check if dev server is running**
   ```bash
   npm run dev
   ```

2. **Clear cache and reinstall**
   ```bash
   rm -rf node_modules .next
   npm install
   npx playwright install
   ```

3. **Update snapshots** (if visual tests fail)
   ```bash
   npx playwright test --update-snapshots
   ```

4. **View detailed report**
   ```bash
   npm run test:report
   ```

## CI/CD

Tests run automatically on:
- Pull requests
- Pushes to main
- Daily scheduled runs

## More Information

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive documentation.
