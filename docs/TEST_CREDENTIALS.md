# Test Giriş Bilgileri

Bu dokümanda local testler için kullanabileceğiniz giriş bilgileri bulunmaktadır.

## 🔐 Admin Hesapları

### Ana Admin Hesabı (Güncel)
```
Email: admin@sylvantoken.org
Şifre: Mjkvebep_68
Rol: ADMIN
```

**Not:** Tüm test dosyaları bu bilgilerle güncellenmiştir.

### Super Admin (Tüm Yetkiler)
```
Email: superadmin@test.com
Şifre: Test123!@#
Rol: SUPER_ADMIN
```

### Moderator (Sınırlı Yetkiler)
```
Email: moderator@test.com
Şifre: Test123!@#
Rol: MODERATOR
```

## 👤 Normal Kullanıcı Hesapları

### Test Kullanıcısı 1
```
Email: user@test.com
Şifre: Test123!
Rol: USER
```

### Test Kullanıcısı 2
```
Email: regular-user@test.com
Şifre: password123
Rol: USER
```

## 🧪 Test Çalıştırma

### Performance Testlerini Çalıştırma

```bash
# Tüm performance testlerini çalıştır
npx playwright test nature-theme-performance

# Sadece neon efekt testlerini çalıştır
npx playwright test nature-theme-performance -g "Neon Effects"

# Sadece backdrop-filter testlerini çalıştır
npx playwright test nature-theme-performance -g "Backdrop Filter"

# Sadece box shadow testlerini çalıştır
npx playwright test nature-theme-performance -g "Box Shadow"

# Sadece animasyon testlerini çalıştır
npx playwright test nature-theme-performance -g "60fps Animation"

# Sadece GPU testlerini çalıştır
npx playwright test nature-theme-performance -g "GPU Usage"

# Tek bir browser'da çalıştır (daha hızlı)
npx playwright test nature-theme-performance --project=chromium

# Debug modunda çalıştır
npx playwright test nature-theme-performance --debug

# UI modunda çalıştır (görsel olarak takip et)
npx playwright test nature-theme-performance --ui
```

### Visual Regression Testlerini Çalıştırma

```bash
# Tüm visual testleri çalıştır
npx playwright test nature-theme-visual

# Dark mode testlerini çalıştır
npx playwright test dark-mode-nature-theme

# Baseline screenshot'ları oluştur
npx playwright test nature-theme-visual --update-snapshots
```

### Contrast Compliance Testlerini Çalıştırma

```bash
# Contrast testlerini çalıştır
npx playwright test contrast-compliance

# Contrast kontrolü script'i çalıştır
npm run check-contrast
```

## 🌐 Test URL'leri

### Local Development
```
Ana Sayfa: http://localhost:3005/
Admin Login: http://localhost:3005/admin/login
Admin Dashboard: http://localhost:3005/admin/dashboard
Admin Tasks: http://localhost:3005/admin/tasks
User Login: http://localhost:3005/login
User Dashboard: http://localhost:3005/dashboard
User Profile: http://localhost:3005/profile
```

## 📊 Test Raporları

Test sonuçlarını görüntülemek için:

```bash
# HTML raporu aç
npx playwright show-report

# Test sonuçları klasörü
test-results/

# Screenshot'lar
test-results/**/*.png

# Video kayıtları
test-results/**/*.webm
```

## 🔧 Test Ortamı Hazırlığı

### 1. Development Server'ı Başlat

```bash
npm run dev
```

Server `http://localhost:3005` adresinde çalışacak.

### 2. Database'i Hazırla

```bash
# Prisma migration'ları çalıştır
npx prisma migrate dev

# Seed data ekle (test kullanıcıları oluşturur)
npx prisma db seed
```

### 3. Environment Variables

`.env.local` dosyanızda şunlar olmalı:

```env
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3005"
```

## 🐛 Sorun Giderme

### Test Timeout Hataları

Eğer testler timeout hatası veriyorsa:

```bash
# Timeout süresini artır
npx playwright test --timeout=60000
```

### Welcome Modal Engelleme

Bazı testler welcome modal'ı kapatmayı gerektirebilir. Test başında:

```typescript
// Modal'ı kapat
const closeButton = page.locator('[aria-label="Close"]');
if (await closeButton.isVisible()) {
  await closeButton.click();
  await page.waitForTimeout(500);
}
```

### Port Çakışması

Eğer 3005 portu kullanımdaysa:

```bash
# Farklı port kullan
PORT=3006 npm run dev

# Playwright config'de base URL'i güncelle
# playwright.config.ts
baseURL: 'http://localhost:3006'
```

## 📝 Notlar

- **Admin hesapları** tüm admin paneline erişebilir
- **Super Admin** kullanıcı yönetimi ve sistem ayarlarına erişebilir
- **Moderator** sadece içerik yönetimine erişebilir
- **Normal kullanıcılar** sadece kendi profillerine erişebilir

## 🔒 Güvenlik

⚠️ **ÖNEMLİ:** Bu bilgiler sadece **test ortamı** içindir. Production ortamında asla bu şifreleri kullanmayın!

Production için:
- Güçlü, rastgele şifreler kullanın
- Environment variables'da saklayın
- Düzenli olarak şifreleri değiştirin
- 2FA (Two-Factor Authentication) aktif edin

## 📚 İlgili Dökümanlar

- [Performance Test Report](./NATURE_THEME_PERFORMANCE_REPORT.md)
- [Visual Testing Guide](./VISUAL_TESTING_QUICK_START.md)
- [Contrast Compliance Report](./CONTRAST_COMPLIANCE_REPORT.md)
