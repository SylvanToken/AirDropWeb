import * as fs from 'fs';
import * as path from 'path';

interface TurkishMatch {
  line: number;
  column: number;
  text: string;
  context: string;
}

interface FileResult {
  path: string;
  type: 'documentation' | 'code' | 'config' | 'test' | 'locale';
  matches: TurkishMatch[];
  priority: 'high' | 'medium' | 'low';
}

interface ScanReport {
  timestamp: string;
  totalFiles: number;
  filesWithTurkish: number;
  results: FileResult[];
  summary: {
    documentation: number;
    code: number;
    config: number;
    test: number;
    locale: number;
  };
}

// Turkish characters and keywords to detect
const TURKISH_CHARS = /[çğıöşüÇĞİÖŞÜ]/;
const TURKISH_KEYWORDS = [
  'Adım', 'Kılavuz', 'Türkçe', 'Anladım', 'Yeni', 'Proje',
  'Cloudflare', 'Domain', 'Kurulum', 'Başlangıç', 'Üretim',
  'Göç', 'Dağıtım', 'Özet', 'Test', 'Hazır', 'Seçenekler'
];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.swc',
  'playwright-report',
  'test-results'
];

// File extensions to scan
const SCAN_EXTENSIONS = [
  '.md', '.ts', '.tsx', '.js', '.jsx', '.json',
  '.txt', '.yml', '.yaml', '.env.example'
];

function getFileType(filePath: string): FileResult['type'] {
  if (filePath.includes('/locales/tr/') || filePath.includes('\\locales\\tr\\')) {
    return 'locale';
  }
  if (filePath.endsWith('.md')) {
    return 'documentation';
  }
  if (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.')) {
    return 'test';
  }
  if (filePath.endsWith('.json') || filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
    return 'config';
  }
  return 'code';
}

function getPriority(fileType: FileResult['type'], filePath: string): FileResult['priority'] {
  // Locale files are low priority (intentional Turkish content)
  if (fileType === 'locale') {
    return 'low';
  }
  // Documentation files are high priority
  if (fileType === 'documentation') {
    return 'high';
  }
  // Test files are medium priority
  if (fileType === 'test') {
    return 'medium';
  }
  // Code files are high priority
  return 'high';
}

function scanFileContent(filePath: string, content: string): TurkishMatch[] {
  const matches: TurkishMatch[] = [];
  const lines = content.split('\n');

  lines.forEach((line, lineIndex) => {
    // Check for Turkish characters
    if (TURKISH_CHARS.test(line)) {
      const match = line.match(TURKISH_CHARS);
      if (match && match.index !== undefined) {
        matches.push({
          line: lineIndex + 1,
          column: match.index + 1,
          text: line.trim().substring(0, 100),
          context: 'Turkish character detected'
        });
      }
    }

    // Check for Turkish keywords
    TURKISH_KEYWORDS.forEach(keyword => {
      if (line.includes(keyword)) {
        const column = line.indexOf(keyword);
        matches.push({
          line: lineIndex + 1,
          column: column + 1,
          text: line.trim().substring(0, 100),
          context: `Turkish keyword: ${keyword}`
        });
      }
    });
  });

  return matches;
}

function shouldScanFile(filePath: string): boolean {
  // Check if file has scannable extension
  const hasValidExtension = SCAN_EXTENSIONS.some(ext => filePath.endsWith(ext));
  if (!hasValidExtension) {
    return false;
  }

  // Check if file is in excluded directory
  const isExcluded = EXCLUDE_DIRS.some(dir => 
    filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)
  );
  
  return !isExcluded;
}

function scanDirectory(dirPath: string, results: FileResult[] = []): FileResult[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(process.cwd(), fullPath);

    if (entry.isDirectory()) {
      // Skip excluded directories
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        scanDirectory(fullPath, results);
      }
    } else if (entry.isFile() && shouldScanFile(relativePath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const matches = scanFileContent(relativePath, content);

        if (matches.length > 0) {
          const fileType = getFileType(relativePath);
          results.push({
            path: relativePath,
            type: fileType,
            matches: matches,
            priority: getPriority(fileType, relativePath)
          });
        }
      } catch (error) {
        console.error(`Error reading file ${relativePath}:`, error);
      }
    }
  }

  return results;
}

function generateReport(): ScanReport {
  console.log('🔍 Scanning codebase for Turkish content...\n');
  
  const results = scanDirectory(process.cwd());
  
  const summary = {
    documentation: 0,
    code: 0,
    config: 0,
    test: 0,
    locale: 0
  };

  results.forEach(result => {
    summary[result.type]++;
  });

  const report: ScanReport = {
    timestamp: new Date().toISOString(),
    totalFiles: results.length,
    filesWithTurkish: results.length,
    results: results.sort((a, b) => {
      // Sort by priority first, then by type
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.type.localeCompare(b.type);
    }),
    summary
  };

  return report;
}

function printReport(report: ScanReport): void {
  console.log('📊 Turkish Content Scan Report');
  console.log('═'.repeat(80));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Files with Turkish content: ${report.filesWithTurkish}`);
  console.log();

  console.log('📈 Summary by File Type:');
  console.log(`  Documentation: ${report.summary.documentation}`);
  console.log(`  Code: ${report.summary.code}`);
  console.log(`  Config: ${report.summary.config}`);
  console.log(`  Test: ${report.summary.test}`);
  console.log(`  Locale: ${report.summary.locale}`);
  console.log();

  console.log('🔴 HIGH PRIORITY FILES:');
  const highPriority = report.results.filter(r => r.priority === 'high');
  highPriority.forEach(result => {
    console.log(`  📄 ${result.path} (${result.type})`);
    console.log(`     Matches: ${result.matches.length}`);
  });
  console.log();

  console.log('🟡 MEDIUM PRIORITY FILES:');
  const mediumPriority = report.results.filter(r => r.priority === 'medium');
  mediumPriority.forEach(result => {
    console.log(`  📄 ${result.path} (${result.type})`);
    console.log(`     Matches: ${result.matches.length}`);
  });
  console.log();

  console.log('🟢 LOW PRIORITY FILES (Intentional Turkish - Locale Files):');
  const lowPriority = report.results.filter(r => r.priority === 'low');
  lowPriority.forEach(result => {
    console.log(`  📄 ${result.path} (${result.type})`);
  });
  console.log();
}

// Main execution
const report = generateReport();
printReport(report);

// Save report to JSON file
const reportPath = path.join(process.cwd(), '.kiro', 'specs', 'github-preparation-and-testing', 'turkish-content-report.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n✅ Report saved to: ${reportPath}`);
