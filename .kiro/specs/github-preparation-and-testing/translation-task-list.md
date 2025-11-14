# Turkish Content Translation Task List

**Generated:** 2025-11-14T12:01:31.992Z  
**Total Files with Turkish Content:** 371  
**Scan Report:** [turkish-content-report.json](./turkish-content-report.json)

## Executive Summary

The scan identified 371 files containing Turkish content across the codebase:
- **Documentation Files:** 224 (60.4%)
- **Code Files:** 68 (18.3%)
- **Test Files:** 53 (14.3%)
- **Config Files:** 26 (7.0%)

## Priority Classification

### 🔴 HIGH PRIORITY (Required for GitHub Publication)

These files must be translated before publishing to GitHub as they contain user-facing content, documentation, or critical code comments.

#### Documentation Files to Translate (Top Priority)

1. **DEPLOYMENT_ADIMLAR.md** → Rename to **DEPLOYMENT_STEPS.md**
   - 116 Turkish matches
   - Complete deployment guide in Turkish
   - Action: Translate entire file and rename

2. **VERCEL_YENI_PROJE.md** → Rename to **VERCEL_NEW_PROJECT.md**
   - 206 Turkish matches
   - Vercel project setup guide
   - Action: Translate entire file and rename

3. **VERCEL_CLOUDFLARE_DOMAIN.md**
   - 248 Turkish matches
   - Domain configuration guide
   - Action: Translate Turkish sections

4. **DEPLOYMENT_OPTIONS.md**
   - 231 Turkish matches
   - Deployment options documentation
   - Action: Translate Turkish sections

5. **PRODUCTION_MIGRATION_GUIDE.md**
   - 147 Turkish matches
   - Production migration instructions
   - Action: Translate Turkish sections

6. **DEPLOYMENT_SUMMARY.md**
   - 149 Turkish matches
   - Deployment summary documentation
   - Action: Translate Turkish sections

7. **VERCEL_DEPLOYMENT_GUIDE.md**
   - 136 Turkish matches
   - Vercel deployment instructions
   - Action: Translate Turkish sections

8. **DEPLOYMENT_GUIDE.md**
   - 99 Turkish matches
   - General deployment guide
   - Action: Translate Turkish sections

9. **DEPLOYMENT_INSTRUCTIONS.md**
   - 96 Turkish matches
   - Deployment instructions
   - Action: Translate Turkish sections

10. **GITHUB_DEPLOYMENT_GUIDE.md**
    - 90 Turkish matches (in docs/)
    - 54 Turkish matches (in root)
    - GitHub-specific deployment guide
    - Action: Translate Turkish sections

#### Code Files to Translate

1. **lib/email/translations.ts**
   - 86 Turkish matches
   - Email translation strings
   - Action: Review and ensure proper i18n structure

2. **lib/email-limiter.ts**
   - 22 Turkish matches
   - Email rate limiting logic
   - Action: Translate comments and error messages

3. **lib/email/queue.ts**
   - 17 Turkish matches
   - Email queue management
   - Action: Translate comments

4. **lib/task-generator/translations.ts**
   - 18 Turkish matches
   - Task translation strings
   - Action: Review i18n structure

5. **lib/auto-translate.ts**
   - 16 Turkish matches
   - Auto-translation mappings
   - Action: Keep Turkish translations (intentional for i18n)

