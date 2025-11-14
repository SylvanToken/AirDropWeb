# Cloudflare Turnstile - Quick Reference

## 🚀 5 Dakikada Başlangıç

### 1. Environment Variables (30 saniye)

```bash
# .env dosyanıza ekleyin
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAACArCE6b3EXA2mX4"
TURNSTILE_SECRET_KEY="0x4AAAAAACArCIAxxPkAefdXJYppUZPtiH4"

# Enable/Disable Turnstile
TURNSTILE_ENABLED="false"                    # Server-side check
NEXT_PUBLIC_TURNSTILE_ENABLED="false"        # Client-side widget

# Local testing: "false" | Production: "true"
```

### 2. Test (1 dakika)

```bash
npm run dev
# http://localhost:3005/register
```

### 3. Deploy (30 saniye)

```bash
# Vercel'e environment variables ekle
vercel --prod
```

## 📋 Dosya Lokasyonları

| Dosya | Lokasyon | Açıklama |
|-------|----------|----------|
| Widget Component | `components/auth/TurnstileWidget.tsx` | React widget |
| Verification Helper | `lib/turnstile.ts` | Backend verification |
| Register API | `app/api/auth/register/route.ts` | API endpoint |
| Register Form | `components/auth/RegisterForm.tsx` | Form integration |

## 🔧 Kullanım Örnekleri

### Frontend

```tsx
import { TurnstileWidget } from '@/components/auth/TurnstileWidget';

<TurnstileWidget
  onVerify={(token) => setToken(token)}
  onError={() => setToken(null)}
/>
```

### Backend

```typescript
import { verifyTurnstileToken } from '@/lib/turnstile';

const result = await verifyTurnstileToken(token, clientIp);
if (!result.success) {
  return error('Verification failed');
}
```

## 🐛 Common Issues

### Widget Görünmüyor
```bash
# Site key kontrol et
echo $NEXT_PUBLIC_TURNSTILE_SITE_KEY
```

### Verification Başarısız
```bash
# Secret key kontrol et
echo $TURNSTILE_SECRET_KEY
```

### Token Expired
```typescript
// Widget'ı reset et
onExpire={() => setTurnstileToken(null)}
```

## 📊 Widget Modes

| Mode | UX | Security | Use Case |
|------|-----|----------|----------|
| **Managed** ✅ | Best | High | Signup/Login |
| Non-Interactive | Good | Medium | Forms |
| Invisible | Excellent | Low | Background |

## 🔒 Security Checklist

- [x] Secret key in environment variable
- [x] Token verified on backend
- [x] IP forwarding enabled
- [x] Error handling implemented
- [x] Token used only once

## 📈 Monitoring

### Cloudflare Dashboard
```
https://dash.cloudflare.com/
→ Turnstile
→ Analytics
```

### Application Logs
```typescript
console.log('[Turnstile]', result);
```

## 🎯 Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `missing-input-secret` | No secret key | Add to .env |
| `invalid-input-secret` | Wrong secret | Check Cloudflare |
| `invalid-input-response` | Token expired | Get new token |
| `timeout-or-duplicate` | Token reused | Use fresh token |

## 🚀 Production Checklist

- [ ] Environment variables set
- [ ] Widget loads correctly
- [ ] Backend verification works
- [ ] Error handling tested
- [ ] Analytics monitored

## 📚 Resources

- [Setup Guide](TURNSTILE_SETUP.md)
- [Implementation Summary](TURNSTILE_IMPLEMENTATION_SUMMARY.md)
- [Cloudflare Docs](https://developers.cloudflare.com/turnstile/)

## 🆘 Quick Help

**Widget not loading?**
→ Check `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

**Verification failing?**
→ Check `TURNSTILE_SECRET_KEY`

**Token expired?**
→ Reset widget and get new token

**Need help?**
→ Check console logs and Cloudflare dashboard

---

**Quick Start**: Add env vars → Test locally → Deploy → Monitor

✅ **Ready to use!**
