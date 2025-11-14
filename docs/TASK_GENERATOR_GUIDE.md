# Random Task Generator - Kullanım Kılavuzu

## 📋 Genel Bakış

Sylvan Token projesi için otomatik görev üretme sistemi. Admin panelinden tek tıkla random görevler oluşturabilir, çevre kuruluşları için özel görevler ekleyebilir ve tüm görevler otomatik olarak çok dilde oluşturulur.

## 🎯 Özellikler

### 1. **Otomatik Görev Üretimi**
- Random görev karışımı
- Sosyal medya görevleri (Twitter, Telegram, GitHub)
- Profil tamamlama görevleri
- Çevre kuruluşları görevleri
- Token listing siteleri görevleri

### 2. **Çevre Kuruluşları Entegrasyonu**
- `public/cevreciler.html` dosyasından otomatik okuma
- Her kuruluş için 2 görev türü:
  - Website ziyareti (5 puan)
  - Twitter takip (10 puan)
- **NOT:** Çevre kuruluşları için retweet görevi YOK

### 3. **Çoklu Dil Desteği**
- Görevler İngilizce oluşturulur
- Otomatik olarak 8 dilde çeviri eklenir:
  - English (en)
  - Arabic (ar)
  - German (de)
  - Spanish (es)
  - Korean (ko)
  - Russian (ru)
  - Turkish (tr)
  - Chinese (zh)

### 4. **Admin Onay Sistemi**
- Tüm üretilen görevler **pasif** olarak oluşturulur
- Admin panelinde manuel olarak aktif edilmelidir
- Görevler aktif edilmeden kullanıcılara görünmez

## 📁 Dosya Yapısı

```
config/
└── sylvan-token-info.json          # Proje bilgileri ve görev şablonları

lib/
└── task-generator/
    └── index.ts                     # Görev üretme mantığı

components/
└── admin/
    ├── TaskManager.tsx              # Görev yönetimi (güncellenmiş)
    └── TaskGenerator.tsx            # Görev üretme UI

app/api/admin/tasks/
└── generate/
    └── route.ts                     # Görev üretme API

public/
└── cevreciler.html                  # Çevre kuruluşları listesi
```

## 🚀 Kullanım

### Admin Panelinde Görev Üretme

1. **Admin paneline giriş yapın:**
   - URL: http://localhost:3333/admin/login
   - Email: admin@sylvantoken.org

2. **Task Management sayfasına gidin**

3. **"Generate Tasks" sekmesine tıklayın**

4. **Görev türünü seçin:**
   - **Random Mix:** Rastgele karışık görevler
   - **Social Media Tasks:** Twitter, Telegram, GitHub görevleri
   - **Profile Completion Tasks:** Profil tamamlama görevleri
   - **Environmental Organization Tasks:** Çevre kuruluşları görevleri
   - **Token Listing Tasks:** CoinScope, CoinBoom görevleri
   - **All Task Types:** Tüm görev türleri

5. **"Generate Tasks" butonuna tıklayın**

6. **Oluşturulan görevleri "Manage Tasks" sekmesinde görün**

7. **Görevleri gözden geçirin ve aktif edin**

### Programatik Kullanım

```typescript
import taskGenerator from '@/lib/task-generator';

// Random görevler üret
const randomTasks = taskGenerator.generateRandomTasks(10);

// Sosyal medya görevleri
const socialTasks = taskGenerator.generateSocialTasks();

// Çevre kuruluşları görevleri
const envTasks = taskGenerator.generateEnvironmentalTasks();

// Profil görevleri
const profileTasks = taskGenerator.generateProfileTasks();

// Tüm görevler
const allTasks = taskGenerator.generateAllTasks();

// İstatistikler
const stats = taskGenerator.getTaskStats();
```

## 📊 Görev Kategorileri

### 1. Social Media Tasks (Sosyal Medya)
```json
{
  "twitter": {
    "follow": "Follow Sylvan Token on Twitter (10 puan)",
    "like": "Like Our Latest Tweet (5 puan)",
    "retweet": "Retweet Our Announcement (15 puan)"
  },
  "telegram": {
    "join": "Join Sylvan Token Telegram (10 puan)"
  },
  "github": {
    "star": "Star Sylvan Token on GitHub (15 puan)"
  }
}
```

### 2. Profile Completion Tasks (Profil Tamamlama)
```json
{
  "complete": "Complete Your Profile (20 puan)",
  "verifyWallet": "Verify Your Wallet (25 puan)",
  "verifyTwitter": "Verify Your Twitter Account (15 puan)",
  "verifyTelegram": "Verify Your Telegram Account (15 puan)"
}
```

### 3. Environmental Organization Tasks (Çevre Kuruluşları)
```
Her kuruluş için:
- Website Visit: 5 puan
- Twitter Follow: 10 puan
- NO RETWEET TASKS
```

