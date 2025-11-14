# Test Infrastructure Setup

This document describes the test infrastructure that has been set up for the Sylvan Token Airdrop Platform.

## Overview

The test infrastructure provides a comprehensive set of utilities and fixtures for writing consistent, maintainable tests across the application.

## Components

### 1. Test Utilities (`__tests__/utils/test-helpers.ts`)

Provides reusable helper functions for creating test data and managing the test database:

#### User Management
- `createTestUser(overrides?)` - Create a test user with optional field overrides
- `createTestUsers(count)` - Create multiple test users at once

#### Campaign Management
- `createTestCampaign(overrides?)` - Create a test campaign with optional overrides

#### Task Management
- `createTestTask(campaignId, overrides?)` - Create a test task linked to a campaign

#### Completion Management
- `createTestCompletion(userId, taskId, overrides?)` - Create a test completion record

#### Authentication
- `createAuthSession(user)` - Generate a JWT token for authenticated requests
- `mockAuthenticatedRequest(method, url, token, body?)` - Make authenticated API requests

#### Database Management
- `cleanDatabase()` - Clean all tables in the correct order (respects foreign keys)

#### Date Utilities
- `getTodayMidnight()` - Get today's date at 00:00:00
- `getYesterdayMidnight()` - Get yesterday's date at 00:00:00
- `wait(ms)` - Wait for specified milliseconds

#### Scenario Creation
- `createTestScenario()` - Create a complete test scenario with campaign, tasks, users, and admin

### 2. Test Fixtures

Predefined test data for consistent testing across all test suites:

#### User Fixtures (`__tests__/fixtures/users.ts`)
- `testUsers` - Valid user configurations (regular, admin, verified, unverified, etc.)
- `invalidUsers` - Invalid user data for validation testing
- `walletAddresses` - Valid and invalid BEP-20 wallet addresses
- `socialMediaUsernames` - Valid and invalid Twitter/Telegram usernames

#### Campaign Fixtures (`__tests__/fixtures/campaigns.ts`)
- `testCampaigns` - Various campaign configurations (active, future, expired, etc.)
- `invalidCampaigns` - Invalid campaign data for validation testing
- `campaignDateRanges` - Predefined date ranges for testing

#### Task Fixtures (`__tests__/fixtures/tasks.ts`)
- `testTasks` - Various task types with translations
- `invalidTasks` - Invalid task data for validation testing
- `taskTypes` - All supported task types
- `taskUrls` - Sample URLs for different platforms

#### Completion Fixtures (`__tests__/fixtures/completions.ts`)
- `testCompletions` - Various completion states (pending, approved, rejected, etc.)
- `completionStatuses` - All completion status values
- `verificationStatuses` - All verification status values
- `fraudScoreRanges` - Risk level definitions
- `completionTimes` - Sample completion times
- `rejectionReasons` - Common rejection reasons
- `ipAddresses` - Sample IP addresses
- `userAgents` - Sample user agent strings

### 3. Database Configuration

#### Test Database Setup (`jest.setup.js`)
- Uses SQLite database (`test.db`) for testing
- Enables foreign key constraints
- Automatically cleans database before each test
- Properly disconnects after all tests

#### Environment Configuration (`.env.test`)
- Test-specific environment variables
- Separate database from development
- Test-specific secrets and credentials

#### Jest Configuration (`jest.config.js`)
- Parallel test execution (50% of CPU cores)
- 10-second timeout per test
- Coverage thresholds (80% statements, 75% branches, 80% functions, 80% lines)
- Proper module mapping for TypeScript paths

## Usage Examples

### Creating Test Data

```typescript
import { createTestUser, createTestCampaign, createTestTask } from './utils/test-helpers'

// Create a regular user
const user = await createTestUser()

// Create an admin user
const admin = await createTestUser({ role: 'ADMIN' })

// Create a verified user with wallet
const verifiedUser = await createTestUser({
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  walletVerified: true,
  twitterVerified: true,
})

// Create a campaign
const campaign = await createTestCampaign()

// Create a task
const task = await createTestTask(campaign.id, {
  title: 'Follow on Twitter',
  taskType: 'TWITTER_FOLLOW',
  points: 10,
})
```

### Using Fixtures

```typescript
import { testUsers } from './__tests__/fixtures/users'
import { testCampaigns } from './__tests__/fixtures/campaigns'
import { testTasks } from './__tests__/fixtures/tasks'

// Use predefined user data
const userData = testUsers.verifiedUser

// Use predefined campaign data
const campaignData = testCampaigns.activeCampaign

// Use predefined task data
const taskData = testTasks.twitterFollow
```

### Testing Authenticated Requests

```typescript
import { createTestUser, createAuthSession, mockAuthenticatedRequest } from './utils/test-helpers'

const user = await createTestUser()
const token = createAuthSession(user)

const response = await mockAuthenticatedRequest(
  'POST',
  '/api/completions',
  token,
  { taskId: 'task-123' }
)
```

### Creating Complete Scenarios

```typescript
import { createTestScenario } from './utils/test-helpers'

const { campaign, tasks, user, admin } = await createTestScenario()

// Now you have a complete setup ready for testing
```

## Test Isolation

Each test runs in isolation with a clean database:

1. **Before All Tests**: Database connection is established
2. **Before Each Test**: Database is cleaned (all tables emptied)
3. **After All Tests**: Database is cleaned and connection is closed

This ensures:
- No test data leaks between tests
- Consistent starting state for each test
- Predictable test results

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- infrastructure.test.ts

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

## Coverage Goals

- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## Best Practices

1. **Always use test utilities** instead of creating data manually
2. **Use fixtures** for consistent test data
3. **Clean up after tests** (handled automatically by jest.setup.js)
4. **Test in isolation** - don't rely on data from other tests
5. **Use meaningful test names** that describe what is being tested
6. **Follow AAA pattern** - Arrange, Act, Assert
7. **Keep tests focused** - one concept per test
8. **Use async/await** for database operations

## Troubleshooting

### Tests failing with "Cannot find module"
- Ensure all dependencies are installed: `npm install`
- Check that TypeScript paths are correctly configured in `jest.config.js`

### Database connection errors
- Verify `DATABASE_URL` is set correctly in `.env.test`
- Check that Prisma client is generated: `npx prisma generate`

### Foreign key constraint errors
- Ensure `cleanDatabase()` deletes tables in the correct order
- Verify foreign key constraints are enabled in `jest.setup.js`

### Flaky tests
- Check for race conditions in async operations
- Ensure proper cleanup between tests
- Verify test isolation (no shared state)

## Next Steps

With the test infrastructure in place, you can now:

1. Write comprehensive tests for campaign system
2. Add tests for wallet verification
3. Implement social media linking tests
4. Create fraud detection tests
5. Add internationalization tests
6. Test API endpoints
7. Test React components
8. Add database operation tests
9. Implement security tests
10. Add performance tests

Refer to the implementation plan in `.kiro/specs/comprehensive-test-coverage/tasks.md` for the complete testing roadmap.
