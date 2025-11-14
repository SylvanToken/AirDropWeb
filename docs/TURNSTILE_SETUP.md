# Cloudflare Turnstile Setup Guide

## 🔐 Bot Protection for Signup/Login

Cloudflare Turnstile, modern ve kullanıcı dostu bir CAPTCHA alternatifidir. Bu guide, Turnstile'ı signup ve login sayfalarına entegre etme adımlarını içerir.

## ✅ Tamamlanan İşler

### 1. Environment Variables ✅
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Frontend için site key
- `TURNSTILE_SECRET_KEY`: Backend verification için secret key

### 2. Components ✅
- `components/auth/TurnstileWidget.tsx`: React widget component
- Managed mode (otomatik risk değerlendirmesi)
- Error handling ve callbacks

### 3. Backend Verification ✅
- `lib/turnstile.ts`: Server-side verification helper
- `app/api/auth/register/route.ts`: Register endpoint'e entegre edildi
- IP-based verification
- Error handling

### 4. Frontend Integration ✅
- `components/auth/RegisterForm.tsx`: Turnstile widget eklendi
- Token state management
- Error handling ve user feedback

## 🚀 Kurulum Adımları

### 1. Cloudflare Turnstile Keys

Keys zaten alınmış:
```bash
# .env dosyanıza ekleyin
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAACArCE6b3EXA2mX4"
TURNSTILE_SECRET_KEY="0x4AAAAAACArCIAxxPkAefdXJYppUZPtiH4"

# Enable/Disable Turnstile (NEW!)
TURNSTILE_ENABLED="false"                    # Server-side verification
NEXT_PUBLIC_TURNSTILE_ENABLED="false"        # Client-side widget visibility

# Local testing: set to "false"
# Production: set to "true"
```

### 2. Widget Modes

**Managed Mode** (Kullanılıyor) ✅
- Cloudflare otomatik risk değerlendirmesi yapar
- Çoğu kullanıcı sadece checkbox görür
- Şüpheli durumlarda challenge gösterir
- En iyi UX/güvenlik dengesi

**Diğer Modlar:**
- **Non-Interactive**: Sadece loading bar, kullanıcı etkileşimi yok
- **Invisible**: Tamamen görünmez, arka planda çalışır

## 📝 Kullanım

### Frontend (React Component)

```tsx
import { TurnstileWidget } from '@/components/auth/TurnstileWidget';

function MyForm() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  return (
    <form>
      {/* Form fields */}
      
      <TurnstileWidget
        onVerify={(token) => setTurnstileToken(token)}
        onError={() => setTurnstileToken(null)}
        onExpire={() => setTurnstileToken(null)}
      />
      
      <button type="submit" disabled={!turnstileToken}>
        Submit
      </button>
    </form>
  );
}
```

### Backend (API Route)

```typescript
import { verifyTurnstileToken } from '@/lib/turnstile';

export async function POST(request: Request) {
  const body = await request.json();
  const { turnstileToken } = body;

  // Verify token
  const result = await verifyTurnstileToken(
    turnstileToken,
    request.headers.get('x-forwarded-for')?.split(',')[0]
  );

  if (!result.success) {
    return NextResponse.json(
      { error: 'Bot verification failed' },
      { status: 400 }
    );
  }

  // Continue with request...
}
```

## 🎯 Entegre Edilen Sayfalar

### ✅ Register Page
- **Lokasyon**: `components/auth/RegisterForm.tsx`
- **Durum**: Zorunlu
- **Davranış**: 
  - Widget form'da görünür
  - Token olmadan submit edilemez
  - Backend'de token doğrulanır

### ⏳ Login Page (Opsiyonel)
- **Lokasyon**: `components/auth/LoginForm.tsx`
- **Durum**: Henüz eklenmedi
- **Öneri**: Rate limiting yeterli olabilir

## 🔧 Configuration

### Widget Customization

