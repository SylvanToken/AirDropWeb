/**
 * Documentation Translation Script
 * Translates Turkish content in documentation files to English
 */

const fs = require('fs');
const path = require('path');

// Translation glossary
const glossary: Record<string, string> = {
  // Common terms
  'Adım': 'Step',
  'Kılavuz': 'Guide',
  'Türkçe': 'Turkish',
  'Anladım': 'Understood',
  'Genel Bakış': 'Overview',
  'Özet': 'Summary',
  'Önemli': 'Important',
  'Dikkat': 'Attention',
  'Hazırlanan Dosyalar': 'Prepared Files',
  'Özel Erişim Anahtarınız': 'Your Special Access Key',
  'Özel key kontrolü': 'Special key control',
  'Geri sayaç': 'Countdown',
  'Geri sayaç sayfası': 'Countdown page',
  'Git ignore dosyası': 'Git ignore file',
  'Environment variables örneği': 'Environment variables example',
  
  // Actions
  'Yükleme': 'Upload',
  'Oluşturma': 'Creation',
  'Ayarla': 'Configure',
  'Ekle': 'Add',
  'Güncelle': 'Update',
  'Test Et': 'Test',
  'Kontrol Et': 'Check',
  'Yükle': 'Upload',
  
  // Status
  'Başarılı': 'Successful',
  'Hata': 'Error',
  'Tamamlandı': 'Complete',
  'Hazır': 'Ready',
  
  // Common phrases
  'Bu anahtarı güvenli bir yerde saklayın': 'Keep this key in a safe place',
  'Mevcut Repo\'nuza Yükleme': 'Upload to Your Existing Repo',
  'Yeni Repo Oluşturma': 'Create New Repo',
  'Eğer zaten bir GitHub repo\'nuz varsa': 'If you already have a GitHub repo',
  'Eğer yeni bir repo oluşturacaksanız': 'If you will create a new repo',
  'Vercel Konfigürasyonu': 'Vercel Configuration',
  'Kullanım': 'Usage',
  'Normal Kullanıcılar': 'Normal Users',
  'Geri Sayaç': 'Countdown',
  'Test Erişimi': 'Test Access',
  'Sorun Giderme': 'Troubleshooting',
  'Hızlı Komutlar': 'Quick Commands',
  'Sonuç': 'Result',
  'Detaylar için': 'For details',
};

// Files to translate
const filesToTranslate = [
  'VERCEL_CLOUDFLARE_DOMAIN.md',
  'QUICK_START.md',
  'PRODUCTION_MIGRATION_GUIDE.md',
  'GITHUB_DEPLOYMENT_GUIDE.md',
  'FINAL_DEPLOYMENT_SUMMARY.md',
  'SIMPLE_TEST_DEPLOYMENT.md',
  'VERCEL_DEPLOYMENT_GUIDE.md',
];

console.log('Documentation translation script');
console.log('This script helps identify Turkish content for manual translation');
console.log('Files to review:', filesToTranslate.join(', '));
