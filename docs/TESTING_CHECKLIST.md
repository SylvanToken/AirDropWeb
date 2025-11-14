# Testing Checklist

Use this checklist to ensure comprehensive testing coverage for the Sylvan Token Airdrop Platform.

## Initial Setup

- [ ] Install npm dependencies (`npm install`)
- [ ] Install Playwright browsers (`npx playwright install`)
- [ ] Verify dev server starts (`npm run dev`)
- [ ] Run initial test suite (`npm run test:all`)
- [ ] Review test results and fix any failures

## Before Every Commit

- [ ] Run unit tests (`npm run test:unit`)
- [ ] Run linter (`npm run lint`)
- [ ] Fix any errors or warnings
- [ ] Ensure code builds (`npm run build`)

## Before Pull Request

- [ ] Run all test suites (`npm run test:all`)
- [ ] Review test report (`npm run test:report`)
- [ ] Fix all failing tests
- [ ] Update snapshots if UI changed (`npx playwright test --update-snapshots`)
- [ ] Verify no accessibility violations
- [ ] Check performance metrics meet thresholds
- [ ] Ensure all translations are complete

## After UI Changes

### Visual Regression
- [ ] Run visual tests (`npm run test:visual`)
- [ ] Review screenshot differences
- [ ] Update snapshots if changes are intentional
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test at all breakpoints (mobile, tablet, desktop)

### Accessibility
- [ ] Run accessibility tests (`npm run test:a11y`)
- [ ] Fix any axe-core violations
- [ ] Test keyboard navigation
- [ ] Verify focus indicators are visible
- [ ] Check color contrast ratios
- [ ] Ensure touch targets are 44x44px minimum
- [ ] Test with screen reader (optional but recommended)

## After Translation Updates

- [ ] Run i18n tests (`npm run test:i18n`)
- [ ] Verify all translation files are complete
- [ ] Check for missing translation keys
- [ ] Test language switching
- [ ] Verify no text overflow
- [ ] Test date/number formatting
- [ ] Check special characters render correctly

## After Performance Optimization

- [ ] Run performance tests (`npm run test:perf`)
- [ ] Check Lighthouse scores (≥90 for all)
- [ ] Verify Core Web Vitals:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] Check bundle sizes:
  - [ ] JavaScript < 500KB
  - [ ] CSS < 100KB
- [ ] Test on slow 3G connection
- [ ] Verify image optimization (WebP/AVIF)

## After Adding New Features

- [ ] Write unit tests for new functionality
- [ ] Write E2E tests for user flows
- [ ] Update visual regression baselines
- [ ] Add accessibility tests for new components
- [ ] Test in all supported browsers
- [ ] Test in all supported languages
- [ ] Update documentation

## Cross-Browser Testing

- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)
- [ ] Test on iOS Safari
- [ ] Test on Chrome Mobile
- [ ] Test on different screen sizes

## Accessibility Checklist

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Skip links work correctly
- [ ] Escape closes modals/dropdowns
- [ ] Enter/Space activate buttons

### Screen Readers
- [ ] All images have alt text
- [ ] Icon buttons have aria-labels
- [ ] Form inputs have labels
- [ ] Dynamic content has aria-live regions
- [ ] Semantic HTML is used (header, nav, main, footer)

### Visual
- [ ] Color contrast meets WCAG AA (4.5:1 for normal, 3:1 for large)
- [ ] Focus indicators are visible
- [ ] Error states use color + icon + text
- [ ] Text is readable at 200% zoom

### Touch/Mobile
- [ ] Touch targets are 44x44px minimum
- [ ] Gestures have alternatives
- [ ] Pinch zoom is not disabled
- [ ] Orientation changes work correctly

## Performance Checklist

### Loading
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.8s
- [ ] Total Blocking Time < 300ms

### Runtime
- [ ] Animations run at 60fps
- [ ] No memory leaks on navigation
- [ ] No long tasks blocking main thread
- [ ] Smooth scrolling

### Optimization
- [ ] Images are optimized (WebP/AVIF)
- [ ] Images are lazy loaded
- [ ] Code is split by route
- [ ] CSS is minified
- [ ] JavaScript is minified
- [ ] Resources are compressed (gzip/brotli)
- [ ] Caching headers are set

