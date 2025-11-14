# Turnstile Configuration Guide

## 🎛️ Environment Variables

Turnstile artık `.env` dosyasından kolayca açılıp kapatılabilir!

### Required Variables

```bash
# Cloudflare Turnstile Keys
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAACArCE6b3EXA2mX4"
TURNSTILE_SECRET_KEY="0x4AAAAAACArCIAxxPkAefdXJYppUZPtiH4"

# Enable/Disable Turnstile
TURNSTILE_ENABLED="false"                    # Server-side verification
NEXT_PUBLIC_TURNSTILE_ENABLED="false"        # Client-side widget
```

## 🔧 Configuration Modes

### Local Development (Testing)

```bash
# .env
TURNSTILE_ENABLED="false"
NEXT_PUBLIC_TURNSTILE_ENABLED="false"
```

**Behavior:**
- ✅ Widget gizlenir
- ✅ Backend verification atlanır
- ✅ Kayıt/giriş normal çalışır
- ✅ Hızlı test için ideal

### Production (Live)

```bash
# .env or Vercel Environment Variables
TURNSTILE_ENABLED="true"
NEXT_PUBLIC_TURNSTILE_ENABLED="true"
```

**Behavior:**
- ✅ Widget görünür
- ✅ Backend verification zorunlu
- ✅ Bot koruması aktif
- ✅ Güvenli production ortamı

## 📋 How It Works

### Client-Side (Frontend)

`NEXT_PUBLIC_TURNSTILE_ENABLED` kontrolü:

```tsx
// components/auth/RegisterForm.tsx
{process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === 'true' && (
  <TurnstileWidget
    onVerify={(token) => setTurnstileToken(token)}
  />
)}
```

**When "false":**
- Widget render edilmez
- Form normal çalışır

**When "true":**
- Widget görünür
- Token gerekli

### Server-Side (Backend)

`TURNSTILE_ENABLED` kontrolü:

```typescript
// app/api/auth/register/route.ts
const isTurnstileEnabled = process.env.TURNSTILE_ENABLED === 'true';

if (isTurnstileEnabled) {
  // Verify token
  const result = await verifyTurnstileToken(token);
  if (!result.success) {
    return error('Verification failed');
  }
} else {
  console.log('Turnstile disabled');
}
```

**When "false":**
- Verification atlanır
- Kayıt devam eder

**When "true":**
- Token zorunlu
- Verification yapılır

## 🚀 Quick Start

### 1. Local Testing

```bash
# .env dosyasında
TURNSTILE_ENABLED="false"
NEXT_PUBLIC_TURNSTILE_ENABLED="false"

# Server restart
npm run dev
```

### 2. Production Deploy

```bash
# Vercel Dashboard → Environment Variables
TURNSTILE_ENABLED="true"
NEXT_PUBLIC_TURNSTILE_ENABLED="true"

# Deploy
vercel --prod
```

## 🔄 Switching Between Modes

### Development → Production

```bash
# .env değiştir
TURNSTILE_ENABLED="true"
NEXT_PUBLIC_TURNSTILE_ENABLED="true"

# Restart server
npm run dev
```

### Production → Development

```bash
# .env değiştir
TURNSTILE_ENABLED="false"
NEXT_PUBLIC_TURNSTILE_ENABLED="false"

# Restart server
npm run dev
```

## ⚠️ Important Notes

### Both Variables Required

Her iki variable'ı da aynı değere set etmelisin:

```bash
# ✅ DOĞRU
TURNSTILE_ENABLED="true"
NEXT_PUBLIC_TURNSTILE_ENABLED="true"

# ✅ DOĞRU
TURNSTILE_ENABLED="false"
NEXT_PUBLIC_TURNSTILE_ENABLED="false"

# ❌ YANLIŞ (inconsistent)
TURNSTILE_ENABLED="true"
NEXT_PUBLIC_TURNSTILE_ENABLED="false"
```

### Server Restart Required

Environment variable değişikliklerinden sonra server restart gerekli:

```bash
# Ctrl+C ile durdur
# Sonra tekrar başlat
npm run dev
```

### Vercel Deployment

Vercel'de environment variables'ı set ederken:

1. Dashboard → Project → Settings → Environment Variables
2. Her iki variable'ı ekle
3. Production, Preview, Development için ayrı değerler set edebilirsin

## 🎯 Use Cases

### Scenario 1: Local Testing

```bash
TURNSTILE_ENABLED="false"
NEXT_PUBLIC_TURNSTILE_ENABLED="false"
```

**Why:** Hızlı test, bot koruması gereksiz

### Scenario 2: Staging/Preview

```bash
TURNSTILE_ENABLED="true"
NEXT_PUBLIC_TURNSTILE_ENABLED="true"
```

**Why:** Production benzeri test

### Scenario 3: Production

```bash
TURNSTILE_ENABLED="true"
NEXT_PUBLIC_TURNSTILE_ENABLED="true"
```

**Why:** Tam güvenlik

## 🐛 Troubleshooting

### Widget Görünmüyor

```bash
# Check
echo $NEXT_PUBLIC_TURNSTILE_ENABLED

# Should be "true"
```

### Verification Başarısız

```bash
# Check
echo $TURNSTILE_ENABLED

# Should be "true"
```

### Token Required Error

```bash
# Widget enabled ama token yok
# Check: NEXT_PUBLIC_TURNSTILE_ENABLED="true"
```

## 📚 Related Docs

- [Quick Reference](TURNSTILE_QUICK_REFERENCE.md)
- [Setup Guide](TURNSTILE_SETUP.md)
- [Implementation Summary](TURNSTILE_IMPLEMENTATION_SUMMARY.md)

---

**TL;DR:** 
- Local test: `"false"` 
- Production: `"true"`
- Her iki variable'ı da aynı değere set et
- Server restart gerekli

✅ **Artık Turnstile tamamen configurable!**
