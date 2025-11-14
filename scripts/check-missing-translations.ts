import fs from 'fs';
import path from 'path';

const languages = ['tr', 'ar', 'de', 'es', 'ko', 'ru', 'zh'];
const localesDir = path.join(process.cwd(), 'locales');

console.log('🔍 Checking for missing translations in common.json\n');

// Load English (reference)
const enPath = path.join(localesDir, 'en', 'common.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

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

// Get all English keys
const enKeys = getAllKeys(enData);
console.log(`📊 Total keys in English: ${enKeys.length}\n`);

// Check each language
const missingByLanguage: Record<string, string[]> = {};

for (const lang of languages) {
  const langPath = path.join(localesDir, lang, 'common.json');
  
  if (!fs.existsSync(langPath)) {
    console.log(`❌ ${lang}/common.json not found!`);
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
    missingByLanguage[lang] = missing;
    console.log(`⚠️  ${lang}: ${missing.length} missing keys`);
    missing.slice(0, 5).forEach(key => console.log(`   - ${key}`));
    if (missing.length > 5) {
      console.log(`   ... and ${missing.length - 5} more`);
    }
    console.log('');
  } else {
    console.log(`✅ ${lang}: All keys present\n`);
  }
}

// Summary
console.log('='.repeat(50));
console.log('📋 Summary\n');

const totalMissing = Object.values(missingByLanguage).reduce((sum, arr) => sum + arr.length, 0);

if (totalMissing === 0) {
  console.log('✅ All translations are complete!');
} else {
  console.log(`⚠️  Total missing translations: ${totalMissing}`);
  console.log('\nMissing by language:');
  Object.entries(missingByLanguage).forEach(([lang, keys]) => {
    console.log(`  ${lang}: ${keys.length} keys`);
  });
}

// Export missing keys for fixing
if (totalMissing > 0) {
  const outputPath = path.join(process.cwd(), 'missing-translations.json');
  fs.writeFileSync(outputPath, JSON.stringify(missingByLanguage, null, 2));
  console.log(`\n📝 Missing keys exported to: missing-translations.json`);
}
