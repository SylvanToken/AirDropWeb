# 🎁 Referral System (Davetiye Sistemi) Dokümantasyonu

## ✅ Tamamlandı

Kullanıcı kayıt sistemine benzersiz referral code (davetiye kodu) özelliği başarıyla eklendi!

---

## 📋 Özellikler

### 1. Otomatik Referral Code Oluşturma
Her yeni kullanıcıya kayıt sırasında otomatik olarak benzersiz bir davetiye kodu oluşturulur.

**Format:**
- 8 karakter uzunluğunda
- Büyük harf ve rakamlardan oluşur
- Karışıklığa neden olan karakterler hariç (0, O, I, 1)
- Örnek: `ABC123XY`, `DEF456ZW`, `GHJ789KL`

### 2. Davetiye ile Kayıt
Kullanıcılar başka birinin davetiye koduyla kayıt olabilir.

### 3. Referral İstatistikleri
Her kullanıcı kaç kişiyi davet ettiğini görebilir.

---

## 🗄️ Database Değişiklikleri

### User Tablosuna Eklenen Alanlar:

```prisma
model User {
  // ... diğer alanlar
  
  referralCode     String?  @unique  // Kullanıcının benzersiz davetiye kodu
  invitedBy        String?           // Bu kullanıcıyı davet eden kişinin kodu
  
  // ... diğer alanlar
}
```

**Migration:** ✅ Başarıyla uygulandı (`20251112200236_add_referral_code`)

---

## 🚀 Kullanım

### 1. Yeni Kullanıcı Kaydı

Kullanıcı kayıt olduğunda otomatik olarak referral code oluşturulur:

```typescript
// POST /api/auth/register
{
  "email": "user@example.com",
  "username": "newuser",
  "password": "SecurePass123",
  "acceptedTerms": true,
  "referralCode": "ABC123XY"  // Opsiyonel: Davet eden kişinin kodu
}

// Response:
{
  "message": "User created successfully",
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "username": "newuser",
    "referralCode": "DEF456ZW",  // Yeni kullanıcının kodu
    "invitedBy": "ABC123XY",     // Davet eden kişinin kodu
    "createdAt": "2025-11-12T..."
  }
}
```

### 2. Referral Code Utilities

```typescript
import ReferralCodeUtils from '@/lib/referral-code';

// Yeni kod oluştur
const code = await ReferralCodeUtils.generateUnique();
console.log(code); // "ABC123XY"

// Kod doğrula
const isValid = ReferralCodeUtils.isValid("ABC123XY");
console.log(isValid); // true

// Kullanıcı bul
const user = await ReferralCodeUtils.findUser("ABC123XY");
console.log(user); // { id, username, email, ... }

// İstatistikleri al
const stats = await ReferralCodeUtils.getStats(userId);
console.log(stats);
/*
{
  referralCode: "ABC123XY",
  totalReferrals: 5,
  referrals: [
    { id, username, email, createdAt, totalPoints },
    ...
  ]
}
*/

// Davetiye linki oluştur
const link = ReferralCodeUtils.generateLink("ABC123XY");
console.log(link); // "http://localhost:3005/register?ref=ABC123XY"

// Kodu formatla (görsel)
const formatted = ReferralCodeUtils.format("ABC123XY");
console.log(formatted); // "ABC-123-XY"
```

---

## 🎨 Frontend Entegrasyonu

### Referral Link Gösterme

