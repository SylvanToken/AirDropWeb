# Continuous Integration Setup

This document describes the CI/CD setup for the Sylvan Token Airdrop Platform.

## Overview

The project uses GitHub Actions for continuous integration and automated testing. Every push and pull request triggers the test suite to ensure code quality and prevent regressions.

## GitHub Actions Workflow

### Configuration

The workflow is defined in `.github/workflows/test.yml` and runs on:
- Push to `main` and `develop` branches
- Pull requests to `main` and `develop` branches

### Test Matrix

Tests run on multiple Node.js versions to ensure compatibility:
- Node.js 18.x
- Node.js 20.x

### Workflow Steps

1. **Checkout Code**: Retrieves the latest code from the repository
2. **Setup Node.js**: Installs the specified Node.js version with npm caching
3. **Install Dependencies**: Runs `npm ci` for clean, reproducible installs
4. **Run Linter**: Executes ESLint to check code quality
5. **Run Tests**: Executes Jest test suite with coverage reporting
6. **Upload Coverage**: Sends coverage data to Codecov (Node.js 20.x only)
7. **Archive Results**: Saves test results and coverage reports as artifacts

### Environment Variables

The workflow sets the following environment variables for testing:
- `DATABASE_URL`: SQLite in-memory database for tests
- `NEXTAUTH_SECRET`: Test secret for authentication
- `NEXTAUTH_URL`: Local test URL

## Test Coverage Reporting

### Codecov Integration

Coverage reports are automatically uploaded to Codecov after successful test runs.

#### Setup Instructions

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository to Codecov
3. Copy the Codecov token
4. Add the token as a GitHub secret:
   - Go to repository Settings → Secrets and variables → Actions
   - Create new secret named `CODECOV_TOKEN`
   - Paste your Codecov token

#### Coverage Configuration

Coverage settings are defined in `codecov.yml`:

```yaml
coverage:
  status:
    project:
      default:
        target: 80%
        threshold: 2%
    patch:
      default:
        target: 75%
        threshold: 2%
```

**Targets:**
- Project coverage: 80% (allows 2% decrease)
- Patch coverage: 75% (new code must have 75% coverage)

### Jest Coverage Thresholds

Jest is configured with strict coverage thresholds in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },
}
```

If coverage falls below these thresholds, the build will fail.

### Coverage Badges

The README includes badges showing:
- Current test coverage percentage
- Test workflow status (passing/failing)

Update the badge URLs in `README.md` with your repository information:

```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/sylvan-airdrop-platform/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/sylvan-airdrop-platform)
[![Tests](https://github.com/YOUR_USERNAME/sylvan-airdrop-platform/workflows/Tests/badge.svg)](https://github.com/YOUR_USERNAME/sylvan-airdrop-platform/actions)
```

## Pre-Commit Hooks

### Husky Setup

The project uses Husky to run Git hooks automatically. Hooks are installed when you run `npm install`.

### Pre-Commit Hook

Runs before each commit to ensure code quality:

1. **ESLint**: Lints and auto-fixes staged JavaScript/TypeScript files
2. **Jest**: Runs tests related to changed files
3. **Prettier**: Formats JSON, Markdown, and CSS files

### Commit Message Hook

Validates commit messages using Commitlint to ensure they follow Conventional Commits:

**Format:** `type(scope): subject`

**Allowed types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `perf`: Performance
- `test`: Tests
- `build`: Build system
- `ci`: CI/CD
- `chore`: Maintenance
- `revert`: Revert commit

**Examples:**
```
feat: add wallet verification
fix: resolve duplicate completion bug
docs: update API documentation
test: add fraud detection tests
```

### Configuration Files

- `.husky/pre-commit`: Pre-commit hook script
- `.husky/commit-msg`: Commit message validation script
- `commitlint.config.js`: Commitlint configuration
- `.prettierrc`: Prettier formatting rules
- `.prettierignore`: Files to exclude from Prettier

### Lint-Staged Configuration

Defined in `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "jest --bail --findRelatedTests --passWithNoTests"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

## Local Testing

### Running Tests Locally

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- __tests__/auth.test.ts
```

### Running Linter

```bash
# Lint all files
npm run lint

# Lint and auto-fix
npm run lint -- --fix
```

### Manual Hook Testing

```bash
# Test pre-commit hook
npx lint-staged

# Test commit message validation
echo "feat: test message" | npx commitlint
```

## Troubleshooting

### Workflow Failures

**Issue:** Tests fail in CI but pass locally

**Solutions:**
1. Ensure you're using the same Node.js version
2. Run `npm ci` instead of `npm install` locally
3. Check environment variables are set correctly
4. Review the workflow logs in GitHub Actions

**Issue:** Coverage upload fails

**Solutions:**
1. Verify `CODECOV_TOKEN` is set in GitHub secrets
2. Check Codecov service status
3. Review the upload step logs

### Hook Issues

**Issue:** Hooks not running

**Solutions:**
1. Run `npm install` to reinstall hooks
2. Check `.husky/` directory exists
3. Verify Git version is 2.9 or higher

**Issue:** ESLint errors block commits

**Solutions:**
1. Fix the reported errors manually
2. Run `npm run lint -- --fix` to auto-fix
3. Review ESLint configuration if rules are too strict

**Issue:** Tests fail during pre-commit

**Solutions:**
1. Run `npm test` to see full test output
2. Fix failing tests before committing
3. Ensure test database is properly set up

### Bypassing Hooks (Not Recommended)

In emergency situations only:

```bash
# Skip all hooks
git commit --no-verify

# Skip specific hook
HUSKY=0 git commit
```

## Best Practices

### Commit Workflow

1. Make your changes
2. Stage files: `git add .`
3. Commit with conventional message: `git commit -m "feat: add new feature"`
4. Hooks run automatically
5. Fix any issues reported by hooks
6. Push to remote: `git push`

### Pull Request Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit (hooks run automatically)
3. Push branch: `git push origin feature/my-feature`
4. Create pull request on GitHub
5. Wait for CI checks to pass
6. Address any failing tests or coverage issues
7. Request review and merge

### Coverage Maintenance

1. Write tests for new features
2. Aim for >80% coverage on new code
3. Review coverage reports regularly
4. Add tests for uncovered code paths
5. Don't sacrifice test quality for coverage numbers

## Monitoring

### GitHub Actions

View workflow runs:
1. Go to repository on GitHub
2. Click "Actions" tab
3. View recent workflow runs
4. Click on a run to see detailed logs

### Codecov Dashboard

View coverage reports:
1. Go to [codecov.io](https://codecov.io)
2. Navigate to your repository
3. View coverage trends over time
4. Identify uncovered code
5. Review pull request coverage changes

## Maintenance

### Updating Dependencies

```bash
# Update Husky
npm install --save-dev husky@latest

# Update Commitlint
npm install --save-dev @commitlint/cli@latest @commitlint/config-conventional@latest

# Update lint-staged
npm install --save-dev lint-staged@latest

# Update Prettier
npm install --save-dev prettier@latest
```

### Updating Workflow

Edit `.github/workflows/test.yml` to:
- Add new Node.js versions
- Add additional test steps
- Modify environment variables
- Change trigger conditions

### Updating Coverage Thresholds

Edit `jest.config.js` to adjust coverage requirements:

```javascript
coverageThreshold: {
  global: {
    statements: 85, // Increase from 80
    branches: 80,   // Increase from 75
    functions: 85,  // Increase from 80
    lines: 85,      // Increase from 80
  },
}
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Jest Coverage](https://jestjs.io/docs/configuration#coveragethreshold-object)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
