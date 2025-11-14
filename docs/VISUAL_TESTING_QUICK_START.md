# Visual Regression Testing - Quick Start Guide

Quick reference for running visual regression tests on the nature theme redesign.

## 🚀 Quick Commands

```bash
# Run all nature theme visual tests
npm run test:visual-nature

# Update baseline screenshots (after intentional changes)
npm run test:visual-update

# Run specific page tests
npm run test:visual-home      # Home page
npm run test:visual-profile   # User profile
npm run test:visual-admin     # Admin dashboard
npm run test:visual-grid      # Task grid layout

# View test report with diffs
npm run test:report

# Clean up test results
node scripts/visual-regression.js clean
```

## 📋 Common Workflows

### 1. First Time Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Start dev server (in separate terminal)
npm run dev

# Create baseline screenshots
npm run test:visual-update
```

### 2. Running Tests During Development

```bash
# Start dev server
npm run dev

# In another terminal, run tests
npm run test:visual-nature

# If tests fail, view the report
npm run test:report
```

### 3. After Making Design Changes

```bash
# Run tests to see what changed
npm run test:visual-nature

# Review diffs in the report
npm run test:report

# If changes are intentional, update baselines
npm run test:visual-update

# Commit the new baselines
git add __tests__/__screenshots__
git commit -m "chore: update visual baselines for [feature]"
```

### 4. Testing Specific Components

```bash
# Test only home page
npm run test:visual-home

# Test only admin dashboard
npm run test:visual-admin

# Test only task grid
npm run test:visual-grid

# Test only light mode
node scripts/visual-regression.js test-light

# Test only dark mode
node scripts/visual-regression.js test-dark
```

## 🎯 What Gets Tested

### Home Page
- Hero section with eco gradients
- Feature cards with neon effects
- Stats section with depth effects
- CTA section with glow effects

### User Dashboard
- Profile layout and cards
- Wallet status indicators
- Input fields and focus states
- Eco-themed gradients

### Admin Dashboard
- Dashboard header and stats
- Task grid (5-column responsive)
- Quick actions section
- Navigation components

### Interactive Elements
- Button hover/focus states
- Input neon focus rings
- Card hover effects
- Navigation active states

## 🔍 Reading Test Results

### Test Passed ✅
```
✓ Home page - Hero section with eco gradient - light mode
```
No visual changes detected.

### Test Failed ❌
```
✗ Home page - Hero section with eco gradient - light mode
  Screenshot comparison failed: 150 pixels differ
```
Visual changes detected. Review the diff images.

### Viewing Diffs

1. Run `npm run test:report`
2. Browser opens with test results
3. Click on failed test
4. View side-by-side comparison:
   - **Expected**: Baseline screenshot
   - **Actual**: Current screenshot
   - **Diff**: Highlighted differences

## 🛠️ Troubleshooting

### "Cannot find baseline screenshot"
**Solution**: Run `npm run test:visual-update` to create baselines.

### "Tests are flaky"
**Solution**: Increase wait times or disable animations in test.

### "Minor pixel differences"
**Solution**: Adjust threshold in `playwright.config.ts` or update baselines if intentional.

### "Dev server not running"
**Solution**: Start dev server with `npm run dev` before running tests.

## 📊 Test Coverage

| Component | Light Mode | Dark Mode | Responsive | Interactive |
|-----------|------------|-----------|------------|-------------|
| Home Hero | ✅ | ✅ | ✅ | ✅ |
| Features | ✅ | ✅ | ✅ | ✅ |
| Profile | ✅ | ✅ | ✅ | ✅ |
| Admin Dashboard | ✅ | ✅ | ✅ | ✅ |
| Task Grid | ✅ | ✅ | ✅ | ✅ |
| Navigation | ✅ | ✅ | ✅ | ✅ |
| Buttons | ✅ | ✅ | N/A | ✅ |
| Inputs | ✅ | ✅ | N/A | ✅ |

## 🎨 Nature Theme Elements Tested

- ✅ Eco color palette (eco-leaf, eco-forest, eco-moss)
- ✅ 4K depth effects (depth-4k-1, depth-4k-2, depth-4k-3)
- ✅ Neon glow effects on interactive elements
- ✅ Glassmorphism with backdrop blur
- ✅ 90% opacity backgrounds
- ✅ Aspect ratio preservation
- ✅ Responsive grid layouts (5-column, 3-column, 1-column)
- ✅ Dark mode variants
- ✅ Reduced motion support

## 📝 Best Practices

1. **Always review diffs** before updating baselines
2. **Test locally** before pushing changes
3. **Update baselines** only for intentional changes
4. **Document changes** in commit messages
5. **Run specific tests** when working on specific pages

## 🔗 Related Documentation

- [Full Visual Regression Testing Guide](./VISUAL_REGRESSION_TESTING.md)
- [Nature Theme Design Document](../.kiro/specs/nature-theme-redesign/design.md)
- [Nature Theme Requirements](../.kiro/specs/nature-theme-redesign/requirements.md)
- [Playwright Documentation](https://playwright.dev/docs/test-snapshots)

## 💡 Tips

- Use `--headed` flag to see browser during tests: `npx playwright test --headed`
- Use `--debug` flag to debug tests: `npx playwright test --debug`
- Use `--ui` flag for interactive mode: `npx playwright test --ui`
- Filter tests by name: `npx playwright test -g "hero"`

## ⚡ Performance

- Full test suite: ~2-3 minutes
- Single page tests: ~30-60 seconds
- Baseline updates: ~2-3 minutes

## 🎯 Success Criteria

Tests pass when:
- ✅ All screenshots match baselines within threshold
- ✅ No unintended visual regressions
- ✅ Nature theme colors are consistent
- ✅ Neon effects render correctly
- ✅ Responsive layouts work at all breakpoints
- ✅ Dark mode renders correctly
- ✅ Interactive states (hover, focus) work as expected
