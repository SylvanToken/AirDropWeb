# Referral Görev Sistemi - Canlı Simülasyon

## 🎬 Senaryo: Ali ve Ayşe'nin Hikayesi

### Başlangıç Durumu

**Veritabanı:**
```sql
-- Kampanya
Campaign {
  id: "camp_001"
  title: "Yaz Kampanyası 2025"
  isActive: true
}

-- Referral Görevi
Task {
  id: "task_ref_001"
  campaignId: "camp_001"
  title: "Arkadaşını Davet Et"
  description: "Referral kodunla bir arkadaşını davet et, 100 puan kazan!"
  taskType: "REFERRAL"  ← ÖNEMLİ!
  points: 100
  isActive: true
}

-- Kullanıcı: Ali
User {
  id: "user_ali"
  email: "ali@example.com"
  username: "ali_crypto"
  referralCode: "ALI2025XYZ"  ← Ali'nin kodu
  totalPoints: 0
}
```

---

## 📍 ADIM 1: Ali Referral Görevini Başlatır

**Ali'nin Aksiyonu:**
- Ali görevler sayfasına gider
- "Arkadaşını Davet Et" görevini görür
- "Başlat" butonuna tıklar

**Sistem İşlemi:**
```typescript
// POST /api/completions
{
  taskId: "task_ref_001",
  userId: "user_ali"
}
```

**Veritabanı Değişikliği:**
```sql
-- Yeni Completion kaydı oluşturulur
Completion {
  id: "comp_001"
  userId: "user_ali"
  taskId: "task_ref_001"
  status: "PENDING"  ← Beklemede!
  pointsAwarded: 0
  completedAt: "2025-11-13T10:00:00Z"
}
```

**Ali'nin Gördüğü:**
```
✅ Görev başlatıldı!
📋 Durum: Beklemede
💡 Referral kodunuzu paylaşın: ALI2025XYZ
⏳ Biri kodunuzla kayıt olduğunda otomatik tamamlanacak
```

---

## 📍 ADIM 2: Ali Kodunu Paylaşır

**Ali'nin Aksiyonu:**
- Profil sayfasından referral kodunu kopyalar: `ALI2025XYZ`
- Arkadaşı Ayşe'ye WhatsApp'tan gönderir:

```
"Merhaba Ayşe! 🎉
Bu harika kripto airdrop platformuna katıl!
Kayıt olurken benim kodumu kullan: ALI2025XYZ
İkimiz de puan kazanacağız! 🚀
Link: https://platform.com/register?ref=ALI2025XYZ"
```

---

## 📍 ADIM 3: Ayşe Kayıt Olur (Sihir Burada Başlar! ✨)

**Ayşe'nin Aksiyonu:**
- Kayıt sayfasına gider
- Formu doldurur:
  ```
  Email: ayse@example.com
  Username: ayse_defi
  Password: ********
  Referral Code: ALI2025XYZ  ← Ali'nin kodu
  ```
- "Kayıt Ol" butonuna tıklar

**Sistem İşlemi (app/api/auth/register/route.ts):**

```typescript
// 1. Ayşe'nin kullanıcı kaydı oluşturulur
const newUser = await prisma.user.create({
  data: {
    email: "ayse@example.com",
    username: "ayse_defi",
    password: hashedPassword,
    invitedBy: "ALI2025XYZ",  ← Ali'nin kodu kaydedilir
    referralCode: "AYSE2025ABC",  ← Ayşe'nin kendi kodu
    totalPoints: 0
  }
});

// 2. 🎯 REFERRAL OTOMASYONU ÇAĞRILIR!
const referralResult = await processReferralCompletion(
  "ALI2025XYZ",  // Ali'nin kodu
  newUser.id     // Ayşe'nin ID'si
);
```

---

## 📍 ADIM 4: Referral Otomasyonu Çalışır

**processReferralCompletion() Fonksiyonu:**

