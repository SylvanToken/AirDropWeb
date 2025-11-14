# ⚡ Hızlı Deployment Kılavuzu

Bu kılavuz, projenizi 15 dakikada Vercel'e deploy etmeniz için gereken minimum adımları içerir.

## 🚀 5 Adımda Deploy

### 1️⃣ Repository Hazırlığı (2 dakika)

```bash
# .env dosyasının .gitignore'da olduğundan emin olun
cat .gitignore | grep .env

# Tüm değişiklikleri commit edin
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2️⃣ Vercel Hesabı (2 dakika)

1. [vercel.com](https://vercel.com) adresine gidin
2. "Sign Up with GitHub" ile kayıt olun
3. GitHub repository'nize erişim izni verin

### 3️⃣ Proje Import (1 dakika)

1. Vercel dashboard'da "New Project" tıklayın
2. GitHub repository'nizi seçin
3. "Import" butonuna tıklayın

### 4️⃣ Environment Variables (5 dakika)

**Settings → Environment Variables** bölümünde şu değişkenleri ekleyin:

#### Minimum Gerekli Variables:

```bash
# Database
DATABASE_URL=postgres://username:password@host:5432/database

# NextAuth (ÖNEMLİ: Yeni secret oluşturun!)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-new-secret-key-here

# Admin
ADMIN_EMAIL=admin@sylvantoken.org
ADMIN_PASSWORD=your-secure-password

# Node
NODE_ENV=production

# Email
EMAIL_FROM=noreply@sylvantoken.org
EMAIL_FROM_NAME=Sylvan Token
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=sylvantoken@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_ENABLED=true
EMAIL_RATE_LIMIT_ENABLED=true
RESEND_API_KEY=your-resend-key

# Supabase
SUPABASE_URL=https://fahcabutajczylskmmgw.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_SUPABASE_URL=https://fahcabutajczylskmmgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Postgres
POSTGRES_HOST=db.fahcabutajczylskmmgw.supabase.co
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=postgres

# Telegram
TELEGRAM_CHANNEL_ID=-1002857056222
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_BOT_USERNAME=SylvusBot

# Turnstile (Production'da true yapın)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key
TURNSTILE_ENABLED=true
NEXT_PUBLIC_TURNSTILE_ENABLED=true

# Token Addresses
TOKEN_DEPLOYER_ADDRESS=0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469
TOKEN_OWNER_ADDRESS=0x465b54282e4885f61df7eB7CcDc2493DB35C9501
TOKEN_MAD_ADDRESS=0x58F30f0aAAaF56DaFA93cd03103C3B9f264a999d
TOKEN_LEB_ADDRESS=0x8df5ec091133fcebc40f964c5c9dda16dd8771b1
TOKEN_CNK_ADDRESS=0x106A637D825e562168678b7fd0f75cFf2cF2845B
TOKEN_KDR_ADDRESS=0xaD1EAc033Ff56e7295abDfB46f5A94016D760460
TOKEN_LOCKED_ADDRESS=0x687A2c7E494c3818c20AD2856d453514970d6aac
TOKEN_DONATION_ADDRESS=0xa697645Fdfa5d9399eD18A6575256F81343D4e17
TOKEN_FEE_ADDRESS=0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915
TOKEN_BURN_ADDRESS=0x000000000000000000000000000000000000dEaD

# BscScan
BSCSCAN_API_KEY=your-bscscan-key
TOKEN_CONTRACT_ADDRESS=0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85

# Redis (Optional)
USE_REDIS=false
```

#### 🔑 NEXTAUTH_SECRET Oluşturma:

Terminal'de çalıştırın:
```bash
openssl rand -base64 32
```

Çıkan değeri `NEXTAUTH_SECRET` olarak kullanın.

### 5️⃣ Deploy (5 dakika)

1. "Deploy" butonuna tıklayın
2. Build tamamlanana kadar bekleyin (~3-5 dakika)
3. Deploy edilen URL'i alın
4. URL'i test edin

## ✅ Deployment Sonrası Kontroller

### Hemen Test Edin:

```bash
# 1. Site açılıyor mu?
https://your-app.vercel.app

# 2. Login çalışıyor mu?
https://your-app.vercel.app/login

# 3. Register çalışıyor mu?
https://your-app.vercel.app/register

# 4. Admin panel erişilebilir mi?
https://your-app.vercel.app/admin
```

### Sorun Giderme:

#### Build Hatası
```bash
# Vercel dashboard'da "Deployments" → "View Function Logs"
# Hata mesajını okuyun ve düzeltin
```

#### Environment Variables Hatası
```bash
# Settings → Environment Variables
# Tüm değişkenlerin eklendiğinden emin olun
# Redeploy edin
```

#### Database Connection Hatası
```bash
# DATABASE_URL'in doğru olduğundan emin olun
# Supabase dashboard'da connection string'i kontrol edin
```

## 🎯 Önemli Notlar

### ⚠️ Güvenlik

1. **NEXTAUTH_SECRET:** Mutlaka yeni bir secret oluşturun!
2. **ADMIN_PASSWORD:** Güçlü bir şifre kullanın
3. **API Keys:** Production keys kullanın
4. **Turnstile:** Production'da enable edin

### 📝 NEXTAUTH_URL

Deploy sonrası Vercel size bir URL verecek (örn: `your-app.vercel.app`). Bu URL'i `NEXTAUTH_URL` olarak ayarlayın:

```bash
NEXTAUTH_URL=https://your-app.vercel.app
```

Sonra redeploy edin.

### 🔄 Redeploy

Environment variables değiştirdikten sonra:

1. Vercel dashboard → Deployments
2. En son deployment'ın yanındaki "..." menüsü
3. "Redeploy" seçeneğini tıklayın

## 📚 Ek Kaynaklar

- [Detaylı Deployment Kılavuzu](./GITHUB_DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Vercel Documentation](https://vercel.com/docs)

## 🆘 Yardım

Sorun yaşarsanız:

1. Build logs'u kontrol edin
2. Environment variables'ları doğrulayın
3. [Detaylı kılavuza](./GITHUB_DEPLOYMENT_GUIDE.md) bakın
4. GitHub Issues'da sorun açın

---

## 🎉 Tebrikler!

Projeniz artık canlıda! 🚀

Sonraki adımlar:
- [ ] Custom domain bağlayın
- [ ] SSL certificate kontrol edin
- [ ] Analytics ekleyin
- [ ] Monitoring kurun
- [ ] Kullanıcılara duyurun

**Deployment Tarihi:** _______________
**URL:** _______________
**Notlar:** _______________
