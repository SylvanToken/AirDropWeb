# Requirements Document

## Introduction

Admin panel için manuel email gönderme özelliği. Adminler kullanıcılara veya kullanıcı gruplarına özelleştirilmiş emailler gönderebilecek. Mevcut email altyapısı kullanılacak ve gönderen adresi seçilebilir olacak.

## Glossary

- **Admin Email Sender**: Admin panelinde bulunan email gönderme arayüzü
- **Email System**: Mevcut email gönderme altyapısı (lib/email/client.ts)
- **Sender Address**: Email gönderen adresi (admin@sylvantoken.org, info@sylvantoken.org, vb.)
- **Recipient Selection**: Email alıcılarını seçme mekanizması
- **Email Template**: Önceden tanımlanmış veya özel email şablonları

## Requirements

### Requirement 1: Admin Email Sender Interface

**User Story:** Admin olarak, kullanıcılara manuel email göndermek istiyorum, böylece önemli duyuruları veya özel mesajları iletebilirim.

#### Acceptance Criteria

1. WHEN admin email sender sayfasını açtığında, THE Admin Email Sender SHALL email gönderme formunu görüntülemek
2. WHEN admin formu doldurduğunda, THE Admin Email Sender SHALL tüm gerekli alanların dolu olduğunu doğrulamak
3. WHEN admin "Send Email" butonuna tıkladığında, THE Admin Email Sender SHALL emaili seçilen alıcılara göndermek
4. WHEN email gönderimi başarılı olduğunda, THE Admin Email Sender SHALL başarı mesajı göstermek
5. WHEN email gönderimi başarısız olduğunda, THE Admin Email Sender SHALL hata mesajı göstermek ve detayları loglamak

### Requirement 2: Sender Address Selection

**User Story:** Admin olarak, email gönderen adresini seçmek istiyorum, böylece emailin amacına göre uygun gönderen kullanabilirim.

#### Acceptance Criteria

1. WHEN admin email formu açtığında, THE Admin Email Sender SHALL kullanılabilir gönderen adreslerini dropdown'da listelemek
2. WHERE gönderen adresi seçilmediğinde, THE Admin Email Sender SHALL varsayılan gönderen adresini kullanmak
3. WHEN admin bir gönderen adresi seçtiğinde, THE Admin Email Sender SHALL seçilen adresi form state'inde saklamak
4. THE Admin Email Sender SHALL sadece environment variable'da tanımlı gönderen adreslerine izin vermek
5. THE Admin Email Sender SHALL gönderen adresini email header'ında doğru şekilde ayarlamak

### Requirement 3: Recipient Selection

**User Story:** Admin olarak, email alıcılarını esnek şekilde seçmek istiyorum, böylece doğru kişilere ulaşabilirim.

#### Acceptance Criteria

1. WHEN admin alıcı seçim alanını kullandığında, THE Admin Email Sender SHALL aşağıdaki seçenekleri sunmak:
   - Tüm kullanıcılar
   - Belirli kullanıcılar (email veya username ile arama)
   - Kullanıcı grupları (role bazlı)
   - Email listesi (manuel email girişi)
2. WHEN admin "All Users" seçtiğinde, THE Admin Email Sender SHALL tüm aktif kullanıcıları alıcı olarak işaretlemek
3. WHEN admin belirli kullanıcıları seçtiğinde, THE Admin Email Sender SHALL seçilen kullanıcıları listelemek
4. WHEN admin email listesi girdiğinde, THE Admin Email Sender SHALL email formatını doğrulamak
5. THE Admin Email Sender SHALL en az bir alıcı seçilmesini zorunlu kılmak

### Requirement 4: Email Content Customization

**User Story:** Admin olarak, email içeriğini özelleştirmek istiyorum, böylece mesajımı etkili şekilde iletebilirim.

#### Acceptance Criteria

1. WHEN admin email içeriği oluşturduğunda, THE Admin Email Sender SHALL aşağıdaki alanları sağlamak:
   - Subject (konu)
   - Body (mesaj içeriği)
   - Template seçimi (opsiyonel)
