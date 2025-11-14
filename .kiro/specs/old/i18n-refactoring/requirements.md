# Requirements Document

## Introduction

This document outlines the requirements for a comprehensive internationalization (i18n) refactoring of the Sylvan Token AirDrop Platform. The goal is to eliminate all hard-coded text strings from the codebase and centralize them in language files for better maintainability and consistency.

## Glossary

- **Hard-coded String**: Text directly written in component/page files instead of being referenced from language files
- **i18n Key**: A unique identifier used to reference translated text in language files
- **Translation File**: JSON files in the `locales/` directory containing translations for different languages
- **useTranslations Hook**: Next-intl hook used to access translations in client components
- **getTranslations Function**: Next-intl function used to access translations in server components

## Requirements

### Requirement 1: Identify All Hard-coded Strings

**User Story:** As a developer, I want to identify all hard-coded strings in the codebase, so that I can systematically replace them with i18n keys.

#### Acceptance Criteria

1. THE System SHALL scan all TypeScript and TSX files in the `app/`, `components/`, and `lib/` directories
2. THE System SHALL identify strings that are not already using translation keys
3. THE System SHALL exclude technical strings such as API endpoints, environment variables, and configuration values
4. THE System SHALL generate a report of all hard-coded strings found
5. THE System SHALL categorize strings by file type (components, pages, utilities)

### Requirement 2: Create Consistent Translation Key Structure

**User Story:** As a developer, I want a consistent naming convention for translation keys, so that the codebase is maintainable and predictable.

#### Acceptance Criteria

1. THE System SHALL use dot notation for nested translation keys (e.g., `admin.users.title`)
2. THE System SHALL follow the pattern: `{section}.{subsection}.{element}.{property}`
3. THE System SHALL use camelCase for key names
4. THE System SHALL avoid duplicate keys across different namespaces
5. THE System SHALL maintain a maximum nesting depth of 4 levels

### Requirement 3: Migrate Component Strings

**User Story:** As a developer, I want all component strings migrated to translation files, so that components are fully internationalized.

#### Acceptance Criteria

1. THE System SHALL replace all hard-coded strings in React components with `useTranslations` hook calls
2. THE System SHALL add appropriate translation keys to language files for each supported language (en, tr, de, zh, ru)
3. THE System SHALL preserve dynamic content using translation parameters
4. THE System SHALL maintain existing component functionality after migration
5. THE System SHALL ensure all components use consistent translation namespaces

### Requirement 4: Migrate Page Strings

**User Story:** As a developer, I want all page strings migrated to translation files, so that pages are fully internationalized.

#### Acceptance Criteria

1. THE System SHALL replace all hard-coded strings in Next.js pages with `getTranslations` function calls
2. THE System SHALL handle both server and client components appropriately
3. THE System SHALL migrate metadata strings (titles, descriptions) to translation files
4. THE System SHALL preserve SEO-related content during migration
5. THE System SHALL ensure proper async/await handling for server-side translations

### Requirement 5: Migrate Utility and Library Strings

**User Story:** As a developer, I want utility and library strings migrated to translation files, so that error messages and notifications are internationalized.

#### Acceptance Criteria

1. THE System SHALL identify strings in utility functions that should be internationalized
2. THE System SHALL create a dedicated namespace for utility strings (e.g., `common.errors`, `common.messages`)
3. THE System SHALL handle strings in email templates and notifications
4. THE System SHALL preserve technical strings that should not be translated (e.g., log messages, debug info)
5. THE System SHALL ensure utility functions can access translations when needed

### Requirement 6: Update Translation Files

**User Story:** As a developer, I want all translation files updated with new keys, so that all languages have complete translations.

#### Acceptance Criteria

1. THE System SHALL add new translation keys to all language files (en, tr, de, zh, ru)
2. THE System SHALL maintain alphabetical ordering within each namespace
3. THE System SHALL provide English translations for all new keys
4. THE System SHALL mark untranslated keys with a placeholder for non-English languages
5. THE System SHALL validate JSON structure of all translation files

### Requirement 7: Handle Dynamic Content

**User Story:** As a developer, I want dynamic content properly handled in translations, so that variable data is displayed correctly.

#### Acceptance Criteria

1. THE System SHALL use translation parameters for dynamic values (e.g., `{username}`, `{count}`)
2. THE System SHALL handle pluralization rules for countable items
3. THE System SHALL support date and number formatting based on locale
4. THE System SHALL preserve HTML content in translations when necessary
5. THE System SHALL escape user-generated content to prevent XSS attacks

### Requirement 8: Maintain Type Safety

**User Story:** As a developer, I want type-safe translation keys, so that I catch errors at compile time.

#### Acceptance Criteria

1. THE System SHALL generate TypeScript types for translation keys
2. THE System SHALL provide autocomplete for translation keys in IDEs
3. THE System SHALL catch missing translation keys at build time
4. THE System SHALL validate translation parameter types
5. THE System SHALL ensure type safety across all supported languages

### Requirement 9: Update Documentation

**User Story:** As a developer, I want updated documentation on the i18n system, so that I can maintain and extend it.

#### Acceptance Criteria

1. THE System SHALL document the translation key naming convention
2. THE System SHALL provide examples of common translation patterns
3. THE System SHALL document how to add new languages
4. THE System SHALL explain how to handle special cases (pluralization, formatting)
5. THE System SHALL include a migration guide for future string additions

### Requirement 10: Validate Migration

**User Story:** As a developer, I want to validate the migration was successful, so that I can ensure no functionality was broken.

#### Acceptance Criteria

1. THE System SHALL run all existing tests after migration
2. THE System SHALL verify no hard-coded strings remain in migrated files
3. THE System SHALL check that all translation keys exist in language files
4. THE System SHALL validate that all languages have the same key structure
5. THE System SHALL perform visual regression testing on key pages