## Internationalization Checklist

### Translations
- [ ] All text is translatable (no hardcoded strings)
- [ ] All translation files exist (en, tr, de, zh, ru)
- [ ] All translation keys are consistent
- [ ] No empty translation values
- [ ] Placeholders are preserved ({{variable}})

### Formatting
- [ ] Dates are formatted per locale
- [ ] Numbers are formatted per locale
- [ ] Currency is formatted per locale
- [ ] Relative time is formatted per locale

### Layout
- [ ] Text doesn't overflow containers
- [ ] Long translations are handled gracefully
- [ ] Navigation items fit in header
- [ ] Form labels align properly
- [ ] No horizontal scrolling

### Special Characters
- [ ] Chinese characters render correctly
- [ ] German umlauts render correctly
- [ ] Turkish characters render correctly
- [ ] Russian Cyrillic renders correctly
- [ ] No encoding issues (�, &amp;, etc.)

## Security Checklist

- [ ] No sensitive data in client-side code
- [ ] API endpoints are protected
- [ ] Input validation is in place
- [ ] XSS prevention is implemented
- [ ] CSRF protection is enabled
- [ ] SQL injection prevention (using Prisma)
- [ ] Passwords are hashed (bcrypt)

## Documentation Checklist

- [ ] README is up to date
- [ ] CHANGELOG is updated
- [ ] API documentation is current
- [ ] Component documentation exists
- [ ] Test documentation is complete
- [ ] Deployment guide is accurate

## CI/CD Checklist

- [ ] Tests run on pull requests
- [ ] Tests run on main branch pushes
- [ ] Test results are reported
- [ ] Failed tests block merging
- [ ] Test artifacts are uploaded
- [ ] Test reports are accessible

## Release Checklist

- [ ] All tests pass
- [ ] No accessibility violations
- [ ] Performance meets thresholds
- [ ] All browsers tested
- [ ] All languages tested
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version number bumped
- [ ] Git tag created

## Maintenance Checklist

### Weekly
- [ ] Review test results
- [ ] Fix flaky tests
- [ ] Update dependencies
- [ ] Check for security vulnerabilities

### Monthly
- [ ] Review and update thresholds
- [ ] Audit accessibility
- [ ] Review performance metrics
- [ ] Update browser versions
- [ ] Review test coverage

### Quarterly
- [ ] Comprehensive accessibility audit
- [ ] Performance optimization review
- [ ] Translation review by native speakers
- [ ] Cross-browser compatibility check
- [ ] Security audit

## Troubleshooting Checklist

### Tests Failing?
- [ ] Dev server is running
- [ ] Dependencies are installed
- [ ] Browsers are installed
- [ ] Environment variables are set
- [ ] Database is migrated
- [ ] Cache is cleared

### Visual Tests Failing?
- [ ] UI changes are intentional
- [ ] Snapshots need updating
- [ ] Font rendering is consistent
- [ ] Images are loading correctly

### Accessibility Tests Failing?
- [ ] Review axe-core report
- [ ] Fix ARIA labels
- [ ] Improve color contrast
- [ ] Add alt text to images

### Performance Tests Failing?
- [ ] Optimize images
- [ ] Reduce bundle size
- [ ] Enable caching
- [ ] Use code splitting

### i18n Tests Failing?
- [ ] All translation files exist
- [ ] Translation keys match
- [ ] No empty values
- [ ] Placeholders preserved

## Quick Reference

### Run Tests
```bash
npm run test:all         # All tests
npm run test:visual      # Visual regression
npm run test:a11y        # Accessibility
npm run test:perf        # Performance
npm run test:browser     # Cross-browser
npm run test:i18n        # Internationalization
npm run test:unit        # Unit tests
```

### View Results
```bash
npm run test:report      # Open HTML report
```

### Debug
```bash
npx playwright test --debug
npx playwright test --ui
```

### Update Snapshots
```bash
npx playwright test --update-snapshots
```

## Notes

- ✅ = Completed
- ⚠️ = Needs attention
- ❌ = Failed
- 🔄 = In progress

Keep this checklist updated as the project evolves!
