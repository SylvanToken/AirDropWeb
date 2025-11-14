import fs from 'fs';
import path from 'path';

interface TranslationKeys {
  [key: string]: any;
}

interface MissingTranslations {
  [language: string]: {
    [file: string]: string[];
  };
}

const LOCALES_DIR = path.join(process.cwd(), 'locales');
const BASE_LANG = 'en';
const LANGUAGES = ['ar', 'de', 'es', 'ko', 'ru', 'tr', 'zh'];

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

function checkTranslations() {
  const missing: MissingTranslations = {};
  const baseFiles = fs.readdirSync(path.join(LOCALES_DIR, BASE_LANG));
  
  console.log('🔍 Checking translations...\n');
  
  for (const file of baseFiles) {
    if (!file.endsWith('.json')) continue;
    
    const baseFilePath = path.join(LOCALES_DIR, BASE_LANG, file);
    const baseContent = JSON.parse(fs.readFileSync(baseFilePath, 'utf-8'));
    const baseKeys = getAllKeys(baseContent);
    
    console.log(`📄 Checking ${file} (${baseKeys.length} keys)`);
    
    for (const lang of LANGUAGES) {
      const langFilePath = path.join(LOCALES_DIR, lang, file);
      
      if (!fs.existsSync(langFilePath)) {
        if (!missing[lang]) missing[lang] = {};
        missing[lang][file] = ['FILE_MISSING'];
        console.log(`  ❌ ${lang}: File missing`);
        continue;
      }
      
      const langContent = JSON.parse(fs.readFileSync(langFilePath, 'utf-8'));
      const langKeys = getAllKeys(langContent);
      
      const missingKeys = baseKeys.filter(key => !langKeys.includes(key));
      
      if (missingKeys.length > 0) {
        if (!missing[lang]) missing[lang] = {};
        missing[lang][file] = missingKeys;
        console.log(`  ⚠️  ${lang}: ${missingKeys.length} missing keys`);
      } else {
        console.log(`  ✅ ${lang}: Complete`);
      }
    }
    console.log('');
  }
  
  return missing;
}

function generateReport(missing: MissingTranslations) {
  let report = '# Translation Analysis Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  const totalMissing = Object.values(missing).reduce((sum, lang) => {
    return sum + Object.values(lang).reduce((s, keys) => s + keys.length, 0);
  }, 0);
  
  report += `## Summary\n\n`;
  report += `- Total missing translations: **${totalMissing}**\n`;
  report += `- Languages with issues: **${Object.keys(missing).length}**\n\n`;
  
  for (const [lang, files] of Object.entries(missing)) {
    const totalKeys = Object.values(files).reduce((sum, keys) => sum + keys.length, 0);
    report += `### ${lang.toUpperCase()} (${totalKeys} missing)\n\n`;
    
    for (const [file, keys] of Object.entries(files)) {
      if (keys[0] === 'FILE_MISSING') {
        report += `- **${file}**: ❌ FILE MISSING\n`;
      } else {
        report += `- **${file}**: ${keys.length} missing keys\n`;
        report += `  \`\`\`\n`;
        keys.forEach(key => report += `  - ${key}\n`);
        report += `  \`\`\`\n`;
      }
    }
    report += '\n';
  }
  
  return report;
}

const missing = checkTranslations();
const report = generateReport(missing);

fs.writeFileSync('TRANSLATION_ANALYSIS.md', report);
console.log('✅ Report saved to TRANSLATION_ANALYSIS.md');
