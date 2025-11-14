# Testing Guide

This document provides comprehensive information about testing the Sylvan Token Airdrop Platform, including visual regression, accessibility, performance, cross-browser compatibility, and internationalization testing.

## Table of Contents

1. [Overview](#overview)
2. [Test Suites](#test-suites)
3. [Running Tests](#running-tests)
4. [Test Requirements](#test-requirements)
5. [Continuous Integration](#continuous-integration)
6. [Troubleshooting](#troubleshooting)

## Overview

The platform uses a comprehensive testing strategy to ensure quality, accessibility, and performance across all supported browsers and languages.

### Testing Stack

- **Playwright**: End-to-end and cross-browser testing
- **Jest**: Unit testing
- **axe-core**: Accessibility testing
- **Lighthouse**: Performance auditing

### Test Coverage

- ✅ Visual regression testing (light/dark modes, all breakpoints)
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Performance metrics (Core Web Vitals, Lighthouse scores)
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- ✅ Internationalization (5 languages, formatting, overflow)
- ✅ Unit tests for critical functionality
- ✅ Campaign system tests (creation, updates, deletion, filtering)
- ✅ Wallet verification tests (BEP-20 validation, duplicate prevention)
- ✅ Social media linking tests (Twitter/X, Telegram)
- ✅ Fraud detection tests (scoring, auto-approval, manual review)
- ✅ API endpoint tests (authentication, authorization, error handling)
- ✅ Component tests (rendering, interactions, states)
- ✅ Database operation tests (CRUD, transactions, integrity)
- ✅ Security tests (password hashing, JWT, input sanitization)

## Test Suites

### 1. Visual Regression Tests

**File**: `__tests__/visual-regression.test.ts`

Tests component rendering consistency across:
- Light and dark modes
- All breakpoints (mobile, tablet, desktop, wide)
- All supported languages (en, tr, de, zh, ru)
- Interactive states (hover, focus, active)

**Key Tests**:
- Component rendering in different themes
- Language variations
- Interactive state screenshots
- Responsive layout verification
- Hero section variants
- Card component variants
- Layout consistency

**Running**:
```bash
node scripts/run-tests.js visual
```

### 2. Accessibility Tests

**File**: `__tests__/accessibility.test.ts`

Tests WCAG 2.1 AA compliance:
- Automated axe-core scans
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Motion preferences
- Touch target sizes

**Key Tests**:
- axe-core violations check
- Tab navigation through elements
- Skip links functionality
- ARIA labels on icon buttons
- Alt text on images
- Semantic HTML structure
- Form labels and descriptions
- Focus indicator visibility
- Error state accessibility

**Running**:
```bash
node scripts/run-tests.js accessibility
```

### 3. Performance Tests

**File**: `__tests__/performance.test.ts`

Tests performance metrics and optimization:
- Lighthouse scores (>90 for all categories)
- Core Web Vitals (LCP, FID, CLS)
- Network performance
- Bundle size analysis
- Runtime performance

**Key Tests**:
- Lighthouse audit scores
- Largest Contentful Paint (< 2.5s)
- Cumulative Layout Shift (< 0.1)
- First Contentful Paint (< 1.8s)
- Time to Interactive (< 3.8s)
- Slow 3G performance
- Image lazy loading
- Resource compression
- Caching headers
- JavaScript bundle size (< 500KB)
- CSS bundle size (< 100KB)
- Image optimization (WebP/AVIF)

**Running**:
```bash
node scripts/run-tests.js performance
```

### 4. Cross-Browser Tests

**File**: `__tests__/cross-browser.test.ts`

Tests compatibility across browsers and devices:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Mobile devices (iPhone, Pixel, iPad)

**Key Tests**:
- Page rendering in all browsers
- CSS Grid and Flexbox support
- CSS Custom Properties
- Modern JavaScript features
- Touch events on mobile
- Mobile navigation menu
- LocalStorage/SessionStorage support
- Fetch API support
- IntersectionObserver support
- Backdrop filter support
- WebP/AVIF image format support
- No console errors
- Font loading

**Running**:
```bash
node scripts/run-tests.js browser
```

### 5. Internationalization Tests

**File**: `__tests__/internationalization.test.ts`

Tests multi-language support:
- Translation file completeness
- Language switching functionality
- Date/number/currency formatting
- Text overflow prevention
- Special character rendering

**Key Tests**:
- All translation files exist
- Valid JSON in all files
- Same keys across all languages
- No empty translation values
- Placeholder preservation
- Language switching persistence
- URL language reflection
- Locale-specific formatting
- No text overflow in buttons/cards
- Long translation handling
- Navigation item fitting
- Form label alignment
- Special character rendering (Chinese, German, Turkish)

**Running**:
```bash
node scripts/run-tests.js i18n
```

### 6. Unit Tests

**File**: `__tests__/*.test.ts` (Jest tests)

Tests individual functions and components:
- Authentication logic
- Task completion
- Admin functionality

**Running**:
```bash
npm run test:unit
# or
node scripts/run-tests.js unit
```

### 7. Campaign System Tests

**File**: `__tests__/campaign-system.test.ts`

Tests campaign management functionality:
- Campaign creation with validation
- Campaign updates and status changes
- Campaign deletion with cascade
- Campaign filtering by date range
- Task-campaign associations

**Key Tests**:
- Create campaign with valid data
- Validate required fields (title, description, dates)
- Prevent non-admin users from creating campaigns
- Validate date range (startDate < endDate)
- Update campaign data and status
- Delete campaign and cascade delete tasks
- Filter campaigns by date range and status
- Associate tasks with campaigns
- Maintain referential integrity

**Running**:
```bash
npm test campaign-system
```

### 8. Wallet Verification Tests

**File**: `__tests__/wallet-verification.test.ts`

Tests BEP-20 wallet address validation and verification:
- Wallet address format validation
- Wallet submission and storage
- Wallet verification workflow
- Duplicate wallet prevention
- Wallet status display

**Key Tests**:
- Accept valid BEP-20 addresses (0x + 40 hex chars)
- Reject invalid address formats
- Store wallet address correctly
- Set verification status to pending
- Update verification status (admin only)
- Prevent duplicate wallet addresses
- Case-insensitive duplicate check
- Display wallet verification status

**Running**:
```bash
npm test wallet-verification
```

### 9. Social Media Linking Tests

**File**: `__tests__/social-media-linking.test.ts`

Tests Twitter/X and Telegram account linking:
- Twitter account linking and validation
- Telegram account linking and validation
- Social media verification
- Duplicate prevention
- Account unlinking

**Key Tests**:
- Link Twitter account with username validation
- Link Telegram account with username validation
- Verify social media accounts (admin only)
- Prevent duplicate Twitter usernames
- Prevent duplicate Telegram usernames
- Case-insensitive duplicate check
- Unlink social media accounts
- Remove connection data on unlink

**Running**:
```bash
npm test social-media-linking
```

### 10. Fraud Detection Tests

**File**: `__tests__/fraud-detection.test.ts`

Tests anti-fraud system:
- Fraud score calculation
- Auto-approval logic
- Manual review workflow
- Fraud indicators
- Auto-approval cron job

**Key Tests**:
- Calculate low risk score (verified user, normal time)
- Calculate medium risk score (partial verification)
- Calculate high risk score (new user, fast completion)
- Consider account age in score
- Consider verification status in score
- Consider completion time in score
- Auto-approve low risk completions (<20)
- Schedule delayed approval (20-50)
- Flag high risk for manual review (>50)
- Admin approve/reject flagged completions
- Process auto-approval cron job

**Running**:
```bash
npm test fraud-detection
```

### 11. Internationalization Functionality Tests

**File**: `__tests__/i18n-functionality.test.ts`

Tests i18n implementation details:
- Translation key consistency
- Language switching
- Date formatting
- Number formatting
- Plural rules

**Key Tests**:
- Identical keys across all languages
- All namespaces have matching keys
- Language switching updates UI
- Russian date format (DD.MM.YYYY)
- German date format (DD.MM.YYYY)
- Chinese date format (YYYY/MM/DD)
- Turkish date format (DD.MM.YYYY)
- English date format (MM/DD/YYYY)
- Russian number format (space separator, comma decimal)
- German number format (dot separator, comma decimal)
- Russian plural rules (one, few, many)
- English plural rules (one, other)

**Running**:
```bash
npm test i18n-functionality
```

### 12. API Endpoint Tests

**File**: `__tests__/api-endpoints.test.ts`

Tests all API endpoints:
- Authentication endpoints
- User endpoints
- Task endpoints
- Admin endpoints
- Error responses
- Rate limiting

**Key Tests**:
- POST /api/auth/register with valid data
- POST /api/auth/register with duplicate email
- POST /api/auth/signin with valid credentials
- POST /api/auth/signin with invalid credentials
- GET /api/users/me (authenticated)
- GET /api/users/me (unauthenticated - 401)
- POST /api/users/wallet
- POST /api/users/social
- GET /api/tasks (authenticated)
- POST /api/completions
- GET /api/admin/stats (admin only)
- GET /api/admin/stats (non-admin - 403)
- 400 Bad Request with validation errors
- 401 Unauthorized without token
- 403 Forbidden for non-admin
- 404 Not Found for invalid resource
- 409 Conflict for duplicates
- 500 Internal Server Error on database failure
- Rate limiting on auth endpoints
- 429 Too Many Requests

**Running**:
```bash
npm test api-endpoints
```

### 13. Component Tests

**File**: `__tests__/component-tests.test.tsx`

Tests React component rendering and interactions:
- Authentication components
- Task components
- Wallet components
- Profile components
- Admin components
- Loading states
- Error states
- Translation in components

**Key Tests**:
- LoginForm rendering and submission
- RegisterForm rendering and validation
- TaskCard rendering with props
- TaskCard completion button click
- TaskList rendering multiple tasks
- WalletSetup form rendering and validation
- ProfileForm rendering
- SocialMediaSetup component
- UserTable rendering
- TaskManager rendering
- LoadingSpinner display
- Error message display
- Components using useTranslation hook
- Language switching in components

**Running**:
```bash
npm test component-tests
```

### 14. Database Operation Tests

**File**: `__tests__/database-operations.test.ts`

Tests Prisma database operations:
- User operations (CRUD)
- Campaign operations (CRUD)
- Task operations (CRUD)
- Completion operations (CRUD)
- Transaction handling

**Key Tests**:
- Create user with all fields
- Update user data
- Delete user (cascade delete completions)
- Query users with filters
- Unique constraints (email, username, wallet)
- Create campaign
- Update campaign
- Delete campaign (cascade delete tasks)
- Query campaigns with date filters
- Create task with campaign
- Update task
- Delete task (cascade delete completions)
- Query tasks by campaign
- Create completion
- Update completion status
- Prevent duplicate daily completions
- Atomic operations (completion + points update)
- Rollback on error
- Concurrent completion attempts

**Running**:
```bash
npm test database-operations
```

### 15. Security Tests

**File**: `__tests__/security.test.ts`

Tests security measures:
- Password hashing
- JWT token handling
- Input sanitization
- Rate limiting
- CSRF protection

**Key Tests**:
- bcrypt hashing with 10+ salt rounds
- Password comparison
- Reject weak passwords
- Password strength validation
- Token generation
- Token validation
- Token expiration (7 days)
- Invalid token rejection
- Token signature verification
- XSS prevention in user inputs
- SQL injection prevention (Prisma)
- HTML entity encoding
- Script tag removal
- Rate limit enforcement
- Block excessive requests
- Rate limit reset
- Different limits per endpoint
- CSRF token validation
- Reject requests without CSRF token

**Running**:
```bash
npm test security
```

### 16. Performance Comprehensive Tests

**File**: `__tests__/performance-comprehensive.test.ts`

Tests performance benchmarks:
- Page load performance
- API response time
- Database query performance
- Concurrent user handling
- Bundle size

**Key Tests**:
- Home page load time (<3s on 3G)
- Dashboard page load time
- Tasks page load time
- Admin page load time
- GET /api/tasks response time (<500ms)
- POST /api/completions response time
- GET /api/leaderboard response time
- User query execution time (<100ms)
- Task query with filters
- Completion query with joins
- Leaderboard aggregation query
- 50 concurrent users
- 100 concurrent users
- No performance degradation
- JavaScript bundle size (<500KB)
- CSS bundle size
- Image optimization
- Code splitting effectiveness

**Running**:
```bash
npm test performance-comprehensive
```

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

3. Start development server (for E2E tests):
```bash
npm run dev
```

### Run All Tests

```bash
node scripts/run-tests.js all
```

### Run Specific Test Suite

```bash
# Visual regression
node scripts/run-tests.js visual

# Accessibility
node scripts/run-tests.js accessibility

# Performance
node scripts/run-tests.js performance

# Cross-browser
node scripts/run-tests.js browser

# Internationalization
node scripts/run-tests.js i18n

# Unit tests (Jest)
node scripts/run-tests.js unit
npm test

# Specific test file
npm test campaign-system
npm test wallet-verification
npm test fraud-detection
npm test api-endpoints
npm test component-tests
npm test database-operations
npm test security

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test by name
npm test -- -t "should create campaign with valid data"
```

### Run Tests in Specific Browser

```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit (Safari) only
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project="Mobile Chrome"

# Mobile Safari
npx playwright test --project="Mobile Safari"
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests with UI

```bash
npx playwright test --ui
```

### View Test Report

```bash
npx playwright show-report
```

## Test Utilities and Fixtures

### Test Helpers

**File**: `__tests__/utils/test-helpers.ts`

Provides utility functions for test setup and teardown:

```typescript
// Create test user with optional overrides
const user = await createTestUser({ role: 'ADMIN' });

// Create test campaign
const campaign = await createTestCampaign({
  title: 'Custom Campaign',
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
});

// Create test task
const task = await createTestTask(campaign.id, {
  points: 20,
  taskType: 'TWITTER_FOLLOW'
});

// Create authenticated session
const token = await createAuthSession(user);

// Clean database between tests
await cleanDatabase();

// Mock authenticated API request
const response = await mockAuthenticatedRequest(
  'POST',
  '/api/completions',
  token,
  { taskId: task.id }
);
```

**Available Functions**:
- `createTestUser(overrides?)` - Create user with optional field overrides
- `createTestCampaign(overrides?)` - Create campaign with optional overrides
- `createTestTask(campaignId, overrides?)` - Create task associated with campaign
- `createAuthSession(user)` - Generate JWT token for user
- `cleanDatabase()` - Remove all test data from database
- `mockAuthenticatedRequest(method, url, token, body?)` - Make authenticated API call

### Test Fixtures

**Files**: `__tests__/fixtures/*.ts`

Predefined test data for consistent testing:

**Users** (`fixtures/users.ts`):
```typescript
testUsers.regularUser      // Standard user account
testUsers.adminUser        // Admin account
testUsers.verifiedUser     // Fully verified user with wallet and social media
```

**Campaigns** (`fixtures/campaigns.ts`):
```typescript
testCampaigns.activeCampaign   // Currently running campaign
testCampaigns.futureCampaign   // Upcoming campaign
testCampaigns.expiredCampaign  // Past campaign
```

**Tasks** (`fixtures/tasks.ts`):
```typescript
testTasks.twitterFollow    // Twitter follow task
testTasks.telegramJoin     // Telegram join task
testTasks.customTask       // Custom task type
```

**Completions** (`fixtures/completions.ts`):
```typescript
testCompletions.pending        // Pending completion
testCompletions.autoApproved   // Auto-approved completion
testCompletions.manualReview   // Flagged for review
testCompletions.rejected       // Rejected completion
```

### Using Test Utilities

**Example Test**:
```typescript
import { createTestUser, createTestCampaign, createTestTask, cleanDatabase } from './utils/test-helpers';
import { testUsers } from './fixtures/users';

describe('Task Completion', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should complete task successfully', async () => {
    // Setup
    const user = await createTestUser(testUsers.verifiedUser);
    const campaign = await createTestCampaign();
    const task = await createTestTask(campaign.id);
    const token = await createAuthSession(user);

    // Execute
    const response = await mockAuthenticatedRequest(
      'POST',
      '/api/completions',
      token,
      { taskId: task.id }
    );

    // Assert
    expect(response.status).toBe(201);
    const completion = await response.json();
    expect(completion.userId).toBe(user.id);
    expect(completion.taskId).toBe(task.id);
  });
});
```

### Database Setup

Tests use SQLite in-memory database for isolation and speed:

```typescript
// jest.setup.js
beforeAll(async () => {
  process.env.DATABASE_URL = 'file::memory:?cache=shared';
  await prisma.$connect();
  await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
});

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

## Test Requirements

### Thresholds

All tests must meet these minimum requirements:

#### Lighthouse Scores
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

#### Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- FCP (First Contentful Paint): < 1.8s
- TTI (Time to Interactive): < 3.8s

#### Bundle Sizes
- Total JavaScript: < 500KB (compressed)
- Total CSS: < 100KB (compressed)

#### Accessibility
- Zero axe-core violations
- All interactive elements keyboard accessible
- Minimum 44x44px touch targets
- 4.5:1 contrast ratio for normal text
- 3:1 contrast ratio for large text

#### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- iOS Safari (latest 2 versions)
- Chrome Mobile (latest 2 versions)

#### Languages
- English (en) - Default
- Turkish (tr)
- German (de)
- Chinese (zh)
- Russian (ru)

### Test Data

Tests use fixtures and helper functions to generate consistent test data. See [Test Utilities and Fixtures](#test-utilities-and-fixtures) section for details.

**Default Test Credentials**:
- Regular User: `user@test.com` / `Test123!`
- Admin User: `admin@test.com` / `Admin123!`
- Verified User: `verified@test.com` / `Test123!`

## Continuous Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled daily runs

### CI Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *' # Daily at midnight

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: node scripts/run-tests.js all
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Troubleshooting

### Common Issues

#### 1. Playwright Browsers Not Installed

**Error**: `browserType.launch: Executable doesn't exist`

**Solution**:
```bash
npx playwright install
```

#### 2. Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
BASE_URL=http://localhost:3001 npx playwright test
```

#### 3. Tests Timing Out

**Error**: `Test timeout of 30000ms exceeded`

**Solution**:
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify network connectivity

#### 4. Screenshot Differences

**Error**: `Screenshot comparison failed`

**Solution**:
- Update baseline screenshots: `npx playwright test --update-snapshots`
- Check for font rendering differences
- Verify image loading

#### 5. Accessibility Violations

**Error**: `Expected violations to equal []`

**Solution**:
- Review axe-core report
- Fix ARIA labels
- Improve color contrast
- Add alt text to images

#### 6. Performance Failures

**Error**: `Expected LCP to be less than 2500ms`

**Solution**:
- Optimize images
- Reduce JavaScript bundle size
- Enable caching
- Use code splitting

### Debug Commands

```bash
# Run single test file
npx playwright test accessibility.test.ts

# Run single test
npx playwright test -g "Tab navigation"

# Run with headed browser
npx playwright test --headed

# Run with slow motion
npx playwright test --slow-mo=1000

# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Getting Help

1. Check Playwright documentation: https://playwright.dev
2. Review test output and error messages
3. Check browser console for errors
4. Review network tab for failed requests
5. Use debug mode to step through tests

## Best Practices

### Writing Tests

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

3. **Use data attributes for test selectors**
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

### Maintaining Tests

1. Update tests when features change
2. Keep test data realistic
3. Review and update thresholds regularly
4. Remove obsolete tests
5. Document complex test scenarios

## Reporting

### HTML Report

View detailed test results:
```bash
npx playwright show-report
```

### JSON Report

Programmatic access to results:
```json
{
  "stats": {
    "expected": 150,
    "passed": 148,
    "failed": 2,
    "skipped": 0,
    "duration": 45000
  }
}
```

### JUnit Report

For CI integration:
```xml
<testsuites>
  <testsuite name="accessibility" tests="25" failures="0">
    <!-- ... -->
  </testsuite>
</testsuites>
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)

## Writing New Tests

### Guidelines

1. **Use descriptive test names** that explain what is being tested
2. **Follow the AAA pattern**: Arrange, Act, Assert
3. **Use test utilities** for common setup operations
4. **Clean up after tests** to prevent side effects
5. **Test one thing per test** for clarity
6. **Use fixtures** for consistent test data
7. **Mock external dependencies** when appropriate
8. **Test error cases** in addition to happy paths

### Example Test Structure

```typescript
import { createTestUser, createTestCampaign, cleanDatabase } from './utils/test-helpers';

describe('Feature Name', () => {
  // Setup before each test
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('Specific Functionality', () => {
    it('should perform expected behavior', async () => {
      // Arrange - Set up test data
      const user = await createTestUser({ role: 'ADMIN' });
      const campaign = await createTestCampaign();

      // Act - Perform the action
      const result = await someFunction(user, campaign);

      // Assert - Verify the outcome
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });

    it('should handle error case', async () => {
      // Arrange
      const invalidData = { title: '' };

      // Act & Assert
      await expect(someFunction(invalidData)).rejects.toThrow('Validation error');
    });
  });
});
```

### Component Testing Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '@/components/tasks/TaskCard';

describe('TaskCard Component', () => {
  it('should render task information', () => {
    // Arrange
    const task = {
      id: '1',
      title: 'Follow on Twitter',
      description: 'Follow @SylvanToken',
      points: 10,
      taskType: 'TWITTER_FOLLOW'
    };

    // Act
    render(<TaskCard task={task} />);

    // Assert
    expect(screen.getByText('Follow on Twitter')).toBeInTheDocument();
    expect(screen.getByText('10 points')).toBeInTheDocument();
  });

  it('should call onComplete when button clicked', () => {
    // Arrange
    const task = { id: '1', title: 'Test Task', points: 10 };
    const onComplete = jest.fn();

    // Act
    render(<TaskCard task={task} onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Complete'));

    // Assert
    expect(onComplete).toHaveBeenCalledWith(task.id);
  });
});
```

### API Testing Example

```typescript
import { createTestUser, createAuthSession, mockAuthenticatedRequest } from './utils/test-helpers';

describe('API Endpoint', () => {
  it('should return 401 for unauthenticated request', async () => {
    // Act
    const response = await fetch('/api/users/me');

    // Assert
    expect(response.status).toBe(401);
  });

  it('should return user data for authenticated request', async () => {
    // Arrange
    const user = await createTestUser();
    const token = await createAuthSession(user);

    // Act
    const response = await mockAuthenticatedRequest('GET', '/api/users/me', token);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.email).toBe(user.email);
  });
});
```

## Changelog

### 2025-01-11
- Added comprehensive test coverage documentation
- Documented test utilities and fixtures
- Added campaign system tests
- Added wallet verification tests
- Added social media linking tests
- Added fraud detection tests
- Added API endpoint tests
- Added component tests
- Added database operation tests
- Added security tests
- Added performance comprehensive tests
- Updated test execution commands
- Added examples for writing new tests

### 2025-01-09
- Initial testing suite implementation
- Added visual regression tests
- Added accessibility tests
- Added performance tests
- Added cross-browser tests
- Added internationalization tests
- Created test runner script
- Created testing documentation
