# Admin Giriş Sorunu Çözüm Rehberi

## 🔍 Sorun Tespiti

Admin girişi çalışmıyorsa, aşağıdaki adımları takip edin.

## 📋 Adım 1: Admin Kullanıcısını Kontrol Et

Database'de admin kullanıcısının olup olmadığını ve şifresinin doğru olup olmadığını kontrol edin:

```bash
npx tsx scripts/check-admin.ts
```

Bu script:
- ✅ Tüm admin kullanıcılarını listeler
- ✅ `admin@sylvantoken.org` kullanıcısını arar
- ✅ Şifrenin doğru olup olmadığını test eder
- ✅ Kullanıcı durumunu (ACTIVE/BLOCKED) gösterir

### Beklenen Çıktı:

```
✅ 1 admin kullanıcısı bulundu:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:      admin@sylvantoken.org
👤 Username:   admin
🔑 Role:       ADMIN
📊 Status:     ACTIVE
📅 Created:    12.11.2025
⏰ Last Active: 12.11.2025

🔐 Şifre testi yapılıyor...
✅ Şifre doğru: "Mjkvebep_68"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 📋 Adım 2: Admin Kullanıcısını Oluştur/Güncelle

Eğer admin kullanıcısı yoksa veya şifre yanlışsa, oluşturun veya güncelleyin:

```bash
npx tsx scripts/create-admin.ts
```

Bu script:
- ✅ `admin@sylvantoken.org` kullanıcısını oluşturur (yoksa)
- ✅ Mevcut kullanıcının şifresini günceller (varsa)
- ✅ Role'ü ADMIN olarak ayarlar
- ✅ Status'ü ACTIVE olarak ayarlar
- ✅ Şifre hash'ini doğru şekilde oluşturur

### Beklenen Çıktı:

```
🚀 Admin Kullanıcısı Oluşturma Script'i

🧪 Şifre hash testi yapılıyor...
Hash test sonucu: ✅ Başarılı

🔍 Admin kullanıcısı kontrol ediliyor...
✏️  Mevcut admin kullanıcısı güncelleniyor...
🔐 Şifre hash'leniyor...
✅ Admin kullanıcısı güncellendi!
📧 Email: admin@sylvantoken.org
👤 Username: admin
🔑 Role: ADMIN
📊 Status: ACTIVE

🎉 İşlem başarılı!

📝 Giriş Bilgileri:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:    admin@sylvantoken.org
Password: Mjkvebep_68
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Admin Panel: http://localhost:3005/admin/login
```

## 📋 Adım 3: Database Bağlantısını Kontrol Et

Database'e bağlanabildiğinizden emin olun:

```bash
npx prisma db push
```

Eğer hata alırsanız, `.env` dosyanızda `DATABASE_URL` değişkenini kontrol edin.

## 📋 Adım 4: Development Server'ı Yeniden Başlat

Admin kullanıcısını oluşturduktan sonra server'ı yeniden başlatın:

```bash
# Server'ı durdur (Ctrl+C)
# Sonra tekrar başlat
npm run dev
```

## 📋 Adım 5: Manuel Giriş Testi

Browser'da test edin:

1. **Admin Login Sayfası:** http://localhost:3005/admin/login
2. **Email:** `admin@sylvantoken.org`
3. **Şifre:** `Mjkvebep_68`
4. Login butonuna tıklayın

### Başarılı Giriş:
- ✅ Admin dashboard'a yönlendirilirsiniz: `/admin/dashboard`
- ✅ Üst menüde admin kullanıcı adını görürsünüz

### Başarısız Giriş:
- ❌ "Invalid email or password" hatası
- ❌ "Your account has been blocked" hatası
- ❌ Sayfa yenilenir ama giriş olmaz

## 🐛 Yaygın Sorunlar ve Çözümleri

### Sorun 1: "Invalid email or password" Hatası

**Neden:**
- Kullanıcı database'de yok
- Şifre hash'i yanlış
- Email yanlış yazılmış

**Çözüm:**
```bash
# Admin kullanıcısını kontrol et
npx tsx scripts/check-admin.ts

# Admin kullanıcısını oluştur/güncelle
npx tsx scripts/create-admin.ts
```

### Sorun 2: "Your account has been blocked" Hatası

**Neden:**
- Kullanıcı status'ü BLOCKED

**Çözüm:**
```bash
# Admin kullanıcısını güncelle (status'ü ACTIVE yapar)
npx ts-node scripts/create-admin.ts
```

### Sorun 3: Database Bağlantı Hatası

**Neden:**
- Database çalışmıyor
- DATABASE_URL yanlış

**Çözüm:**
```bash
# Database'i kontrol et
npx prisma db push

# .env dosyasını kontrol et
cat .env | grep DATABASE_URL
```

### Sorun 4: NextAuth Session Hatası

**Neden:**
- NEXTAUTH_SECRET tanımlı değil
- NEXTAUTH_URL yanlış

**Çözüm:**
`.env` dosyasında kontrol edin:
```env
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3005"
```

## 🔧 Manuel Database Kontrolü

Prisma Studio ile database'i görsel olarak kontrol edebilirsiniz:

```bash
npx prisma studio
```

Browser'da açılacak arayüzde:
1. **User** tablosuna gidin
2. `admin@sylvantoken.org` kullanıcısını bulun
3. Kontrol edin:
   - ✅ `role` = "ADMIN"
   - ✅ `status` = "ACTIVE"
   - ✅ `password` hash'lenmiş olmalı (bcrypt hash)

## 📊 Test Sonrası Doğrulama

Admin girişi başarılı olduktan sonra:

```bash
# Performance testlerini çalıştır
npx playwright test nature-theme-performance --project=chromium

# Veya sadece admin sayfalarını test et
npx playwright test --grep "admin"
```

## 🔒 Güvenlik Notları

- ⚠️ Bu bilgiler sadece **local development** içindir
- ⚠️ Production'da asla bu şifreleri kullanmayın
- ⚠️ Production'da environment variables kullanın
- ⚠️ Production'da güçlü, rastgele şifreler kullanın

## 📚 İlgili Dökümanlar

- [Test Credentials](./TEST_CREDENTIALS.md) - Tüm test giriş bilgileri
- [Admin Credentials Update](./ADMIN_CREDENTIALS_UPDATE.md) - Güncelleme raporu

## 💡 Hızlı Çözüm

Tüm adımları tek seferde yapmak için:

```bash
# 1. Admin kullanıcısını oluştur/güncelle
npx tsx scripts/create-admin.ts

# 2. Server'ı yeniden başlat
npm run dev

# 3. Browser'da test et
# http://localhost:3005/admin/login
# Email: admin@sylvantoken.org
# Şifre: Mjkvebep_68
```

## 🆘 Hala Çalışmıyor mu?

Eğer yukarıdaki adımları denediyseniz ve hala giriş yapamıyorsanız:

1. **Console loglarını kontrol edin:**
   - Browser console (F12)
   - Server console (terminal)

2. **Network tab'ı kontrol edin:**
   - Login request'i gidiyor mu?
   - Response ne döndürüyor?

3. **Database loglarını kontrol edin:**
   ```bash
   # Prisma query loglarını aktif et
   # .env dosyasına ekle:
   # DATABASE_URL="...?connection_limit=5&pool_timeout=0&log=query"
   ```

4. **Auth callback'leri kontrol edin:**
   - `lib/auth.ts` dosyasındaki `authorize` fonksiyonunu inceleyin
   - Console.log ekleyerek debug yapın

---

**Son Güncelleme:** 12 Kasım 2025  
**Durum:** ✅ Aktif
