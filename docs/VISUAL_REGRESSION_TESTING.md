# Visual Regression Testing - Nature Theme

This document describes the visual regression testing setup for the nature theme redesign.

## Overview

Visual regression tests capture screenshots of key pages and components, then compare them against baseline images to detect unintended visual changes. This ensures the nature theme's eco colors, neon effects, and 4K depth effects remain consistent across updates.

## Test Coverage

### Home Page
- ✅ Hero section with eco gradient backgrounds
- ✅ Features section with neon variant cards
- ✅ Benefits and stats section with eco gradients
- ✅ CTA section with neon glow effects
- ✅ Full page in light and dark modes

### User Dashboard (Profile Page)
- ✅ Profile page layout with eco gradient background
- ✅ Profile cards with eco borders and shadows
- ✅ Wallet status with eco-leaf colors
- ✅ Verified badges with neon glow
- ✅ Input fields with eco-themed gradients
- ✅ Input focus states with neon rings
- ✅ Stat displays with eco gradient text

### Admin Dashboard
- ✅ Dashboard header with eco gradient
- ✅ Admin badge with eco gradient
- ✅ Stats cards with gradient backgrounds and depth-4k-1
- ✅ Stats card hover effects with shadow-lg
- ✅ Stat icons with eco-themed gradients
- ✅ Quick actions section with hover effects
- ✅ Full dashboard in light and dark modes

### Admin Task Grid
- ✅ 5-column layout on xlarge screens (≥1280px)
- ✅ 3-column layout on medium screens (768px-1279px)
- ✅ 1-column layout on small screens (<768px)
- ✅ Task cards with neon variant
- ✅ Task cards with depth-4k-2 effect
- ✅ Task card hover glow effects
- ✅ Task cards with delete buttons

### Interactive Elements
- ✅ Button neon glow effects (default, hover, focus)
- ✅ Input neon focus rings
- ✅ Card neon borders on focus
- ✅ Card animated pulse effects

### Navigation Components
- ✅ Header with eco-themed colors
- ✅ Admin sidebar with eco gradients
- ✅ Active navigation items with neon glow
- ✅ Navigation icons with eco-leaf color

### Aspect Ratio Preservation
- ✅ Cards maintain aspect ratio across viewports
- ✅ Images preserve natural aspect ratios

### Accessibility
- ✅ Reduced motion support (neon effects disabled)
- ✅ High contrast mode compatibility

## Requirements Coverage

| Requirement | Description | Test Coverage |
|-------------|-------------|---------------|
| 1.1-1.5 | Nature color palette | ✅ All pages tested |
| 2.1-2.5 | 4K depth effects | ✅ Cards, buttons, shadows |
| 3.1-3.5 | Admin task grid | ✅ All breakpoints |
| 5.1-5.5 | Page styling | ✅ Home, profile, admin |
| 6.1-6.5 | Theme system | ✅ Light/dark modes |
| 7.1-7.5 | Aspect ratio | ✅ Cards and images |
| 8.1-8.5 | Neon effects | ✅ All interactive elements |

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Start the development server:
```bash
npm run dev
```

### Test Commands

#### Run all visual regression tests
```bash
npm run test:visual-nature
```

#### Update baseline screenshots
```bash
npm run test:visual-update
```

#### Run specific page tests
```bash
npm run test:visual-home      # Home page only
npm run test:visual-profile   # Profile page only
npm run test:visual-admin     # Admin dashboard only
npm run test:visual-grid      # Task grid only
```

#### Run theme-specific tests
```bash
node scripts/visual-regression.js test-light   # Light mode only
node scripts/visual-regression.js test-dark    # Dark mode only
```

#### View test report
```bash
npm run test:report
```

#### Clean up test results
```bash
node scripts/visual-regression.js clean
```

## Test Configuration

### Viewport Sizes

