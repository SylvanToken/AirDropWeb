# Deployment Guide - Test Environment Setup

## Senaryo
Ana sunucuda geri sayaç (index.html) çalışırken, Next.js uygulamasını özel link ile test etmek.

## Yapı
```
https://yourdomain.com/           → index.html (Geri Sayaç - Herkes görür)
https://yourdomain.com/app/       → Next.js Uygulaması (Test için özel link)
```

---

## Adım 1: Test Build Oluşturma

### 1.1 Test için Build
```bash
# Test konfigürasyonu ile build
cp next.config.test.js next.config.js
npm run build
```

### 1.2 Normal Build (Production için)
```bash
# Normal konfigürasyonu geri yükle
git checkout next.config.js
npm run build
```

---

## Adım 2: Nginx Konfigürasyonu

### 2.1 Nginx Config Dosyası Oluştur
```bash
sudo nano /etc/nginx/sites-available/sylvan-token
```

### 2.2 Konfigürasyon İçeriği
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Ana sayfa - Geri Sayaç (index.html)
    location = / {
        root /var/www/countdown;
        index index.html;
        try_files $uri $uri/ =404;
    }

    # Geri sayaç için static dosyalar
    location ~ ^/(css|js|images|assets)/ {
        root /var/www/countdown;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js Uygulaması - /app altında
    location /app {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_read_timeout 86400;
    }

    # Next.js static files
    location /_next/ {
        proxy_pass http://localhost:3000/_next/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Cache static files
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js public files
    location /app/assets/ {
        proxy_pass http://localhost:3000/app/assets/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # Cache static files
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}

# HTTPS redirect (SSL kurulumundan sonra)
# server {
#     listen 80;
#     server_name yourdomain.com www.yourdomain.com;
#     return 301 https://$server_name$request_uri;
# }

# SSL Configuration (Certbot ile otomatik eklenecek)
# server {
#     listen 443 ssl http2;
#     server_name yourdomain.com www.yourdomain.com;
#     
#     ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
#     
#     # ... yukarıdaki location blokları buraya gelecek
# }
```

### 2.3 Nginx'i Aktifleştir
```bash
# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/sylvan-token /etc/nginx/sites-enabled/

# Test et
sudo nginx -t

# Yeniden başlat
sudo systemctl restart nginx
```

---

## Adım 3: Geri Sayaç (index.html) Yerleştirme

### 3.1 Dizin Oluştur
```bash
sudo mkdir -p /var/www/countdown
sudo chown -R $USER:$USER /var/www/countdown
```

### 3.2 index.html Örneği
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sylvan Token - Coming Soon</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .container {
            text-align: center;
            padding: 2rem;
        }
        
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .countdown {
            display: flex;
            gap: 2rem;
            justify-content: center;
            margin: 3rem 0;
        }
        
        .time-box {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 15px;
            min-width: 120px;
        }
        
        .time-box .number {
            font-size: 3rem;
            font-weight: bold;
            display: block;
        }
        
        .time-box .label {
            font-size: 0.9rem;
            text-transform: uppercase;
            opacity: 0.8;
            margin-top: 0.5rem;
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌿 Sylvan Token</h1>
        <p class="subtitle">Something amazing is coming...</p>
        
        <div class="countdown">
            <div class="time-box">
                <span class="number" id="days">00</span>
                <span class="label">Days</span>
            </div>
            <div class="time-box">
                <span class="number" id="hours">00</span>
                <span class="label">Hours</span>
            </div>
            <div class="time-box">
                <span class="number" id="minutes">00</span>
                <span class="label">Minutes</span>
            </div>
            <div class="time-box">
                <span class="number" id="seconds">00</span>
                <span class="label">Seconds</span>
            </div>
        </div>
        
        <p class="subtitle">Stay tuned for updates!</p>
    </div>

    <script>
        // Hedef tarih (örnek: 30 gün sonra)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 30);

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                document.querySelector('.countdown').innerHTML = '<h2>We are live!</h2>';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    </script>
</body>
</html>
```

### 3.3 Dosyayı Yerleştir
```bash
# index.html'i kopyala
cp /path/to/your/index.html /var/www/countdown/

# İzinleri ayarla
sudo chown -R www-data:www-data /var/www/countdown
sudo chmod -R 755 /var/www/countdown
```

---

## Adım 4: Next.js Uygulamasını Çalıştırma

### 4.1 PM2 ile Başlat
```bash
# Proje dizinine git
cd /path/to/your/nextjs/project

# PM2 ile başlat
pm2 start npm --name "sylvan-app" -- start

# Otomatik başlatma
pm2 startup
pm2 save
```

### 4.2 PM2 Komutları
```bash
# Durumu kontrol et
pm2 status

# Logları görüntüle
pm2 logs sylvan-app

# Yeniden başlat
pm2 restart sylvan-app

# Durdur
pm2 stop sylvan-app

# Sil
pm2 delete sylvan-app
```

---

## Adım 5: Test Etme

### 5.1 Erişim Kontrolleri
```bash
# Ana sayfa (geri sayaç)
curl -I http://yourdomain.com/

# Next.js uygulaması
curl -I http://yourdomain.com/app/

# API endpoint
curl http://yourdomain.com/app/api/health
```

### 5.2 Tarayıcıdan Test
```
✅ https://yourdomain.com/           → Geri sayaç görünmeli
✅ https://yourdomain.com/app/       → Next.js uygulaması açılmalı
✅ https://yourdomain.com/app/login  → Login sayfası çalışmalı
```

---

## Adım 6: SSL Kurulumu (Opsiyonel ama Önerilen)

### 6.1 Certbot Kurulumu
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### 6.2 SSL Sertifikası Al
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 6.3 Otomatik Yenileme
```bash
# Test et
sudo certbot renew --dry-run

# Cron job otomatik eklenir
```

---

## Adım 7: Monitoring ve Bakım

### 7.1 Log Dosyaları
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs sylvan-app

# System logs
sudo journalctl -u nginx -f
```

### 7.2 Performans İzleme
```bash
# PM2 monitoring
pm2 monit

# Sistem kaynakları
htop
```

---

## Deployment Script

### deploy-test.sh
```bash
#!/bin/bash

echo "🚀 Deploying Sylvan Token (Test Mode)..."

# 1. Test konfigürasyonunu kullan
echo "📝 Using test configuration..."
cp next.config.test.js next.config.js

# 2. Dependencies yükle
echo "📦 Installing dependencies..."
npm ci

# 3. Build
echo "🔨 Building application..."
npm run build

# 4. PM2'yi yeniden başlat
echo "🔄 Restarting PM2..."
pm2 restart sylvan-app || pm2 start npm --name "sylvan-app" -- start

# 5. Nginx'i yeniden yükle
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 Test URL: https://yourdomain.com/app"
```

### Kullanım
```bash
chmod +x deploy-test.sh
./deploy-test.sh
```

---

## Sorun Giderme

### Problem: /app yolu 404 veriyor
```bash
# Nginx konfigürasyonunu kontrol et
sudo nginx -t

# PM2 durumunu kontrol et
pm2 status

# Logları kontrol et
pm2 logs sylvan-app --lines 100
```

### Problem: Static dosyalar yüklenmiyor
```bash
# Next.js build'i kontrol et
ls -la .next/

# Nginx cache'i temizle
sudo rm -rf /var/cache/nginx/*
sudo systemctl restart nginx
```

### Problem: API çalışmıyor
```bash
# Environment variables kontrol et
cat .env.local

# Database bağlantısını test et
npm run db:test
```

---

## Güvenlik Notları

1. **Firewall Ayarları:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Rate Limiting (Nginx):**
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /app/api/ {
    limit_req zone=api burst=20 nodelay;
    # ... diğer ayarlar
}
```

3. **Environment Variables:**
```bash
# .env.local dosyasını güvenli tut
chmod 600 .env.local
```

---

## Özet

✅ **Ana sayfa:** Geri sayaç (herkes görür)
✅ **Test URL:** /app altında Next.js (özel link)
✅ **Kolay geçiş:** Production'a geçerken sadece basePath'i kaldır
✅ **Güvenli:** Nginx reverse proxy ile korumalı
✅ **Ölçeklenebilir:** PM2 ile process yönetimi

**Test için paylaşılacak link:**
```
https://yourdomain.com/app
```

**Production'a geçiş için:**
1. `next.config.js`'den `basePath` ve `assetPrefix`'i kaldır
2. Nginx'de `/app` location'ını `/` olarak değiştir
3. Geri sayaç index.html'i kaldır veya taşı
