# Implementation Plan

## Phase 1: Setup and Infrastructure

- [ ] 1.1 Create new translation namespace files
  - Create `locales/en/errors.json` for error messages
  - Create `locales/en/validation.json` for form validation
  - Replicate structure for tr, de, zh, ru languages
  - _Requirements: 6.1, 6.2_

- [ ] 1.2 Create translation utility functions
  - Create `lib/i18n/utils.ts` for translation helpers
  - Implement `getTranslationKeys()` function to extract keys from files
  - Implement `validateTranslations()` to check completeness
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 1.3 Create migration scripts
  - Create `scripts/extract-strings.ts` to find hard-coded strings
  - Create `scripts/validate-translations.ts` to check all languages
  - Create `scripts/generate-types.ts` for TypeScript types
  - _Requirements: 1.1, 1.2, 1.3, 8.1_

## Phase 2: Core UI Components

- [ ] 2.1 Migrate button and form components
  - Update `components/ui/button.tsx` to use translations
  - Update `components/ui/input.tsx` to use translations
  - Update `components/ui/card.tsx` to use translations
  - Add translations to `common.json` for all languages
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

- [ ] 2.2 Migrate layout components
  - Update `components/layout/Header.tsx` with translation keys
  - Update `components/layout/Footer.tsx` with translation keys
  - Update `components/layout/AdminSidebar.tsx` with translation keys
  - Update `components/layout/MobileBottomNav.tsx` with translation keys
  - Add translations to `common.json` for all languages
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

- [ ] 2.3 Migrate authentication components
  - Update `components/auth/LoginForm.tsx` with translation keys
  - Update `components/auth/RegisterForm.tsx` with translation keys
  - Update `components/auth/AdminLoginForm.tsx` with translation keys
  - Add translations to `auth.json` for all languages
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

## Phase 3: Feature Components

- [ ] 3.1 Migrate admin components
  - Update `components/admin/UserTable.tsx` with translation keys
  - Update `components/admin/TaskManager.tsx` with translation keys
  - Update `components/admin/StatsCard.tsx` with translation keys
  - Update `components/admin/VerificationDashboard.tsx` with translation keys
  - Update `components/admin/AuditLogTable.tsx` with translation keys
  - Update `components/admin/AdvancedSearch.tsx` with translation keys
  - Update `components/admin/CampaignAnalytics.tsx` with translation keys
  - Update `components/admin/UserTimeline.tsx` with translation keys
  - Add translations to `admin.json` for all languages
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

- [ ] 3.2 Migrate task components
  - Update `components/tasks/TaskCard.tsx` with translation keys
  - Update `components/tasks/TaskList.tsx` with translation keys
  - Update `components/tasks/TaskCompletionModal.tsx` with translation keys
  - Update `components/tasks/TaskTimer.tsx` with translation keys
  - Add translations to `tasks.json` for all languages
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

- [ ] 3.3 Migrate wallet components
  - Update `components/wallet/WalletSetup.tsx` with translation keys
  - Update `components/wallet/WalletConfirmationModal.tsx` with translation keys
  - Update `components/layout/WalletWarningBanner.tsx` with translation keys
  - Add translations to `wallet.json` for all languages
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

- [ ] 3.4 Migrate profile components
  - Update `components/profile/ProfileForm.tsx` with translation keys
  - Update `components/profile/AvatarUpload.tsx` with translation keys
  - Update `components/profile/SocialMediaSetup.tsx` with translation keys
  - Update `components/profile/SocialMediaConfirmationModal.tsx` with translation keys
  - Update `components/profile/EmailPreferences.tsx` with translation keys
  - Add translations to `profile.json` for all languages
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

- [ ] 3.5 Migrate home and modal components
  - Update `components/home/WelcomeInfoModal.tsx` with translation keys
  - Update `components/legal/TermsModal.tsx` with translation keys
  - Update `components/legal/PrivacyModal.tsx` with translation keys
  - Add translations to `common.json` and `legal.json` for all languages
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

## Phase 4: Pages

- [ ] 4.1 Migrate authentication pages
  - Update `app/(auth)/login/page.tsx` with translation keys
  - Update `app/(auth)/register/page.tsx` with translation keys
  - Update `app/(auth)/terms/page.tsx` with translation keys
  - Update `app/(auth)/privacy/page.tsx` with translation keys
  - Update metadata strings in all auth pages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2_

- [ ] 4.2 Migrate user pages
  - Update `app/(user)/dashboard/page.tsx` with translation keys
  - Update `app/(user)/tasks/page.tsx` with translation keys
  - Update `app/(user)/wallet/page.tsx` with translation keys
  - Update `app/(user)/profile/page.tsx` with translation keys
  - Update `app/(user)/leaderboard/page.tsx` with translation keys
  - Update `app/(user)/email/unsubscribe/page.tsx` with translation keys
  - Update metadata strings in all user pages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2_

