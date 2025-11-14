/**
 * Optimize Logo for Email
 * Creates a smaller version of the logo for email embedding
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function optimizeLogo() {
  console.log('🖼️  Optimizing logo for email...\n');
  
  const inputPath = path.join(process.cwd(), 'public', 'images', 'sylvan_logo.png');
  const outputPath = path.join(process.cwd(), 'public', 'images', 'sylvan_logo_email.png');
  
  try {
    // Check if input exists
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Logo file not found:', inputPath);
      process.exit(1);
    }
    
    // Get original size
    const originalStats = fs.statSync(inputPath);
    console.log(`📊 Original size: ${(originalStats.size / 1024).toFixed(2)} KB`);
    
    // Optimize: resize to 96x96 (2x for retina) and compress
    await sharp(inputPath)
      .resize(96, 96, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: 80,
        compressionLevel: 9,
        palette: true
      })
      .toFile(outputPath);
    
    // Get optimized size
    const optimizedStats = fs.statSync(outputPath);
    const optimizedSizeKB = (optimizedStats.size / 1024).toFixed(2);
    const reduction = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1);
    
    console.log(`✅ Optimized size: ${optimizedSizeKB} KB`);
    console.log(`📉 Size reduction: ${reduction}%`);
    console.log(`💾 Saved to: ${outputPath}`);
    
    // Check if size is acceptable for email
    if (optimizedStats.size < 50 * 1024) {
      console.log('\n✨ Logo is ready for email embedding!');
      console.log('📧 This size is perfect for base64 embedding in emails.');
    } else {
      console.log('\n⚠️  Logo is still large, but should work.');
      console.log('💡 Consider using a simpler logo design for emails.');
    }
    
  } catch (error) {
    console.error('❌ Error optimizing logo:', error);
    process.exit(1);
  }
}

optimizeLogo();
