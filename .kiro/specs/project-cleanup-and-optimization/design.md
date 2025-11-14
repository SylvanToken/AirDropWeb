# Project Cleanup and Optimization - Design Document

## Overview

Bu doküman, Sylvan Token Airdrop Platform projesinin kapsamlı temizlik ve optimizasyon sürecinin teknik tasarımını içerir. Proje genelinde kod kalitesini artırmak, gereksiz dosyaları temizlemek ve bakımı kolaylaştırmak için sistematik bir yaklaşım sunar.

## Architecture

### Cleanup Pipeline

```
┌─────────────────────────────────────────┐
│         Code Analysis Phase             │
│  ┌───────────────────────────────────┐  │
│  │ - ESLint Analysis                 │  │
│  │ - TypeScript Compiler Check       │  │
│  │ - File System Scan                │  │
│  │ - Pattern Matching                │  │
│  └───────────────────────────────────┘  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Issue Detection Phase              │
│  ┌───────────────────────────────────┐  │
│  │ - Debug Code Detection            │  │
│  │ - Unused Import Detection         │  │
│  │ - TODO/FIXME Collection           │  │
│  │ - Duplicate File Detection        │  │
│  └───────────────────────────────────┘  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│       Cleanup Execution Phase           │
│  ┌───────────────────────────────────┐  │
│  │ - Remove Debug Code               │  │
│  │ - Remove Unused Imports           │  │
│  │ - Fix ESLint Warnings             │  │
│  │ - Archive Old Files               │  │
│  └───────────────────────────────────┘  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Verification Phase                 │
│  ┌───────────────────────────────────┐  │
│  │ - TypeScript Compilation          │  │
│  │ - Test Execution                  │  │
│  │ - Build Verification              │  │
│  │ - Report Generation               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Code Analyzer

**Purpose:** Proje dosyalarını analiz eder ve sorunları tespit eder

**Interface:**
```typescript
interface CodeAnalyzer {
  analyzeProject(): Promise<AnalysisResult>;
  findDebugCode(): Promise<DebugCodeLocation[]>;
  findUnusedImports(): Promise<UnusedImport[]>;
  findTodoComments(): Promise<TodoComment[]>;
  getESLintWarnings(): Promise<ESLintWarning[]>;
}
```


### 2. Debug Code Detector

**Purpose:** console.log, debugger ve diğer debug kodlarını tespit eder

**Detection Patterns:**
- `console.log(...)` - Production'da olmamalı
- `console.error(...)` - Test dosyaları dışında
- `console.warn(...)` - Test dosyaları dışında
- `debugger;` - Tüm dosyalarda
- `// DEBUG:` - Debug yorumları
- `// TEMP:` - Geçici kodlar

**Exclusions:**
- `__tests__/` klasöründeki dosyalar
- `*.test.ts` ve `*.test.tsx` dosyaları
- `lib/error-monitoring.ts` (legitimate error logging)

### 3. Unused Import Detector

**Purpose:** Kullanılmayan import'ları tespit eder

**Detection Method:**
- TypeScript Language Service API kullan
- Her dosya için unused imports kontrol et
- Safe-to-remove import'ları işaretle

**Safe Removal Criteria:**
- Import edilen değişken/fonksiyon kullanılmıyor
- Type-only import ve kullanılmıyor
- Side-effect import değil

### 4. TODO/FIXME Collector

**Purpose:** Kod içindeki TODO ve FIXME yorumlarını toplar ve kategorize eder

**Comment Types:**
- `// TODO:` - Yapılacak işler
- `// FIXME:` - Düzeltilmesi gerekenler
- `// HACK:` - Geçici çözümler
- `// XXX:` - Dikkat gerektiren yerler

**Categorization:**
- **Critical:** FIXME, XXX
- **Important:** TODO with "urgent", "important"
- **Low Priority:** Diğer TODO'lar

### 5. ESLint Fixer

**Purpose:** ESLint uyarılarını otomatik düzeltir

**Fixable Issues:**
- Missing dependencies in useEffect
- Anonymous default exports
- Unused variables (safe cases)
- Import/export order
- Formatting issues

**Manual Review Required:**
- Complex dependency arrays
- Potential infinite loops
- Breaking changes

### 6. File Archiver

**Purpose:** Gereksiz dosyaları arşivler

**Archive Targets:**
- Tamamlanmış spec'ler
- Eski dokümantasyon
- Kullanılmayan test dosyaları
- Geçici script'ler

