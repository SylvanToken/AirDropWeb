# ⚡ Quick Start - 3 Adımda Deployment

## 🔐 Özel Erişim Anahtarınız

```
07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

---

## 📦 Adım 1: GitHub'a Push

```bash
git add .
git commit -m "Add test access with secret key"
git push origin main
```

---

## ⚙️ Adım 2: Vercel Environment Variable

1. https://vercel.com/dashboard → Projeniz
2. Settings → Environment Variables
3. Add New:
   ```
   Name: TEST_ACCESS_KEY
   Value: 07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
   ```
4. Save → Redeploy

---

## 🌐 Adım 3: Test Et

### Normal Kullanıcılar:
```
https://airdrop.sylvantoken.org/
```
→ Geri sayaç görür ✅

### Siz (Test):
```
https://airdrop.sylvantoken.org/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```
→ Dashboard'a gider ✅

---

## ✅ Hazırlanan Dosyalar

- `middleware.ts` - Özel key kontrolü
- `public/countdown.html` - Geri sayaç
- `.gitignore` - Git ignore
- `.env.example` - Env örneği

---

## 🎯 Sonuç

✅ Mevcut site bozulmadı
✅ Özel key ile test erişimi
✅ 7 gün cookie ile otomatik giriş
✅ Tek repo, tek deployment

Detaylar için: `DEPLOYMENT_INSTRUCTIONS.md`
