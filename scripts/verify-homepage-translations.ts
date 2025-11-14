import fs from 'fs';
import path from 'path';

const languages = ['en', 'tr', 'ar', 'de', 'es', 'ko', 'ru', 'zh'];
const localesDir = path.join(process.cwd(), 'locales');

console.log('🔍 Verifying homepage translations...\n');

let allValid = true;

// Check if all homepage.json files exist
for (const lang of languages) {
  const filePath = path.join(localesDir, lang, 'homepage.json');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Missing: ${lang}/homepage.json`);
    allValid = false;
    continue;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    
    // Check required structure
    const requiredKeys = ['header', 'footer'];
    const headerKeys = ['navigation', 'buttons'];
    const footerKeys = ['description', 'links', 'social', 'branding', 'copyright'];
    
    let langValid = true;
    
    for (const key of requiredKeys) {
      if (!json[key]) {
        console.log(`❌ ${lang}/homepage.json: Missing key "${key}"`);
        langValid = false;
      }
    }
    
    if (json.header) {
      for (const key of headerKeys) {
        if (!json.header[key]) {
          console.log(`❌ ${lang}/homepage.json: Missing key "header.${key}"`);
          langValid = false;
        }
      }
    }
    
    if (json.footer) {
      for (const key of footerKeys) {
        if (!json.footer[key]) {
          console.log(`❌ ${lang}/homepage.json: Missing key "footer.${key}"`);
          langValid = false;
        }
      }
    }
    
    if (langValid) {
      console.log(`✅ ${lang}/homepage.json - Valid`);
    } else {
      allValid = false;
    }
    
  } catch (error) {
    console.log(`❌ ${lang}/homepage.json: Invalid JSON - ${error}`);
    allValid = false;
  }
}

console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('✅ All homepage translations are valid!');
  process.exit(0);
} else {
  console.log('❌ Some translations have issues. Please fix them.');
  process.exit(1);
}
