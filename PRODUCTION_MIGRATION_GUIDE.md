# Production Migration Guide

## Test'ten Production'a Geçiş Rehberi

Bu rehber, `/app` altında test edilen uygulamanın ana dizine (`/`) nasıl taşınacağını açıklar.

---

## Geçiş Süreci Özeti

```
TEST:       https://yourdomain.com/app/  → Next.js
            https://yourdomain.com/      → Geri sayaç

            ⬇️ GEÇIŞ ⬇️

PRODUCTION: https://yourdomain.com/      → Next.js (Ana uygulama)
```

---

## Adım 1: Hazırlık

### 1.1 Yedekleme
```bash
# Mevcut durumu yedekle
pm2 save
sudo cp /etc/nginx/sites-available/sylvan-token /etc/nginx/sites-available/sylvan-token.backup

# Geri sayaç yedekleme
sudo cp -r /var/www/countdown /var/www/countdown_backup_$(date +%Y%m%d)
```

### 1.2 Test Kontrolü
```bash
# Tüm testlerin başarılı olduğundan emin olun
# - Kullanıcı kaydı ✓
# - Login/Logout ✓
# - Task tamamlama ✓
# - Wallet bağlama ✓
# - Admin paneli ✓
# - Tüm diller ✓
```

---

## Adım 2: Next.js Konfigürasyonunu Güncelle

### 2.1 Otomatik Yöntem (Önerilen)
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

### 2.2 Manuel Yöntem

**next.config.js'i güncelle:**
```javascript
// ÖNCESİ (Test)
const nextConfig = {
  basePath: '/app',        // ← KALDIR
  assetPrefix: '/app',     // ← KALDIR
  // ... diğer ayarlar
}

// SONRASI (Production)
const nextConfig = {
  // basePath ve assetPrefix yok!
  reactStrictMode: true,
  // ... diğer ayarlar
}
```

**Build yap:**
```bash
npm run build
```

---

## Adım 3: Nginx Konfigürasyonunu Güncelle

### 3.1 Yeni Konfigürasyonu Kopyala
```bash
# Hazır production config'i kullan
sudo cp nginx-production.conf /etc/nginx/sites-available/sylvan-token

# Veya manuel düzenle
sudo nano /etc/nginx/sites-available/sylvan-token
```

### 3.2 Değişiklikler

**ÖNCESİ (Test):**
```nginx
# Ana sayfa - Geri Sayaç
location = / {
    root /var/www/countdown;
    index index.html;
}

# Next.js - /app altında
location /app {
    proxy_pass http://localhost:3000;
}
```

**SONRASI (Production):**
```nginx
# Ana uygulama - Next.js
location / {
    proxy_pass http://localhost:3000;
}

# Geri sayaç location'ları KALDIRILDI
```

### 3.3 Test ve Uygula
```bash
# Syntax kontrolü
sudo nginx -t

# Başarılıysa yeniden yükle
sudo systemctl reload nginx
```

---

## Adım 4: PM2'yi Yeniden Başlat

```bash
# Uygulamayı yeniden başlat
pm2 restart sylvan-app

# Durumu kontrol et
pm2 status

# Logları izle
pm2 logs sylvan-app --lines 50
```

---

## Adım 5: Doğrulama

### 5.1 Health Check
```bash
# API health check
curl http://localhost:3000/api/health

# Ana sayfa
curl -I http://yourdomain.com/

# Login sayfası
curl -I http://yourdomain.com/login
```

### 5.2 Tarayıcıdan Test
```
✅ https://yourdomain.com/           → Ana sayfa (Next.js)
✅ https://yourdomain.com/login      → Login sayfası
✅ https://yourdomain.com/register   → Kayıt sayfası
✅ https://yourdomain.com/dashboard  → Dashboard
✅ https://yourdomain.com/tasks      → Tasks
✅ https://yourdomain.com/app/       → 404 (artık yok)
```

### 5.3 Fonksiyonel Testler
- [ ] Kullanıcı kaydı çalışıyor
- [ ] Login/Logout çalışıyor
- [ ] Task tamamlama çalışıyor
- [ ] Wallet bağlama çalışıyor
- [ ] Leaderboard görüntüleniyor
- [ ] Admin paneli erişilebilir
- [ ] Tüm diller çalışıyor
- [ ] Email gönderimi çalışıyor

---

## Adım 6: Geri Sayaç Temizliği

### 6.1 Geri Sayaç Dosyalarını Kaldır
```bash
# Zaten yedeklendi, artık kaldırılabilir
sudo rm -rf /var/www/countdown

# Veya saklamak isterseniz
sudo mv /var/www/countdown /var/www/countdown_archived
```

---

## Adım 7: DNS ve SSL (Opsiyonel)

### 7.1 SSL Sertifikası Güncelle (Gerekirse)
```bash
# Mevcut sertifika çalışıyorsa gerek yok
# Yeni domain eklendiyse:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 7.2 DNS Kontrolü
```bash
# DNS'in doğru IP'yi gösterdiğinden emin olun
nslookup yourdomain.com
dig yourdomain.com
```

---

## Adım 8: Monitoring ve İzleme

### 8.1 PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Detaylı bilgi
pm2 show sylvan-app

# Logları izle
pm2 logs sylvan-app --lines 100
```

