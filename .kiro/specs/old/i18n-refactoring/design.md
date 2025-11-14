# Design Document

## Overview

This document describes the design for a comprehensive internationalization (i18n) refactoring that will eliminate all hard-coded strings from the codebase and centralize them in language files. The refactoring will cover all files, provide complete translations for all 5 supported languages, and establish a maintainable structure for future additions.

## Architecture

### Translation File Structure

```
locales/
├── en/
│   ├── common.json          # Shared strings across the app
│   ├── auth.json            # Authentication related
│   ├── admin.json           # Admin panel
│   ├── dashboard.json       # User dashboard
│   ├── tasks.json           # Task management
│   ├── wallet.json          # Wallet features
│   ├── profile.json         # User profile
│   ├── email.json           # Email templates
│   ├── legal.json           # Terms, privacy
│   ├── errors.json          # Error messages
│   └── validation.json      # Form validation
├── tr/ (same structure)
├── de/ (same structure)
├── zh/ (same structure)
└── ru/ (same structure)
```

### Translation Key Naming Convention

**Pattern**: `{namespace}.{section}.{element}.{property}`

**Examples**:
- `common.buttons.save` → "Save"
- `admin.users.table.headers.email` → "Email Address"
- `errors.validation.required` → "This field is required"
- `dashboard.stats.totalPoints` → "Total Points"

**Rules**:
1. Use camelCase for all key segments
2. Maximum 4 levels of nesting
3. Group related keys together
4. Use descriptive names that indicate context
5. Avoid abbreviations unless universally understood

## Components and Interfaces

### 1. Translation Hook Usage

**Client Components**:
```typescript
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('namespace');
  return <div>{t('key')}</div>;
}
```

**Server Components**:
```typescript
import { getTranslations } from 'next-intl/server';

export async function MyPage() {
  const t = await getTranslations('namespace');
  return <div>{t('key')}</div>;
}
```

### 2. Dynamic Content Handling

**With Parameters**:
```typescript
// Translation file
{
  "welcome": "Welcome, {username}!"
}

// Component
t('welcome', { username: user.name })
```

**With Pluralization**:
```typescript
// Translation file
{
  "itemCount": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
}

// Component
t('itemCount', { count: items.length })
```

**With Rich Text**:
```typescript
// Translation file
{
  "terms": "I agree to the <link>Terms of Service</link>"
}

// Component
t.rich('terms', {
  link: (chunks) => <Link href="/terms">{chunks}</Link>
})
```

### 3. Email Template Translations

Email templates will use a dedicated namespace with locale-specific content:

```typescript
// lib/email/queue.ts
import { getTranslations } from 'next-intl/server';

async function getEmailSubject(locale: string, key: string, params?: any) {
  const t = await getTranslations({ locale, namespace: 'email' });
  return t(key, params);
}
```

### 4. Error Message Translations

Centralized error handling with translated messages:

```typescript
// lib/errors.ts
export async function getErrorMessage(
  errorCode: string,
  locale: string
): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'errors' });
  return t(errorCode);
}
```

## Data Models

### Translation File Schema

```typescript
interface TranslationFile {
  [key: string]: string | TranslationFile;
}

interface TranslationWithParams {
  key: string;
  params?: Record<string, string | number>;
}
```

### Translation Namespace Map

```typescript
const NAMESPACE_MAP = {
  // Pages
  '/': 'common',
  '/dashboard': 'dashboard',
  '/admin/*': 'admin',
  '/tasks': 'tasks',
  '/wallet': 'wallet',
  '/profile': 'profile',
  
  // Components
  'components/auth/*': 'auth',
  'components/admin/*': 'admin',
  'components/tasks/*': 'tasks',
  'components/wallet/*': 'wallet',
  'components/profile/*': 'profile',
  
  // Utilities
  'lib/validations.ts': 'validation',
  'lib/errors.ts': 'errors',
  'lib/email/*': 'email',
};
```

## Error Handling

### Missing Translation Keys

