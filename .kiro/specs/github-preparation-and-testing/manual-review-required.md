# Files Requiring Manual Review

**Generated:** 2025-11-14  
**Purpose:** Document files with Turkish content that require human decision-making

## Overview

This document lists files that contain significant Turkish content and require manual review to determine the appropriate action (translate, archive, or delete).

## Category 1: Old Documentation Files

These files are in the `docs/old/` directory and may be outdated or superseded by newer documentation.

### High Turkish Content (>100 matches)

1. **docs/old/LOKAL_TEST_REHBERI.md** - 378 matches
   - **Content:** Local testing guide in Turkish
   - **Size:** Extensive documentation
   - **Recommendation:** Check if superseded by docs/TESTING_GUIDE.md
   - **Action Options:**
     - [ ] Translate if still relevant
     - [ ] Archive if outdated
     - [ ] Delete if superseded

2. **docs/old/EMAIL_TEST_SONUCLARI.md** - 167 matches
   - **Content:** Email test results in Turkish
   - **Size:** Detailed test results
   - **Recommendation:** Historical data, likely can be archived
   - **Action Options:**
     - [ ] Archive (historical record)
     - [ ] Delete if no longer needed

3. **docs/old/GIRIS_BILGILERI.md** - 144 matches
   - **Content:** Login credentials and access information in Turkish
   - **Size:** Comprehensive access guide
   - **Recommendation:** Check if contains sensitive data, update docs/TEST_CREDENTIALS.md instead
   - **Action Options:**
     - [ ] Extract relevant info to TEST_CREDENTIALS.md
     - [ ] Delete after extraction

4. **docs/old/ADMIN_LOGIN_TROUBLESHOOTING.md** - 111 matches
   - **Content:** Admin login troubleshooting in Turkish
   - **Size:** Detailed troubleshooting guide
   - **Recommendation:** Check if superseded by docs/TROUBLESHOOTING_GUIDE.md
   - **Action Options:**
     - [ ] Merge relevant content into TROUBLESHOOTING_GUIDE.md
     - [ ] Delete after merge

5. **docs/old/LOGO_AND_BACKGROUND_FIX.md** - 97 matches
   - **Content:** Logo and background fix documentation
   - **Size:** Implementation details
   - **Recommendation:** Historical implementation notes
   - **Action Options:**
     - [ ] Archive (historical record)
     - [ ] Delete if no longer relevant

6. **docs/old/PROJECT_CLEANUP_REPORT.md** - 96 matches
   - **Content:** Project cleanup report
   - **Size:** Detailed cleanup documentation
   - **Recommendation:** Historical report
   - **Action Options:**
     - [ ] Archive (historical record)
     - [ ] Delete if no longer needed

## Category 2: Spec Documentation

Files in `.kiro/specs/` directories containing Turkish content.

### Spec Files with Significant Turkish Content

1. **.kiro/specs/project-cleanup-and-optimization/tasks.md** - 159 matches
   - **Content:** Task list with Turkish descriptions
   - **Recommendation:** Translate task descriptions
   - **Action:** Translate

2. **.kiro/specs/telegram-reaction-rewards/tasks.md** - 143 matches
   - **Content:** Telegram feature task list
   - **Recommendation:** Translate for consistency
   - **Action:** Translate

3. **.kiro/specs/old/referral-task-automation/REFERRAL_SIMULATION.md** - 126 matches
   - **Content:** Referral simulation documentation
   - **Recommendation:** Archive if in "old" directory
   - **Action:** Archive or delete

4. **.kiro/specs/old/time-limited-tasks/SECURITY_AUDIT_REPORT.md** - 213 matches
   - **Content:** Security audit report
   - **Recommendation:** Important security documentation
   - **Action:** Translate if still relevant, archive if superseded

5. **.kiro/specs/old/time-limited-tasks/SECURITY_SUMMARY_TR.md** - 121 matches
   - **Content:** Security summary in Turkish (filename indicates Turkish version)
   - **Recommendation:** Check if English version exists
   - **Action:** Delete if English version exists, translate otherwise

## Category 3: Root-Level Documentation

Major documentation files in the project root.

### Files to Translate (Already Identified)

1. **DEPLOYMENT_ADIMLAR.md** - 116 matches
   - **Action:** Translate and rename to DEPLOYMENT_STEPS.md

2. **VERCEL_YENI_PROJE.md** - 206 matches
   - **Action:** Translate and rename to VERCEL_NEW_PROJECT.md

3. **VERCEL_CLOUDFLARE_DOMAIN.md** - 248 matches
   - **Action:** Translate Turkish sections

4. **DEPLOYMENT_OPTIONS.md** - 231 matches
   - **Action:** Translate Turkish sections

