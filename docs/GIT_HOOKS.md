# Git Hooks Documentation

This project uses Git hooks to maintain code quality and consistency. Hooks are automatically installed when you run `npm install`.

## Pre-Commit Hook

The pre-commit hook runs automatically before each commit and performs the following checks:

### 1. ESLint

Runs ESLint on staged JavaScript/TypeScript files and automatically fixes issues when possible.

```bash
eslint --fix
```

**What it checks:**
- Code style and formatting
- Potential bugs and errors
- Best practices violations
- TypeScript type errors

### 2. Tests

Runs Jest tests related to the files you're committing to ensure your changes don't break existing functionality.

```bash
jest --bail --findRelatedTests --passWithNoTests
```

**What it does:**
- Finds and runs tests related to changed files
- Stops on first test failure
- Passes if no tests are found for the changed files

### 3. Prettier

Formats JSON, Markdown, and CSS files to maintain consistent code style.

```bash
prettier --write
```

**What it formats:**
- JSON files (package.json, tsconfig.json, etc.)
- Markdown files (README.md, documentation)
- CSS files (global styles)

## Commit Message Hook

The commit-msg hook validates your commit messages to ensure they follow the Conventional Commits specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Allowed Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI/CD configuration changes
- **chore**: Other changes (dependencies, tooling, etc.)
- **revert**: Revert a previous commit

### Examples

**Good commit messages:**
```
feat: add wallet verification feature
fix: resolve duplicate completion bug
docs: update API documentation
test: add tests for fraud detection
refactor: simplify task completion logic
```

**Bad commit messages:**
```
update stuff
fixed bug
WIP
asdf
```

### Scope (Optional)

You can optionally add a scope to provide more context:

```
feat(auth): add two-factor authentication
fix(tasks): resolve completion date issue
docs(api): update endpoint documentation
```

## Bypassing Hooks

In rare cases where you need to bypass the hooks (not recommended):

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip commit-msg hook
git commit --no-verify
```

**Warning:** Only bypass hooks when absolutely necessary, as they help maintain code quality.

## Troubleshooting

### Hook Not Running

If hooks aren't running automatically:

1. Ensure Husky is installed:
```bash
npm install
```

2. Manually set up hooks:
```bash
npx husky install
```

3. Check that `.husky/` directory exists and contains hook files

### ESLint Errors

If ESLint finds errors that can't be auto-fixed:

1. Review the error messages
2. Fix the issues manually
3. Stage the fixed files
4. Try committing again

### Test Failures

If tests fail during pre-commit:

1. Review the test output
2. Fix the failing tests or the code causing failures
3. Run tests manually to verify: `npm test`
4. Stage the fixes and commit again

### Commit Message Rejected

If your commit message is rejected:

1. Review the error message
2. Ensure your message follows the format: `type: subject`
3. Use one of the allowed types (feat, fix, docs, etc.)
4. Keep the subject line concise and descriptive

## Configuration Files

### Husky Configuration

- `.husky/pre-commit` - Pre-commit hook script
- `.husky/commit-msg` - Commit message validation script

### Lint-Staged Configuration

Located in `package.json`:

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

### Commitlint Configuration

Located in `commitlint.config.js`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
  },
};
```

### Prettier Configuration

Located in `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

## Benefits

Using Git hooks provides several benefits:

1. **Consistent Code Style**: Automatic formatting ensures all code follows the same style
2. **Early Bug Detection**: Catch issues before they reach the repository
3. **Better Commit History**: Conventional commits make it easier to understand changes
4. **Automated Testing**: Ensure changes don't break existing functionality
5. **Team Collaboration**: Everyone follows the same standards

## Disabling Hooks

If you need to disable hooks temporarily (for development):

1. Remove the `prepare` script from `package.json`
2. Delete the `.husky/` directory
3. Run `npm install` to reinstall without hooks

To re-enable:

1. Restore the `prepare` script
2. Run `npm install`
3. Hooks will be automatically set up

## Additional Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [Commitlint](https://commitlint.js.org/)