```typescript
// components/profile/ReferralSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

export function ReferralSection({ userId }: { userId: string }) {
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/user/referral-stats`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  const copyLink = () => {
    const link = `${window.location.origin}/register?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Davetiye Kodunuz</h3>
        <div className="flex items-center gap-2 mt-2">
          <code className="px-4 py-2 bg-gray-100 rounded text-lg font-mono">
            {stats.referralCode}
          </code>
          <Button onClick={copyLink} size="sm">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div>
        <h4 className="font-medium">Davet Ettiğiniz Kullanıcılar</h4>
        <p className="text-2xl font-bold">{stats.totalReferrals}</p>
      </div>

      {stats.referrals.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Son Davetler</h4>
          <ul className="space-y-2">
            {stats.referrals.slice(0, 5).map(ref => (
              <li key={ref.id} className="flex justify-between">
                <span>{ref.username}</span>
                <span className="text-sm text-gray-500">
                  {new Date(ref.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Kayıt Sayfasında Referral Code

```typescript
// app/register/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  const [referralCode, setReferralCode] = useState(refCode || '');
  const [referrerInfo, setReferrerInfo] = useState(null);

  useEffect(() => {
    if (refCode) {
      // Davet eden kişinin bilgilerini al
      fetch(`/api/referral/validate?code=${refCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setReferrerInfo(data.user);
          }
        });
    }
  }, [refCode]);

  return (
    <div>
      {referrerInfo && (
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <p className="text-sm">
            🎉 <strong>{referrerInfo.username}</strong> tarafından davet edildiniz!
          </p>
        </div>
      )}

      <form>
        {/* ... diğer form alanları ... */}
        
        <input
          type="hidden"
          name="referralCode"
          value={referralCode}
        />
      </form>
    </div>
  );
}
```

---

## 🔌 API Endpoints

### 1. Kullanıcı İstatistikleri

```typescript
// GET /api/user/referral-stats
// Response:
{
  "referralCode": "ABC123XY",
  "totalReferrals": 5,
  "referrals": [
    {
      "id": "clx...",
      "username": "user1",
      "email": "user1@example.com",
      "createdAt": "2025-11-12T...",
      "totalPoints": 150
    }
  ]
}
```

### 2. Referral Code Doğrulama

```typescript
// GET /api/referral/validate?code=ABC123XY
// Response:
{
  "valid": true,
  "user": {
    "id": "clx...",
    "username": "inviter",
    "email": "inviter@example.com"
  }
}
```

### 3. Referral Leaderboard

```typescript
// GET /api/referral/leaderboard
// Response:
{
  "leaderboard": [
    {
      "username": "topinviter",
      "referralCode": "ABC123XY",
      "totalReferrals": 50,
      "rank": 1
    }
  ]
}
```

---

## 💡 Gelecek Özellikler (Opsiyonel)

### 1. Referral Ödülleri
```typescript
// Davet eden ve davet edilen için puan ödülü
const REFERRAL_REWARDS = {
  inviter: 100,  // Davet eden kişiye 100 puan
  invitee: 50,   // Davet edilen kişiye 50 puan
};
```

### 2. Referral Seviyeleri
```typescript
// Çok davet eden kullanıcılar için seviyeler
const REFERRAL_LEVELS = {
  bronze: { min: 5, bonus: 1.1 },   // 5+ davet: %10 bonus
  silver: { min: 20, bonus: 1.2 },  // 20+ davet: %20 bonus
  gold: { min: 50, bonus: 1.5 },    // 50+ davet: %50 bonus
};
```

### 3. Referral Kampanyaları
```typescript
// Belirli dönemlerde özel kampanyalar
const REFERRAL_CAMPAIGN = {
  startDate: '2025-12-01',
  endDate: '2025-12-31',
  multiplier: 2, // Çift puan
  minReferrals: 10,
  prize: 'Special NFT',
};
```

---

## 🧪 Test Etme

### Manuel Test

1. **Yeni Kullanıcı Kaydı:**
   ```bash
   curl -X POST http://localhost:3005/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "username": "testuser",
       "password": "SecurePass123",
       "acceptedTerms": true
     }'
   ```

2. **Referral Code ile Kayıt:**
   ```bash
   curl -X POST http://localhost:3005/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "invited@example.com",
       "username": "inviteduser",
       "password": "SecurePass123",
       "acceptedTerms": true,
       "referralCode": "ABC123XY"
     }'
   ```

3. **İstatistikleri Kontrol:**
   ```bash
   curl http://localhost:3005/api/user/referral-stats \
     -H "Authorization: Bearer <token>"
   ```

### Otomatik Test

```typescript
// __tests__/referral-system.test.ts
import { generateUniqueReferralCode, isValidReferralCode } from '@/lib/referral-code';

describe('Referral System', () => {
  it('should generate unique referral code', async () => {
    const code = await generateUniqueReferralCode();
    expect(code).toHaveLength(8);
    expect(isValidReferralCode(code)).toBe(true);
  });

  it('should validate referral code format', () => {
    expect(isValidReferralCode('ABC123XY')).toBe(true);
    expect(isValidReferralCode('abc123xy')).toBe(false); // lowercase
    expect(isValidReferralCode('ABC')).toBe(false); // too short
    expect(isValidReferralCode('ABC-123-XY')).toBe(false); // has dashes
  });
});
```

---

## 📊 Database Queries

### Kullanışlı Sorgular

```sql
-- En çok davet eden kullanıcılar
SELECT 
  u.username,
  u.referralCode,
  COUNT(invited.id) as totalReferrals
FROM User u
LEFT JOIN User invited ON invited.invitedBy = u.referralCode
GROUP BY u.id
ORDER BY totalReferrals DESC
LIMIT 10;

-- Belirli bir kullanıcının davetlileri
SELECT 
  u.username,
  u.email,
  u.createdAt,
  u.totalPoints
FROM User u
WHERE u.invitedBy = 'ABC123XY'
ORDER BY u.createdAt DESC;

-- Referral code olmayan kullanıcılar (eski kullanıcılar)
SELECT id, username, email
FROM User
WHERE referralCode IS NULL;
```

---

## 🔒 Güvenlik Notları

### 1. Referral Code Güvenliği
- ✅ Kodlar benzersizdir (unique constraint)
- ✅ Karışıklığa neden olan karakterler hariç
- ✅ Büyük/küçük harf duyarlı değil (uppercase'e çevrilir)
- ✅ SQL injection korumalı (Prisma ORM)

### 2. Rate Limiting
```typescript
// Referral code kontrolü için rate limiting
const REFERRAL_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 dakika
  max: 10, // 10 istek
};
```

### 3. Fraud Prevention
```typescript
// Aynı IP'den çok fazla kayıt engelleme
// Aynı email domain'inden çok fazla kayıt engelleme
// Şüpheli aktivite tespiti
```

---

## ✅ Kontrol Listesi

- [x] Database schema güncellendi
- [x] Migration uygulandı
- [x] Referral code utility fonksiyonları oluşturuldu
- [x] Register API endpoint güncellendi
- [x] Dokümantasyon hazırlandı
- [ ] Frontend referral section (gerektiğinde)
- [ ] Referral stats API endpoint (gerektiğinde)
- [ ] Referral leaderboard (gerektiğinde)
- [ ] Referral ödül sistemi (opsiyonel)

---

## 🎯 Sonraki Adımlar

1. **Frontend Geliştir:** Kullanıcı profil sayfasına referral section ekle
2. **API Endpoints:** Referral stats ve leaderboard endpoint'leri oluştur
3. **Ödül Sistemi:** Davet edenlere puan ödülü ekle
4. **Analytics:** Referral conversion rate tracking
5. **Kampanyalar:** Özel referral kampanyaları oluştur

---

## 📞 Destek

Sorularınız için:
- Dokümantasyon: Bu dosya
- Kod: `lib/referral-code.ts`
- API: `app/api/auth/register/route.ts`

---

**Durum:** ✅ Aktif ve Çalışıyor  
**Server:** http://localhost:3005  
**Tarih:** 12 Kasım 2025  
**Versiyon:** 1.0.0