### 8.2 Nginx Logları
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 8.3 Sistem Kaynakları
```bash
# CPU ve Memory kullanımı
htop

# Disk kullanımı
df -h

# Network bağlantıları
netstat -tulpn | grep :3000
```

---

## Rollback Planı (Sorun Çıkarsa)

### Hızlı Geri Dönüş

**1. Nginx'i geri al:**
```bash
sudo cp /etc/nginx/sites-available/sylvan-token.backup /etc/nginx/sites-available/sylvan-token
sudo nginx -t
sudo systemctl reload nginx
```

**2. Geri sayaç'ı geri getir:**
```bash
sudo cp -r /var/www/countdown_backup_* /var/www/countdown
```

**3. Next.js'i test moduna al:**
```bash
cp next.config.test.js next.config.js
npm run build
pm2 restart sylvan-app
```

**4. Durumu kontrol et:**
```bash
pm2 status
curl -I http://yourdomain.com/
curl -I http://yourdomain.com/app/
```

---

## Karşılaşılabilecek Sorunlar

### Problem 1: 404 Hataları
**Sebep:** basePath hala next.config.js'de
**Çözüm:**
```bash
# next.config.js'i kontrol et
grep -n "basePath" next.config.js

# Varsa kaldır ve rebuild
npm run build
pm2 restart sylvan-app
```

### Problem 2: Static Dosyalar Yüklenmiyor
**Sebep:** Nginx cache veya yanlış proxy ayarları
**Çözüm:**
```bash
# Cache temizle
sudo rm -rf /var/cache/nginx/*
sudo systemctl restart nginx

# Build'i kontrol et
ls -la .next/static/
```

### Problem 3: API Çalışmıyor
**Sebep:** Environment variables veya database bağlantısı
**Çözüm:**
```bash
# Environment variables kontrol
cat .env.local

# Database bağlantısını test et
npx prisma db push

# PM2 loglarını kontrol et
pm2 logs sylvan-app --err
```

### Problem 4: Yavaş Yanıt Süreleri
**Sebep:** PM2 cluster mode kullanılmıyor
**Çözüm:**
```bash
# Cluster mode ile başlat
pm2 delete sylvan-app
pm2 start npm --name "sylvan-app" -i max -- start
pm2 save
```

---

## Production Checklist

### Deployment Öncesi
- [ ] Tüm testler başarılı
- [ ] Yedekler alındı
- [ ] Environment variables doğru
- [ ] Database migration tamamlandı
- [ ] SSL sertifikası geçerli
- [ ] DNS ayarları doğru

### Deployment Sırası
- [ ] next.config.js güncellendi (basePath kaldırıldı)
- [ ] Production build yapıldı
- [ ] Nginx konfigürasyonu güncellendi
- [ ] PM2 yeniden başlatıldı
- [ ] Health check başarılı

### Deployment Sonrası
- [ ] Ana sayfa açılıyor
- [ ] Login/Register çalışıyor
- [ ] API endpoints çalışıyor
- [ ] Static dosyalar yükleniyor
- [ ] Database bağlantısı çalışıyor
- [ ] Email gönderimi çalışıyor
- [ ] Monitoring aktif
- [ ] Loglar temiz

---

## Performans Optimizasyonu

### PM2 Cluster Mode
```bash
# CPU çekirdek sayısı kadar instance
pm2 start npm --name "sylvan-app" -i max -- start

# Veya belirli sayıda
pm2 start npm --name "sylvan-app" -i 4 -- start
```

### Nginx Caching
```nginx
# Nginx config'e ekle
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 1h;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    # ... diğer proxy ayarları
}
```

### Database Connection Pooling
```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool ayarları
  connection_limit = 10
}
```

---

## Güvenlik Kontrolleri

### 1. Environment Variables
```bash
# Hassas bilgilerin güvenli olduğundan emin olun
chmod 600 .env.local
```

### 2. Firewall
```bash
# Sadece gerekli portlar açık
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Rate Limiting
```nginx
# Nginx config'de zaten var
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
```

### 4. SSL/TLS
```bash
# SSL Labs test
# https://www.ssllabs.com/ssltest/

# Sertifika yenileme testi
sudo certbot renew --dry-run
```

---

## Özet

### Test Ortamı (Şu An)
```
URL: https://yourdomain.com/app/
Durum: Test için özel link
Geri Sayaç: Ana sayfada aktif
```

### Production Ortamı (Geçiş Sonrası)
```
URL: https://yourdomain.com/
Durum: Herkes için açık
Geri Sayaç: Kaldırıldı/Arşivlendi
```

### Geçiş Komutu
```bash
./deploy-production.sh
```

### Rollback Komutu
```bash
# Nginx backup'ı geri yükle
sudo cp /etc/nginx/sites-available/sylvan-token.backup /etc/nginx/sites-available/sylvan-token
sudo systemctl reload nginx

# Test moduna dön
cp next.config.test.js next.config.js
npm run build
pm2 restart sylvan-app
```

---

## Destek ve Yardım

### Loglar
```bash
# PM2 logs
pm2 logs sylvan-app

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### Monitoring
```bash
# PM2 monitoring
pm2 monit

# Sistem kaynakları
htop
```

### Health Check
```bash
# API health
curl http://localhost:3000/api/health

# Database
npx prisma db push --preview-feature
```

---

**🎉 Production'a geçiş başarıyla tamamlandığında, uygulamanız artık ana domain'de çalışacak!**
