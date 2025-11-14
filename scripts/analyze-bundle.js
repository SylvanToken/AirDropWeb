/**
 * Bundle Size Analysis Script
 * Analyzes Next.js build output to measure bundle sizes
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', '.next');
const STATIC_DIR = path.join(BUILD_DIR, 'static');

function getDirectorySize(dirPath) {
  let totalSize = 0;

  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  }

  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBuildManifest() {
  const manifestPath = path.join(BUILD_DIR, 'build-manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.log('⚠️  Build manifest not found. Run "npm run build" first.');
    return null;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return manifest;
}

function analyzeBundle() {
  console.log('📦 Bundle Size Analysis');
  console.log('═'.repeat(60));

  // Check if build exists
  if (!fs.existsSync(BUILD_DIR)) {
    console.log('❌ No build found. Please run "npm run build" first.\n');
    return;
  }

  // Analyze static assets
  const chunksDir = path.join(STATIC_DIR, 'chunks');
  const cssDir = path.join(STATIC_DIR, 'css');
  const mediaDir = path.join(STATIC_DIR, 'media');

  const jsSize = getDirectorySize(chunksDir);
  const cssSize = getDirectorySize(cssDir);
  const mediaSize = getDirectorySize(mediaDir);
  const totalSize = jsSize + cssSize + mediaSize;

  console.log('\n📊 Bundle Sizes:');
  console.log('─'.repeat(60));
  console.log(`JavaScript: ${formatBytes(jsSize)}`);
  console.log(`CSS: ${formatBytes(cssSize)}`);
  console.log(`Media: ${formatBytes(mediaSize)}`);
  console.log(`Total: ${formatBytes(totalSize)}`);

  // Analyze build manifest
  const manifest = analyzeBuildManifest();
  
  if (manifest) {
    console.log('\n📄 Pages:');
    console.log('─'.repeat(60));

    const pages = manifest.pages || {};
    for (const [page, files] of Object.entries(pages)) {
      const jsFiles = files.filter(f => f.endsWith('.js'));
      const cssFiles = files.filter(f => f.endsWith('.css'));
      
      let pageJsSize = 0;
      let pageCssSize = 0;

      for (const file of jsFiles) {
        const filePath = path.join(BUILD_DIR, 'static', file);
        if (fs.existsSync(filePath)) {
          pageJsSize += fs.statSync(filePath).size;
        }
      }

      for (const file of cssFiles) {
        const filePath = path.join(BUILD_DIR, 'static', file);
        if (fs.existsSync(filePath)) {
          pageCssSize += fs.statSync(filePath).size;
        }
      }

      console.log(`\n${page}:`);
      console.log(`  JS: ${formatBytes(pageJsSize)}`);
      console.log(`  CSS: ${formatBytes(pageCssSize)}`);
      console.log(`  Total: ${formatBytes(pageJsSize + pageCssSize)}`);
    }
  }

  // Performance thresholds
  console.log('\n\n🎯 Performance Thresholds:');
  console.log('─'.repeat(60));

  const jsThreshold = 500 * 1024; // 500 KB
  const cssThreshold = 100 * 1024; // 100 KB

  const jsStatus = jsSize < jsThreshold ? '✅ PASS' : '❌ FAIL';
  const cssStatus = cssSize < cssThreshold ? '✅ PASS' : '❌ FAIL';

  console.log(`JavaScript: ${formatBytes(jsSize)} / ${formatBytes(jsThreshold)} ${jsStatus}`);
  console.log(`CSS: ${formatBytes(cssSize)} / ${formatBytes(cssThreshold)} ${cssStatus}`);

  // Recommendations
  console.log('\n\n💡 Recommendations:');
  console.log('─'.repeat(60));

  if (jsSize > jsThreshold) {
    console.log('⚠️  JavaScript bundle exceeds threshold:');
    console.log('   - Review and remove unused dependencies');
    console.log('   - Implement more aggressive code splitting');
    console.log('   - Use dynamic imports for heavy components');
    console.log('   - Consider lazy loading non-critical features');
  } else {
    console.log('✅ JavaScript bundle size is within acceptable limits');
  }

  if (cssSize > cssThreshold) {
    console.log('\n⚠️  CSS bundle exceeds threshold:');
    console.log('   - Verify Tailwind CSS purging is working');
    console.log('   - Remove unused CSS');
    console.log('   - Consider CSS modules for component styles');
  } else {
    console.log('✅ CSS bundle size is within acceptable limits');
  }

  console.log('\n' + '═'.repeat(60) + '\n');

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    bundles: {
      javascript: { size: jsSize, formatted: formatBytes(jsSize) },
      css: { size: cssSize, formatted: formatBytes(cssSize) },
      media: { size: mediaSize, formatted: formatBytes(mediaSize) },
      total: { size: totalSize, formatted: formatBytes(totalSize) },
    },
    thresholds: {
      javascript: { limit: jsThreshold, passed: jsSize < jsThreshold },
      css: { limit: cssThreshold, passed: cssSize < cssThreshold },
    },
  };

  const reportPath = path.join(__dirname, '..', 'test-results', 'bundle-analysis.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`📄 Report saved to: ${reportPath}\n`);
}

analyzeBundle();