```tsx
<TurnstileWidget
  onVerify={(token) => console.log('Verified:', token)}
  onError={() => console.error('Error')}
  onExpire={() => console.log('Expired')}
  className="my-4" // Custom styling
/>
```

### Theme Options

Widget otomatik olarak light theme kullanır. Dark theme için:

```tsx
// TurnstileWidget.tsx içinde
theme: 'dark', // veya 'auto'
```

### Size Options

```tsx
size: 'normal', // veya 'compact'
```

## 🐛 Troubleshooting

### Widget Görünmüyor

1. **Site key kontrol et:**
```bash
echo $NEXT_PUBLIC_TURNSTILE_SITE_KEY
```

2. **Console errors kontrol et:**
```javascript
// Browser console'da
window.turnstile
```

3. **Script yüklendi mi:**
```html
<!-- Page source'da kontrol et -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>
```

### Backend Verification Başarısız

1. **Secret key kontrol et:**
```bash
echo $TURNSTILE_SECRET_KEY
```

2. **Token format kontrol et:**
```typescript
console.log('Token:', turnstileToken);
// Should be a long string
```

3. **IP forwarding kontrol et:**
```typescript
const ip = request.headers.get('x-forwarded-for');
console.log('Client IP:', ip);
```

### Error Codes

| Code | Açıklama | Çözüm |
|------|----------|-------|
| `missing-input-secret` | Secret key eksik | Environment variable kontrol et |
| `invalid-input-secret` | Secret key yanlış | Cloudflare dashboard'dan kontrol et |
| `missing-input-response` | Token eksik | Frontend'de token gönderildiğinden emin ol |
| `invalid-input-response` | Token geçersiz/expired | Widget'ı reset et |
| `timeout-or-duplicate` | Token zaten kullanıldı | Her submit için yeni token al |

## 📊 Monitoring

### Success Rate

```typescript
// Backend'de log
console.log('[Turnstile] Verification:', {
  success: result.success,
  error: result.error,
  ip: remoteIp,
});
```

### Analytics

Cloudflare dashboard'da:
1. Turnstile → Analytics
2. Success rate, challenge rate, error rate görüntüle

## 🔒 Security Best Practices

### ✅ Yapılması Gerekenler

- ✅ Her form submission'da token doğrula
- ✅ Token'ı sadece bir kez kullan
- ✅ Secret key'i environment variable'da sakla
- ✅ Client IP'yi verification'a ekle
- ✅ Error handling implement et

### ❌ Yapılmaması Gerekenler

- ❌ Secret key'i frontend'de kullanma
- ❌ Token'ı tekrar kullanma
- ❌ Verification'ı skip etme
- ❌ Error'ları ignore etme

## 🎨 UI/UX Considerations

### Loading States

```tsx
{!isLoaded && (
  <div className="flex justify-center">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
)}
```

### Error Messages

```tsx
{error && (
  <div className="text-sm text-red-600">
    {error}
  </div>
)}
```

### Accessibility

- Widget keyboard accessible
- Screen reader friendly
- ARIA labels mevcut

## 📈 Performance

### Script Loading

- Async loading
- Defer attribute
- No blocking

### Widget Rendering

- Lazy initialization
- Cleanup on unmount
- Memory leak prevention

## 🚀 Production Checklist

- [x] Environment variables set
- [x] Widget component created
- [x] Backend verification implemented
- [x] Register form integrated
- [ ] Login form integrated (optional)
- [x] Error handling complete
- [x] Documentation complete
- [ ] Testing in production
- [ ] Monitoring setup

## 📚 Resources

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Widget Modes](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Server-Side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Error Codes](https://developers.cloudflare.com/turnstile/troubleshooting/error-codes/)

## 🎉 Sonuç

Cloudflare Turnstile başarıyla entegre edildi! Register sayfası artık bot koruması ile güvenli.

**Next Steps:**
1. Production'da test et
2. Analytics'i monitor et
3. Login sayfasına da ekle (opsiyonel)
4. Rate limiting ile kombine et