2. WHEN admin template seçtiğinde, THE Admin Email Sender SHALL template içeriğini form alanlarına yüklemek
3. WHEN admin rich text editor kullandığında, THE Admin Email Sender SHALL HTML formatında içerik oluşturmayı desteklemek
4. THE Admin Email Sender SHALL email preview özelliği sunmak
5. THE Admin Email Sender SHALL değişken kullanımını desteklemek (örn: {{username}}, {{email}})

### Requirement 5: Batch Email Sending

**User Story:** Admin olarak, çok sayıda kullanıcıya email gönderirken sistem performansını korumak istiyorum.

#### Acceptance Criteria

1. WHEN admin 100'den fazla alıcıya email gönderdiğinde, THE Admin Email Sender SHALL batch processing kullanmak
2. WHEN batch processing aktif olduğunda, THE Admin Email Sender SHALL ilerleme durumunu göstermek
3. THE Admin Email Sender SHALL her batch'te maksimum 50 email göndermek
4. WHEN bir batch'te hata oluştuğunda, THE Admin Email Sender SHALL diğer batch'leri göndermeye devam etmek
5. WHEN tüm batch'ler tamamlandığında, THE Admin Email Sender SHALL özet rapor göstermek

### Requirement 6: Email Logging and Tracking

**User Story:** Admin olarak, gönderilen emailleri takip etmek istiyorum, böylece email kampanyalarının etkinliğini ölçebilirim.

#### Acceptance Criteria

1. WHEN email gönderildiğinde, THE Admin Email Sender SHALL email kaydını EmailLog tablosuna eklemek
2. THE Admin Email Sender SHALL aşağıdaki bilgileri loglamak:
   - Gönderen adresi
   - Alıcı listesi
   - Konu
   - Gönderim zamanı
   - Durum (sent, failed)
   - Hata mesajı (varsa)
3. WHEN admin email geçmişini görüntülediğinde, THE Admin Email Sender SHALL gönderilen emailleri listelemek
4. WHEN admin bir email kaydına tıkladığında, THE Admin Email Sender SHALL email detaylarını göstermek
5. THE Admin Email Sender SHALL email istatistiklerini dashboard'da göstermek

### Requirement 7: Email Templates Management

**User Story:** Admin olarak, sık kullanılan email şablonlarını kaydetmek istiyorum, böylece tekrar tekrar yazmak zorunda kalmayayım.

#### Acceptance Criteria

1. WHEN admin yeni template oluşturduğunda, THE Admin Email Sender SHALL template'i veritabanına kaydetmek
2. WHEN admin template listesini görüntülediğinde, THE Admin Email Sender SHALL tüm template'leri listelemek
3. WHEN admin bir template'i düzenlediğinde, THE Admin Email Sender SHALL değişiklikleri kaydetmek
4. WHEN admin bir template'i sildiğinde, THE Admin Email Sender SHALL onay istemek
5. THE Admin Email Sender SHALL template'lerde değişken kullanımını desteklemek

### Requirement 8: Security and Permissions

**User Story:** Admin olarak, email gönderme özelliğinin güvenli olmasını istiyorum, böylece kötüye kullanım önlenebilir.

#### Acceptance Criteria

1. THE Admin Email Sender SHALL sadece ADMIN role'üne sahip kullanıcılara erişim vermek
2. WHEN admin email gönderdiğinde, THE Admin Email Sender SHALL rate limiting uygulamak (saatte max 100 email)
3. THE Admin Email Sender SHALL gönderilen tüm emailleri audit log'a kaydetmek
4. WHEN şüpheli aktivite tespit edildiğinde, THE Admin Email Sender SHALL email gönderimini engellemek
5. THE Admin Email Sender SHALL spam önleme mekanizmaları uygulamak

### Requirement 9: Email Preview and Testing

**User Story:** Admin olarak, emaili göndermeden önce önizlemek istiyorum, böylece hataları önleyebilirim.

