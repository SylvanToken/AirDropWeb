# 🚀 Sylvan Token Airdrop Platform - Lokal Test Rehberi

## ✅ Sistem Durumu

### Aktif Sunucular:
- **Ana Uygulama:** http://localhost:3005 ✅ ÇALIŞIYOR
- **Email Preview:** http://localhost:3001 ✅ ÇALIŞIYOR

### Veritabanı:
- ✅ Prisma Client oluşturuldu
- ✅ Migrations uygulandı
- ✅ Seed data yüklendi
- ✅ 40 test kullanıcısı oluşturuldu
- ✅ 1 kampanya ve 6 görev eklendi

---

## 📋 Test Senaryoları

### 1. Ana Sayfa Testi 🏠

**URL:** http://localhost:3005

**Test Adımları:**
1. Ana sayfayı açın
2. Hero section'ı kontrol edin
3. Dil değiştirici çalışıyor mu test edin (EN, TR, DE, ZH, RU)
4. "Get Started" butonuna tıklayın

**Beklenen Sonuçlar:**
- ✅ Sayfa hızlı yükleniyor
- ✅ Hero görselleri görünüyor
- ✅ Animasyonlar çalışıyor
- ✅ Responsive tasarım düzgün
- ✅ Dil değişimi anında çalışıyor

---

### 2. Kullanıcı Kaydı Testi 📝

**URL:** http://localhost:3005/register

**Test Adımları:**
1. Kayıt sayfasını açın
2. Yeni kullanıcı bilgileri girin:
   ```
   Email: test@example.com
   Username: testuser
   Password: Test123!
   ```
3. Terms & Privacy checkbox'larını işaretleyin
4. "Create Account" butonuna tıklayın