5. **PRODUCTION_MIGRATION_GUIDE.md** - 147 matches
   - **Action:** Translate Turkish sections

## Category 4: Test and Email Documentation

1. **docs/EMAIL_LOCAL_TEST_GUIDE.md** - 143 matches
   - **Content:** Local email testing guide
   - **Recommendation:** Active documentation
   - **Action:** Translate Turkish sections

2. **docs/EMAIL_IMAGE_METHODS.md** - 89 matches
   - **Content:** Email image implementation methods
   - **Recommendation:** Active documentation
   - **Action:** Translate Turkish sections

3. **docs/EMAIL_LOGO_IMPLEMENTATION.md** - 76 matches
   - **Content:** Email logo implementation guide
   - **Recommendation:** Active documentation
   - **Action:** Translate Turkish sections

## Category 5: Task and Feature Documentation

1. **docs/TASK_GENERATOR_GUIDE.md** - 103 matches
   - **Content:** Task generator documentation
   - **Recommendation:** Active feature documentation
   - **Action:** Translate Turkish sections

2. **docs/REFERRAL_SYSTEM.md** - 91 matches
   - **Content:** Referral system documentation
   - **Recommendation:** Active feature documentation
   - **Action:** Translate Turkish sections

3. **docs/TEST_CREDENTIALS.md** - 86 matches
   - **Content:** Test credentials and access information
   - **Recommendation:** Active testing documentation
   - **Action:** Translate Turkish sections

4. **docs/TELEGRAM_INTEGRATION.md** - 74 matches
   - **Content:** Telegram integration guide
   - **Recommendation:** Active feature documentation
   - **Action:** Translate Turkish sections

## Decision Matrix

Use this matrix to decide the fate of each file:

| Criteria | Translate | Archive | Delete |
|----------|-----------|---------|--------|
| In `docs/old/` directory | If still relevant | If historical value | If superseded |
| In `.kiro/specs/old/` | If still relevant | If historical value | If superseded |
| Active documentation | ✅ Yes | ❌ No | ❌ No |
| Historical report | ❌ No | ✅ Yes | Maybe |
| Superseded by newer doc | ❌ No | Maybe | ✅ Yes |
| Contains sensitive data | Extract first | ❌ No | ✅ Yes after extraction |
| Implementation notes | ❌ No | ✅ Yes | Maybe |

## Recommended Actions

### Immediate Actions (Before GitHub Publication)

1. **Translate Active Documentation:**
   - All files in `docs/` (not in `docs/old/`)
   - All root-level deployment guides
   - Active spec files in `.kiro/specs/`

2. **Archive Historical Files:**
   - Create `docs/archive/` directory
   - Move old test results and reports
   - Move superseded documentation

3. **Delete Superseded Files:**
   - Files with newer English equivalents
   - Outdated troubleshooting guides
   - Old implementation notes

### Post-Publication Actions

1. **Review Archived Files:**
   - Determine if any archived files should be translated
   - Delete files with no historical value
   - Keep important historical records

2. **Update Documentation Index:**
   - Update docs/INDEX.md to reflect changes
   - Remove references to deleted files
   - Add references to new translated files

## Files to Archive (Recommendation)

Move these files to `docs/archive/` or `docs/old/archive/`:

- docs/old/EMAIL_TEST_SONUCLARI.md
- docs/old/LOCAL_TEST_RESULTS.md
- docs/old/PERFORMANCE_AUDIT_REPORT.md
- docs/old/PROJECT_CLEANUP_REPORT.md
- docs/old/LOGO_FIX_REPORT.md
- docs/old/LOGO_AND_WIDTH_FIX_SUMMARY.md
- docs/old/LOGO_AND_BACKGROUND_FIX.md
- All test summary files in docs/old/TEST_*.md

## Files to Delete (Recommendation)

Delete these files if they are superseded or no longer relevant:

- docs/old/GIRIS_BILGILERI.md (after extracting to TEST_CREDENTIALS.md)
- docs/old/WALLET_HATASI_COZUMU.md (if issue is resolved)
- .kiro/specs/old/time-limited-tasks/SECURITY_SUMMARY_TR.md (if English version exists)

## Verification Checklist

After processing files:

- [ ] All active documentation is in English
- [ ] Historical files are archived appropriately
- [ ] No sensitive data in repository
- [ ] Documentation index updated
- [ ] All file references updated
- [ ] Broken links fixed
- [ ] README.md updated if necessary

## Notes

- Always backup files before deletion
- Check git history for file importance
- Consult with team before deleting large documentation files
- Preserve files with unique historical value
- Consider creating a separate archive repository for old documentation
