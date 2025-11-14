# Ana Sayfa Çoklu Dil Desteği Implementasyonu

## Genel Bakış

Ana giriş sayfasının Header ve Footer component'leri için çoklu dil desteği başarıyla eklendi. Bu implementasyon, 8 farklı dilde (İngilizce, Türkçe, Arapça, Almanca, İspanyolca, Korece, Rusça ve Çince) tam destek sağlamaktadır.

## Eklenen Dosyalar

### Çeviri Dosyaları

Tüm diller için `homepage.json` dosyaları oluşturuldu:

```
locales/
├── en/homepage.json
├── tr/homepage.json
├── ar/homepage.json
├── de/homepage.json
├── es/homepage.json
├── ko/homepage.json
├── ru/homepage.json
└── zh/homepage.json
```

### Çeviri Dosyası Yapısı

Her `homepage.json` dosyası aşağıdaki yapıya sahiptir:

```json
{
  "header": {
    "navigation": {
      "home": "...",
      "about": "...",
      "airdrop": "...",
      "whitepaper": "...",
      "community": "...",
      "contact": "..."
    },
    "buttons": {
      "connectWallet": "...",
      "joinAirdrop": "...",
      "login": "...",
      "register": "...",
      "dashboard": "..."
    }
  },
  "footer": {
    "description": "...",
    "links": {
      "terms": "...",
      "privacy": "..."
    },
    "social": {
      "twitter": "...",
      "telegram": "..."
    },
    "branding": {
      "tagline": "...",
      "madeWith": "...",
      "forNature": "...",
      "greenerFuture": "..."
    },
    "copyright": "© {year} ..."
  }
}
```

## Güncellenen Component'ler

### Footer Component (`components/layout/Footer.tsx`)

**Değişiklikler:**

1. `useTranslations` hook'u `"homepage.footer"` namespace'ini kullanacak şekilde güncellendi
2. Tüm sabit metinler çeviri anahtarlarıyla değiştirildi:
   - Footer linkleri (`terms`, `privacy`)
   - Sosyal medya aria-label'ları
   - Branding metinleri (tagline, madeWith, forNature, greenerFuture)
   - Copyright metni (dinamik yıl desteği ile)

**Kullanım Örneği:**

```typescript
const t = useTranslations("homepage.footer");
const currentYear = new Date().getFullYear();

// Dinamik yıl ile copyright
{t("copyright", { year: currentYear })}

// Diğer çeviriler
{t("branding.tagline")}
{t("links.terms")}
```

### Header Component (`components/layout/Header.tsx`)

Header component'i zaten `common.json` içindeki `header` namespace'ini kullanıyor ve doğru çalışıyor. Ana sayfa için özel navigasyon linkleri gerekirse `homepage.header.navigation` kullanılabilir.

## Doğrulama

### Otomatik Doğrulama Script'i

Çeviri dosyalarının yapısını doğrulamak için bir script oluşturuldu:

```bash
npx tsx scripts/verify-homepage-translations.ts
```

Bu script:
- Tüm diller için `homepage.json` dosyalarının varlığını kontrol eder
- JSON formatının geçerliliğini doğrular
- Gerekli tüm anahtarların mevcut olduğunu kontrol eder
- Her dil için detaylı rapor sağlar

### Test Sonuçları

✅ Tüm 8 dil için çeviri dosyaları başarıyla oluşturuldu
✅ JSON formatı geçerli
✅ Tüm gerekli anahtarlar mevcut
✅ TypeScript hataları yok
✅ Component'ler doğru namespace'leri kullanıyor

## Desteklenen Diller

| Dil Kodu | Dil Adı | Durum |
|----------|---------|-------|
| en | English | ✅ Tamamlandı |
| tr | Türkçe | ✅ Tamamlandı |
| ar | العربية (Arapça) | ✅ Tamamlandı |
| de | Deutsch (Almanca) | ✅ Tamamlandı |
| es | Español (İspanyolca) | ✅ Tamamlandı |
| ko | 한국어 (Korece) | ✅ Tamamlandı |
| ru | Русский (Rusça) | ✅ Tamamlandı |
| zh | 中文 (Çince) | ✅ Tamamlandı |

## Kullanım

### Yeni Çeviri Ekleme

Yeni bir çeviri anahtarı eklemek için:

1. `locales/en/homepage.json` dosyasına yeni anahtarı ekleyin
2. Diğer tüm dil dosyalarına aynı anahtarı ekleyin
3. Component'te `t("yeni.anahtar")` şeklinde kullanın
4. Doğrulama script'ini çalıştırın

### Dinamik Değerler

Dinamik değerler için placeholder kullanın:

```json
{
  "copyright": "© {year} Sylvan Token"
}
```

Component'te:

```typescript
{t("copyright", { year: currentYear })}
```

## Notlar

- Footer component'inden kullanılmayan `LanguageSwitcher` import'u temizlendi
- Tüm çeviriler profesyonel ve tutarlı bir dil kullanıyor
- RTL (Right-to-Left) diller (Arapça) için özel dikkat gösterildi
- Emoji'ler tüm dillerde korundu (🌱)

## Gelecek İyileştirmeler

- [ ] Ana sayfa hero section için çeviriler
- [ ] Ana sayfa features section için çeviriler
- [ ] Ana sayfa CTA section için çeviriler
- [ ] Otomatik çeviri eksikliği tespiti
- [ ] Çeviri kalite kontrol sistemi

## İlgili Dosyalar

- `components/layout/Footer.tsx` - Footer component
- `components/layout/Header.tsx` - Header component
- `locales/*/homepage.json` - Çeviri dosyaları
- `scripts/verify-homepage-translations.ts` - Doğrulama script'i
