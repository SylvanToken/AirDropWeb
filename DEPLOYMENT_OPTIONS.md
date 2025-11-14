# Deployment Options - Sylvan Token

Bu rehber, Sylvan Token uygulamasını farklı platformlara nasıl deploy edeceğinizi açıklar.

---

## 📋 İçindekiler

1. [Kendi Sunucunuza Deployment (VPS)](#1-kendi-sunucunuza-deployment-vps)
2. [Vercel'e Deployment](#2-vercele-deployment)
3. [Karşılaştırma](#3-karşılaştırma)

---

## 1. Kendi Sunucunuza Deployment (VPS)

### 1.1 Gereksinimler

**Minimum Sunucu Özellikleri:**
- **CPU:** 2 Core
- **RAM:** 4 GB
- **Disk:** 20 GB SSD
- **OS:** Ubuntu 20.04 LTS veya üzeri
- **Network:** 100 Mbps

**Önerilen Sunucu Özellikleri:**
- **CPU:** 4 Core
- **RAM:** 8 GB
- **Disk:** 40 GB SSD
- **OS:** Ubuntu 22.04 LTS
- **Network:** 1 Gbps

### 1.2 Sunucu Hazırlığı

#### Adım 1: Sunucuya Bağlan
```bash
ssh root@your-server-ip
```

#### Adım 2: Sistem Güncellemesi
```bash
sudo apt update && sudo apt upgrade -y
```

#### Adım 3: Node.js Kurulumu
```bash
# NodeSource repository ekle (Node.js 20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js ve npm kur
sudo apt install -y nodejs

# Versiyonları kontrol et
node --version  # v20.x.x olmalı
npm --version   # 10.x.x olmalı
```

#### Adım 4: PostgreSQL Kurulumu
```bash
# PostgreSQL kur
sudo apt install -y postgresql postgresql-contrib

# PostgreSQL'i başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL kullanıcısı oluştur
sudo -u postgres psql

# PostgreSQL içinde:
CREATE DATABASE sylvan_token;
CREATE USER sylvan_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sylvan_token TO sylvan_user;
\q
```

#### Adım 5: Nginx Kurulumu
```bash
# Nginx kur
sudo apt install -y nginx

# Nginx'i başlat
sudo systemctl start nginx
sudo systemctl enable nginx

# Firewall ayarları
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

#### Adım 6: PM2 Kurulumu
```bash
# PM2'yi global olarak kur
sudo npm install -g pm2

# PM2'yi sistem başlangıcına ekle
pm2 startup systemd
# Çıkan komutu çalıştır
```

#### Adım 7: Git Kurulumu
```bash
sudo apt install -y git
```

### 1.3 Proje Deployment

#### Adım 1: Proje Dizini Oluştur
```bash
# Uygulama dizini oluştur
sudo mkdir -p /var/www/sylvan-token
sudo chown -R $USER:$USER /var/www/sylvan-token
cd /var/www/sylvan-token
```

#### Adım 2: Projeyi Klonla
```bash
# GitHub'dan klonla (private repo için SSH key gerekli)
git clone https://github.com/your-username/sylvan-token.git .

# Veya dosyaları manuel olarak yükle
# scp -r /local/path/* user@server:/var/www/sylvan-token/
```

#### Adım 3: Environment Variables Ayarla
```bash
# .env.local dosyası oluştur
nano .env.local
```

**`.env.local` içeriği:**
```env
# Database
DATABASE_URL="postgresql://sylvan_user:your_secure_password@localhost:5432/sylvan_token"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long"

# Email (Resend)
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="noreply@yourdomain.com"

# Twitter OAuth (Opsiyonel)
TWITTER_CLIENT_ID="your_twitter_client_id"
TWITTER_CLIENT_SECRET="your_twitter_client_secret"

# Cloudflare Turnstile (Opsiyonel)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your_site_key"
TURNSTILE_SECRET_KEY="your_secret_key"
NEXT_PUBLIC_TURNSTILE_ENABLED="false"

# App Settings
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

```bash
# Dosya izinlerini güvenli yap
chmod 600 .env.local
```

#### Adım 4: Dependencies Yükle
```bash
npm ci --production=false
```

#### Adım 5: Prisma Setup
```bash
# Prisma client oluştur
npx prisma generate

# Database migration
npx prisma migrate deploy

# (Opsiyonel) Seed data
npx prisma db seed
```

#### Adım 6: Build
```bash
# Test için (basePath: '/app' ile)
cp next.config.test.js next.config.js
npm run build

# Veya Production için (basePath yok)
npm run build
```

#### Adım 7: PM2 ile Başlat
```bash
# Uygulamayı başlat
pm2 start npm --name "sylvan-app" -- start

# Cluster mode (önerilen)
pm2 start npm --name "sylvan-app" -i max -- start

# Kaydet
pm2 save

# Durumu kontrol et
pm2 status
pm2 logs sylvan-app
```

### 1.4 Nginx Konfigürasyonu

#### Test Ortamı için:
```bash
sudo nano /etc/nginx/sites-available/sylvan-token
```

**İçerik:** (DEPLOYMENT_GUIDE.md'deki Nginx config'i kullan)

```bash
# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/sylvan-token /etc/nginx/sites-enabled/

# Test et
sudo nginx -t

# Yeniden başlat
sudo systemctl restart nginx
```

### 1.5 SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kur
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

### 1.6 Monitoring ve Bakım

```bash
# PM2 monitoring
pm2 monit

# Logları görüntüle
pm2 logs sylvan-app

# Yeniden başlat
pm2 restart sylvan-app

# Sistem kaynakları
htop
```

---

## 2. Vercel'e Deployment

### 2.1 Avantajlar ve Dezavantajlar

**✅ Avantajlar:**
- Kolay ve hızlı deployment
- Otomatik SSL
- Global CDN
- Otomatik scaling
- Git entegrasyonu
- Ücretsiz plan (hobby)

**❌ Dezavantajlar:**
- Serverless fonksiyonlar (10 sn timeout)
- Database ayrı host gerekli
- Daha az kontrol
- Maliyet (yüksek trafik için)

### 2.2 Gereksinimler

1. **Vercel Hesabı:** https://vercel.com/signup
2. **GitHub/GitLab/Bitbucket Hesabı**
3. **External Database:** (Vercel Postgres, Supabase, PlanetScale, vb.)

### 2.3 Database Seçenekleri

#### Seçenek 1: Vercel Postgres (Önerilen)
```bash
# Vercel dashboard'dan:
# Storage → Create Database → Postgres
# Connection string'i kopyala
```

#### Seçenek 2: Supabase (Ücretsiz)
```bash
# https://supabase.com
# New Project → Database Settings
# Connection string'i kopyala
```

#### Seçenek 3: PlanetScale (Ücretsiz)
```bash
# https://planetscale.com
# New Database → Connection Strings
# Prisma format'ı seç
```

### 2.4 Vercel Deployment Adımları

#### Adım 1: Vercel CLI Kurulumu (Opsiyonel)
```bash
npm install -g vercel
```

#### Adım 2: GitHub'a Push
```bash
# Projeyi GitHub'a push et
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/sylvan-token.git
git push -u origin main
```

#### Adım 3: Vercel'e Import

**Web Interface ile:**
1. https://vercel.com/new adresine git
2. "Import Git Repository" seç
3. GitHub repository'nizi seçin
4. "Import" tıklayın

**CLI ile:**
```bash
cd /path/to/your/project
vercel
# Soruları cevapla
```

#### Adım 4: Environment Variables Ayarla

Vercel Dashboard → Project → Settings → Environment Variables

**Eklenecek Variables:**
```
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key
NEXT_PUBLIC_TURNSTILE_ENABLED=false
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

#### Adım 5: Build Settings

Vercel otomatik olarak algılar, ama manuel ayarlamak isterseniz:

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm ci
```

**Development Command:**
```bash
npm run dev
```

#### Adım 6: Database Migration

**Vercel'de Prisma kullanımı için:**

1. `package.json`'a script ekle:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

2. Vercel Build Settings'de:
   - Build Command: `npm run vercel-build`

#### Adım 7: Custom Domain (Opsiyonel)

Vercel Dashboard → Project → Settings → Domains

1. "Add Domain" tıkla
2. Domain'inizi girin (örn: yourdomain.com)
3. DNS kayıtlarını güncelleyin:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 2.5 Vercel Deployment Workflow

```bash
# Her push otomatik deploy tetikler
git add .
git commit -m "Update feature"
git push origin main

# Vercel otomatik olarak:
# 1. Build yapar
# 2. Test eder
# 3. Deploy eder
# 4. URL verir
```

### 2.6 Vercel Preview Deployments

```bash
# Feature branch oluştur
git checkout -b feature/new-feature

# Değişiklikleri yap ve push et
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Vercel otomatik preview URL oluşturur
# Örnek: https://sylvan-token-git-feature-new-feature-username.vercel.app
```

### 2.7 Vercel CLI Komutları

```bash
# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod

# Environment variables listele
vercel env ls

# Environment variable ekle
vercel env add DATABASE_URL

# Logları görüntüle
vercel logs

# Domain ekle
vercel domains add yourdomain.com

# Proje bilgisi
vercel inspect
```

---

## 3. Karşılaştırma

### 3.1 Özellik Karşılaştırması

| Özellik | VPS (Kendi Sunucu) | Vercel |
|---------|-------------------|--------|
| **Kurulum Kolaylığı** | ⭐⭐ Orta | ⭐⭐⭐⭐⭐ Çok Kolay |
| **Maliyet (Başlangıç)** | $5-20/ay | Ücretsiz |
| **Maliyet (Yüksek Trafik)** | Sabit | Değişken (pahalı) |
| **Kontrol** | ⭐⭐⭐⭐⭐ Tam | ⭐⭐ Sınırlı |
| **Performans** | ⭐⭐⭐⭐ İyi | ⭐⭐⭐⭐⭐ Mükemmel |
| **Scaling** | Manuel | Otomatik |
| **SSL** | Manuel (Let's Encrypt) | Otomatik |
| **CDN** | Ayrı kurulum | Dahil |
| **Database** | Dahil | Ayrı (ücretli) |
| **Bakım** | Manuel | Otomatik |
| **Deployment** | Manuel/Script | Git push |
| **Monitoring** | Kendin kur | Dahil |
| **Logs** | PM2/Nginx | Dashboard |
| **Rollback** | Manuel | 1 tık |

### 3.2 Maliyet Karşılaştırması

#### VPS (Örnek: DigitalOcean, Hetzner, Linode)

**Başlangıç:**
- Droplet/VPS: $12/ay (4GB RAM, 2 CPU)
- Domain: $10-15/yıl
- **Toplam:** ~$13/ay

**Orta Ölçek:**
- Droplet/VPS: $24/ay (8GB RAM, 4 CPU)
- Domain: $10-15/yıl
- **Toplam:** ~$25/ay

**Avantaj:** Sabit maliyet, trafik sınırı yok

#### Vercel

**Hobby Plan (Ücretsiz):**
- 100 GB bandwidth/ay
- Serverless function: 100 GB-Saat
- 1000 build dakikası/ay
- **Maliyet:** $0

**Pro Plan:**
- $20/ay (kullanıcı başına)
- 1 TB bandwidth/ay
- Serverless function: 1000 GB-Saat
- **Maliyet:** $20/ay + aşım ücretleri

**Enterprise:**
- Custom pricing
- Unlimited bandwidth
- **Maliyet:** $$$

**Ek Maliyetler:**
- Vercel Postgres: $20/ay (başlangıç)
- Veya Supabase: Ücretsiz (2GB)

### 3.3 Hangi Seçenek Size Uygun?

#### VPS Seçin Eğer:
- ✅ Tam kontrol istiyorsanız
- ✅ Sabit maliyet tercih ediyorsanız
- ✅ Yüksek trafik bekliyorsanız
- ✅ Custom server konfigürasyonu gerekiyorsa
- ✅ Database'i aynı sunucuda istiyorsanız
- ✅ Teknik bilginiz varsa

#### Vercel Seçin Eğer:
- ✅ Hızlı başlamak istiyorsanız
- ✅ Sunucu yönetimi istemiyorsanız
- ✅ Otomatik scaling istiyorsanız
- ✅ Global CDN önemliyse
- ✅ Düşük-orta trafik bekliyorsanız
- ✅ Git workflow tercih ediyorsanız

---

## 4. Hibrit Yaklaşım (Önerilen)

### 4.1 Test: Vercel
```
- Hızlı test ve geliştirme
- Preview deployments
- Ücretsiz
```

### 4.2 Production: VPS
```
- Tam kontrol
- Sabit maliyet
- Yüksek performans
```

### 4.3 Kurulum

**1. Vercel'de Test:**
```bash
# Feature branch'leri Vercel'e push et
git push origin feature/new-feature
# Otomatik preview URL alırsınız
```

**2. VPS'de Production:**
```bash
# Main branch'i VPS'e deploy et
ssh user@your-server
cd /var/www/sylvan-token
git pull origin main
npm run build
pm2 restart sylvan-app
```

---

## 5. Deployment Checklist

### Deployment Öncesi
- [ ] Environment variables hazır
- [ ] Database kuruldu ve erişilebilir
- [ ] Domain DNS ayarları yapıldı
- [ ] SSL sertifikası hazır (VPS için)
- [ ] Email servisi (Resend) aktif
- [ ] Tüm testler başarılı

### VPS Deployment
- [ ] Sunucu hazır (Node.js, PostgreSQL, Nginx, PM2)
- [ ] Proje klonlandı
- [ ] Dependencies yüklendi
- [ ] Prisma migration yapıldı
- [ ] Build başarılı
- [ ] PM2 ile başlatıldı
- [ ] Nginx konfigüre edildi
- [ ] SSL kuruldu
- [ ] Firewall ayarlandı

### Vercel Deployment
- [ ] GitHub'a push edildi
- [ ] Vercel'e import edildi
- [ ] Environment variables eklendi
- [ ] Database bağlantısı test edildi
- [ ] Build başarılı
- [ ] Custom domain eklendi (opsiyonel)
- [ ] DNS ayarları yapıldı

### Deployment Sonrası
- [ ] Ana sayfa açılıyor
- [ ] Login/Register çalışıyor
- [ ] Database bağlantısı çalışıyor
- [ ] Email gönderimi çalışıyor
- [ ] API endpoints çalışıyor
- [ ] SSL aktif (HTTPS)
- [ ] Monitoring kuruldu
- [ ] Backup planı hazır

---

## 6. Yardımcı Kaynaklar

### VPS Sağlayıcılar
- **DigitalOcean:** https://www.digitalocean.com (Kolay, iyi dokümantasyon)
- **Hetzner:** https://www.hetzner.com (Ucuz, Avrupa)
- **Linode:** https://www.linode.com (Güvenilir)
- **Vultr:** https://www.vultr.com (Global)

### Database Sağlayıcılar
- **Vercel Postgres:** https://vercel.com/storage/postgres
- **Supabase:** https://supabase.com (Ücretsiz plan)
- **PlanetScale:** https://planetscale.com (Ücretsiz plan)
- **Railway:** https://railway.app (Kolay)

### Monitoring
- **Vercel Analytics:** Dahil
- **PM2 Plus:** https://pm2.io (VPS için)
- **Sentry:** https://sentry.io (Error tracking)
- **LogRocket:** https://logrocket.com (Session replay)

---

## 7. Sonuç

### Önerilen Yaklaşım:

**Başlangıç (İlk 3 Ay):**
```
Vercel (Ücretsiz) + Supabase (Ücretsiz)
= $0/ay
```

**Büyüme (3-12 Ay):**
```
VPS ($12-24/ay) + Kendi Database
= $12-24/ay (sabit)
```

**Ölçeklendirme (12+ Ay):**
```
VPS Cluster + Load Balancer + CDN
= $50-100/ay
```

Her iki seçenek için de detaylı rehberler hazırladım. Hangi yöntemi tercih ederseniz edin, başarılı bir deployment için tüm adımlar mevcut! 🚀
