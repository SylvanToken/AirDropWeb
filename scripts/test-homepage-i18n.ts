import fs from 'fs';
import path from 'path';

console.log('🧪 Testing Homepage i18n Integration\n');

// Check if homepage.json files exist
const languages = ['en', 'tr', 'ar', 'de', 'es', 'ko', 'ru', 'zh'];
const localesDir = path.join(process.cwd(), 'locales');

console.log('1️⃣ Checking homepage.json files...');
let allFilesExist = true;

for (const lang of languages) {
  const filePath = path.join(localesDir, lang, 'homepage.json');
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${lang}/homepage.json exists`);
  } else {
    console.log(`   ❌ ${lang}/homepage.json MISSING!`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n❌ Some homepage.json files are missing!');
  process.exit(1);
}

// Check i18n/request.ts configuration
console.log('\n2️⃣ Checking i18n/request.ts configuration...');
const requestConfigPath = path.join(process.cwd(), 'i18n', 'request.ts');

if (!fs.existsSync(requestConfigPath)) {
  console.log('   ❌ i18n/request.ts not found!');
  process.exit(1);
}

const requestConfigContent = fs.readFileSync(requestConfigPath, 'utf-8');

if (requestConfigContent.includes('homepage.json')) {
  console.log('   ✅ homepage.json is imported');
} else {
  console.log('   ❌ homepage.json is NOT imported!');
  console.log('   💡 Add this to i18n/request.ts:');
  console.log('      import(`../locales/${locale}/homepage.json`)');
  process.exit(1);
}

if (requestConfigContent.includes('homepage: homepage.default')) {
  console.log('   ✅ homepage namespace is registered');
} else {
  console.log('   ❌ homepage namespace is NOT registered!');
  console.log('   💡 Add this to messages object:');
  console.log('      homepage: homepage.default,');
  process.exit(1);
}

// Check Footer component
console.log('\n3️⃣ Checking Footer component...');
const footerPath = path.join(process.cwd(), 'components', 'layout', 'Footer.tsx');

if (!fs.existsSync(footerPath)) {
  console.log('   ❌ Footer.tsx not found!');
  process.exit(1);
}

const footerContent = fs.readFileSync(footerPath, 'utf-8');

if (footerContent.includes('useTranslations("homepage.footer")')) {
  console.log('   ✅ Footer uses homepage.footer namespace');
} else {
  console.log('   ⚠️  Footer might not be using homepage.footer namespace');
}

// Test translation keys
console.log('\n4️⃣ Testing translation keys structure...');
const enHomepagePath = path.join(localesDir, 'en', 'homepage.json');
const enHomepage = JSON.parse(fs.readFileSync(enHomepagePath, 'utf-8'));

const requiredKeys = [
  'footer.branding.tagline',
  'footer.links.terms',
  'footer.links.privacy',
  'footer.social.twitter',
  'footer.social.telegram',
  'footer.branding.madeWith',
  'footer.branding.forNature',
  'footer.branding.greenerFuture',
  'footer.copyright',
];

let allKeysExist = true;

for (const key of requiredKeys) {
  const keys = key.split('.');
  let obj: any = enHomepage;
  let exists = true;
  
  for (const k of keys) {
    if (obj && obj[k] !== undefined) {
      obj = obj[k];
    } else {
      exists = false;
      break;
    }
  }
  
  if (exists) {
    console.log(`   ✅ ${key}`);
  } else {
    console.log(`   ❌ ${key} MISSING!`);
    allKeysExist = false;
  }
}

if (!allKeysExist) {
  console.log('\n❌ Some translation keys are missing!');
  process.exit(1);
}

console.log('\n' + '='.repeat(50));
console.log('✅ All homepage i18n tests passed!');
console.log('='.repeat(50));
console.log('\n📝 Next steps:');
console.log('   1. Restart your development server');
console.log('   2. Visit http://localhost:3005');
console.log('   3. Check the footer for translations');
console.log('   4. Try changing language');
console.log('\n🎉 Homepage i18n is ready!');
