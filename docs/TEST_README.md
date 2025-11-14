# Test Suite

This directory contains all automated tests for the Sylvan Token Airdrop Platform.

## Test Files

### 1. `visual-regression.test.ts`
Tests component rendering consistency across themes, breakpoints, and languages.

**What it tests**:
- Light and dark mode rendering
- Responsive layouts (mobile, tablet, desktop, wide)
- All 5 languages (en, tr, de, zh, ru)
- Interactive states (hover, focus, active)
- Hero sections and card variants
- Layout consistency

**Run**: `npm run test:visual`

### 2. `accessibility.test.ts`
Tests WCAG 2.1 AA compliance and accessibility features.

**What it tests**:
- axe-core automated scans
- Keyboard navigation
- Screen reader support (ARIA labels, semantic HTML)
- Color contrast ratios
- Touch target sizes
- Motion preferences

**Run**: `npm run test:a11y`

### 3. `performance.test.ts`
Tests performance metrics and optimization.

**What it tests**:
- Lighthouse scores (≥90 for all categories)
- Core Web Vitals (LCP, FID, CLS)
- Network performance on slow 3G
- Bundle sizes (JS <500KB, CSS <100KB)
- Image optimization
- Runtime performance

**Run**: `npm run test:perf`

### 4. `cross-browser.test.ts`
Tests compatibility across browsers and devices.

**What it tests**:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Mobile devices (iPhone, Pixel, iPad)
- CSS and JavaScript feature support
- Browser APIs (LocalStorage, Fetch, etc.)
- Image format support (WebP, AVIF)

**Run**: `npm run test:browser`

### 5. `internationalization.test.ts`
Tests multi-language support and formatting.

**What it tests**:
- Translation file completeness
- Translation key consistency
- Language switching functionality
- Date/number/currency formatting
- Text overflow prevention
- Special character rendering

**Run**: `npm run test:i18n`

### 6. `auth.test.ts`, `task-completion.test.ts`, `admin-task-management.test.ts`, `bulk-operations.test.ts`
Unit tests for core functionality (Jest).

**What it tests**:
- Authentication and authorization
- Task completion workflows
- Admin task management
- Bulk operations (status updates, deletion, point assignment)
- Error handling and audit logging

**Run**: `npm run test:unit`

## Running Tests

### All Tests
```bash
npm run test:all
```

### Individual Suites
```bash
npm run test:visual      # Visual regression
npm run test:a11y        # Accessibility
npm run test:perf        # Performance
npm run test:browser     # Cross-browser
npm run test:i18n        # Internationalization
npm run test:unit        # Unit tests
```

### Specific Test File
```bash
npx playwright test visual-regression.test.ts
```

### Specific Test
```bash
npx playwright test -g "Home page renders"
```

### Debug Mode
```bash
npx playwright test --debug
```

### UI Mode
```bash
npx playwright test --ui
```

## Test Results

### View HTML Report
```bash
npm run test:report
```

### Test Results Location
- HTML Report: `playwright-report/`
- JSON Results: `test-results/results.json`
- JUnit XML: `test-results/junit.xml`
- Screenshots: `test-results/`
- Videos: `test-results/`

## Writing Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    
    // Your test code here
    
    await expect(page).toHaveTitle('Expected Title');
  });
});
```

### Best Practices

1. **Use descriptive test names**
   ```typescript
   test('User can login with valid credentials', async ({ page }) => {
     // ...
   });
   ```

2. **Wait for elements properly**
   ```typescript
   await page.waitForLoadState('networkidle');
   await expect(element).toBeVisible();
   ```

3. **Use data attributes for selectors**
   ```typescript
   const button = page.locator('[data-testid="submit-button"]');
   ```

4. **Clean up after tests**
   ```typescript
   test.afterEach(async ({ page }) => {
     await page.close();
   });
   ```

5. **Use fixtures for common setup**
   ```typescript
   test.use({ locale: 'en-US', timezoneId: 'America/New_York' });
   ```

## Test Configuration

Configuration is in `playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop, Mobile (iPhone, Pixel, iPad)
- **Reporters**: HTML, JSON, JUnit
- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

## Thresholds

Tests will fail if these thresholds are not met:

### Lighthouse Scores
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

### Core Web Vitals
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

### Bundle Sizes
- JavaScript: < 500KB
- CSS: < 100KB

### Accessibility
- Zero axe-core violations
- 44x44px minimum touch targets
- 4.5:1 contrast ratio for normal text

## Troubleshooting

### Tests Failing?

1. **Check dev server is running**
   ```bash
   npm run dev
   ```

2. **Update snapshots** (if visual tests fail)
   ```bash
   npx playwright test --update-snapshots
   ```

3. **Clear cache**
   ```bash
   rm -rf node_modules .next
   npm install
   ```

4. **Reinstall browsers**
   ```bash
   npx playwright install
   ```

### Common Issues

- **Port in use**: `npx kill-port 3000`
- **Timeout**: Increase timeout in config
- **Screenshot diff**: Update snapshots
- **Browser not found**: Run `npx playwright install`

## CI/CD

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Daily scheduled runs

See `.github/workflows/test.yml` for CI configuration.

## Documentation

- [TESTING_GUIDE.md](../docs/TESTING_GUIDE.md) - Comprehensive guide
- [TESTING_QUICK_START.md](../docs/TESTING_QUICK_START.md) - Quick reference
- [TESTING_INSTALLATION.md](../docs/TESTING_INSTALLATION.md) - Installation guide

## Resources

- [Playwright Documentation](https://playwright.dev)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)

## Test Coverage

| Suite | Tests | Duration |
|-------|-------|----------|
| Visual Regression | ~50 | ~5 min |
| Accessibility | ~40 | ~3 min |
| Performance | ~30 | ~10 min |
| Cross-Browser | ~45 | ~8 min |
| Internationalization | ~35 | ~4 min |
| Unit Tests | ~33 | ~2 min |
| **Total** | **~233** | **~32 min** |

## Maintenance

### Regular Tasks
- Run tests before commits
- Update snapshots when UI changes
- Review and fix violations
- Monitor performance metrics
- Update thresholds as needed

### When to Run
- **Before commit**: Unit tests + lint
- **Before PR**: All test suites
- **After UI changes**: Visual + accessibility
- **After translations**: i18n tests
- **After optimization**: Performance tests

## Contributing

When adding new features:

1. Write tests for new functionality
2. Ensure all tests pass
3. Update snapshots if needed
4. Document new test cases
5. Update thresholds if necessary

## Questions?

See the [TESTING_GUIDE.md](../docs/TESTING_GUIDE.md) for detailed information or ask the team.
