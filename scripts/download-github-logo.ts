/**
 * Download and optimize GitHub logo for email
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';

async function downloadAndOptimizeLogo() {
  console.log('📥 Downloading logo from GitHub...\n');
  
  const githubUrl = 'https://github.com/SylvanToken/SylvanToken/raw/main/assets/images/sylvan-token-logo.png';
  const tempPath = path.join(process.cwd(), 'public', 'images', 'sylvan_logo_github.png');
  const optimizedPath = path.join(process.cwd(), 'public', 'images', 'sylvan_logo_email.png');
  
  return new Promise((resolve, reject) => {
    https.get(githubUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(tempPath);
      response.pipe(fileStream);
      
      fileStream.on('finish', async () => {
        fileStream.close();
        console.log('✅ Downloaded successfully!');
        
        // Get original size
        const originalStats = fs.statSync(tempPath);
        console.log(`📊 Original size: ${(originalStats.size / 1024).toFixed(2)} KB\n`);
        
        // Optimize
        console.log('🔧 Optimizing for email...');
        
        try {
          await sharp(tempPath)
            .resize(96, 96, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png({
              quality: 80,
              compressionLevel: 9,
              palette: true
            })
            .toFile(optimizedPath);
          
          // Get optimized size
          const optimizedStats = fs.statSync(optimizedPath);
          const optimizedSizeKB = (optimizedStats.size / 1024).toFixed(2);
          const reduction = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1);
          
          console.log(`✅ Optimized size: ${optimizedSizeKB} KB`);
          console.log(`📉 Size reduction: ${reduction}%`);
          console.log(`💾 Saved to: ${optimizedPath}\n`);
          
          // Clean up temp file
          fs.unlinkSync(tempPath);
          
          if (optimizedStats.size < 50 * 1024) {
            console.log('✨ Logo is ready for email embedding!');
            console.log('📧 This size is perfect for base64 embedding in emails.');
          }
          
          resolve(optimizedPath);
        } catch (error) {
          reject(error);
        }
      });
      
      fileStream.on('error', (error) => {
        fs.unlinkSync(tempPath);
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

downloadAndOptimizeLogo()
  .then(() => {
    console.log('\n✅ Done!');
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