```typescript
// ⏱️ Performance Timer Başlar
const overallTimer = createPerformanceTimer('referral_completion_overall');

// ✅ 1. Validasyon
if (!isValidReferralCode("ALI2025XYZ")) {
  return { success: false, error: "Invalid code" };
}
// ✅ Geçti!

// ✅ 2. Duplicate Check
const existing = await checkDuplicateCompletion("user_ayse");
// ✅ Yok, devam!

// ✅ 3. Referrer'ı Bul
const referrer = await findUserByReferralCode("ALI2025XYZ");
// ✅ Bulundu: Ali (user_ali)

// ✅ 4. Pending Referral Görevlerini Bul
const pendingCompletions = await prisma.completion.findMany({
  where: {
    userId: "user_ali",
    status: "PENDING",
    task: {
      taskType: "REFERRAL",  ← Sadece REFERRAL görevler!
      isActive: true
    }
  },
  orderBy: { completedAt: 'asc' }  // En eski önce
});

// ✅ Bulundu: comp_001 (Ali'nin pending görevi)

// ✅ 5. Görevi Tamamla (Transaction içinde)
await executeTransaction(async (tx) => {
  // Completion'ı güncelle
  await tx.completion.update({
    where: { id: "comp_001" },
    data: {
      status: "APPROVED",  ← PENDING → APPROVED
      pointsAwarded: 100,
      completedAt: new Date(),
      verificationStatus: "VERIFIED",
      userAgent: "referee:user_ayse"  ← Audit için
    }
  });
  
  // Ali'nin puanını artır
  await tx.user.update({
    where: { id: "user_ali" },
    data: {
      totalPoints: { increment: 100 }  ← 0 → 100
    }
  });
});

// ⏱️ Performance Timer Biter
overallTimer.end(true, {
  processingTime: 23,  // 23ms
  completionId: "comp_001",
  pointsAwarded: 100,
  withinTarget: true  // ✅ < 500ms
});
```

**Performance Logları:**
```json
[Referral Automation Performance] {
  "timestamp": "2025-11-13T10:05:23.456Z",
  "event": "referral_performance_metric",
  "service": "referral-automation",
  "operation": "referral_completion_overall",
  "duration": 23,
  "success": true,
  "metadata": {
    "processingTime": 23,
    "completionId": "comp_001",
    "pointsAwarded": 100,
    "withinTarget": true
  }
}

[Referral Automation Success] {
  "timestamp": "2025-11-13T10:05:23.456Z",
  "event": "referral_completion_success",
  "referralCode": "ALI2025XYZ",
  "newUserId": "user_ayse",
  "referrerId": "user_ali",
  "completionId": "comp_001",
  "pointsAwarded": 100,
  "processingTime": 23
}
```

---

## 📍 ADIM 5: Sonuç

### Veritabanı Son Durum:

```sql
-- Ali'nin Completion'ı Güncellendi
Completion {
  id: "comp_001"
  userId: "user_ali"
  taskId: "task_ref_001"
  status: "APPROVED"  ← PENDING'den değişti!
  pointsAwarded: 100  ← 0'dan değişti!
  completedAt: "2025-11-13T10:05:23Z"
  verificationStatus: "VERIFIED"
  userAgent: "referee:user_ayse"  ← Audit trail
}

-- Ali'nin Puanı Arttı
User {
  id: "user_ali"
  email: "ali@example.com"
  username: "ali_crypto"
  referralCode: "ALI2025XYZ"
  totalPoints: 100  ← 0'dan değişti! 🎉
}

-- Ayşe Başarıyla Kaydoldu
User {
  id: "user_ayse"
  email: "ayse@example.com"
  username: "ayse_defi"
  referralCode: "AYSE2025ABC"
  invitedBy: "ALI2025XYZ"  ← Ali'nin kodu kaydedildi
  totalPoints: 0
}
```

### Ali'nin Gördüğü:

```
🎉 Tebrikler!
✅ "Arkadaşını Davet Et" görevi tamamlandı!
💰 +100 puan kazandınız!
👤 ayse_defi sizin davetinizle katıldı
📊 Toplam Puanınız: 100
```

### Ayşe'nin Gördüğü:

```
✅ Kayıt başarılı!
🎁 ALI2025XYZ referral kodu ile katıldınız
👋 Hoş geldiniz!
```

---

