# 🚀 Deployment Adımları - Türkçe Kılavuz

## 📋 Özet

Countdown 404 hatasını düzelttik. Şimdi GitHub'a push edip Vercel'e deploy edeceğiz.

---

## ⚠️ ÖNEMLİ BİLGİLER

### Test Access Key (Admin Erişimi İçin)
```
07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

**Bu key ile admin paneline erişebilirsiniz:**
```
https://your-domain.vercel.app/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

---

## 📝 ADIM 1: GitHub'a Dosyaları Yükle

### 1.1 Terminal'i Aç
- VS Code'da Terminal menüsünden "New Terminal" seç
- Veya `Ctrl + ö` (Türkçe klavye) / `Ctrl + `` (İngilizce klavye)

### 1.2 Git Durumunu Kontrol Et
```bash
git status
```

**Göreceğin dosyalar:**
- ✅ middleware.ts (değiştirildi)
- ✅ vercel.json (değiştirildi)
- ✅ next.config.js (değiştirildi)
- ✅ app/countdown/error.tsx (yeni)
- ✅ app/not-found.tsx (yeni)
- ✅ lib/env-validation.ts (yeni)
- ✅ scripts/pre-deploy-validation.ts (yeni)
- ✅ scripts/post-deploy-verification.ts (yeni)
- ✅ docs/DEPLOYMENT.md (yeni)
- ✅ docs/DEPLOYMENT_TROUBLESHOOTING.md (yeni)
- ✅ DEPLOYMENT_READY.md (yeni)
- ✅ DEPLOYMENT_ADIMLAR.md (yeni - bu dosya)

### 1.3 Dosyaları Stage'e Al
```bash
git add middleware.ts
git add vercel.json
git add next.config.js
git add app/countdown/error.tsx
git add app/not-found.tsx
git add lib/env-validation.ts
git add scripts/pre-deploy-validation.ts
git add scripts/post-deploy-verification.ts
git add docs/DEPLOYMENT.md
git add docs/DEPLOYMENT_TROUBLESHOOTING.md
git add DEPLOYMENT_READY.md
git add DEPLOYMENT_ADIMLAR.md
```

**VEYA hepsini birden ekle:**
```bash
git add .
```

### 1.4 Commit Yap
```bash
git commit -m "fix: Countdown 404 hatası düzeltildi ve deployment optimize edildi"
```

### 1.5 GitHub'a Push Et
```bash
git push origin main
```

**✅ Başarılı olursa:** "Enumerating objects..." gibi mesajlar göreceksin

**❌ Hata alırsan:** 
- GitHub şifren/token'ın doğru olduğundan emin ol
- `git pull origin main` yap, sonra tekrar push et

---

## 🌐 ADIM 2: Vercel'de Environment Variables Ayarla

### 2.1 Vercel Dashboard'a Git
1. Tarayıcıda [vercel.com](https://vercel.com) aç
2. Giriş yap
3. Projenizi seç (Sylvan Token Airdrop Platform)

### 2.2 Settings'e Git
1. Üst menüden **"Settings"** sekmesine tıkla
2. Sol menüden **"Environment Variables"** seç

### 2.3 Environment Variables Ekle

Her bir variable için şu adımları tekrarla:

#### Variable 1: TEST_ACCESS_KEY
```
Name: TEST_ACCESS_KEY
Value: 07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```
- ✅ Production
- ✅ Preview
- ✅ Development
- **"Save"** butonuna bas

#### Variable 2: NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://your-domain.vercel.app
```
**⚠️ DİKKAT:** `your-domain` yerine gerçek Vercel domain'inizi yazın!

Örnek: `https://sylvan-airdrop-platform.vercel.app`

- ✅ Production
- ✅ Preview
- ✅ Development
- **"Save"** butonuna bas

#### Variable 3: NEXTAUTH_SECRET
Yeni bir secret oluştur:

**Windows PowerShell'de:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Çıkan değeri kopyala, örnek:
```
Name: NEXTAUTH_SECRET
Value: kJ8mN2pQ5rT9vX3zA6bC8dE1fG4hI7jK0lM3nO6pQ9rS2tU5vW8xY1zA4bC7dE0f
```
- ✅ Production
- ✅ Preview
- ✅ Development
- **"Save"** butonuna bas

#### Variable 4: DATABASE_URL
```
Name: DATABASE_URL
Value: <mevcut production database URL'iniz>
```
**⚠️ DİKKAT:** Bu değer zaten Vercel'de olmalı. Kontrol et, yoksa ekle.

