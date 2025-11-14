# 🚀 GitHub Deployment Guide - Sylvan Token Airdrop

## ✅ Pre-Deployment Cleanup Complete

Gereksiz dosyalar temizlendi:
- ❌ Eski raporlar ve analiz dosyaları silindi
- ❌ `old_docs/`, `old_scripts/`, `TaskCreator/` klasörleri kaldırıldı
- ❌ Test database dosyaları temizlendi
- ❌ Gereksiz HTML test sayfaları silindi

---

## 📦 GitHub'a Yüklenecek Dosyalar

### ✅ Yüklenecek Ana Klasörler:
```
├── app/                    # Next.js app router
├── components/             # React components
├── config/                 # Configuration files
├── docs/                   # Documentation
├── emails/                 # Email templates
├── hooks/                  # React hooks
├── i18n/                   # Internationalization
├── lib/                    # Utility libraries
├── locales/                # Translation files (8 languages)
├── prisma/                 # Database schema & migrations
├── public/                 # Static assets
│   ├── assets/
│   ├── avatars/
│   ├── countdown.html     # ✨ NEW: Countdown page
│   └── images/
├── scripts/                # Utility scripts
├── types/                  # TypeScript types
└── __tests__/              # Test files
```

### ✅ Yüklenecek Root Dosyalar:
```
├── .env.example            # Environment variables template
├── .env.production.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── CHANGELOG.md
├── DEPLOYMENT_GUIDE.md
├── DEPLOYMENT_INSTRUCTIONS.md
├── DEPLOYMENT_OPTIONS.md
├── DEPLOYMENT_SUMMARY.md
├── FINAL_DEPLOYMENT_SUMMARY.md
├── middleware.ts           # Next.js middleware
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── PRODUCTION_MIGRATION_GUIDE.md
├── QUICK_START.md
├── README.md
├── SECURITY.md
├── SIMPLE_TEST_DEPLOYMENT.md
├── tailwind.config.ts
├── tsconfig.json
├── VERCEL_DEPLOYMENT_GUIDE.md
└── vercel.json
```

### ❌ GitHub'a Yüklenmeyecekler (.gitignore):
```
node_modules/               # Dependencies (npm install ile gelir)
.next/                      # Build output
.env                        # Local environment variables
.env*.local                 # Local env files
*.tsbuildinfo              # TypeScript build info
.vscode/                    # IDE settings
database.db                 # Local SQLite database
prisma/*.db                 # Test databases
```

---

## 🎯 Deployment Adımları

### 1️⃣ Git Repository Hazırlama

```bash
# Git durumunu kontrol et
git status

# Tüm değişiklikleri ekle
git add .

# Commit yap
git commit -m "feat: Add countdown page and clean up project for deployment"

# GitHub'a push et
git push origin main
```

### 2️⃣ Vercel Deployment

#### Option A: Vercel Dashboard (Kolay)
1. https://vercel.com adresine git
2. "Import Project" tıkla
3. GitHub repository'ni seç
4. Environment variables ekle (.env.production.example'dan)
5. "Deploy" tıkla

#### Option B: Vercel CLI (Hızlı)
```bash
# Vercel CLI kur (ilk kez)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3️⃣ Environment Variables (Vercel Dashboard)

Vercel'de şu environment variables'ları ekle:

```env
# Database
DATABASE_URL=your_postgres_url

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_secret_here

# Email (Resend)
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@yourdomain.com

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key

# Twitter API (Optional)
TWITTER_API_KEY=your_key
TWITTER_API_SECRET=your_secret
TWITTER_BEARER_TOKEN=your_token

# Telegram (Optional)
TELEGRAM_BOT_TOKEN=your_token
```

---

## 🔍 Deployment Sonrası Kontroller

### ✅ Test Edilecekler:
1. **Countdown Page**: `https://your-domain.vercel.app/countdown.html`
   - Geri sayım çalışıyor mu?
   - Background logo görünüyor mu?
   - Responsive tasarım düzgün mü?

2. **Ana Sayfa**: `https://your-domain.vercel.app`
   - Dil seçimi çalışıyor mu? (8 dil)
   - Tema değişimi çalışıyor mu?

3. **Auth System**:
   - Login/Register çalışıyor mu?
   - Email verification geliyor mu?

4. **Database**:
   - Prisma migrations çalıştı mı?
   - Veriler kaydediliyor mu?

---

## 📊 Countdown Page Özellikleri

### ✨ Yeni Eklenen Countdown Sayfası:
- **URL**: `/countdown.html`
- **Bitiş Tarihi**: 15 Kasım 2025, 20:00 UTC
- **Dil**: İngilizce
- **Background**: Sylvan Token logo (GitHub'dan)
- **Responsive**: Mobil uyumlu
- **Animasyonlu**: Floating logo, gradient text

### 🎨 Tasarım:
- Yeşil doğa teması (#2d5016, #4a7c2c, #a8e063)
- Glassmorphism countdown boxes
- Animated background pattern
- 3 feature highlight (Airdrop, Eco-Friendly, Secure)

---

## 🔗 Faydalı Linkler

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🆘 Sorun Giderme

### Build Hatası:
```bash
# Local'de build test et
npm run build
```

### Database Hatası:
```bash
# Migrations kontrol et
npx prisma migrate status

# Migrations uygula
npx prisma migrate deploy
```

### Environment Variables Hatası:
- Vercel Dashboard > Settings > Environment Variables
- Tüm gerekli değişkenlerin eklendiğinden emin ol

---

## ✅ Deployment Checklist

- [ ] Gereksiz dosyalar temizlendi
- [ ] Git repository güncel
- [ ] .env.example dosyası hazır
- [ ] README.md güncel
- [ ] Countdown page test edildi
- [ ] GitHub'a push yapıldı
- [ ] Vercel'e deploy edildi
- [ ] Environment variables eklendi
- [ ] Database migrations çalıştırıldı
- [ ] Production test edildi
- [ ] Domain bağlandı (opsiyonel)

---

**🎉 Deployment Hazır!**

Sorularınız için: [GitHub Issues](https://github.com/SylvanToken/SylvanToken/issues)