## 🔄 Bonus: Ali İkinci Bir Arkadaşını Davet Ederse?

**Senaryo:**
1. Ali yine "Arkadaşını Davet Et" görevini başlatır
2. Yeni bir PENDING completion oluşur: `comp_002`
3. Mehmet, Ali'nin kodu ile kayıt olur
4. Sistem yine otomatik olarak `comp_002`'yi APPROVED yapar
5. Ali +100 puan daha kazanır (Toplam: 200 puan)

**Sınırsız Referral:**
- Ali istediği kadar arkadaş davet edebilir
- Her biri için yeni bir görev başlatması gerekir
- Her başarılı davet = +100 puan

---

## 🎯 Sistem Özellikleri

### ✅ Otomatik Tamamlanma
- Manuel doğrulama yok
- Kayıt anında otomatik işlenir
- 23ms gibi çok hızlı

### ✅ Güvenlik
- Duplicate check (aynı kişi 2 kez sayılmaz)
- Self-referral engellenir
- Transaction ile tutarlılık

### ✅ Performance
- Composite index kullanımı
- 23ms işlem süresi (hedef: 500ms)
- Detaylı performance monitoring

### ✅ Audit Trail
- Kim kimi davet etti kaydedilir
- `userAgent: "referee:user_ayse"` ile takip
- Tüm işlemler loglanır

---

## 🧪 Test Senaryoları

### Senaryo 1: Geçersiz Kod
```
Ayşe: "INVALID123" ile kayıt olur
Sonuç: Kayıt başarılı, ama referral işlenmez
Ali: Puan kazanmaz
```

### Senaryo 2: Self-Referral
```
Ali: Kendi kodu "ALI2025XYZ" ile kayıt olmaya çalışır
Sonuç: Hata! "Cannot refer yourself"
```

### Senaryo 3: Pending Görev Yok
```
Ali: Görevi başlatmamış
Ayşe: Ali'nin kodu ile kayıt olur
Sonuç: Kayıt başarılı, ama Ali puan kazanmaz (görev yok)
```

### Senaryo 4: Çoklu Pending Görevler
```
Ali: 3 tane "Arkadaşını Davet Et" görevi başlatmış
Ayşe: Ali'nin kodu ile kayıt olur
Sonuç: EN ESKİ görev tamamlanır (FIFO)
```

---

## 📊 Database Query Analizi

### Kullanılan İndeksler:

```sql
-- 1. Referrer Bulma
SELECT * FROM User WHERE referralCode = 'ALI2025XYZ'
-- Index: User.referralCode (unique)
-- Süre: ~0ms

-- 2. Pending Görevler
SELECT * FROM Completion 
WHERE userId = 'user_ali' 
  AND status = 'PENDING'
  AND taskId IN (SELECT id FROM Task WHERE taskType = 'REFERRAL')
-- Index: Completion(userId, status, taskId) ← YENİ COMPOSITE INDEX!
-- Süre: ~2ms

-- 3. Duplicate Check
SELECT * FROM Completion 
WHERE userAgent = 'referee:user_ayse'
  AND status = 'APPROVED'
-- Index: Completion.status
-- Süre: ~0ms
```

**Toplam Süre: ~23ms** ✅

---

## 🎓 Öğrenilen Dersler

1. **taskType = "REFERRAL"** → Otomatik tamamlanan görevler
2. **PENDING durumu** → Bekleyen referral görevleri
3. **processReferralCompletion()** → Kayıt sırasında çağrılır
4. **Composite index** → Hızlı sorgular için kritik
5. **Performance monitoring** → Her adım loglanır

---

## 🚀 Sonuç

Referral görev sistemi:
- ✅ Tamamen otomatik
- ✅ Çok hızlı (23ms)
- ✅ Güvenli (duplicate check, self-referral engelleme)
- ✅ Ölçeklenebilir (composite index)
- ✅ İzlenebilir (detaylı loglar)

**Ali mutlu! Ayşe mutlu! Sistem mutlu!** 🎉

---

*Simülasyon Tarihi: 13 Kasım 2025*
*Sistem Versiyonu: v2.0 (Performance Optimized)*