Supabase kullanıyorsanız şuna benzer:
```
postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

- ✅ Production
- ✅ Preview
- ✅ Development
- **"Save"** butonuna bas

#### Variable 5: RESEND_API_KEY (Opsiyonel)
```
Name: RESEND_API_KEY
Value: <mevcut Resend API key'iniz>
```
- ✅ Production
- ✅ Preview
- ✅ Development
- **"Save"** butonuna bas

#### Variable 6: EMAIL_FROM (Opsiyonel)
```
Name: EMAIL_FROM
Value: noreply@sylvantoken.org
```
- ✅ Production
- ✅ Preview
- ✅ Development
- **"Save"** butonuna bas

---

## 🔄 ADIM 3: Yeniden Deploy Et

### 3.1 Deployments Sekmesine Git
1. Vercel Dashboard'da projenize gidin
2. Üst menüden **"Deployments"** sekmesine tıklayın

### 3.2 Redeploy Yap
1. En üstteki deployment'ı bulun (en son push'unuz)
2. Sağ taraftaki **"..."** (üç nokta) menüsüne tıklayın
3. **"Redeploy"** seçin
4. **"Redeploy"** butonuna tekrar basın (onay için)

**VEYA**

Yeni bir push yapın:
```bash
# Küçük bir değişiklik yap
git commit --allow-empty -m "trigger: Redeploy with new environment variables"
git push origin main
```

### 3.3 Build Loglarını İzle
1. Deployment'a tıklayın
2. **"Building"** aşamasını izleyin
3. Hata varsa kırmızı ile gösterilir
4. Başarılı olursa yeşil ✅ işareti görürsünüz

**Beklenen süre:** 2-5 dakika

---

## ✅ ADIM 4: Test Et

### 4.1 Countdown Sayfasını Test Et

Tarayıcıda aç:
```
https://your-domain.vercel.app/countdown
```

**✅ Başarılı:** Countdown sayfası görünüyor, geri sayım çalışıyor

**❌ Hata:** 404 görüyorsan, Vercel logs'a bak (Adım 5)

### 4.2 Ana Sayfa Redirect Test Et

Tarayıcıda aç:
```
https://your-domain.vercel.app/
```

**✅ Başarılı:** Otomatik olarak `/countdown` sayfasına yönlendiriyor

### 4.3 Admin Erişimi Test Et

**Incognito/Gizli Pencere** aç (önemli!), sonra:
```
https://your-domain.vercel.app/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

**✅ Başarılı:** Dashboard sayfasına yönlendiriyor

**❌ Hata:** Countdown'a geri dönüyorsa, TEST_ACCESS_KEY doğru ayarlanmamış (Adım 2.3'e dön)

### 4.4 Cookie Test Et

Admin erişiminden sonra:
1. Normal pencerede (incognito değil) şu URL'yi aç:
```
https://your-domain.vercel.app/
```

**✅ Başarılı:** Dashboard'a yönlendiriyor (cookie çalışıyor)

2. Tarayıcı DevTools'u aç (F12)
3. **Application** sekmesine git
4. **Cookies** altında domain'inizi seç
5. `sylvan_test_access=granted` cookie'sini görmelisin

### 4.5 Mobil Test

Telefonundan aç:
```
https://your-domain.vercel.app/countdown
```

**✅ Başarılı:** Responsive tasarım düzgün görünüyor

---

## 🔍 ADIM 5: Sorun Giderme (Gerekirse)

### 5.1 Vercel Logs'a Bak

Vercel Dashboard'da:
1. **"Deployments"** sekmesine git
2. Son deployment'a tıkla
3. **"Logs"** sekmesine git
4. Hataları ara (kırmızı renkli)

**VEYA Terminal'de:**
```bash
vercel logs
```

### 5.2 Yaygın Hatalar

#### Hata: "TEST_ACCESS_KEY is not defined"
**Çözüm:** Adım 2.3'e dön, TEST_ACCESS_KEY'i ekle, redeploy yap

#### Hata: "404 Not Found"
**Çözüm:** 
1. Middleware.ts doğru push edildi mi kontrol et
2. Vercel logs'da hata var mı bak
3. Local'de test et: `npm run build && npm start`

#### Hata: "Database connection failed"
**Çözüm:** DATABASE_URL doğru mu kontrol et

#### Hata: "Build failed"
**Çözüm:** 
1. Vercel build logs'a bak
2. Local'de build dene: `npm run build`
3. TypeScript hataları varsa düzelt

---

## 📱 ADIM 6: Son Kontroller

### Checklist

- [ ] GitHub'a push başarılı
- [ ] Vercel'de tüm environment variables eklendi
- [ ] Deployment başarılı (yeşil ✅)
- [ ] Countdown sayfası açılıyor
- [ ] Ana sayfa countdown'a yönlendiriyor
- [ ] Admin access key çalışıyor
- [ ] Cookie set ediliyor
- [ ] Dashboard erişilebiliyor
- [ ] Mobil'de düzgün görünüyor
- [ ] Hata yok (Vercel logs temiz)

---

## 🎉 Tamamlandı!

Artık siteniz çalışıyor! 

### Admin Paneline Giriş

Her zaman bu URL ile giriş yapabilirsiniz:
```
https://your-domain.vercel.app/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

Cookie 7 gün geçerli. Sonra tekrar bu URL'yi kullanmanız gerekir.

---

## 📞 Yardım

Sorun yaşarsan:

1. **Vercel Logs'a bak:** `vercel logs`
2. **Local'de test et:** `npm run dev`
3. **Dokümanlara bak:** 
   - `DEPLOYMENT_READY.md`
   - `docs/DEPLOYMENT_TROUBLESHOOTING.md`

---

## 🔐 Güvenlik Notları

- ✅ `.env` dosyası GitHub'a push edilmedi (gitignore'da)
- ✅ Tüm secretlar Vercel environment variables'da
- ✅ Cookie güvenli (httpOnly, secure)
- ✅ Admin access key güçlü

---

**Son Güncelleme:** 14 Kasım 2025
**Durum:** ✅ Deployment'a Hazır

**İyi çalışmalar! 🚀**
