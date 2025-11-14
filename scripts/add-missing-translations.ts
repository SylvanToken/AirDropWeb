import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.join(process.cwd(), 'locales');
const BASE_LANG = 'en';

interface TranslationObject {
  [key: string]: any;
}

function setNestedValue(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return current;
}

function getAllKeyPaths(obj: any, prefix = ''): string[] {
  let paths: string[] = [];
  
  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      paths = paths.concat(getAllKeyPaths(obj[key], fullPath));
    } else {
      paths.push(fullPath);
    }
  }
  
  return paths;
}

function addMissingTranslations(lang: string, file: string) {
  const baseFilePath = path.join(LOCALES_DIR, BASE_LANG, file);
  const langFilePath = path.join(LOCALES_DIR, lang, file);
  
  if (!fs.existsSync(baseFilePath)) {
    console.log(`  ⚠️  Base file not found: ${file}`);
    return 0;
  }
  
  const baseContent = JSON.parse(fs.readFileSync(baseFilePath, 'utf-8'));
  const baseKeys = getAllKeyPaths(baseContent);
  
  let langContent: TranslationObject;
  if (fs.existsSync(langFilePath)) {
    langContent = JSON.parse(fs.readFileSync(langFilePath, 'utf-8'));
  } else {
    langContent = {};
    console.log(`  📝 Creating new file: ${file}`);
  }
  
  const langKeys = getAllKeyPaths(langContent);
  const missingKeys = baseKeys.filter(key => !langKeys.includes(key));
  
  if (missingKeys.length === 0) {
    return 0;
  }
  
  // Add missing keys with English values (marked for translation)
  for (const key of missingKeys) {
    const englishValue = getNestedValue(baseContent, key);
    const markedValue = typeof englishValue === 'string' 
      ? `[EN] ${englishValue}` 
      : englishValue;
    setNestedValue(langContent, key, markedValue);
  }
  
  // Write updated content
  fs.writeFileSync(
    langFilePath,
    JSON.stringify(langContent, null, 2) + '\n',
    'utf-8'
  );
  
  return missingKeys.length;
}

function main() {
  console.log('🔧 Adding missing translations...\n');
  
  const languages = ['ar', 'de', 'es', 'ko', 'ru', 'tr', 'zh'];
  const baseFiles = fs.readdirSync(path.join(LOCALES_DIR, BASE_LANG))
    .filter(f => f.endsWith('.json'));
  
  let totalAdded = 0;
  
  for (const lang of languages) {
    console.log(`\n📦 Processing ${lang.toUpperCase()}...`);
    let langTotal = 0;
    
    for (const file of baseFiles) {
      const added = addMissingTranslations(lang, file);
      if (added > 0) {
        console.log(`  ✅ ${file}: Added ${added} keys`);
        langTotal += added;
      }
    }
    
    console.log(`  📊 Total for ${lang.toUpperCase()}: ${langTotal} keys added`);
    totalAdded += langTotal;
  }
  
  console.log(`\n✅ Complete! Added ${totalAdded} translations across all languages`);
  console.log(`\n⚠️  Note: All added translations are marked with [EN] prefix`);
  console.log(`   Please replace them with proper translations for each language.`);
}

main();
