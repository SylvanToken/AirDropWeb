import fs from 'fs';
import path from 'path';

interface LinkCheck {
  file: string;
  link: string;
  type: 'internal' | 'external' | 'anchor';
  exists: boolean;
  error?: string;
}

const results: LinkCheck[] = [];
const rootDir = process.cwd();

// Regex to find markdown links
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

// Files and directories to check
const docsToCheck = [
  'README.md',
  'CHANGELOG.md',
  'SECURITY.md',
  'DEPLOYMENT_STEPS.md',
  'VERCEL_NEW_PROJECT.md',
  'VERCEL_CLOUDFLARE_DOMAIN.md',
  'QUICK_START.md',
  'PRODUCTION_MIGRATION_GUIDE.md',
  'GITHUB_DEPLOYMENT_GUIDE.md',
  'FINAL_DEPLOYMENT_SUMMARY.md',
  'SIMPLE_TEST_DEPLOYMENT.md',
  'VERCEL_DEPLOYMENT_GUIDE.md',
  'docs/',
];

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkInternalLink(filePath: string, link: string): boolean {
  // Remove anchor
  const [pathPart] = link.split('#');
  
  if (!pathPart) return true; // Just an anchor
  
  // Resolve relative to the file's directory
  const fileDir = path.dirname(filePath);
  const targetPath = path.resolve(fileDir, pathPart);
  
  return fs.existsSync(targetPath);
}

function checkLink(filePath: string, link: string, linkText: string): void {
  // Skip mailto and tel links
  if (link.startsWith('mailto:') || link.startsWith('tel:')) {
    return;
  }
  
  // External link
  if (link.startsWith('http://') || link.startsWith('https://')) {
    results.push({
      file: filePath,
      link: linkText,
      type: 'external',
      exists: true, // We'll assume external links are valid
    });
    return;
  }
  
  // Anchor only
  if (link.startsWith('#')) {
    results.push({
      file: filePath,
      link: linkText,
      type: 'anchor',
      exists: true, // We'll assume anchors are valid
    });
    return;
  }
  
  // Internal link
  const exists = checkInternalLink(filePath, link);
  results.push({
    file: filePath,
    link: linkText,
    type: 'internal',
    exists,
    error: exists ? undefined : `File not found: ${link}`,
  });
}

function checkFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const linkText = match[1];
    const link = match[2];
    checkLink(filePath, link, linkText);
  }
}

// Main execution
console.log('🔍 Validating documentation links...\n');

const filesToCheck: string[] = [];

for (const item of docsToCheck) {
  const fullPath = path.join(rootDir, item);
  
  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      filesToCheck.push(...getAllMarkdownFiles(fullPath));
    } else {
      filesToCheck.push(fullPath);
    }
  }
}

console.log(`📄 Checking ${filesToCheck.length} markdown files...\n`);

for (const file of filesToCheck) {
  checkFile(file);
}

// Report results
const brokenLinks = results.filter(r => !r.exists);
const internalLinks = results.filter(r => r.type === 'internal');
const externalLinks = results.filter(r => r.type === 'external');
const anchorLinks = results.filter(r => r.type === 'anchor');

console.log('📊 Link Validation Results:\n');
console.log(`Total links found: ${results.length}`);
console.log(`  - Internal links: ${internalLinks.length}`);
console.log(`  - External links: ${externalLinks.length}`);
console.log(`  - Anchor links: ${anchorLinks.length}`);
console.log(`\n❌ Broken links: ${brokenLinks.length}\n`);

if (brokenLinks.length > 0) {
  console.log('Broken Links:\n');
  for (const broken of brokenLinks) {
    console.log(`  File: ${path.relative(rootDir, broken.file)}`);
    console.log(`  Link: ${broken.link}`);
    console.log(`  Error: ${broken.error}\n`);
  }
  
  process.exit(1);
} else {
  console.log('✅ All internal links are valid!');
  console.log('\n📝 Note: External links were not validated (assumed valid)');
  console.log('   You may want to manually verify external URLs are accessible.\n');
}
