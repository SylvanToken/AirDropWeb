# Vercel Deployment Guide - Test Ortamı

## Mevcut Durum
```
GitHub: index.html (geri sayaç) ✅
Vercel: index.html'e yönlendirilmiş ✅
Database: Hazır ✅
Hedef: Next.js'i /app altında test için deploy et
```

---

## Senaryo: İki Ayrı Repo Yaklaşımı

### Yapı:
```
Repo 1 (Mevcut): index.html (geri sayaç)
  └─ https://yourdomain.com/ → Geri sayaç

Repo 2 (Yeni): Next.js Uygulaması  
  └─ https://test.yourdomain.com/ → Next.js (test için)
```

**VEYA**

```
Repo 1 (Mevcut): index.html (geri sayaç)
  └─ https://yourdomain.com/ → Geri sayaç

Repo 2 (Yeni): Next.js Uygulaması
  └─ https://yourdomain.vercel.app/app/ → Next.js (test için)
```

---

## Çözüm 1: Subdomain ile Test (ÖNERİLEN)

### Adım 1: Yeni GitHub Repo Oluştur

```bash
# Yeni bir repo oluştur (GitHub'da)
# Örnek: sylvan-token-app

# Lokal projenizde
cd /path/to/your/nextjs/project

# Yeni repo'ya bağla
git init
git add .
git commit -m "Initial commit - Next.js app"
git branch -M main
git remote add origin https://github.com/your-username/sylvan-token-app.git
git push -u origin main
```

### Adım 2: Vercel'de Yeni Proje Oluştur

1. https://vercel.com/new
2. "Import Git Repository" seç
3. Yeni oluşturduğunuz `sylvan-token-app` repo'sunu seçin
4. Project Name: `sylvan-token-app`
5. Framework Preset: Next.js (otomatik algılar)
6. Root Directory: `./` (değiştirme)
7. Build Command: `npm run vercel-build`
8. Output Directory: `.next` (otomatik)
9. Install Command: `npm ci`

### Adım 3: Environment Variables Ekle

Vercel Dashboard → Project Settings → Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=https://test.yourdomain.com
NEXTAUTH_SECRET=your-super-secret-32-char-key
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://test.yourdomain.com
```

### Adım 4: Subdomain Ekle

Vercel Dashboard → Project → Settings → Domains

1. "Add Domain" tıkla
2. `test.yourdomain.com` girin
3. DNS kayıtlarını ekle:

```dns
Type: CNAME
Name: test
Value: cname.vercel-dns.com
TTL: 3600
```

### Adım 5: Test Et

```
✅ https://yourdomain.com/ → Geri sayaç (eski repo)
✅ https://test.yourdomain.com/ → Next.js (yeni repo)
```

---

## Çözüm 2: Tek Repo ile Monorepo Yapısı

### Yapı:
```
your-repo/
├── index.html              # Geri sayaç (root'ta kalacak)
├── app/                    # Next.js uygulaması (yeni klasör)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── prisma/
│   ├── public/
│   ├── locales/
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── ...
└── vercel.json             # Routing ayarları
```

### Adım 1: Proje Yapısını Düzenle

```bash
# Mevcut repo'nuza git
cd /path/to/your/github/repo

# Next.js dosyalarını 'app' klasörüne taşı
mkdir app
mv package.json app/
mv next.config.js app/
mv tsconfig.json app/
mv app/ app/app/  # Next.js app directory
mv components/ app/
mv lib/ app/
mv prisma/ app/
mv public/ app/
mv locales/ app/
mv styles/ app/
# ... diğer Next.js dosyaları

# index.html root'ta kalsın
# index.html (geri sayaç) root'ta kalacak
```

### Adım 2: vercel.json Oluştur (Root'ta)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app/package.json",
      "use": "@vercel/next",
      "config": {
        "rootDirectory": "app"
      }
    }
  ],
  "routes": [
    {
      "src": "/app/(.*)",
      "dest": "/app/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Adım 3: next.config.js Güncelle (app/ içinde)

```javascript
// app/next.config.js
const withNextIntl = require('next-intl/plugin')();

const nextConfig = {
  basePath: '/app',
  assetPrefix: '/app',
  // ... diğer ayarlar
}

