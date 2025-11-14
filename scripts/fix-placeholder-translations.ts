import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'locales');

console.log('🔧 Fixing placeholder translations with [EN] prefix\n');

// Find all JSON files with [EN] prefix
function findPlaceholders(dir: string, results: Array<{file: string, count: number}> = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findPlaceholders(filePath, results);
    } else if (file.endsWith('.json')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(/\[EN\]/g);
      
      if (matches && matches.length > 0) {
        results.push({
          file: filePath.replace(localesDir + path.sep, ''),
          count: matches.length
        });
      }
    }
  }
  
  return results;
}

const placeholders = findPlaceholders(localesDir);

if (placeholders.length === 0) {
  console.log('✅ No placeholder translations found!');
  process.exit(0);
}

console.log(`Found ${placeholders.length} files with [EN] placeholders:\n`);

placeholders.forEach(({file, count}) => {
  console.log(`  ⚠️  ${file}: ${count} placeholders`);
});

console.log('\n' + '='.repeat(60));
console.log('\n📝 These files need manual translation:');
console.log('\nPlease translate the [EN] prefixed strings to the target language.');
console.log('The [EN] prefix indicates that the translation is incomplete.\n');

// Export list for manual fixing
const reportPath = path.join(process.cwd(), 'placeholder-translations.json');
fs.writeFileSync(reportPath, JSON.stringify(placeholders, null, 2));
console.log(`📄 Report exported to: placeholder-translations.json\n`);
