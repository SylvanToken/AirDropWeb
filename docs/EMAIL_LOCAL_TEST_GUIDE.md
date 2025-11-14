# Wallet Email Lokal Test Rehberi

Bu rehber, wallet doğrulama emaillerini lokal ortamda test etmeniz için adım adım talimatlar içerir.

## Yöntem 1: React Email Preview (Önerilen) 🎨

React Email'in yerleşik preview sunucusunu kullanarak emaillerinizi tarayıcıda görüntüleyin.

### Adımlar:

1. **Email preview sunucusunu başlatın:**
   ```bash
   npm run email:dev
   ```

2. **Tarayıcınızda açın:**
   ```
   http://localhost:3001
   ```

3. **Email şablonlarını seçin:**
   - `wallet-pending.tsx` - Bekleyen doğrulama emaili
   - `wallet-approved.tsx` - Onaylanmış email
   - `wallet-rejected.tsx` - Reddedilmiş email

4. **Farklı dilleri test edin:**
   - Her şablonda `locale` prop'unu değiştirin
   - Desteklenen diller: `en`, `tr`, `de`, `zh`, `ru`

### Avantajları:
- ✅ Gerçek zamanlı önizleme
- ✅ Hot reload (değişiklikler anında görünür)
- ✅ Responsive tasarım testi
- ✅ Farklı cihaz boyutlarında test
- ✅ Email istemcisi simülasyonu

---

## Yöntem 2: Manuel HTML Render 📄

Email şablonlarını HTML olarak render edip tarayıcıda açın.

### Adımlar:

1. **Test scriptini çalıştırın:**
   ```bash
   npx tsx emails/test-wallet-pending.tsx > wallet-pending.html
   npx tsx emails/test-wallet-approved.tsx > wallet-approved.html
   npx tsx emails/test-wallet-rejected.tsx > wallet-rejected.html
   ```

2. **HTML dosyalarını tarayıcıda açın:**
   - `wallet-pending.html`
   - `wallet-approved.html`
   - `wallet-rejected.html`

### Avantajları:
- ✅ Hızlı ve basit
- ✅ Offline çalışır
- ✅ HTML kaynak kodunu inceleyebilirsiniz

---

## Yöntem 3: Gerçek Email Gönderimi (Test Ortamı) 📧

Resend test modunu kullanarak gerçek email gönderin.

### Ön Gereksinimler:

1. **Resend hesabı oluşturun:**
   - https://resend.com/signup adresine gidin
   - Ücretsiz hesap oluşturun (ayda 100 email)

2. **API Key alın:**
   - Dashboard > API Keys
   - "Create API Key" butonuna tıklayın
   - Key'i kopyalayın

3. **.env dosyasını güncelleyin:**
   ```env
   RESEND_API_KEY=re_your_api_key_here
   NEXTAUTH_URL=http://localhost:3005
   ```

### Test Adımları:

#### A. Wallet Pending Email Testi

1. **Uygulamayı başlatın:**
   ```bash
   npm run dev
   ```

2. **Kullanıcı olarak giriş yapın:**
   - http://localhost:3005/login

3. **Wallet sayfasına gidin:**
   - http://localhost:3005/wallet

4. **Wallet adresi girin:**
   ```
   0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
   ```

5. **"Save Wallet Address" butonuna tıklayın**

6. **Email kutunuzu kontrol edin:**
   - Pending verification emaili gelecek
   - Wallet adresi maskelenmiş olmalı
   - Doğrulama talimatları olmalı

#### B. Wallet Approved Email Testi

1. **Admin olarak giriş yapın:**
   - http://localhost:3005/admin/login
   - Email: admin@sylvantoken.org
   - Password: admin123

2. **Kullanıcı detaylarına gidin:**
   - http://localhost:3005/admin/users/[USER_ID]

3. **API ile wallet'ı onaylayın:**
   ```bash
   curl -X PUT http://localhost:3005/api/admin/users/[USER_ID]/wallet \
     -H "Content-Type: application/json" \
     -H "Cookie: your-session-cookie" \
     -d '{"action": "approve"}'
   ```

4. **Email kutunuzu kontrol edin:**
   - Approved emaili gelecek
   - Tebrik mesajı olmalı
   - Dashboard linki olmalı

#### C. Wallet Rejected Email Testi

1. **API ile wallet'ı reddedin:**
   ```bash
   curl -X PUT http://localhost:3005/api/admin/users/[USER_ID]/wallet \
     -H "Content-Type: application/json" \
     -H "Cookie: your-session-cookie" \
     -d '{
       "action": "reject",
       "reason": "Geçersiz cüzdan adresi formatı"
     }'
   ```

2. **Email kutunuzu kontrol edin:**
   - Rejected emaili gelecek
   - Red nedeni açıklanmalı
   - Yeniden gönderme talimatları olmalı

---

## Yöntem 4: Email Queue Test (Redis ile) 🔄

Email queue sistemini test edin (Redis gerektirir).

### Ön Gereksinimler:

1. **Redis'i yükleyin ve başlatın:**
   
   **Windows (WSL):**
   ```bash
   sudo apt-get install redis-server
   sudo service redis-server start
   ```
   
   **macOS:**
   ```bash
   brew install redis
   brew services start redis
   ```
   
   **Docker:**
   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

