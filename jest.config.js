const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(next-intl|use-intl|msgpackr)/)',
  ],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    // Exclude Playwright E2E tests from Jest
    '__tests__/internationalization.test.ts',
    '__tests__/cross-browser.test.ts',
    '__tests__/performance.test.ts',
    '__tests__/performance-comprehensive.test.ts',
    '__tests__/accessibility.test.ts',
    '__tests__/visual-regression.test.ts',
    '__tests__/workflows.test.ts',
    '__tests__/role-based-access.test.ts',
    '__tests__/data-export.test.ts',
    '__tests__/analytics-dashboard.test.ts',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  // Test execution settings
  maxWorkers: '50%', // Use 50% of available CPU cores for parallel execution
  testTimeout: 10000, // 10 second timeout per test
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