module.exports = withNextIntl(nextConfig)
```

### Adım 4: GitHub'a Push

```bash
git add .
git commit -m "Add Next.js app in /app directory"
git push origin main
```

### Adım 5: Vercel'de Güncelle

Vercel Dashboard → Project → Settings → General

- Root Directory: `app`
- Build Command: `npm run vercel-build`
- Output Directory: `.next`

---

## Çözüm 3: Basit Yaklaşım - Vercel Subdomain (EN KOLAY)

### Adım 1: Yeni Repo Oluştur ve Push Et

```bash
# Next.js projenizde
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/sylvan-app.git
git push -u origin main
```

### Adım 2: Vercel'e Import Et

1. https://vercel.com/new
2. Repo'yu seçin
3. Deploy

### Adım 3: Otomatik URL Kullan

Vercel otomatik URL verir:
```
https://sylvan-app-username.vercel.app/
```

Bu URL'i test için kullanın!

---

## GitHub'a Yüklenecek Dosyalar Listesi

### ✅ Mutlaka Yüklenecekler:

```
📁 Proje Root
├── 📄 package.json                 ✅
├── 📄 package-lock.json            ✅
├── 📄 next.config.js               ✅
├── 📄 tsconfig.json                ✅
├── 📄 .env.example                 ✅ (örnek env dosyası)
├── 📄 .gitignore                   ✅
├── 📄 vercel.json                  ✅
├── 📄 .vercelignore                ✅
├── 📄 README.md                    ✅
│
├── 📁 app/                         ✅ (Next.js app directory)
│   ├── 📁 (auth)/
│   ├── 📁 (dashboard)/
│   ├── 📁 admin/
│   ├── 📁 api/
│   ├── 📄 layout.tsx
│   ├── 📄 page.tsx
│   └── ...
│
├── 📁 components/                  ✅
│   ├── 📁 auth/
│   ├── 📁 dashboard/
│   ├── 📁 layout/
│   ├── 📁 legal/
│   ├── 📁 ui/
│   └── ...
│
├── 📁 lib/                         ✅
│   ├── 📄 auth.ts
│   ├── 📄 db.ts
│   ├── 📄 email.ts
│   └── ...
│
├── 📁 prisma/                      ✅
│   ├── 📄 schema.prisma
│   └── 📁 migrations/
│
├── 📁 public/                      ✅
│   ├── 📁 assets/
│   ├── 📄 manifest.json
│   └── ...
│
├── 📁 locales/                     ✅
│   ├── 📁 en/
│   ├── 📁 tr/
│   ├── 📁 de/
│   └── ...
│
├── 📁 styles/                      ✅
│   └── 📄 globals.css
│
└── 📁 types/                       ✅
    └── ...
```

### ❌ Yüklenmeyecekler (.gitignore):

```
❌ node_modules/
❌ .next/
❌ .env.local
❌ .env.production
❌ .vercel/
❌ *.log
❌ .DS_Store
❌ coverage/
❌ dist/
❌ build/
```

---

## .gitignore Dosyası

```gitignore
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build
/dist

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db

# Prisma
/prisma/migrations/*_migration.sql
```

---

## .env.example Dosyası (GitHub'a Yüklenecek)

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-characters"

# Email (Resend)
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="noreply@yourdomain.com"

# Twitter OAuth (Optional)
TWITTER_CLIENT_ID="your_client_id"
TWITTER_CLIENT_SECRET="your_client_secret"

# Cloudflare Turnstile (Optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your_site_key"
TURNSTILE_SECRET_KEY="your_secret_key"
NEXT_PUBLIC_TURNSTILE_ENABLED="false"

# App Settings
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Hızlı Başlangıç Komutları

### 1. Yeni Repo Oluştur ve Push Et

```bash
# Proje dizinine git
cd /path/to/your/nextjs/project

# Git başlat
git init

# .gitignore oluştur (yukarıdaki içerikle)
nano .gitignore

# .env.example oluştur
cp .env.local .env.example
# .env.example'ı düzenle (gerçek değerleri kaldır)

# Tüm dosyaları ekle
git add .

# Commit
git commit -m "Initial commit - Sylvan Token Next.js App"

# Branch oluştur
git branch -M main

# Remote ekle
git remote add origin https://github.com/your-username/sylvan-token-app.git

# Push
git push -u origin main
```

### 2. Vercel'e Deploy Et

```bash
# Vercel CLI (opsiyonel)
npm install -g vercel
vercel login
vercel

# VEYA Web Interface
# https://vercel.com/new → Repo seçin → Deploy
```

### 3. Environment Variables Ekle

Vercel Dashboard'dan ekleyin (yukarıdaki listede)

### 4. Test Et

```
https://your-project.vercel.app/
```

---

## Önerilen Yaklaşım

### Test Aşaması (Şu An):

**Seçenek A: Subdomain (En Temiz)**
```
https://yourdomain.com/           → index.html (geri sayaç)
https://test.yourdomain.com/      → Next.js (test)
```

**Seçenek B: Vercel Subdomain (En Kolay)**
```
https://yourdomain.com/                    → index.html (geri sayaç)
https://sylvan-app-username.vercel.app/   → Next.js (test)
```

### Production Aşaması (Testler Sonrası):

```
https://yourdomain.com/           → Next.js (ana uygulama)
```

---

## Özet

### GitHub'a Yüklenecekler:
✅ Tüm Next.js kaynak kodları
✅ package.json, next.config.js, tsconfig.json
✅ app/, components/, lib/, prisma/, public/, locales/
✅ vercel.json, .vercelignore
✅ .env.example (gerçek değerler YOK)
✅ .gitignore
✅ README.md

### GitHub'a Yüklenmeyecekler:
❌ node_modules/
❌ .next/
❌ .env.local (gerçek değerler)
❌ .vercel/

### Klasör Yapısı:
```
HAYIR: /app klasörüne yükleme
EVET: Proje root'una yükleme
```

Next.js projeniz zaten `app/` directory kullanıyor (Next.js 13+ App Router).
Bu `app/` klasörü projenizin bir parçası, ayrı bir deployment klasörü değil!

---

## Sonraki Adımlar

1. ✅ GitHub'a push et
2. ✅ Vercel'e import et
3. ✅ Environment variables ekle
4. ✅ Deploy
5. ✅ Test URL'i al
6. ✅ Test et!

Hazır mısınız? 🚀
