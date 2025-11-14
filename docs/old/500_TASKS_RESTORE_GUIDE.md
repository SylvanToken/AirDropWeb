# 500 Görev Listesi - Geri Yükleme Kılavuzu

## 📋 Durum

**Eski 500 görev SQL dosyası:** `prisma/seed-500-tasks.sql`
- ✅ Dosya başlatıldı (ilk 20 görev eklendi)
- ⏸️ Tam 500 görev eklemek çok fazla token kullanacağı için durduruldu

## 🎯 Çözüm Önerileri

### Seçenek 1: Manuel Tamamlama
`prisma/seed-500-tasks.sql` dosyasını aç ve aynı formatta devam et:

```sql
('t1_021', 'camp1', 'Task Title', 'Description', 30, 'TWITTER_FOLLOW', 'https://...', true, NOW(), NOW()),
```

### Seçenek 2: Script ile Oluştur
Bir script yazıp otomatik oluştur:

```javascript
// prisma/generate-500-tasks.js
const fs = require('fs');

const categories = {
  twitter: { prefix: 't1', campaign: 'camp1', count: 100 },
  telegram: { prefix: 't2', campaign: 'camp2', count: 100 },
  social: { prefix: 't3', campaign: 'camp3', count: 100 },
  referral: { prefix: 't4', campaign: 'camp4', count: 100 },
  profile: { prefix: 't5', campaign: 'camp5', count: 100 }
};

// Generate SQL...
```

### Seçenek 3: Mevcut Dosyayı Kullan
Eğer daha önce yedek aldıysan, o dosyayı geri yükle.

## 📝 Şimdi Ne Yapmalı?

1. **Task Manager için Markdown dosyası oluştur** (Seçenek 2)
2. **SQL dosyasını manuel tamamla** (gerekirse)
3. **Her ikisini de kullan** (Task Manager + SQL import)

Hangisini tercih edersin?
