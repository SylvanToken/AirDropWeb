# Admin Email Sender - Kullanım Kılavuzu

## 📧 Genel Bakış

Admin panelinden kullanıcılara manuel email gönderme sistemi. Farklı gönderen adresleri seçebilir, kullanıcı gruplarına veya özel email listelerine gönderim yapabilirsiniz.

## 🎯 Özellikler

### 1. **Gönderen Adresi Seçimi**
Aşağıdaki adreslerden birini seçebilirsiniz:
- `admin@sylvantoken.org` - Resmi admin iletişimi
- `info@sylvantoken.org` - Genel bilgi ve güncellemeler
- `support@sylvantoken.org` - Destek ve yardım masası
- `noreply@sylvantoken.org` - Otomatik bildirimler

### 2. **Alıcı Seçenekleri**
- **All Users:** Tüm kayıtlı kullanıcılar
- **Active Users Only:** Son 7 günde aktif olan kullanıcılar
- **Verified Users Only:** Wallet, Twitter ve Telegram doğrulaması yapılmış kullanıcılar
- **Custom Email List:** Manuel email listesi (virgülle ayrılmış)

### 3. **Değişken Desteği**
Email içeriğinde kullanabileceğiniz değişkenler:
- `{{username}}` - Kullanıcının kullanıcı adı
- `{{email}}` - Kullanıcının email adresi