- [ ] 4.3 Migrate admin pages
  - Update `app/admin/(dashboard)/dashboard/page.tsx` with translation keys
  - Update `app/admin/(dashboard)/users/page.tsx` with translation keys
  - Update `app/admin/(dashboard)/users/[id]/page.tsx` with translation keys
  - Update `app/admin/(dashboard)/tasks/page.tsx` with translation keys
  - Update `app/admin/(dashboard)/tasks/[id]/page.tsx` with translation keys
  - Update `app/admin/(dashboard)/campaigns/page.tsx` with translation keys
  - Update `app/admin/(dashboard)/campaigns/[id]/page.tsx` with translation keys
  - Update `app/admin/(dashboard)/roles/page.tsx` with translation keys
  - Update `app/admin/(dashboard)/workflows/page.tsx` with translation keys
  - Update `app/admin/(dashboard)/analytics/page.tsx` with translation keys
  - Update `app/admin/(dashboard)/emails/page.tsx` with translation keys
  - Update `app/admin/(auth)/login/page.tsx` with translation keys
  - Update metadata strings in all admin pages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2_

- [ ] 4.4 Migrate root and layout pages
  - Update `app/page.tsx` with translation keys
  - Update `app/layout.tsx` metadata
  - Update `app/(user)/layout.tsx` with translation keys
  - Update `app/admin/(dashboard)/layout.tsx` with translation keys
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2_

## Phase 5: Utilities and Libraries

- [ ] 5.1 Migrate validation utilities
  - Update `lib/validations.ts` error messages with translation keys
  - Create translation helper for validation errors
  - Add translations to `validation.json` for all languages
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2_

- [ ] 5.2 Migrate email templates and queue
  - Update `lib/email/queue.ts` subject functions with translation keys
  - Update `emails/welcome.tsx` with translation keys
  - Update `emails/task-completion.tsx` with translation keys
  - Update `emails/wallet-pending.tsx` with translation keys
  - Update `emails/wallet-approved.tsx` with translation keys
  - Update `emails/wallet-rejected.tsx` with translation keys
  - Update `emails/admin-review-needed.tsx` with translation keys
  - Update `emails/admin-fraud-alert.tsx` with translation keys
  - Update `emails/admin-daily-digest.tsx` with translation keys
  - Update `emails/admin-error-alert.tsx` with translation keys
  - Add translations to `email.json` for all languages
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 7.1, 7.2_

- [ ] 5.3 Migrate error handling
  - Update `lib/error-monitoring.ts` with translation keys
  - Update `lib/fraud-detection.ts` error messages with translation keys
  - Create centralized error message function
  - Add translations to `errors.json` for all languages
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2_

- [ ] 5.4 Migrate API route responses
  - Update error responses in `app/api/auth/register/route.ts`
  - Update error responses in `app/api/users/*/route.ts`
  - Update error responses in `app/api/admin/*/route.ts`
  - Update error responses in `app/api/completions/route.ts`
  - Update error responses in `app/api/tasks/route.ts`
  - Add translations to `errors.json` for all languages
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2_

## Phase 6: Validation and Testing

- [ ] 6.1 Run translation completeness tests
  - Execute `scripts/validate-translations.ts`
  - Verify all languages have identical key structures
  - Check for missing translations
  - Validate JSON syntax in all translation files
  - _Requirements: 10.3, 10.4_

- [ ] 6.2 Verify no hard-coded strings remain
  - Run `scripts/extract-strings.ts` on all migrated files
  - Manually review flagged strings
  - Ensure technical strings (API endpoints, env vars) are excluded
  - _Requirements: 10.2_

- [ ] 6.3 Run existing test suites
  - Execute all Jest unit tests
  - Execute all Playwright E2E tests
  - Fix any broken tests due to translation changes
  - _Requirements: 10.1_

- [ ] 6.4 Perform visual regression testing
  - Test key pages in all 5 languages
  - Verify layout doesn't break with longer translations
  - Check RTL support if applicable
  - Test responsive design with translations
  - _Requirements: 10.5_

- [ ] 6.5 Update documentation
  - Create `docs/I18N_GUIDE.md` with translation guidelines
  - Document translation key naming conventions
  - Provide examples for common patterns
  - Document how to add new languages
  - Update README with i18n information
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 6.6 Generate TypeScript types
  - Run `scripts/generate-types.ts`
  - Verify type safety for translation keys
  - Test autocomplete in IDE
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 6.7 Final validation and cleanup
  - Remove any unused translation keys
  - Optimize translation file sizes
  - Verify build succeeds
  - Test production build
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
