# 🌍 Task Internationalization System

## Genel Bakış

Görev (Task) sistemi artık 8 farklı dilde tam destek sağlamaktadır. Görevler oluşturulduğunda otomatik olarak tüm dillere çevrilir ve kullanıcılar kendi dillerinde görevleri görürler.

## 🎯 Özellikler

- ✅ **8 Dil Desteği:** EN, TR, AR, DE, ES, KO, RU, ZH
- ✅ **Otomatik Çeviri:** Görev oluşturulurken tüm çeviriler otomatik eklenir
- ✅ **Fallback Mekanizması:** Çeviri yoksa İngilizce gösterilir
- ✅ **Database Entegrasyonu:** Çeviriler database'de saklanır
- ✅ **Type-Safe:** TypeScript ile tam tip güvenliği

## 📊 Database Yapısı

### Task Model

```prisma
model Task {
  id            String  @id @default(cuid())
  campaignId    String
  
  // English (default)
  title         String
  description   String
  
  // Translations
  titleTr       String? // Turkish
  descriptionTr String?
  titleAr       String? // Arabic
  descriptionAr String?
  titleDe       String? // German
  descriptionDe String?
  titleEs       String? // Spanish
  descriptionEs String?
  titleKo       String? // Korean
  descriptionKo String?
  titleRu       String? // Russian
  descriptionRu String?
  titleZh       String? // Chinese
  descriptionZh String?
  
  // ... other fields
}
```

### Campaign Model

Campaign modeli de aynı çeviri yapısına sahiptir.

## 🔧 Kullanım

### 1. Görev Oluşturma (Otomatik Çeviri ile)

```typescript
import { generateTaskTranslations } from '@/lib/task-generator/translations';

// Twitter follow görevi oluştur
const translations = generateTaskTranslations('twitter', 'follow', {
  account: 'Sylvan Token'
});

// Database'e kaydet
await prisma.task.create({
  data: {
    campaignId: 'campaign-id',
    // English (default)
    title: translations.title,
    description: translations.description,
    // Translations
    titleTr: translations.titleTr,
    descriptionTr: translations.descriptionTr,
    titleAr: translations.titleAr,
    descriptionAr: translations.descriptionAr,
    titleDe: translations.titleDe,
    descriptionDe: translations.descriptionDe,
    titleEs: translations.titleEs,
    descriptionEs: translations.descriptionEs,
    titleKo: translations.titleKo,
    descriptionKo: translations.descriptionKo,
    titleRu: translations.titleRu,
    descriptionRu: translations.descriptionRu,
    titleZh: translations.titleZh,
    descriptionZh: translations.descriptionZh,
    // Other fields
    points: 20,
    taskType: 'TWITTER_FOLLOW',
  }
});
```

### 2. Görevleri Lokalize Etme

```typescript
import { getLocalizedTask, getLocalizedTasks } from '@/lib/task-i18n';

// Tek görev
const task = await prisma.task.findUnique({ where: { id: 'task-id' } });
const localizedTask = getLocalizedTask(task, 'tr'); // Turkish

console.log(localizedTask.title); // "Sylvan Token hesabını Twitter'da takip et"

// Birden fazla görev
const tasks = await prisma.task.findMany();
const localizedTasks = getLocalizedTasks(tasks, 'de'); // German
```

### 3. API Endpoint'lerinde Kullanım

```typescript
// app/api/tasks/route.ts
import { getLocalizedTasks } from '@/lib/task-i18n';

export async function GET(request: NextRequest) {
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
  
  const tasks = await prisma.task.findMany({
    where: { isActive: true }
  });
  
  // Lokalize edilmiş görevleri döndür
  const localizedTasks = getLocalizedTasks(tasks, locale);
  
  return NextResponse.json({ tasks: localizedTasks });
}
```

## 📝 Desteklenen Görev Tipleri

### 1. Twitter Görevleri

```typescript
// Follow
generateTaskTranslations('twitter', 'follow', { account: 'AccountName' });

// Like
generateTaskTranslations('twitter', 'like', { account: 'AccountName' });

// Retweet
generateTaskTranslations('twitter', 'retweet', { account: 'AccountName' });
```

### 2. Telegram Görevleri

```typescript
// Join
generateTaskTranslations('telegram', 'join', { channel: 'ChannelName' });
```

### 3. Profil Görevleri

```typescript
// Wallet
generateTaskTranslations('profile', 'wallet', {});

// Twitter Link
generateTaskTranslations('profile', 'twitter', {});
```

### 4. Çevresel Görevler

```typescript
// Website Visit
generateTaskTranslations('environmental', 'visit', { org: 'OrganizationName' });
```

## 🌍 Desteklenen Diller