```typescript
// Development: Show warning and key
if (process.env.NODE_ENV === 'development') {
  console.warn(`Missing translation: ${namespace}.${key}`);
  return `[${namespace}.${key}]`;
}

// Production: Fallback to English
return getEnglishTranslation(namespace, key);
```

### Invalid Parameters

```typescript
// Validate parameters match translation placeholders
function validateParams(translation: string, params: Record<string, any>) {
  const placeholders = translation.match(/\{(\w+)\}/g);
  if (placeholders) {
    placeholders.forEach(placeholder => {
      const key = placeholder.slice(1, -1);
      if (!(key in params)) {
        console.warn(`Missing parameter: ${key}`);
      }
    });
  }
}
```

## Testing Strategy

### 1. Unit Tests

Test translation key existence and parameter handling:

```typescript
describe('Translations', () => {
  it('should have all required keys', () => {
    const keys = ['common.buttons.save', 'common.buttons.cancel'];
    keys.forEach(key => {
      expect(hasTranslation('en', key)).toBe(true);
    });
  });
  
  it('should handle parameters correctly', () => {
    const result = t('welcome', { username: 'John' });
    expect(result).toBe('Welcome, John!');
  });
});
```

### 2. Integration Tests

Verify translations work in components:

```typescript
describe('Component Translations', () => {
  it('should render translated text', () => {
    render(<MyComponent />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});
```

### 3. Translation Completeness Tests

Ensure all languages have the same keys:

```typescript
describe('Translation Completeness', () => {
  const languages = ['en', 'tr', 'de', 'zh', 'ru'];
  const namespaces = ['common', 'admin', 'dashboard'];
  
  namespaces.forEach(namespace => {
    it(`should have complete ${namespace} translations`, () => {
      const enKeys = getKeys('en', namespace);
      languages.forEach(lang => {
        const langKeys = getKeys(lang, namespace);
        expect(langKeys).toEqual(enKeys);
      });
    });
  });
});
```

## Migration Strategy

### Phase 1: Setup and Infrastructure
1. Create new translation namespaces
2. Set up translation utilities
3. Create migration scripts

### Phase 2: Core Components
1. Migrate `components/ui/*`
2. Migrate `components/layout/*`
3. Migrate `components/auth/*`

### Phase 3: Feature Components
1. Migrate `components/admin/*`
2. Migrate `components/tasks/*`
3. Migrate `components/wallet/*`
4. Migrate `components/profile/*`

### Phase 4: Pages
1. Migrate `app/(auth)/*`
2. Migrate `app/(user)/*`
3. Migrate `app/admin/*`

### Phase 5: Utilities and Libraries
1. Migrate `lib/validations.ts`
2. Migrate `lib/email/*`
3. Migrate error messages

### Phase 6: Validation and Testing
1. Run translation completeness tests
2. Perform visual regression testing
3. Validate all functionality

## Performance Considerations

### 1. Translation Loading

- Use Next-intl's built-in lazy loading
- Load only required namespaces per page
- Cache translations on client side

### 2. Bundle Size

- Split translations by namespace
- Use dynamic imports for large translation files
- Minimize translation file size

### 3. Runtime Performance

- Pre-compile translations at build time
- Use memoization for frequently accessed translations
- Avoid unnecessary re-renders

## Security Considerations

### 1. XSS Prevention

- Escape all user-generated content in translations
- Use `t.rich()` for HTML content with sanitization
- Validate translation parameters

### 2. Injection Prevention

- Never use user input directly in translation keys
- Sanitize parameters before passing to translations
- Use parameterized translations for dynamic content

## Maintenance Guidelines

### Adding New Translations

1. Add key to English translation file first
2. Add same key to all other language files
3. Run translation completeness test
4. Update TypeScript types if using typed translations

### Modifying Existing Translations

1. Update all language files simultaneously
2. Check for usages across codebase
3. Update tests if translation structure changes
4. Document breaking changes

### Adding New Languages

1. Create new language directory in `locales/`
2. Copy structure from English files
3. Translate all keys
4. Add language to Next.js config
5. Update language switcher component
