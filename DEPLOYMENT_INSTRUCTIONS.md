# 🚀 Deployment Instructions - Sylvan Token

## 📋 Hazırlanan Dosyalar

✅ `middleware.ts` - Özel key kontrolü
✅ `public/countdown.html` - Geri sayaç sayfası
✅ `.gitignore` - Git ignore dosyası
✅ `.env.example` - Environment variables örneği

---

## 🔐 Özel Erişim Anahtarınız

```
07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

**⚠️ Bu anahtarı güvenli bir yerde saklayın!**

---

## 📂 GitHub'a Yükleme

### Mevcut Repo'nuza Yükleme (Önerilen)

Eğer zaten bir GitHub repo'nuz varsa:

```bash
# 1. Proje dizininize gidin
cd /path/to/your/project

# 2. Yeni dosyaları ekleyin
git add middleware.ts
git add public/countdown.html
git add .gitignore
git add .env.example

# 3. Commit yapın
git commit -m "Add test access with secret key and countdown page"

# 4. Push edin
git push origin main
```

### Yeni Repo Oluşturma

Eğer yeni bir repo oluşturacaksanız:

```bash
# 1. GitHub'da yeni repo oluşturun
# https://github.com/new
# Repo adı: sylvan-token-airdrop (veya istediğiniz isim)

# 2. Proje dizininizde
git init
git add .
git commit -m "Initial commit - Sylvan Token Airdrop"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sylvan-token-airdrop.git
git push -u origin main
```

---

## ⚙️ Vercel Konfigürasyonu

### 1. Vercel'de Mevcut Projenize Git

https://vercel.com/dashboard → Projenizi seçin

### 2. Environment Variables Ekleyin

Settings → Environment Variables → Add New

```
Name: TEST_ACCESS_KEY
Value: 07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
Environment: Production, Preview, Development (hepsini seçin)
```

"Save" tıklayın.

### 3. Redeploy Edin

Deployments → En son deployment → ⋯ (üç nokta) → Redeploy

VEYA

Yeni bir commit push edin, otomatik deploy olur.

---

## 🌐 Kullanım

### Normal Kullanıcılar (Geri Sayaç):

```
https://airdrop.sylvantoken.org/
```

→ Geri sayaç sayfasını görür ✅

### Siz (Test Erişimi):

```
https://airdrop.sylvantoken.org/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

→ Dashboard'a yönlendirilir ✅
→ Cookie set edilir (7 gün geçerli)
→ Sonraki 7 gün direkt erişebilirsiniz

### Cookie Temizleme (Geri Sayaç Görmek İçin):

1. Tarayıcı Developer Tools (F12)
2. Application → Cookies
3. `sylvan_test_access` cookie'sini silin
4. Sayfayı yenileyin

---

## 📝 Deployment Checklist

### GitHub'a Push Öncesi:

- [x] `middleware.ts` oluşturuldu
- [x] `public/countdown.html` oluşturuldu
- [x] `.gitignore` güncellendi
- [x] `.env.example` oluşturuldu
- [ ] `.env.local` dosyanız var mı? (gerçek değerlerle)
- [ ] `node_modules/` ignore edilmiş mi?

### GitHub'a Push:

```bash
git status  # Değişiklikleri kontrol et
git add .
git commit -m "Add test access and countdown"
git push origin main
```

### Vercel'de:

- [ ] Environment variable eklendi (`TEST_ACCESS_KEY`)
- [ ] Redeploy yapıldı
- [ ] Deployment başarılı oldu mu?

### Test:

- [ ] Normal URL geri sayaç gösteriyor mu?
- [ ] Özel key ile erişim çalışıyor mu?
- [ ] Dashboard açılıyor mu?
- [ ] Cookie set ediliyor mu?

---

## 🔍 Sorun Giderme

### Problem: Geri sayaç görünmüyor

**Çözüm:**
```bash
# public/countdown.html dosyasının olduğundan emin olun
ls public/countdown.html

# Varsa, git'e eklenmiş mi kontrol edin
git status
```

### Problem: Özel key çalışmıyor

**Çözüm:**
1. Vercel'de environment variable'ı kontrol edin
2. Tam olarak bu değeri kullanın:
   ```
   07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
   ```
3. Redeploy yapın

### Problem: Middleware çalışmıyor

**Çözüm:**
```bash
# middleware.ts dosyasının root'ta olduğundan emin olun
ls middleware.ts

# TypeScript hatası var mı kontrol edin
npm run build
```

### Problem: 404 Hatası

**Çözüm:**
- Vercel'de build loglarını kontrol edin
- `next.config.js` dosyanızda `basePath` var mı? (olmamalı)

---

## 📊 Deployment Durumu

### Şu Anki Durum:
```
✅ Dosyalar hazır
⏳ GitHub'a push bekleniyor
⏳ Vercel environment variable bekleniyor
⏳ Test bekleniyor
```

### Deployment Sonrası:
```
✅ GitHub'a push edildi
✅ Vercel environment variable eklendi
✅ Deployment başarılı
✅ Test edildi
```

---

## 🎯 Sonraki Adımlar

1. **GitHub'a Push:**
   ```bash
   git add .
   git commit -m "Add test access"
   git push origin main
   ```

2. **Vercel Environment Variable:**
   - Settings → Environment Variables
   - `TEST_ACCESS_KEY` ekle
   - Redeploy

3. **Test:**
   - Normal URL: Geri sayaç ✓
   - Özel URL: Dashboard ✓

4. **Paylaş:**
   Test URL'ini ekibinizle paylaşın:
   ```
   https://airdrop.sylvantoken.org/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
   ```

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. Vercel deployment loglarını kontrol edin
2. Browser console'u kontrol edin (F12)
3. Network tab'ı kontrol edin

---

## 🎉 Başarılı Deployment Sonrası

Tebrikler! Artık:

✅ Normal kullanıcılar geri sayaç görüyor
✅ Siz özel key ile test edebiliyorsunuz
✅ Mevcut site bozulmadı
✅ Tek repo, tek deployment
✅ 7 gün boyunca cookie ile erişim

**Test URL'iniz:**
```
https://airdrop.sylvantoken.org/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

🚀 İyi testler!