| Breakpoint | Width | Height | Use Case |
|------------|-------|--------|----------|
| mobile | 375px | 667px | Mobile phones |
| tablet | 768px | 1024px | Tablets |
| desktop | 1280px | 720px | Desktop (3-col grid) |
| large | 1920px | 1080px | Large desktop (5-col grid) |
| xlarge | 2560px | 1440px | Extra large (5-col grid) |

### Screenshot Comparison Settings

- **Max Diff Pixels**: 100 pixels
- **Max Diff Ratio**: 1% of total pixels
- **Threshold**: 0.2 (20% color difference tolerance)
- **Animations**: Disabled during capture
- **Caret**: Hidden in inputs

## Baseline Management

### When to Update Baselines

Update baseline screenshots when:
- ✅ Intentional design changes are made
- ✅ New components are added
- ✅ Color palette is updated
- ✅ Layout changes are implemented

Do NOT update baselines for:
- ❌ Unintended visual regressions
- ❌ Browser rendering differences
- ❌ Flaky test failures

### Updating Baselines

1. Review the visual changes in the test report:
```bash
npm run test:report
```

2. If changes are intentional, update baselines:
```bash
npm run test:visual-update
```

3. Commit the updated screenshots:
```bash
git add __tests__/__screenshots__
git commit -m "chore: update visual regression baselines"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run visual regression tests
        run: npm run test:visual-nature
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-test-results
          path: test-results/
```

## Troubleshooting

### Tests Failing Due to Minor Differences

If tests fail due to minor pixel differences:

1. Check the diff images in `test-results/`
2. Adjust threshold in `playwright.config.ts`:
```typescript
expect: {
  toHaveScreenshot: {
    threshold: 0.3, // Increase tolerance
  },
}
```

### Flaky Tests

If tests are flaky:

1. Increase wait times in test:
```typescript
await page.waitForTimeout(1000); // Increase from 500ms
```

2. Ensure animations are complete:
```typescript
await page.waitForLoadState('networkidle');
```

3. Disable animations in CSS:
```css
* {
  animation-duration: 0s !important;
  transition-duration: 0s !important;
}
```

### Font Rendering Differences

If fonts render differently across environments:

1. Use web fonts (not system fonts)
2. Ensure fonts are loaded before screenshots:
```typescript
await page.waitForFunction(() => document.fonts.ready);
```

### Browser-Specific Issues

If tests pass in one browser but fail in others:

1. Run tests in specific browser:
```bash
npx playwright test --project=chromium
```

2. Update baselines per browser:
```bash
npx playwright test --project=chromium --update-snapshots
```

## Best Practices

### 1. Keep Tests Focused
- Test one component or section per test
- Use descriptive test names
- Group related tests in describe blocks

### 2. Wait for Stability
- Always wait for `networkidle` state
- Add delays after hover/focus actions
- Ensure animations complete before capture

### 3. Maintain Baselines
- Review diffs before updating baselines
- Document intentional changes in commits
- Keep baselines in version control

### 4. Handle Dynamic Content
- Mock dynamic data (dates, user info)
- Use consistent test data
- Avoid time-dependent content

### 5. Test Responsively
- Test all critical breakpoints
- Verify grid layouts at each size
- Check mobile navigation states

## File Structure

```
__tests__/
├── nature-theme-visual.test.ts    # Main test file
└── __screenshots__/               # Baseline screenshots
    ├── chromium/
    │   ├── home-hero-light.png
    │   ├── home-hero-dark.png
    │   └── ...
    ├── firefox/
    └── webkit/

scripts/
└── visual-regression.js           # Helper script

docs/
└── VISUAL_REGRESSION_TESTING.md   # This file

playwright.config.ts               # Playwright configuration
```

## Resources

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Nature Theme Design Document](./nature-theme-redesign/design.md)
- [Nature Theme Requirements](./nature-theme-redesign/requirements.md)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test output and diff images
3. Consult Playwright documentation
4. Open an issue with screenshots and error logs
