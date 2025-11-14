import fs from 'fs';
import path from 'path';

const languages = ['en', 'tr', 'ar', 'de', 'es', 'ko', 'ru', 'zh'];
const files = ['common.json', 'auth.json', 'tasks.json', 'wallet.json', 'dashboard.json', 'admin.json', 'profile.json', 'legal.json', 'homepage.json'];
const localesDir = path.join(process.cwd(), 'locales');

console.log('🔍 Comprehensive Translation Check\n');
console.log('='.repeat(60));

// Function to get all keys recursively
function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

// Function to check if key exists
function hasKey(obj: any, keyPath: string): boolean {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      return false;
    }
    current = current[key];
  }
  
  return true;
}

let totalMissingCount = 0;
const missingByFile: Record<string, Record<string, string[]>> = {};

// Check each file
for (const file of files) {
  console.log(`\n📄 Checking ${file}...`);
  
  // Load English (reference)
  const enPath = path.join(localesDir, 'en', file);
  
  if (!fs.existsSync(enPath)) {
    console.log(`   ⚠️  English file not found, skipping...`);
    continue;
  }
  
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const enKeys = getAllKeys(enData);
  
  console.log(`   📊 English keys: ${enKeys.length}`);
  
  let fileMissingCount = 0;
  
  // Check each language
  for (const lang of languages) {
    if (lang === 'en') continue; // Skip English
    
    const langPath = path.join(localesDir, lang, file);
    
    if (!fs.existsSync(langPath)) {
      console.log(`   ❌ ${lang}/${file} not found!`);
      continue;
    }
    
    const langData = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
    const missing: string[] = [];
    
    for (const key of enKeys) {
      if (!hasKey(langData, key)) {
        missing.push(key);
      }
    }
    
    if (missing.length > 0) {
      if (!missingByFile[file]) {
        missingByFile[file] = {};
      }
      missingByFile[file][lang] = missing;
      fileMissingCount += missing.length;
      totalMissingCount += missing.length;
      
      console.log(`   ⚠️  ${lang}: ${missing.length} missing`);
    }
  }
  
  if (fileMissingCount === 0) {
    console.log(`   ✅ All languages complete!`);
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 SUMMARY\n');

if (totalMissingCount === 0) {
  console.log('✅ All translations are complete across all files!');
  console.log(`\n📊 Statistics:`);
  console.log(`   Languages: ${languages.length}`);
  console.log(`   Files: ${files.length}`);
  console.log(`   Status: 100% Complete`);
} else {
  console.log(`⚠️  Total missing translations: ${totalMissingCount}\n`);
  
  console.log('Missing by file:');
  Object.entries(missingByFile).forEach(([file, langs]) => {
    const fileTotal = Object.values(langs).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`\n  📄 ${file}: ${fileTotal} missing`);
    Object.entries(langs).forEach(([lang, keys]) => {
      console.log(`     ${lang}: ${keys.length} keys`);
      keys.slice(0, 3).forEach(key => console.log(`       - ${key}`));
      if (keys.length > 3) {
        console.log(`       ... and ${keys.length - 3} more`);
      }
    });
  });
  
  // Export detailed report
  const reportPath = path.join(process.cwd(), 'missing-translations-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(missingByFile, null, 2));
  console.log(`\n📝 Detailed report exported to: missing-translations-report.json`);
}

console.log('\n' + '='.repeat(60));