2. **.env dosyasını güncelleyin:**
   ```env
   REDIS_URL=redis://localhost:6379
   ```

### Test Adımları:

1. **Queue test scriptini çalıştırın:**
   ```bash
   npx tsx emails/verify-wallet-integration.ts
   ```

2. **Çıktıyı kontrol edin:**
   ```
   🧪 Testing Wallet Verification Email Integration
   
   📧 Test 1: Queueing wallet pending email...
   ✅ Wallet pending email queued successfully
   
   📧 Test 2: Queueing wallet approved email...
   ✅ Wallet approved email queued successfully
   
   📧 Test 3: Queueing wallet rejected email...
   ✅ Wallet rejected email queued successfully
   
   🎉 All wallet email integration tests passed!
   ```

3. **Redis queue'yu kontrol edin:**
   ```bash
   redis-cli
   > KEYS *
   > LLEN bull:emails:waiting
   ```

---

## Test Kontrol Listesi ✅

Her email şablonu için aşağıdakileri kontrol edin:

### Görsel Kontroller:
- [ ] Logo doğru görünüyor
- [ ] Renkler marka kimliğine uygun
- [ ] Butonlar tıklanabilir görünüyor
- [ ] Wallet adresi maskelenmiş (0x1234...5678)
- [ ] İkonlar doğru yerde
- [ ] Boşluklar ve hizalama düzgün

### İçerik Kontrolleri:
- [ ] Kullanıcı adı doğru
- [ ] Wallet adresi doğru
- [ ] Linkler çalışıyor
- [ ] Dil doğru (TR için Türkçe, EN için İngilizce)
- [ ] Talimatlar açık ve anlaşılır

### Responsive Kontroller:
- [ ] Mobil cihazda düzgün görünüyor
- [ ] Tablet'te düzgün görünüyor
- [ ] Desktop'ta düzgün görünüyor
- [ ] Email istemcilerinde düzgün (Gmail, Outlook, Apple Mail)

### Fonksiyonel Kontroller:
- [ ] Email gönderimi başarılı
- [ ] Email doğru kişiye gidiyor
- [ ] Linkler doğru sayfaya yönlendiriyor
- [ ] Butonlar çalışıyor
- [ ] Unsubscribe linki var (gelecekte eklenecek)

---

## Sorun Giderme 🔧

### Email Gönderilmiyor

**Sorun:** Email queue'ya eklenmiyor
**Çözüm:**
```bash
# Redis çalışıyor mu kontrol edin
redis-cli ping
# PONG dönmeli

# Redis bağlantısını test edin
redis-cli
> PING
```

**Sorun:** Resend API hatası
**Çözüm:**
- API key'in doğru olduğundan emin olun
- Resend dashboard'da quota'nızı kontrol edin
- .env dosyasında RESEND_API_KEY'in set olduğundan emin olun

### Preview Çalışmıyor

**Sorun:** `npm run email:dev` hata veriyor
**Çözüm:**
```bash
# React Email'i yeniden yükleyin
npm install react-email @react-email/components --save-dev

# Cache'i temizleyin
rm -rf .next
npm run email:dev
```

### Türkçe Karakterler Bozuk

**Sorun:** Email'de Türkçe karakterler düzgün görünmüyor
**Çözüm:**
- Email şablonlarının UTF-8 encoding'de olduğundan emin olun
- HTML meta tag'inde charset="UTF-8" olmalı
- Resend otomatik olarak UTF-8 kullanır

---

## Hızlı Test Komutları 🚀

```bash
# Email preview sunucusunu başlat
npm run email:dev

# Tüm email şablonlarını test et
npx tsx emails/verify-wallet-integration.ts

# Tek bir email'i HTML olarak render et
npx tsx emails/test-wallet-pending.tsx > test.html

# Redis queue'yu kontrol et
redis-cli LLEN bull:emails:waiting

# Email queue istatistiklerini gör
redis-cli
> KEYS bull:emails:*
> LLEN bull:emails:completed
> LLEN bull:emails:failed
```

---

## Önerilen Test Sırası 📋

1. **Önce Preview ile görsel test:**
   ```bash
   npm run email:dev
   ```
   - Tüm şablonları görsel olarak kontrol edin
   - Farklı dilleri test edin
   - Responsive tasarımı kontrol edin

2. **Sonra Queue test:**
   ```bash
   npx tsx emails/verify-wallet-integration.ts
   ```
   - Email queue sistemini test edin
   - Hata yönetimini kontrol edin

3. **Son olarak gerçek gönderim:**
   - Uygulamayı başlatın
   - Wallet işlemlerini yapın
   - Gerçek emailleri kontrol edin

---

## Faydalı Linkler 🔗

- [React Email Docs](https://react.email/docs/introduction)
- [Resend Docs](https://resend.com/docs)
- [Email Testing Best Practices](https://www.emailonacid.com/blog/article/email-development/email-testing-best-practices/)
- [Can I Email](https://www.caniemail.com/) - Email istemcisi uyumluluk tablosu

---

## Destek 💬

Sorun yaşarsanız:
1. Bu rehberdeki sorun giderme bölümünü kontrol edin
2. Console loglarını inceleyin
3. Email queue durumunu kontrol edin
4. Resend dashboard'da email loglarını kontrol edin
