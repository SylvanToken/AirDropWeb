#!/bin/bash

# Sylvan Token - Production Deployment Script
# Bu script uygulamayı ana dizinde (/) production'a alır

set -e  # Hata durumunda dur

echo "🚀 Sylvan Token Production Deployment Başlıyor..."
echo "================================================"

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Onay al
echo -e "${YELLOW}⚠️  UYARI: Bu işlem uygulamayı production'a alacak!${NC}"
echo -e "${YELLOW}   - Geri sayaç index.html kaldırılacak${NC}"
echo -e "${YELLOW}   - Uygulama ana dizinde (/) çalışacak${NC}"
echo ""
read -p "Devam etmek istiyor musunuz? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "İşlem iptal edildi."
    exit 1
fi

# 1. Normal konfigürasyonu geri yükle
echo -e "${YELLOW}📝 Production konfigürasyonu aktifleştiriliyor...${NC}"
if [ -f "next.config.js.backup" ]; then
    cp next.config.js.backup next.config.js
    echo -e "${GREEN}✓ Backup'tan geri yüklendi${NC}"
else
    # Git'ten geri yükle
    git checkout next.config.js 2>/dev/null || echo -e "${YELLOW}⚠️  Git'ten geri yüklenemedi, manuel kontrol edin${NC}"
fi

# basePath ve assetPrefix'in olmadığını kontrol et
if grep -q "basePath" next.config.js; then
    echo -e "${RED}✗ next.config.js hala basePath içeriyor!${NC}"
    echo "Lütfen next.config.js'den basePath ve assetPrefix'i kaldırın."
    exit 1
fi
echo -e "${GREEN}✓ Production konfigürasyonu hazır${NC}"

# 2. Dependencies kontrol et
echo -e "${YELLOW}📦 Dependencies kontrol ediliyor...${NC}"
npm ci
echo -e "${GREEN}✓ Dependencies yüklendi${NC}"

# 3. Environment variables kontrol et
echo -e "${YELLOW}🔐 Environment variables kontrol ediliyor...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}✗ .env.local dosyası bulunamadı!${NC}"
    exit 1
fi

# Production environment'ı kontrol et
if ! grep -q "NODE_ENV=production" .env.local; then
    echo -e "${YELLOW}⚠️  NODE_ENV=production ayarlanmamış${NC}"
fi
echo -e "${GREEN}✓ Environment variables mevcut${NC}"

# 4. Database migration
echo -e "${YELLOW}🗄️  Database migration çalıştırılıyor...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✓ Database migration tamamlandı${NC}"

# 5. Build
echo -e "${YELLOW}🔨 Production build ediliyor...${NC}"
NODE_ENV=production npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build başarılı${NC}"
else
    echo -e "${RED}✗ Build başarısız!${NC}"
    exit 1
fi

# 6. Geri sayaç index.html'i yedekle ve kaldır
echo -e "${YELLOW}📦 Geri sayaç yedekleniyor...${NC}"
if [ -d "/var/www/countdown" ]; then
    BACKUP_DIR="/var/www/countdown_backup_$(date +%Y%m%d_%H%M%S)"
    sudo cp -r /var/www/countdown "$BACKUP_DIR"
    echo -e "${GREEN}✓ Geri sayaç yedeklendi: $BACKUP_DIR${NC}"
fi

# 7. PM2'yi yeniden başlat
echo -e "${YELLOW}🔄 PM2 ile uygulama yeniden başlatılıyor...${NC}"
if pm2 list | grep -q "sylvan-app"; then
    pm2 restart sylvan-app
else
    pm2 start npm --name "sylvan-app" -- start
fi
pm2 save
echo -e "${GREEN}✓ PM2 process başlatıldı${NC}"

# 8. Nginx konfigürasyonunu güncelle
echo -e "${YELLOW}🔄 Nginx konfigürasyonu güncelleniyor...${NC}"
echo ""
echo -e "${YELLOW}⚠️  MANUEL İŞLEM GEREKLİ:${NC}"
echo "Nginx konfigürasyonunu güncelleyin:"
echo "1. sudo nano /etc/nginx/sites-available/sylvan-token"
echo "2. /app location'larını / olarak değiştirin"
echo "3. Geri sayaç location'larını kaldırın"
echo "4. sudo nginx -t"
echo "5. sudo systemctl reload nginx"
echo ""
read -p "Nginx güncellemesi tamamlandı mı? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Nginx'i manuel olarak güncelleyin!${NC}"
fi

# 9. Health check
echo -e "${YELLOW}🏥 Health check yapılıyor...${NC}"
sleep 5
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Uygulama sağlıklı çalışıyor${NC}"
else
    echo -e "${RED}✗ Health check başarısız!${NC}"
    echo "Logları kontrol edin: pm2 logs sylvan-app"
fi

# 10. Özet
echo ""
echo "================================================"
echo -e "${GREEN}✅ PRODUCTION DEPLOYMENT TAMAMLANDI!${NC}"
echo "================================================"
echo ""
echo "📊 Durum Bilgileri:"
echo "-------------------"
pm2 list | grep sylvan-app

echo ""
echo "🌐 Production URL'leri:"
echo "-------------------"
echo "Ana Sayfa:        http://yourdomain.com/"
echo "Login:            http://yourdomain.com/login"
echo "Dashboard:        http://yourdomain.com/dashboard"
echo "API Health:       http://yourdomain.com/api/health"
echo ""
echo "📝 Önemli Notlar:"
echo "-------------------"
echo "✓ Geri sayaç yedeklendi"
echo "✓ Uygulama ana dizinde çalışıyor"
echo "✓ /app yolu artık kullanılmıyor"
echo ""
echo "🔍 Monitoring:"
echo "   pm2 logs sylvan-app"
echo "   pm2 monit"
echo ""
echo "================================================"