6. **emails/*.tsx** (Multiple files)
   - Various email templates with Turkish locale strings
   - Action: Keep Turkish strings (intentional for i18n), translate comments

#### Script Files to Translate

Multiple test and utility scripts contain Turkish comments and console messages:
- scripts/test-all-email-types.ts (31 matches)
- scripts/test-email-sender.ts (29 matches)
- scripts/test-turkish-emails.ts (24 matches)
- scripts/scan-turkish-content.ts (23 matches)
- scripts/test-error-report-system.ts (21 matches)
- And 30+ more script files

**Action:** Translate console.log messages and comments to English

### 🟡 MEDIUM PRIORITY (Test Files)

53 test files contain Turkish content, primarily in test data and assertions.

**Key Files:**
- `__tests__/welcome-info-modal.test.tsx` (18 matches) - Contains "Anladım" button test
- `__tests__/fraud-detection.test.ts` (114 matches)
- `__tests__/database-operations.test.ts` (89 matches)
- `__tests__/campaign-system.test.ts` (70 matches)

**Action:** Translate test descriptions and assertions, keep test data if testing Turkish locale

### 🟢 LOW PRIORITY (Intentional Turkish Content)

#### Locale Files (Keep As-Is)
- `locales/tr/*.json` - Intentional Turkish translations for Turkish locale
- These files SHOULD NOT be translated as they provide Turkish language support

#### German Locale Files (Contains Turkish Characters)
- `locales/de/*.json` - German translations with umlauts (ä, ö, ü)
- These are German, not Turkish - keep as-is

## Translation Guidelines

### Files to Rename

| Current Name | New Name | Reason |
|-------------|----------|--------|
| DEPLOYMENT_ADIMLAR.md | DEPLOYMENT_STEPS.md | "Adımlar" means "Steps" |
| VERCEL_YENI_PROJE.md | VERCEL_NEW_PROJECT.md | "Yeni Proje" means "New Project" |

### Content to Keep (Do NOT Translate)

1. **Locale Files:** All files in `locales/tr/` directory
2. **i18n Strings:** Turkish strings in code that are part of internationalization
3. **Test Data:** Turkish strings used specifically to test Turkish locale functionality
4. **German Content:** Files in `locales/de/` (German umlauts are not Turkish)

### Translation Glossary

Common Turkish terms found in the codebase:

| Turkish | English | Context |
|---------|---------|---------|
| Adım | Step | Documentation |
| Kılavuz | Guide | Documentation |
| Yeni | New | General |
| Proje | Project | General |
| Türkçe | Turkish | Language reference |
| Anladım | Understood | UI button |
| Görev | Task | Application feature |
| Kullanıcı | User | Application feature |
| Doğrula | Verify | Action |
| Şifre | Password | Authentication |
| Cüzdan | Wallet | Blockchain feature |
| Puan | Points | Rewards system |
| Test | Test | Testing (also English) |
| Cloudflare | Cloudflare | Service name (keep) |

## Implementation Plan

### Phase 1: Critical Documentation (Immediate)
1. Translate and rename DEPLOYMENT_ADIMLAR.md → DEPLOYMENT_STEPS.md
2. Translate and rename VERCEL_YENI_PROJE.md → VERCEL_NEW_PROJECT.md
3. Translate VERCEL_CLOUDFLARE_DOMAIN.md content
4. Translate DEPLOYMENT_OPTIONS.md content
5. Update all references to renamed files

### Phase 2: Code Comments and Messages (High Priority)
1. Translate comments in lib/email/*.ts files
2. Translate console.log messages in scripts/
3. Translate error messages in middleware and API routes
4. Review and update code documentation

### Phase 3: Test Files (Medium Priority)
1. Translate test descriptions in __tests__/ files
2. Update test assertions with English text
3. Keep Turkish test data where testing Turkish locale

### Phase 4: Spec Documentation (Medium Priority)
1. Translate Turkish content in .kiro/specs/ documentation
2. Update implementation summaries and reports
3. Ensure all spec files are in English

### Phase 5: Verification (Final)
1. Run scanner again to verify all high-priority content translated
2. Check for broken links after file renames
3. Verify all documentation is accessible in English
4. Update README.md with any necessary changes

## Files Requiring Manual Review

The following files contain mixed content or require careful review:

1. **docs/old/LOKAL_TEST_REHBERI.md** (378 matches)
   - Extensive Turkish testing guide
   - Decision: Archive or translate?

2. **docs/old/EMAIL_TEST_SONUCLARI.md** (167 matches)
   - Email test results in Turkish
   - Decision: Archive or translate?

3. **docs/old/GIRIS_BILGILERI.md** (144 matches)
   - Login information in Turkish
   - Decision: Archive or translate?

4. **docs/old/WALLET_HATASI_COZUMU.md** (48 matches)
   - Wallet error solution in Turkish
   - Decision: Archive or translate?

**Recommendation:** Move these files to an archive directory or delete if no longer relevant.

## Automation Opportunities

### Safe to Auto-Translate
- Console.log messages in scripts
- Code comments (with review)
- Documentation headers and titles

### Requires Manual Translation
- Technical documentation with code examples
- User-facing error messages
- API documentation
- Deployment guides with specific instructions

## Success Criteria

Translation is complete when:
- ✅ All high-priority documentation files are in English
- ✅ Turkish-named files are renamed to English equivalents
- ✅ All code comments and console messages are in English
- ✅ No Turkish content in user-facing strings (except i18n)
- ✅ All file references updated after renames
- ✅ Documentation links verified and working
- ✅ Locale files (locales/tr/) preserved for Turkish language support

## Next Steps

1. Review this translation task list
2. Prioritize files based on GitHub publication timeline
3. Begin with Phase 1 (Critical Documentation)
4. Update file references as files are renamed
5. Run verification scan after each phase
6. Document any decisions about archived files
