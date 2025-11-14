# 🔐 Webhook Security Guide

## Overview

Bu guide, Resend webhook'larının güvenli bir şekilde nasıl yapılandırılacağını açıklar.

## 🎯 Neden Webhook Güvenliği Önemli?

Webhook'lar public endpoint'lerdir ve herkes tarafından erişilebilir. Signature verification olmadan:

- ❌ Kötü niyetli kullanıcılar sahte webhook'lar gönderebilir
- ❌ Email istatistikleriniz manipüle edilebilir
- ❌ Sistem güvenliği tehlikeye girebilir

## ✅ Çözüm: HMAC-SHA256 Signature Verification

Resend, her webhook'u HMAC-SHA256 ile imzalar. Biz de bu imzayı doğrulayarak webhook'un gerçek olduğundan emin oluruz.

## 🚀 Kurulum Adımları

### 1. Webhook Secret Oluştur

```bash
# Otomatik oluştur
npm run generate:webhook-secret

# Veya manuel oluştur
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Çıktı:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 2. .env Dosyasına Ekle

```env
# Resend Webhook Security
RESEND_WEBHOOK_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
```

⚠️ **Önemli:** Bu secret'ı asla git'e commit etmeyin!

### 3. Resend Dashboard'da Yapılandır

1. [Resend Dashboard](https://resend.com/webhooks) > Webhooks
2. "Add Webhook" tıkla
3. Webhook URL'i gir:
   ```
   https://yourdomain.com/api/webhooks/resend
   ```
4. Events seç:
   - ✅ email.delivered
   - ✅ email.bounced
   - ✅ email.opened
   - ✅ email.clicked
   - ✅ email.complained
5. Signing Secret'i gir (yukarıda oluşturduğun secret)
6. "Create Webhook" tıkla

### 4. Test Et

```bash
# Signature verification'ı test et
npm run test:webhook
```

Beklenen çıktı:
```
🧪 Testing Webhook Signature Verification

Test 1: Valid Signature
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verification Result: ✅ PASS

Test 2: Invalid Signature
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verification Result: ✅ PASS

✅ All tests completed
```

## 🔒 Güvenlik Özellikleri

### 1. HMAC-SHA256 Signature

```typescript
// Resend webhook signature format:
// t=<timestamp>,v1=<signature>

// Signed payload:
// <timestamp>.<payload>

// Signature computation:
HMAC-SHA256(secret, "<timestamp>.<payload>")
```

### 2. Timestamp Validation

- Webhook'lar 5 dakika içinde işlenmeli
- Eski webhook'lar otomatik reddedilir
- Replay attack'lara karşı koruma

### 3. Timing-Safe Comparison

```typescript
crypto.timingSafeEqual(expected, received)
```

- Timing attack'lara karşı güvenli
- Constant-time comparison

### 4. Production Enforcement

```typescript
if (process.env.NODE_ENV === 'production' && !webhookSecret) {
  // Webhook reddedilir
  return false;
}
```

## 📝 Implementation Details

### Webhook Route

```typescript
// app/api/webhooks/resend/route.ts

export async function POST(request: NextRequest) {
  // 1. Get raw body
  const body = await request.text();
  
  // 2. Verify signature
  if (!verifyWebhookSignature(request, body)) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }
  
  // 3. Process webhook
  const payload = JSON.parse(body);
  // ...
}
```

### Security Library

```typescript
// lib/webhook-security.ts

export function verifyResendWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  tolerance: number = 300
): boolean {
  // Parse signature: t=<timestamp>,v1=<signature>
  // Verify timestamp (replay attack prevention)
  // Compute HMAC-SHA256
  // Timing-safe comparison
}
```

## 🧪 Testing

### Local Testing

```bash
# 1. Generate test signature
npm run test:webhook

# 2. Send test webhook
curl -X POST http://localhost:3333/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -H "svix-signature: t=1234567890,v1=<signature>" \
  -d '{"type":"email.delivered","data":{"email_id":"test"}}'
```

### Production Testing

1. Resend Dashboard > Webhooks > Test
2. "Send Test Event" tıkla
3. Logs'u kontrol et

## 🚨 Troubleshooting

### "Invalid signature" Hatası

**Sebep:** Secret yanlış veya signature format hatalı

**Çözüm:**
1. .env dosyasındaki secret'ı kontrol et
2. Resend dashboard'daki secret ile aynı olduğundan emin ol
3. Secret'ın en az 32 karakter olduğunu doğrula

### "Webhook timestamp too old" Hatası

**Sebep:** Webhook 5 dakikadan eski

**Çözüm:**
1. Server saatini kontrol et
2. Webhook'u tekrar gönder
3. Tolerance süresini artır (önerilmez)

### "No signature provided" Hatası

**Sebep:** Resend signature header'ı göndermiyor

**Çözüm:**
1. Resend dashboard'da webhook'u kontrol et
2. Signing secret'ın yapılandırıldığından emin ol
3. Header name'i kontrol et: `svix-signature` veya `resend-signature`

## 📊 Monitoring

### Logs

```typescript
// Success
[Webhook] Signature verified successfully

// Failure
[Webhook Security] Invalid signature format
[Webhook Security] Signature mismatch
[Webhook Security] Webhook timestamp too old
```

### Metrics

- Webhook success rate
- Signature verification failures
- Average processing time
- Replay attack attempts

## 🔐 Best Practices

1. ✅ **Always use HTTPS** in production
2. ✅ **Rotate secrets** periodically (every 90 days)
3. ✅ **Monitor failed verifications** for security threats
4. ✅ **Use environment variables** for secrets
5. ✅ **Never commit secrets** to version control
6. ✅ **Test thoroughly** before production
7. ✅ **Log security events** for audit trail

## 📚 Resources

- [Resend Webhooks Documentation](https://resend.com/docs/webhooks)
- [HMAC-SHA256 Specification](https://tools.ietf.org/html/rfc2104)
- [Webhook Security Best Practices](https://webhooks.fyi/security/hmac)

## ✅ Checklist

- [ ] Webhook secret oluşturuldu
- [ ] .env dosyasına eklendi
- [ ] Resend dashboard'da yapılandırıldı
- [ ] Test edildi (npm run test:webhook)
- [ ] Production'da test edildi
- [ ] Monitoring kuruldu
- [ ] Dokümantasyon güncellendi

---

**Hazırlayan:** Kiro AI  
**Tarih:** 13 Kasım 2025  
**Versiyon:** 1.0