| Kod | Dil | Durum |
|-----|-----|-------|
| en | English | ✅ Default |
| tr | Türkçe | ✅ Tam Destek |
| ar | العربية (Arabic) | ✅ Tam Destek |
| de | Deutsch (German) | ✅ Tam Destek |
| es | Español (Spanish) | ✅ Tam Destek |
| ko | 한국어 (Korean) | ✅ Tam Destek |
| ru | Русский (Russian) | ✅ Tam Destek |
| zh | 中文 (Chinese) | ✅ Tam Destek |

## 🔄 Migration

Database migration otomatik olarak uygulandı:

```bash
npx prisma migrate dev --name add_task_translations
```

Yeni alanlar:
- `titleAr`, `descriptionAr` (Arabic)
- `titleEs`, `descriptionEs` (Spanish)
- `titleKo`, `descriptionKo` (Korean)

## 🧪 Test

Test script'i ile çevirileri test edebilirsiniz:

```bash
npx tsx scripts/test-task-translations.ts
```

## 📚 API Referansı

### Translation Functions

#### `generateTaskTranslations(taskType, action, replacements)`

Görev için tüm dillerde çeviri oluşturur.

**Parameters:**
- `taskType`: 'twitter' | 'telegram' | 'profile' | 'environmental'
- `action`: 'follow' | 'like' | 'retweet' | 'join' | 'wallet' | 'twitter' | 'visit'
- `replacements`: Placeholder değerleri (örn: `{ account: 'Name' }`)

**Returns:** `TaskTranslations` object with all language fields

#### `getLocalizedTask(task, locale)`

Görevi belirtilen dile çevirir.

**Parameters:**
- `task`: Task object from database
- `locale`: Language code ('en', 'tr', 'ar', etc.)

**Returns:** `{ title: string, description: string }`

#### `getLocalizedTasks(tasks, locale)`

Birden fazla görevi belirtilen dile çevirir.

**Parameters:**
- `tasks`: Array of Task objects
- `locale`: Language code

**Returns:** Array of localized tasks

#### `hasTranslation(task, locale)`

Görevin belirtilen dilde çevirisi olup olmadığını kontrol eder.

**Returns:** `boolean`

#### `getAvailableTranslations(task)`

Görevin hangi dillerde çevirisi olduğunu döndürür.

**Returns:** `string[]` (language codes)

## 🎨 Yeni Çeviri Ekleme

### 1. Translation Template Ekleme

`lib/task-generator/translations.ts` dosyasına yeni template ekleyin:

```typescript
const translationTemplates = {
  // ... existing templates
  
  newTaskType: {
    newAction: {
      title: {
        en: 'English Title',
        tr: 'Türkçe Başlık',
        ar: 'العنوان العربي',
        // ... other languages
      },
      description: {
        en: 'English Description',
        tr: 'Türkçe Açıklama',
        ar: 'الوصف العربي',
        // ... other languages
      }
    }
  }
};
```

### 2. Kullanım

```typescript
const translations = generateTaskTranslations('newTaskType', 'newAction', {
  placeholder: 'value'
});
```

## 🔍 Sorun Giderme

### Çeviri Görünmüyor

1. Database'de çeviri alanları var mı kontrol edin:
   ```sql
   SELECT titleTr, titleAr FROM Task WHERE id = 'task-id';
   ```

2. Locale doğru mu kontrol edin:
   ```typescript
   console.log('Current locale:', locale);
   ```

3. Fallback çalışıyor mu test edin:
   ```typescript
   const localized = getLocalizedTask(task, 'invalid-locale');
   // Should return English
   ```

### Migration Hatası

Eğer migration hatası alırsanız:

```bash
# Reset database (development only!)
npx prisma migrate reset

# Apply migrations
npx prisma migrate dev
```

## 📈 İstatistikler

- **Toplam Çeviri Alanı:** 16 (8 dil × 2 alan)
- **Desteklenen Görev Tipi:** 4 (Twitter, Telegram, Profile, Environmental)
- **Desteklenen Aksiyon:** 7 (follow, like, retweet, join, wallet, twitter, visit)
- **Toplam Çeviri Template:** 28+

## 🚀 Gelecek İyileştirmeler

- [ ] Admin panel'de çeviri düzenleme
- [ ] Otomatik çeviri API entegrasyonu
- [ ] Çeviri kalite kontrol sistemi
- [ ] Eksik çeviri uyarıları
- [ ] Çeviri versiyonlama

## 📞 Destek

Sorun yaşarsanız:
- Test script'ini çalıştırın: `npx tsx scripts/test-task-translations.ts`
- Database'i kontrol edin
- Locale ayarlarını doğrulayın

---

**Oluşturulma Tarihi:** 2024
**Son Güncelleme:** 2024
**Versiyon:** 1.0.0