**Archive Structure:**
```
old_archive/
├── specs/
├── docs/
├── scripts/
└── tests/
```

## Data Models

### AnalysisResult

```typescript
interface AnalysisResult {
  timestamp: Date;
  filesScanned: number;
  issuesFound: {
    debugCode: number;
    unusedImports: number;
    todoComments: number;
    eslintWarnings: number;
  };
  details: {
    debugCode: DebugCodeLocation[];
    unusedImports: UnusedImport[];
    todoComments: TodoComment[];
    eslintWarnings: ESLintWarning[];
  };
}

interface DebugCodeLocation {
  file: string;
  line: number;
  column: number;
  code: string;
  type: 'console.log' | 'console.error' | 'debugger' | 'comment';
}

interface UnusedImport {
  file: string;
  line: number;
  importName: string;
  importPath: string;
  isSafeToRemove: boolean;
}

interface TodoComment {
  file: string;
  line: number;
  type: 'TODO' | 'FIXME' | 'HACK' | 'XXX';
  priority: 'critical' | 'important' | 'low';
  text: string;
}

interface ESLintWarning {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
  isFixable: boolean;
}
```

## Cleanup Strategies

### 1. Debug Code Removal

**Strategy:**
1. Scan all `.ts` and `.tsx` files
2. Exclude test files
3. Find debug patterns
4. Remove or comment out
5. Verify compilation

**Safety Checks:**
- Don't remove from test files
- Don't remove legitimate error logging
- Keep production error monitoring

### 2. Unused Import Removal

**Strategy:**
1. Run TypeScript compiler
2. Get unused import diagnostics
3. Remove safe imports
4. Re-compile to verify
5. Run tests

**Safety Checks:**
- Don't remove side-effect imports
- Don't remove type-only imports used in JSDoc
- Verify no compilation errors

### 3. ESLint Warning Fixes

**Strategy:**
1. Run ESLint with --fix flag
2. Manually review complex issues
3. Fix useEffect dependencies
4. Fix anonymous exports
5. Verify tests pass

**Manual Review Cases:**
- Complex dependency arrays
- Potential breaking changes
- Performance implications

### 4. Documentation Consolidation

**Strategy:**
1. Identify duplicate docs
2. Merge similar content
3. Update cross-references
4. Archive old versions
5. Update README

**Merge Criteria:**
- Same topic
- Overlapping content
- Outdated information

## Testing Strategy

### Pre-Cleanup Tests

1. Run full test suite
2. Verify TypeScript compilation
3. Check build process
4. Record baseline metrics

### Post-Cleanup Tests

1. Run full test suite again
2. Verify TypeScript compilation
3. Check build process
4. Compare metrics
5. Verify no regressions

### Verification Checklist

- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] Build succeeds
- [ ] No new ESLint errors
- [ ] Application runs correctly
- [ ] No broken imports
- [ ] No missing dependencies

## Error Handling

### Compilation Errors

**If TypeScript fails:**
1. Rollback last change
2. Review removed imports
3. Check for type dependencies
4. Fix and retry

### Test Failures

**If tests fail:**
1. Identify failing tests
2. Check if related to cleanup
3. Fix or rollback
4. Document issue

### Build Errors

**If build fails:**
1. Check for missing files
2. Verify import paths
3. Check for circular dependencies
4. Fix and rebuild

## Performance Considerations

### Analysis Performance

- Use parallel file processing
- Cache analysis results
- Skip node_modules
- Use incremental analysis

### Cleanup Performance

- Batch file operations
- Use atomic writes
- Minimize disk I/O
- Progress reporting

## Monitoring and Reporting

### Metrics to Track

- Files scanned
- Issues found
- Issues fixed
- Time taken
- Lines removed
- Bundle size change

### Report Format

```markdown
# Cleanup Report

## Summary
- Files Scanned: X
- Issues Found: Y
- Issues Fixed: Z
- Time Taken: N minutes

## Details

### Debug Code
- Removed: X instances
- Files affected: Y

### Unused Imports
- Removed: X imports
- Files affected: Y

### ESLint Warnings
- Fixed: X warnings
- Manual review: Y

### Documentation
- Archived: X files
- Merged: Y files

## Verification
- ✅ TypeScript compilation
- ✅ All tests pass
- ✅ Build succeeds
- ✅ Bundle size: -X KB
```

---

**Version:** 1.0  
**Date:** November 13, 2025  
**Status:** Ready for Implementation