**Mevcut Kuruluşlar:**
1. World Wildlife Fund (WWF)
2. Greenpeace
3. The Nature Conservancy
4. Sierra Club
5. Conservation International
6. Rainforest Alliance
7. Ocean Conservancy
8. Environmental Defense Fund
9. Natural Resources Defense Council (NRDC)
10. Earthjustice

### 4. Token Listing Tasks
```json
{
  "coinscope": "Visit Sylvan Token on CoinScope (10 puan)",
  "coinboom": "Visit Sylvan Token on CoinBoom (10 puan)"
}
```

## 🔧 Konfigürasyon

### Sylvan Token Bilgileri

`config/sylvan-token-info.json` dosyasında tüm proje bilgileri:

```json
{
  "links": {
    "website": "https://www.sylvantoken.org/",
    "airdrop": "https://airdrop.sylvantoken.org/",
    "github": "https://github.com/SylvanToken/SylvanToken",
    "twitter": "https://x.com/SylvanToken",
    "telegram": "https://t.me/sylvantoken",
    "coinscope": "https://www.coinscope.co/coin/1-syl",
    "coinboom": "https://coinboom.net/coin/sylvan-token"
  }
}
```

### Yeni Çevre Kuruluşu Ekleme

`public/cevreciler.html` dosyasına yeni kuruluş ekleyin:

```html
<div class="org" 
     data-name="Organization Name" 
     data-website="https://example.org/" 
     data-twitter="https://x.com/example">
    <h2>Organization Name</h2>
    <p>Organization description</p>
</div>
```

## 🎨 UI Özellikleri

### Task Generator Component

- **Görev Türü Seçimi:** Dropdown menü
- **Görev Sayısı:** Random mix için ayarlanabilir (1-50)
- **Bilgilendirme:** Her görev türü için açıklama
- **İlerleme Göstergesi:** Üretim sırasında loading state
- **Başarı Mesajı:** Üretilen görev sayısı ve durum

### Task Manager Integration

- **Tab Sistemi:** "Manage Tasks" ve "Generate Tasks" sekmeleri
- **Seamless Integration:** Üretilen görevler otomatik olarak listeye eklenir
- **Filter Support:** Aktif/Pasif görev filtreleme

## 📝 API Endpoints

### POST /api/admin/tasks/generate

Yeni görevler üretir.

**Request Body:**
```json
{
  "type": "random|social|profile|environmental|listing|all",
  "count": 10,
  "campaignId": "campaign-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 10 tasks",
  "tasks": [...],
  "stats": {
    "total": 10,
    "type": "random",
    "campaignId": "...",
    "status": "inactive"
  }
}
```

### GET /api/admin/tasks/generate/stats

Görev üretme istatistiklerini döner.

**Response:**
```json
{
  "stats": {
    "total": 50,
    "byCategory": {
      "social": 5,
      "profile": 4,
      "environmental": 20,
      "listing": 2,
      "random": 10
    },
    "environmentalOrgs": 10
  },
  "config": {...}
}
```

## ⚠️ Önemli Notlar

1. **Tüm görevler pasif olarak oluşturulur**
   - Admin onayı gereklidir
   - Aktif edilmeden kullanıcılara görünmez

2. **Çevre kuruluşları için özel kurallar**
   - Sadece website visit ve Twitter follow
   - Retweet görevi YOK

3. **Çoklu dil desteği**
   - Görevler İngilizce oluşturulur
   - Çeviriler otomatik eklenir (gelecek özellik)

4. **Campaign gereksinimi**
   - Görevler bir campaign'e bağlı olmalıdır
   - İlk campaign otomatik seçilir

## 🔮 Gelecek Özellikler

- [ ] Otomatik çeviri entegrasyonu
- [ ] Görev şablonu editörü
- [ ] Toplu görev aktifleştirme
- [ ] Görev önizleme
- [ ] Görev kopyalama
- [ ] Görev zamanlama
- [ ] A/B testing desteği

## 🐛 Sorun Giderme

### Görevler oluşturulmuyor
- Campaign ID'nin doğru olduğundan emin olun
- Admin yetkilerinizi kontrol edin
- Console'da hata mesajlarını kontrol edin

### Çevre kuruluşları yüklenmiyor
- `public/cevreciler.html` dosyasının var olduğundan emin olun
- HTML formatının doğru olduğunu kontrol edin
- `data-name` ve `data-website` attribute'larının dolu olduğunu kontrol edin

### Görevler kullanıcılara görünmüyor
- Görevlerin aktif olduğundan emin olun
- Campaign'in aktif olduğunu kontrol edin
- Cache'i temizleyin

## 📞 Destek

Sorularınız için:
- GitHub Issues: https://github.com/SylvanToken/SylvanToken/issues
- Telegram: https://t.me/sylvantoken

---

**Son Güncelleme:** November 14, 2025  
**Versiyon:** 1.0.0