### 4. **Güvenlik Özellikleri**
- ✅ Admin yetki kontrolü
- ✅ Rate limiting (saatte 100 email)
- ✅ Audit logging (tüm gönderimler kaydedilir)
- ✅ Batch processing (50'şer email)
- ✅ Test email özelliği

## 🚀 Kullanım

### Adım 1: Admin Paneline Giriş
```
URL: http://localhost:3333/admin/login
Email: admin@sylvantoken.org
```

### Adım 2: Send Email Sayfasına Git
Sidebar'dan **"Send Email"** seçeneğine tıklayın.

### Adım 3: Email Oluştur

1. **Gönderen Adresi Seçin**
   - Dropdown'dan uygun gönderen adresini seçin
   - Örnek: `admin@sylvantoken.org`

2. **Alıcıları Seçin**
   - Dropdown'dan alıcı türünü seçin
   - Custom seçerseniz, email adreslerini virgülle ayırarak girin

3. **Konu Girin**
   - Email konusunu yazın
   - Örnek: "Important Update - Sylvan Token Airdrop"

4. **Mesaj Yazın**
   - Email içeriğini yazın
   - Değişkenleri kullanabilirsiniz: `{{username}}`, `{{email}}`
   - Örnek:
     ```
     Hello {{username}},
     
     We have an important update about the Sylvan Token airdrop...
     
     Best regards,
     Sylvan Token Team
     ```

### Adım 4: Test Et (Opsiyonel)
- **"Send Test"** butonuna tıklayın
- Test emaili kendi adresinize gönderilir
- Email'i kontrol edin ve gerekirse düzenleyin

### Adım 5: Önizle (Opsiyonel)
- **"Preview"** butonuna tıklayın
- Email'in nasıl görüneceğini kontrol edin

### Adım 6: Gönder
- **"Send Email"** butonuna tıklayın
- Onay mesajını bekleyin
- Gönderim istatistiklerini görün

## 📊 Örnek Kullanım Senaryoları

### Senaryo 1: Tüm Kullanıcılara Duyuru
```
From: info@sylvantoken.org
To: All Users
Subject: New Feature Announcement

Hello {{username}},

We're excited to announce a new feature on our platform...

Visit: https://airdrop.sylvantoken.org

Best regards,
Sylvan Token Team
```

### Senaryo 2: Aktif Kullanıcılara Özel Kampanya
```
From: admin@sylvantoken.org
To: Active Users Only
Subject: Exclusive Bonus for Active Members

Dear {{username}},

As one of our most active members, we're offering you...

Your email: {{email}}

Claim your bonus now!
```

### Senaryo 3: Doğrulanmış Kullanıcılara Airdrop Bildirimi
```
From: admin@sylvantoken.org
To: Verified Users Only
Subject: Airdrop Distribution Starting Soon

Hello {{username}},

Your wallet has been verified and you're eligible for the airdrop...

Distribution will begin on [DATE]
```

### Senaryo 4: Özel Email Listesine Gönderim
```
From: support@sylvantoken.org
To: Custom Email List
Emails: user1@example.com, user2@example.com, user3@example.com
Subject: Support Ticket Update

Hello,

Your support ticket has been updated...
```

## 🔒 Güvenlik ve Limitler

### Rate Limiting
- **Limit:** 100 email/saat
- **Batch Size:** 50 email/batch
- **Batch Delay:** 1 saniye

### Audit Logging
Tüm email gönderimler şu bilgilerle loglanır:
- Admin ID ve email
- Alıcı türü ve sayısı
- Konu
- Gönderim zamanı
- Başarılı/Başarısız sayısı
- IP adresi
- User agent

### Güvenlik Kontrolleri
- ✅ Admin role kontrolü
- ✅ Session doğrulama
- ✅ Email format validasyonu
- ✅ Rate limit kontrolü
- ✅ Batch processing

## 📁 Teknik Detaylar

### API Endpoints

#### POST /api/admin/email/send
Email gönderir.

**Request:**
```json
{
  "senderAddress": "admin@sylvantoken.org",
  "recipientType": "all",
  "recipientEmails": "",
  "subject": "Test Email",
  "body": "Hello {{username}}"
}
```

**Response:**
```json
{
  "success": true,
  "recipientCount": 100,
  "sentCount": 98,
  "failedCount": 2
}
```

#### POST /api/admin/email/send-test
Test emaili gönderir (admin'in kendi adresine).

**Request:**
```json
{
  "senderAddress": "admin@sylvantoken.org",
  "subject": "Test Email",
  "body": "Hello {{username}}"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "sentTo": "admin@sylvantoken.org"
}
```

### Dosya Yapısı

```
app/admin/(dashboard)/
└── send-email/
    └── page.tsx                    # Email gönderme UI

app/api/admin/email/
├── send/
│   └── route.ts                    # Email gönderme API
└── send-test/
    └── route.ts                    # Test email API

components/layout/
└── AdminSidebar.tsx                # Sidebar (Send Email linki)
```

### Database Schema

Email gönderimler `AuditLog` tablosuna kaydedilir:

```prisma
model AuditLog {
  id            String   @id @default(cuid())
  action        String   // "email_sent"
  adminId       String
  adminEmail    String
  beforeData    String?  // Recipient info
  afterData     String?  // Send stats
  ipAddress     String?
  userAgent     String?
  timestamp     DateTime @default(now())
}
```

## ⚠️ Önemli Notlar

1. **Geri Alınamaz**
   - Gönderilen emailler geri alınamaz
   - Göndermeden önce mutlaka test edin

2. **Rate Limiting**
   - Saatte maksimum 100 email gönderilebilir
   - Büyük listeler için batch processing otomatik çalışır

3. **Değişkenler**
   - Değişkenler her alıcı için otomatik değiştirilir
   - Custom email listesinde username = email'in @ öncesi kısmı

4. **Audit Trail**
   - Tüm gönderimler audit log'a kaydedilir
   - Admin panelinden görüntülenebilir

5. **Email Provider**
   - Resend API kullanılır
   - RESEND_API_KEY environment variable gereklidir

## 🐛 Sorun Giderme

### Email gönderilmiyor
- RESEND_API_KEY'in doğru olduğundan emin olun
- Admin yetkilerinizi kontrol edin
- Rate limit'e takılmadığınızdan emin olun

### Test email gelmiyor
- Spam klasörünü kontrol edin
- Email adresinizin doğru olduğundan emin olun
- Console'da hata mesajlarını kontrol edin

### Değişkenler çalışmıyor
- Değişken formatını kontrol edin: `{{username}}` (çift süslü parantez)
- Boşluk bırakmayın: `{{ username }}` ❌ `{{username}}` ✅

### Rate limit hatası
- 1 saat bekleyin veya
- Daha küçük gruplara bölün

## 📞 Destek

Sorularınız için:
- GitHub Issues: https://github.com/SylvanToken/SylvanToken/issues
- Telegram: https://t.me/sylvantoken

---

**Son Güncelleme:** November 14, 2025  
**Versiyon:** 1.0.0
