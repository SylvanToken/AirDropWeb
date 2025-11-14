import * as fs from 'fs';
import * as path from 'path';

interface SensitiveMatch {
  file: string;
  line: number;
  pattern: string;
  context: string;
  severity: 'high' | 'medium' | 'low';
}

interface ScanReport {
  apiKeys: SensitiveMatch[];
  tokens: SensitiveMatch[];
  passwords: SensitiveMatch[];
  credentials: SensitiveMatch[];
  privateKeys: SensitiveMatch[];
  summary: {
    totalFindings: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
  };
}

// Patterns to detect sensitive data
const sensitivePatterns = [
  // API Keys
  { pattern: /api[_-]?key[\s]*[=:]['"]?([a-zA-Z0-9_\-]{20,})/gi, type: 'apiKeys', severity: 'high' as const },
  { pattern: /apikey[\s]*[=:]['"]?([a-zA-Z0-9_\-]{20,})/gi, type: 'apiKeys', severity: 'high' as const },
  
  // Tokens
  { pattern: /token[\s]*[=:]['"]?([a-zA-Z0-9_\-]{20,})/gi, type: 'tokens', severity: 'high' as const },
  { pattern: /access[_-]?token[\s]*[=:]['"]?([a-zA-Z0-9_\-]{20,})/gi, type: 'tokens', severity: 'high' as const },
  { pattern: /auth[_-]?token[\s]*[=:]['"]?([a-zA-Z0-9_\-]{20,})/gi, type: 'tokens', severity: 'high' as const },
  { pattern: /bearer[\s]+([a-zA-Z0-9_\-\.]{20,})/gi, type: 'tokens', severity: 'high' as const },
  
  // Passwords
  { pattern: /password[\s]*[=:]['"]([^'"]{8,})['"]/gi, type: 'passwords', severity: 'high' as const },
  { pattern: /passwd[\s]*[=:]['"]([^'"]{8,})['"]/gi, type: 'passwords', severity: 'high' as const },
  { pattern: /pwd[\s]*[=:]['"]([^'"]{8,})['"]/gi, type: 'passwords', severity: 'high' as const },
  
  // Credentials
  { pattern: /client[_-]?secret[\s]*[=:]['"]?([a-zA-Z0-9_\-]{20,})/gi, type: 'credentials', severity: 'high' as const },
  { pattern: /secret[_-]?key[\s]*[=:]['"]?([a-zA-Z0-9_\-]{20,})/gi, type: 'credentials', severity: 'high' as const },
  { pattern: /private[_-]?key[\s]*[=:]['"]?([a-zA-Z0-9_\-]{20,})/gi, type: 'privateKeys', severity: 'high' as const },
  
  // Database URLs with credentials
  { pattern: /postgres:\/\/[^:]+:[^@]+@/gi, type: 'credentials', severity: 'high' as const },
  { pattern: /mysql:\/\/[^:]+:[^@]+@/gi, type: 'credentials', severity: 'high' as const },
  { pattern: /mongodb:\/\/[^:]+:[^@]+@/gi, type: 'credentials', severity: 'high' as const },
  
  // AWS Keys
  { pattern: /AKIA[0-9A-Z]{16}/g, type: 'apiKeys', severity: 'high' as const },
  
  // Generic secrets
  { pattern: /secret[\s]*[=:]['"]([^'"]{20,})['"]/gi, type: 'credentials', severity: 'medium' as const },
];

// Files and directories to exclude
const excludePatterns = [
  /node_modules/,
  /\.git\//,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.swc/,
  /test-results/,
  /playwright-report/,
  /\.env\.example/,
  /\.env\.production\.example/,
  /package-lock\.json/,
  /tsconfig\.tsbuildinfo/,
  /\.kiro\/specs.*\/(sensitive-data-scan-report|task-8\.1-sensitive-data-report)/,
];

// File extensions to scan
const scanExtensions = [
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.env',
  '.yml', '.yaml', '.config', '.conf', '.sh', '.txt'
];

function shouldExclude(filePath: string): boolean {
  return excludePatterns.some(pattern => pattern.test(filePath));
}

function shouldScan(filePath: string): boolean {
  return scanExtensions.some(ext => filePath.endsWith(ext));
}

function scanFile(filePath: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      sensitivePatterns.forEach(({ pattern, type, severity }) => {
        const regex = new RegExp(pattern);
        const match = regex.exec(line);
        
        if (match) {
          // Skip if it's a comment explaining the pattern or example
          if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('*')) {
            // Check if it's actually showing an example or documentation
            if (line.includes('example') || line.includes('Example') || line.includes('EXAMPLE')) {
              return;
            }
          }
          
          matches.push({
            file: filePath,
            line: index + 1,
            pattern: type,
            context: line.trim().substring(0, 100),
            severity
          });
        }
      });
    });
  } catch (error) {
    // Skip files that can't be read
  }
  
  return matches;
}

function scanDirectory(dir: string): SensitiveMatch[] {
  let matches: SensitiveMatch[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (shouldExclude(fullPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        matches = matches.concat(scanDirectory(fullPath));
      } else if (entry.isFile() && shouldScan(fullPath)) {
        matches = matches.concat(scanFile(fullPath));
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return matches;
}

function generateReport(matches: SensitiveMatch[]): ScanReport {
  const report: ScanReport = {
    apiKeys: [],
    tokens: [],
    passwords: [],
    credentials: [],
    privateKeys: [],
    summary: {
      totalFindings: matches.length,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0
    }
  };
  
  matches.forEach(match => {
    // Categorize by type
    if (match.pattern === 'apiKeys') {
      report.apiKeys.push(match);
    } else if (match.pattern === 'tokens') {
      report.tokens.push(match);
    } else if (match.pattern === 'passwords') {
      report.passwords.push(match);
    } else if (match.pattern === 'credentials') {
      report.credentials.push(match);
    } else if (match.pattern === 'privateKeys') {
      report.privateKeys.push(match);
    }
    
    // Count by severity
    if (match.severity === 'high') {
      report.summary.highSeverity++;
    } else if (match.severity === 'medium') {
      report.summary.mediumSeverity++;
    } else {
      report.summary.lowSeverity++;
    }
  });
  
  return report;
}

function checkGitignore(): { envIgnored: boolean; issues: string[] } {
  const issues: string[] = [];
  let envIgnored = false;
  
  try {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      
      // Check for .env files
      if (content.includes('.env') || content.includes('*.env')) {
        envIgnored = true;
      } else {
        issues.push('.env files are not in .gitignore');
      }
      
      // Check for other important patterns
      if (!content.includes('node_modules')) {
        issues.push('node_modules is not in .gitignore');
      }
      if (!content.includes('.next')) {
        issues.push('.next is not in .gitignore');
      }
    } else {
      issues.push('.gitignore file not found');
    }
  } catch (error) {
    issues.push('Error reading .gitignore');
  }
  
  return { envIgnored, issues };
}

// Main execution
console.log('🔍 Scanning for sensitive data...\n');

const matches = scanDirectory(process.cwd());
const report = generateReport(matches);
const gitignoreCheck = checkGitignore();

console.log('📊 Scan Results:');
console.log('================\n');

console.log(`Total findings: ${report.summary.totalFindings}`);
console.log(`  - High severity: ${report.summary.highSeverity}`);
console.log(`  - Medium severity: ${report.summary.mediumSeverity}`);
console.log(`  - Low severity: ${report.summary.lowSeverity}\n`);

if (report.apiKeys.length > 0) {
  console.log(`⚠️  API Keys found: ${report.apiKeys.length}`);
  report.apiKeys.forEach(match => {
    console.log(`   ${match.file}:${match.line} - ${match.context}`);
  });
  console.log();
}

if (report.tokens.length > 0) {
  console.log(`⚠️  Tokens found: ${report.tokens.length}`);
  report.tokens.forEach(match => {
    console.log(`   ${match.file}:${match.line} - ${match.context}`);
  });
  console.log();
}

if (report.passwords.length > 0) {
  console.log(`⚠️  Passwords found: ${report.passwords.length}`);
  report.passwords.forEach(match => {
    console.log(`   ${match.file}:${match.line} - ${match.context}`);
  });
  console.log();
}

if (report.credentials.length > 0) {
  console.log(`⚠️  Credentials found: ${report.credentials.length}`);
  report.credentials.forEach(match => {
    console.log(`   ${match.file}:${match.line} - ${match.context}`);
  });
  console.log();
}

if (report.privateKeys.length > 0) {
  console.log(`⚠️  Private Keys found: ${report.privateKeys.length}`);
  report.privateKeys.forEach(match => {
    console.log(`   ${match.file}:${match.line} - ${match.context}`);
  });
  console.log();
}

console.log('🔒 .gitignore Check:');
console.log('===================\n');
console.log(`ENV files ignored: ${gitignoreCheck.envIgnored ? '✅' : '❌'}`);
if (gitignoreCheck.issues.length > 0) {
  console.log('\nIssues found:');
  gitignoreCheck.issues.forEach(issue => {
    console.log(`  ❌ ${issue}`);
  });
} else {
  console.log('✅ No issues found');
}

// Save report to file
const reportPath = path.join(process.cwd(), '.kiro/specs/github-preparation-and-testing/sensitive-data-scan-report.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({ ...report, gitignoreCheck }, null, 2));

console.log(`\n📄 Full report saved to: ${reportPath}`);

// Exit with error code if high severity findings
if (report.summary.highSeverity > 0) {
  console.log('\n❌ High severity findings detected. Please review and remediate.');
  process.exit(1);
} else {
  console.log('\n✅ No high severity findings detected.');
  process.exit(0);
}