#### Acceptance Criteria

1. WHEN admin "Preview" butonuna tıkladığında, THE Admin Email Sender SHALL email önizlemesini modal'da göstermek
2. THE Admin Email Sender SHALL önizlemede değişkenleri örnek verilerle değiştirmek
3. WHEN admin "Send Test Email" butonuna tıkladığında, THE Admin Email Sender SHALL test emailini admin'in kendi adresine göndermek
4. THE Admin Email Sender SHALL önizlemede mobil ve desktop görünümlerini göstermek
5. WHEN önizleme açıkken admin içeriği değiştirdiğinde, THE Admin Email Sender SHALL önizlemeyi otomatik güncellemek

### Requirement 10: Internationalization Support

**User Story:** Admin olarak, farklı dillerde email göndermek istiyorum, böylece kullanıcılara kendi dillerinde ulaşabilirim.

#### Acceptance Criteria

1. WHEN admin email oluşturduğunda, THE Admin Email Sender SHALL dil seçimi sunmak
2. WHEN admin bir dil seçtiğinde, THE Admin Email Sender SHALL o dildeki template'leri göstermek
3. THE Admin Email Sender SHALL her dil için ayrı template desteği sunmak
4. WHEN admin çoklu dil desteği aktif ettiğinde, THE Admin Email Sender SHALL her dil için ayrı içerik girişi sağlamak
5. THE Admin Email Sender SHALL kullanıcının tercih ettiği dilde email göndermek

## Technical Requirements

### Database Schema

```prisma
model EmailTemplate {
  id          String   @id @default(cuid())
  name        String
  subject     String
  body        String   // HTML content
  language    String   @default("en")
  variables   String?  // JSON array of variable names
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([createdBy])
  @@index([language])
}

model EmailCampaign {
  id              String   @id @default(cuid())
  name            String
  senderAddress   String
  subject         String
  body            String
  recipientType   String   // "all", "specific", "role", "custom"
  recipientList   String?  // JSON array
  templateId      String?
  status          String   @default("draft") // draft, sending, sent, failed
  totalRecipients Int      @default(0)
  sentCount       Int      @default(0)
  failedCount     Int      @default(0)
  createdBy       String
  sentAt          DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([createdBy])
  @@index([status])
  @@index([sentAt])
}
```

### Environment Variables

```env
# Sender email addresses (comma-separated)
SENDER_EMAIL_ADDRESSES=admin@sylvantoken.org,info@sylvantoken.org,support@sylvantoken.org

# Default sender
DEFAULT_SENDER_EMAIL=admin@sylvantoken.org

# Email rate limits
EMAIL_RATE_LIMIT_PER_HOUR=100
EMAIL_BATCH_SIZE=50
```

### API Endpoints

1. `POST /api/admin/email/send` - Send email
2. `POST /api/admin/email/send-test` - Send test email
3. `GET /api/admin/email/templates` - List templates
4. `POST /api/admin/email/templates` - Create template
5. `PUT /api/admin/email/templates/[id]` - Update template
6. `DELETE /api/admin/email/templates/[id]` - Delete template
7. `GET /api/admin/email/campaigns` - List campaigns
8. `GET /api/admin/email/campaigns/[id]` - Get campaign details
9. `POST /api/admin/email/preview` - Preview email

## Non-Functional Requirements

1. **Performance**: Email gönderimi 5 saniye içinde başlamalı
2. **Scalability**: Sistem 10,000+ kullanıcıya email gönderebilmeli
3. **Reliability**: Email gönderim başarı oranı %95'in üzerinde olmalı
4. **Usability**: Email gönderme süreci 3 adımdan fazla olmamalı
5. **Security**: Tüm email işlemleri audit log'a kaydedilmeli

## Success Metrics

1. Email gönderim başarı oranı
2. Ortalama email gönderim süresi
3. Template kullanım oranı
4. Admin kullanıcı memnuniyeti
5. Email açılma oranı (opsiyonel tracking ile)
