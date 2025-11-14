#!/bin/bash

# Sylvan Token - Test Deployment Script
# Bu script uygulamayı /app altında test için deploy eder

set -e  # Hata durumunda dur

echo "🚀 Sylvan Token Test Deployment Başlıyor..."
echo "================================================"

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Test konfigürasyonunu kullan
echo -e "${YELLOW}📝 Test konfigürasyonu aktifleştiriliyor...${NC}"
if [ -f "next.config.test.js" ]; then
    cp next.config.test.js next.config.js
    echo -e "${GREEN}✓ Test konfigürasyonu kopyalandı${NC}"
else
    echo -e "${RED}✗ next.config.test.js bulunamadı!${NC}"
    exit 1
fi

# 2. Dependencies kontrol et
echo -e "${YELLOW}📦 Dependencies kontrol ediliyor...${NC}"
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi
echo -e "${GREEN}✓ Dependencies yüklendi${NC}"

# 3. Environment variables kontrol et
echo -e "${YELLOW}🔐 Environment variables kontrol ediliyor...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}⚠️  .env.local dosyası bulunamadı!${NC}"
    echo "Lütfen .env.local dosyasını oluşturun."
    exit 1
fi
echo -e "${GREEN}✓ Environment variables mevcut${NC}"

# 4. Database migration (opsiyonel)
echo -e "${YELLOW}🗄️  Database migration kontrol ediliyor...${NC}"
if command -v npx &> /dev/null; then
    npx prisma migrate deploy || echo -e "${YELLOW}⚠️  Migration atlandı${NC}"
fi

# 5. Build
echo -e "${YELLOW}🔨 Uygulama build ediliyor...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build başarılı${NC}"
else
    echo -e "${RED}✗ Build başarısız!${NC}"
    exit 1
fi

# 6. PM2 kontrol et ve yeniden başlat
echo -e "${YELLOW}🔄 PM2 ile uygulama başlatılıyor...${NC}"
if command -v pm2 &> /dev/null; then
    # Mevcut process'i kontrol et
    if pm2 list | grep -q "sylvan-app"; then
        echo "Mevcut process yeniden başlatılıyor..."
        pm2 restart sylvan-app
    else
        echo "Yeni process başlatılıyor..."
        pm2 start npm --name "sylvan-app" -- start
    fi
    
    # PM2'yi kaydet
    pm2 save
    echo -e "${GREEN}✓ PM2 process başlatıldı${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 bulunamadı. Manuel olarak başlatın: npm start${NC}"
fi

# 7. Nginx'i yeniden yükle (opsiyonel)
echo -e "${YELLOW}🔄 Nginx yeniden yükleniyor...${NC}"
if command -v nginx &> /dev/null; then
    sudo systemctl reload nginx && echo -e "${GREEN}✓ Nginx yeniden yüklendi${NC}" || echo -e "${YELLOW}⚠️  Nginx yeniden yüklenemedi${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx bulunamadı${NC}"
fi

# 8. Durum kontrolü
echo ""
echo "================================================"
echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo "================================================"
echo ""
echo "📊 Durum Bilgileri:"
echo "-------------------"

# PM2 durumu
if command -v pm2 &> /dev/null; then
    pm2 list | grep sylvan-app || echo "PM2 process bilgisi alınamadı"
fi

echo ""
echo "🌐 Test URL'leri:"
echo "-------------------"
echo "Ana Sayfa (Geri Sayaç): http://localhost/"
echo "Test Uygulaması:        http://localhost/app"
echo "API Health Check:       http://localhost/app/api/health"
echo ""
echo "📝 Logları görüntülemek için:"
echo "   pm2 logs sylvan-app"
echo ""
echo "🔄 Yeniden başlatmak için:"
echo "   pm2 restart sylvan-app"
echo ""
echo "================================================"
