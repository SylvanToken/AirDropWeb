# GitHub Deployment Kılavuzu

## 🚀 GitHub'da Deploy Etme

Bu kılavuz, Sylvan Token Airdrop platformunu GitHub üzerinden deploy etmek için gereken tüm adımları içerir.

## 📋 İçindekiler

1. [Environment Variables Yönetimi](#environment-variables-yönetimi)
2. [Vercel Deployment](#vercel-deployment)
3. [GitHub Pages (Statik Export)](#github-pages-statik-export)
4. [Netlify Deployment](#netlify-deployment)
5. [Güvenlik Önerileri](#güvenlik-önerileri)

---

## Environment Variables Yönetimi

### ⚠️ ÖNEMLİ: .env Dosyası GitHub'a Yüklenmemeli!

`.env` dosyası zaten `.gitignore` içinde ve GitHub'a yüklenmeyecek. Bu dosya hassas bilgiler içerir:

- Database credentials
- API keys
- Secret keys
- Email passwords
- Admin credentials

### 📝 Environment Variables Listesi

Deployment platformunuzda aşağıdaki environment variables'ları ayarlamanız gerekir:

#### 1. Database (Production)

```bash
# PostgreSQL/Supabase
DATABASE_URL="postgres://username:password@host:5432/database"
```

#### 2. NextAuth

```bash
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret-key-change-this"
```

**NEXTAUTH_SECRET Oluşturma:**
```bash
# Terminal'de çalıştırın:
openssl rand -base64 32
```

#### 3. Admin Credentials

```bash
ADMIN_EMAIL="admin@sylvantoken.org"
ADMIN_PASSWORD="your-secure-password"
```

#### 4. Application

```bash
NODE_ENV="production"
```

#### 5. Email Configuration

```bash
EMAIL_FROM="noreply@sylvantoken.org"
EMAIL_FROM_NAME="Sylvan Token"

# SMTP (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="sylvantoken@gmail.com"
SMTP_PASSWORD="your-app-password"

# Email Settings
EMAIL_ENABLED="true"
EMAIL_RATE_LIMIT_ENABLED="true"

# Resend API
RESEND_API_KEY="your-resend-api-key"
```

#### 6. Supabase Configuration

```bash
SUPABASE_URL="https://fahcabutajczylskmmgw.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_JWT_SECRET="your-jwt-secret"

# Public Keys (client-side)
NEXT_PUBLIC_SUPABASE_URL="https://fahcabutajczylskmmgw.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

#### 7. PostgreSQL Details

```bash
POSTGRES_HOST="db.fahcabutajczylskmmgw.supabase.co"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your-password"
POSTGRES_DATABASE="postgres"
```

#### 8. Telegram Configuration

```bash
TELEGRAM_CHANNEL_ID="-1002857056222"
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_BOT_USERNAME="SylvusBot"
```

#### 9. Cloudflare Turnstile (Bot Protection)

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-site-key"
TURNSTILE_SECRET_KEY="your-secret-key"
TURNSTILE_ENABLED="true"
NEXT_PUBLIC_TURNSTILE_ENABLED="true"
```

#### 10. Token Contract Addresses (BSC)

```bash
TOKEN_DEPLOYER_ADDRESS="0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469"
TOKEN_OWNER_ADDRESS="0x465b54282e4885f61df7eB7CcDc2493DB35C9501"
TOKEN_MAD_ADDRESS="0x58F30f0aAAaF56DaFA93cd03103C3B9f264a999d"
TOKEN_LEB_ADDRESS="0x8df5ec091133fcebc40f964c5c9dda16dd8771b1"
TOKEN_CNK_ADDRESS="0x106A637D825e562168678b7fd0f75cFf2cF2845B"
TOKEN_KDR_ADDRESS="0xaD1EAc033Ff56e7295abDfB46f5A94016D760460"
TOKEN_LOCKED_ADDRESS="0x687A2c7E494c3818c20AD2856d453514970d6aac"
TOKEN_DONATION_ADDRESS="0xa697645Fdfa5d9399eD18A6575256F81343D4e17"
TOKEN_FEE_ADDRESS="0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915"
TOKEN_BURN_ADDRESS="0x000000000000000000000000000000000000dEaD"
```

#### 11. BscScan API

```bash
BSCSCAN_API_KEY="your-bscscan-api-key"
TOKEN_CONTRACT_ADDRESS="0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85"
```

#### 12. Redis (Optional)

```bash
USE_REDIS="false"
# REDIS_URL="redis://localhost:6379"  # Eğer kullanıyorsanız
```

---

## Vercel Deployment

### 1. Vercel'e Proje Yükleme

1. [Vercel](https://vercel.com) hesabınıza giriş yapın
2. "New Project" butonuna tıklayın
3. GitHub repository'nizi seçin
4. "Import" butonuna tıklayın

### 2. Environment Variables Ekleme

Vercel Dashboard'da:

1. **Settings** → **Environment Variables** bölümüne gidin
2. Yukarıdaki tüm environment variables'ları ekleyin
3. Her değişken için:
   - **Name:** Değişken adı (örn: `DATABASE_URL`)
   - **Value:** Değişken değeri
   - **Environment:** Production, Preview, Development seçin

### 3. Build Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### 4. Deploy

1. "Deploy" butonuna tıklayın
2. Build tamamlanana kadar bekleyin
3. Deploy edilen URL'i alın

### 5. Domain Bağlama (Opsiyonel)

1. **Settings** → **Domains** bölümüne gidin
2. Custom domain ekleyin
3. DNS ayarlarını yapın

---

## GitHub Pages (Statik Export)

⚠️ **NOT:** GitHub Pages sadece statik siteler için uygundur. Bu proje API routes ve server-side rendering kullandığı için **GitHub Pages önerilmez**. Vercel veya Netlify kullanın.

Eğer yine de statik export yapmak isterseniz:

### 1. next.config.js Güncelleme

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // API routes çalışmayacak!
}

module.exports = nextConfig
```

### 2. Build ve Export

```bash
npm run build
```

### 3. GitHub Pages Ayarları

1. Repository **Settings** → **Pages**
2. Source: **GitHub Actions** seçin
3. `.github/workflows/deploy.yml` oluşturun:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v2
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v2
        id: deployment
```

---

## Netlify Deployment

### 1. Netlify'a Proje Yükleme

1. [Netlify](https://netlify.com) hesabınıza giriş yapın
2. "New site from Git" butonuna tıklayın
3. GitHub repository'nizi seçin

### 2. Build Settings

```
Build command: npm run build
Publish directory: .next
```

### 3. Environment Variables

1. **Site settings** → **Environment variables**
2. Yukarıdaki tüm environment variables'ları ekleyin

### 4. Deploy

1. "Deploy site" butonuna tıklayın
2. Build tamamlanana kadar bekleyin

---

## Güvenlik Önerileri

### 🔒 Hassas Bilgileri Koruma

1. **Asla `.env` dosyasını GitHub'a yüklemeyin**
   - `.gitignore` dosyasında olduğundan emin olun
   - Commit history'de kontrol edin

2. **Production Secret Keys Oluşturun**
   ```bash
   # Güçlü secret key oluşturma
   openssl rand -base64 32
   ```

3. **Environment Variables'ları Platform'da Saklayın**
   - Vercel: Settings → Environment Variables
   - Netlify: Site settings → Environment variables
   - GitHub Actions: Settings → Secrets and variables

4. **Database Credentials'ları Güvenli Tutun**
   - Production database için ayrı credentials kullanın
   - Development ve production'ı ayırın

5. **API Keys'leri Rotate Edin**
   - Düzenli olarak API keys'leri yenileyin
   - Eski keys'leri devre dışı bırakın

### 🔐 .env.example Dosyası Oluşturma

Takım arkadaşlarınız için bir `.env.example` dosyası oluşturun:

```bash
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_URL="http://localhost:3005"
NEXTAUTH_SECRET="your-secret-key"

# Admin
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-password"

# ... diğer değişkenler
```

### 📝 Checklist

Deploy öncesi kontrol listesi:

- [ ] `.env` dosyası `.gitignore`'da
- [ ] Production database hazır
- [ ] Tüm environment variables platform'da ayarlandı
- [ ] NEXTAUTH_SECRET production için değiştirildi
- [ ] NEXTAUTH_URL production domain'e ayarlandı
- [ ] Admin credentials güvenli
- [ ] Email SMTP ayarları doğru
- [ ] Turnstile production keys kullanılıyor
- [ ] Database migrations çalıştırıldı
- [ ] Build başarılı

---

## 🚨 Sorun Giderme

### Build Hatası

```bash
# Local'de test edin
npm run build

# Hata loglarını kontrol edin
```

### Environment Variables Hatası

```bash
# Tüm gerekli değişkenlerin ayarlandığından emin olun
# Platform dashboard'dan kontrol edin
```

### Database Connection Hatası

```bash
# DATABASE_URL'in doğru olduğundan emin olun
# Supabase/PostgreSQL connection string'i kontrol edin
# IP whitelist ayarlarını kontrol edin
```

### Email Gönderme Hatası

```bash
# SMTP credentials'ları kontrol edin
# Gmail için "App Password" kullanın
# Email rate limiting ayarlarını kontrol edin
```

---

## 📚 Ek Kaynaklar

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🆘 Destek

Sorun yaşarsanız:

1. Build loglarını kontrol edin
2. Environment variables'ları doğrulayın
3. Database connection'ı test edin
4. GitHub Issues'da sorun açın

---

**Son Güncelleme:** 2024
**Versiyon:** 1.0.0
