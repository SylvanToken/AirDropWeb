import * as fs from 'fs';
import * as path from 'path';

const localesDir = path.join(process.cwd(), 'locales');
const languages = ['ar', 'de', 'es', 'ko', 'ru', 'tr', 'zh'];

interface MissingTranslation {
  file: string;
  language: string;
  key: string;
  value: string;
}

const missingTranslations: MissingTranslation[] = [];

function checkObject(obj: any, prefix: string, file: string, language: string) {
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (typeof value === 'string') {
      if (value.includes('[EN]') || value.startsWith('EN]')) {
        missingTranslations.push({
          file,
          language,
          key: fullKey,
          value
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      checkObject(value, fullKey, file, language);
    }
  }
}

// Check all language files
for (const lang of languages) {
  const langDir = path.join(localesDir, lang);
  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const filePath = path.join(langDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    
    checkObject(json, '', file, lang);
  }
}

// Print results
console.log('\n=== Missing Translations Report ===\n');

if (missingTranslations.length === 0) {
  console.log('✅ No missing translations found! All files are complete.');
} else {
  console.log(`❌ Found ${missingTranslations.length} missing translations:\n`);
  
  // Group by language
  const byLanguage: Record<string, MissingTranslation[]> = {};
  for (const item of missingTranslations) {
    if (!byLanguage[item.language]) {
      byLanguage[item.language] = [];
    }
    byLanguage[item.language].push(item);
  }
  
  for (const [lang, items] of Object.entries(byLanguage)) {
    console.log(`\n📁 ${lang.toUpperCase()} (${items.length} missing):`);
    
    // Group by file
    const byFile: Record<string, MissingTranslation[]> = {};
    for (const item of items) {
      if (!byFile[item.file]) {
        byFile[item.file] = [];
      }
      byFile[item.file].push(item);
    }
    
    for (const [file, fileItems] of Object.entries(byFile)) {
      console.log(`  📄 ${file} (${fileItems.length} missing):`);
      for (const item of fileItems) {
        console.log(`    - ${item.key}: "${item.value}"`);
      }
    }
  }
}

console.log('\n');