**Beklenen Sonuçlar:**
- ✅ Form validasyonu çalışıyor
- ✅ Kayıt başarılı
- ✅ Otomatik giriş yapılıyor
- ✅ Dashboard'a yönlendiriliyor
- ✅ Welcome email kuyruğa ekleniyor (console'da log görünür)

---

### 3. Kullanıcı Girişi Testi 🔐

**URL:** http://localhost:3005/login

**Test Kullanıcıları:**
```
Email: cryptoking@example.com
Password: password123

Email: tokenhunter@example.com
Password: password123

Email: airdropmaster@example.com
Password: password123
```

**Test Adımları:**
1. Login sayfasını açın
2. Test kullanıcısı ile giriş yapın
3. Dashboard'a yönlendirildiğinizi kontrol edin

**Beklenen Sonuçlar:**
- ✅ Giriş başarılı
- ✅ Session oluşturuluyor
- ✅ Dashboard açılıyor
- ✅ Kullanıcı bilgileri görünüyor

---

### 4. Dashboard Testi 📊

**URL:** http://localhost:3005/dashboard

**Test Adımları:**
1. Dashboard'u açın
2. İstatistikleri kontrol edin:
   - Total Points
   - Completed Tasks
   - Current Streak
   - Rank
3. Recent completions listesini inceleyin
4. Grafikleri kontrol edin

**Beklenen Sonuçlar:**
- ✅ Tüm istatistikler doğru
- ✅ Grafikler yükleniyor
- ✅ Animasyonlar çalışıyor
- ✅ Responsive tasarım düzgün

---

### 5. Görev Tamamlama Testi ✅

**URL:** http://localhost:3005/tasks

**Test Adımları:**
1. Tasks sayfasını açın
2. Aktif görevleri görüntüleyin
3. Bir göreve tıklayın
4. "Complete Task" butonuna tıklayın
5. Proof URL girin (örnek: https://twitter.com/test/status/123)
6. Onaylayın

**Beklenen Sonuçlar:**
- ✅ Görev listesi yükleniyor
- ✅ Görev detayları açılıyor
- ✅ Tamamlama modal'ı açılıyor
- ✅ Görev başarıyla tamamlanıyor
- ✅ Puan ekleniyor
- ✅ Confetti animasyonu çalışıyor
- ✅ Task completion email kuyruğa ekleniyor

---

### 6. Wallet Doğrulama Testi 👛

**URL:** http://localhost:3005/wallet

**Test Adımları:**

#### A. Wallet Ekleme
1. Wallet sayfasını açın
2. BEP-20 wallet adresi girin:
   ```
   0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
   ```
3. "Save Wallet Address" butonuna tıklayın
4. Console'da email log'unu kontrol edin

**Beklenen Sonuçlar:**
- ✅ Wallet adresi kaydediliyor
- ✅ Pending status görünüyor
- ✅ Wallet pending email kuyruğa ekleniyor
- ✅ Maskelenmiş adres görünüyor (0x742d...5f0bEb)

#### B. Wallet Onaylama (Admin)
1. "Confirm Wallet" butonuna tıklayın
2. Onaylayın

**Beklenen Sonuçlar:**
- ✅ Wallet verified olarak işaretleniyor
- ✅ Yeşil onay rozeti görünüyor
- ✅ Artık değiştirilemez durumda

---

### 7. Profil Testi 👤

**URL:** http://localhost:3005/profile

**Test Adımları:**
1. Profile sayfasını açın
2. Avatar yükleyin (opsiyonel)
3. Bio ekleyin
4. Social media hesaplarını bağlayın:
   - Twitter: @testuser
   - Telegram: @testuser
5. "Save Changes" butonuna tıklayın

**Beklenen Sonuçlar:**
- ✅ Profil bilgileri güncelleniyor
- ✅ Avatar yükleniyor
- ✅ Social media doğrulama modal'ı açılıyor
- ✅ Değişiklikler kaydediliyor

---

### 8. Leaderboard Testi 🏆

**URL:** http://localhost:3005/leaderboard

**Test Adımları:**
1. Leaderboard sayfasını açın
2. Sıralamayı kontrol edin
3. Filtreleri test edin:
   - All Time
   - This Month
   - This Week
4. Arama yapın

**Beklenen Sonuçlar:**
- ✅ Kullanıcılar puana göre sıralı
- ✅ Filtreler çalışıyor
- ✅ Arama çalışıyor
- ✅ Pagination çalışıyor
- ✅ Wallet verified rozetleri görünüyor

---

### 9. Admin Girişi Testi 🔑

**URL:** http://localhost:3005/admin/login

**Admin Bilgileri:**
```
Email: admin@sylvantoken.org
Password: admin123
```

**Test Adımları:**
1. Admin login sayfasını açın
2. Admin bilgileri ile giriş yapın
3. Admin dashboard'a yönlendirildiğinizi kontrol edin

**Beklenen Sonuçlar:**
- ✅ Admin girişi başarılı
- ✅ Admin dashboard açılıyor
- ✅ Admin menüsü görünüyor

---

### 10. Admin Dashboard Testi 📈

**URL:** http://localhost:3005/admin/dashboard

**Test Adımları:**
1. Admin dashboard'u açın
2. İstatistikleri kontrol edin:
   - Total Users
   - Total Tasks
   - Total Completions
   - Pending Reviews
3. Grafikleri inceleyin
4. Recent activity'yi kontrol edin

**Beklenen Sonuçlar:**
- ✅ Tüm istatistikler doğru
- ✅ Grafikler yükleniyor
- ✅ Activity feed çalışıyor
- ✅ Real-time updates çalışıyor

---

### 11. Admin Kullanıcı Yönetimi Testi 👥

**URL:** http://localhost:3005/admin/users

**Test Adımları:**
1. Users sayfasını açın
2. Kullanıcı listesini görüntüleyin
3. Bir kullanıcıya tıklayın
4. Kullanıcı detaylarını inceleyin
5. Wallet'ı onaylayın/reddedin:
   - Actions menüsünden "Verify Wallet" seçin
   - Veya "Reject Wallet" seçip neden yazın

**Beklenen Sonuçlar:**
- ✅ Kullanıcı listesi yükleniyor
- ✅ Arama ve filtreleme çalışıyor
- ✅ Kullanıcı detayları açılıyor
- ✅ Wallet onaylama çalışıyor
- ✅ Wallet approved/rejected email kuyruğa ekleniyor
- ✅ Audit log oluşturuluyor

---

### 12. Admin Görev Yönetimi Testi 📋

**URL:** http://localhost:3005/admin/tasks

**Test Adımları:**
1. Tasks sayfasını açın
2. "Create Task" butonuna tıklayın
3. Yeni görev oluşturun:
   ```
   Title: Test Task
   Description: This is a test task
   Points: 50
   Type: CUSTOM
   URL: https://example.com
   ```
4. Görevi kaydedin
5. Görevi düzenleyin
6. Görevi aktif/pasif yapın

**Beklenen Sonuçlar:**
- ✅ Görev listesi yükleniyor
- ✅ Yeni görev oluşturuluyor
- ✅ Görev düzenleniyor
- ✅ Görev durumu değiştiriliyor
- ✅ Çoklu dil desteği çalışıyor

---

### 13. Admin Doğrulama Paneli Testi ✔️

**URL:** http://localhost:3005/admin/verifications

**Test Adımları:**
1. Verifications sayfasını açın
2. Pending completions'ı görüntüleyin
3. Bir completion'a tıklayın
4. Detayları inceleyin:
   - User info
   - Task info
   - Proof URL
   - Fraud score
5. Approve veya Reject edin

**Beklenen Sonuçlar:**
- ✅ Pending completions listeleniyor
- ✅ Fraud detection skorları görünüyor
- ✅ Detaylar açılıyor
- ✅ Onaylama/reddetme çalışıyor
- ✅ Kullanıcıya puan ekleniyor (approve)
- ✅ Audit log oluşturuluyor

---

### 14. Admin Kampanya Yönetimi Testi 🎯

**URL:** http://localhost:3005/admin/campaigns

**Test Adımları:**
1. Campaigns sayfasını açın
2. "Create Campaign" butonuna tıklayın
3. Yeni kampanya oluşturun:
   ```
   Title: Test Campaign
   Description: Test campaign description
   Start Date: Bugün
   End Date: 1 ay sonra
   ```
4. Kampanyayı kaydedin
5. Kampanyaya görev ekleyin

**Beklenen Sonuçlar:**
- ✅ Kampanya listesi yükleniyor
- ✅ Yeni kampanya oluşturuluyor
- ✅ Kampanya düzenleniyor
- ✅ Görevler kampanyaya ekleniyor
- ✅ Çoklu dil desteği çalışıyor

---

### 15. Email Preview Testi 📧

**URL:** http://localhost:3001

**Test Adımları:**
1. Email preview sunucusunu açın
2. Sol menüden email şablonlarını seçin:
   - welcome.tsx
   - task-completion.tsx
   - wallet-pending.tsx
   - wallet-approved.tsx
   - wallet-rejected.tsx
3. Her birini önizleyin
4. Farklı dilleri test edin
5. Responsive tasarımı kontrol edin

**Beklenen Sonuçlar:**
- ✅ Tüm email şablonları görünüyor
- ✅ Tasarım düzgün
- ✅ Çoklu dil desteği çalışıyor
- ✅ Responsive tasarım düzgün
- ✅ Linkler ve butonlar doğru

---

## 🌍 Çoklu Dil Testi

### Test Edilecek Diller:
- 🇬🇧 English (en)
- 🇹🇷 Türkçe (tr)
- 🇩🇪 Deutsch (de)
- 🇨🇳 中文 (zh)
- 🇷🇺 Русский (ru)

### Test Sayfaları:
1. Ana sayfa
2. Login/Register
3. Dashboard
4. Tasks
5. Wallet
6. Profile
7. Leaderboard
8. Admin pages

**Test Adımları:**
1. Sağ üst köşedeki dil değiştiriciye tıklayın
2. Her dili seçin
3. Sayfanın tamamen o dilde olduğunu kontrol edin
4. Tüm metinlerin çevrildiğini doğrulayın

---

## 📱 Responsive Tasarım Testi

### Test Edilecek Cihazlar:
- 📱 Mobile (375px - iPhone SE)
- 📱 Mobile (390px - iPhone 12/13/14)
- 📱 Mobile (414px - iPhone Plus)
- 📱 Tablet (768px - iPad)
- 💻 Desktop (1024px)
- 💻 Desktop (1440px)
- 🖥️ Large Desktop (1920px)

### Test Adımları:
1. Browser DevTools'u açın (F12)
2. Responsive mode'a geçin
3. Farklı cihaz boyutlarını test edin
4. Tüm sayfaları kontrol edin

**Kontrol Listesi:**
- ✅ Layout düzgün
- ✅ Menü çalışıyor (hamburger menu mobilde)
- ✅ Butonlar tıklanabilir
- ✅ Formlar kullanılabilir
- ✅ Tablolar scroll edilebilir
- ✅ Görseller düzgün boyutlanıyor

---

## 🎨 Tema ve Animasyon Testi

### Test Edilecek Özellikler:
- ✅ Doğa temalı tasarım
- ✅ Yeşil renk paleti
- ✅ Smooth transitions
- ✅ Hover effects
- ✅ Loading animations
- ✅ Confetti animations
- ✅ Page transitions

### Test Adımları:
1. Sayfalar arası geçişleri test edin
2. Hover efektlerini kontrol edin
3. Loading state'leri görüntüleyin
4. Animasyonların smooth olduğunu doğrulayın

---

## 🔒 Güvenlik Testi

### Test Senaryoları:

#### 1. Authentication Test
- ✅ Giriş yapmadan korumalı sayfalara erişim engelleniyor
- ✅ Session timeout çalışıyor
- ✅ Logout çalışıyor

#### 2. Authorization Test
- ✅ Normal kullanıcı admin sayfalarına erişemiyor
- ✅ Admin kullanıcı tüm sayfalara erişebiliyor
- ✅ Role-based access control çalışıyor

#### 3. Input Validation Test
- ✅ XSS koruması çalışıyor
- ✅ SQL injection koruması çalışıyor
- ✅ Form validasyonu çalışıyor
- ✅ Rate limiting çalışıyor

---

## ⚡ Performans Testi

### Test Metrikleri:
- ✅ First Contentful Paint (FCP) < 1.8s
- ✅ Largest Contentful Paint (LCP) < 2.5s
- ✅ Time to Interactive (TTI) < 3.8s
- ✅ Cumulative Layout Shift (CLS) < 0.1

### Test Araçları:
1. Chrome DevTools Lighthouse
2. Network tab
3. Performance tab

### Test Adımları:
1. DevTools'u açın
2. Lighthouse'u çalıştırın
3. Performance skorunu kontrol edin
4. Önerileri inceleyin

---

## 🐛 Hata Yönetimi Testi

### Test Senaryoları:

#### 1. Network Errors
- ✅ API hatalarında error message gösteriliyor
- ✅ Retry mekanizması çalışıyor
- ✅ Fallback UI gösteriliyor

#### 2. Validation Errors
- ✅ Form hataları gösteriliyor
- ✅ Field-level validation çalışıyor
- ✅ Error messages açıklayıcı

#### 3. 404 Errors
- ✅ 404 sayfası gösteriliyor
- ✅ Ana sayfaya dönüş linki var

---

## 📊 Test Sonuçları Kontrol Listesi

### Fonksiyonel Testler:
- [ ] Ana sayfa çalışıyor
- [ ] Kayıt sistemi çalışıyor
- [ ] Giriş sistemi çalışıyor
- [ ] Dashboard çalışıyor
- [ ] Görev tamamlama çalışıyor
- [ ] Wallet doğrulama çalışıyor
- [ ] Profil güncelleme çalışıyor
- [ ] Leaderboard çalışıyor
- [ ] Admin paneli çalışıyor
- [ ] Email sistemi çalışıyor

### UI/UX Testleri:
- [ ] Responsive tasarım düzgün
- [ ] Animasyonlar smooth
- [ ] Renkler tutarlı
- [ ] Typography okunabilir
- [ ] Butonlar tıklanabilir
- [ ] Formlar kullanılabilir

### Çoklu Dil Testleri:
- [ ] İngilizce çalışıyor
- [ ] Türkçe çalışıyor
- [ ] Almanca çalışıyor
- [ ] Çince çalışıyor
- [ ] Rusça çalışıyor

### Güvenlik Testleri:
- [ ] Authentication çalışıyor
- [ ] Authorization çalışıyor
- [ ] Input validation çalışıyor
- [ ] Rate limiting çalışıyor

### Performans Testleri:
- [ ] Sayfa yükleme hızlı
- [ ] API yanıtları hızlı
- [ ] Animasyonlar smooth
- [ ] Memory leaks yok

---

## 🚨 Bilinen Sorunlar ve Çözümler

### Sorun 1: Redis Bağlantı Hatası
**Belirti:** Email queue hatası
**Çözüm:** Redis opsiyonel, emailler senkron gönderilir

### Sorun 2: Port Zaten Kullanımda
**Belirti:** EADDRINUSE: address already in use
**Çözüm:**
```bash
# Port 3005'i kullanan process'i bul ve kapat
netstat -ano | findstr :3005
taskkill /PID <PID> /F
```

### Sorun 3: Prisma Client Hatası
**Belirti:** PrismaClient is unable to run in the browser
**Çözüm:**
```bash
npx prisma generate
```

---

## 📞 Destek

Sorun yaşarsanız:
1. Console loglarını kontrol edin (F12)
2. Network tab'ı inceleyin
3. Error messages'ı okuyun
4. Dokümantasyonu kontrol edin

---

## 🎉 Test Tamamlandı!

Tüm testler başarılı olduğunda:
- ✅ Uygulama production'a hazır
- ✅ Tüm özellikler çalışıyor
- ✅ Güvenlik önlemleri aktif
- ✅ Performans optimize edilmiş

**Tebrikler! Sylvan Token Airdrop Platform hazır! 🚀**
