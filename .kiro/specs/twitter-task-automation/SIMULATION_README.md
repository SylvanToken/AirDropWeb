# Twitter Integration Simulation - Kullanım Kılavuzu

## 🎯 Amaç

Bu simulation, Twitter API credentials olmadan tüm Twitter entegrasyonunu test etmenizi sağlar.

## 🚀 Nasıl Çalıştırılır

### Yöntem 1: NPM Script ile

```bash
npm run simulate:twitter
```

### Yöntem 2: Doğrudan

```bash
npx tsx scripts/simulate-twitter.ts
```

## 📋 Test Edilen Senaryolar

Simulation şu senaryoları test eder:

### 1. Twitter Connection (OAuth Flow)
- ✅ OAuth URL generation
- ✅ User authorization
- ✅ Token exchange
- ✅ Token encryption
- ✅ Database storage

### 2. Follow Task Verification (Success)
- ✅ Task completion
- ✅ Automatic verification trigger
- ✅ Twitter API call simulation
- ✅ Follow check
- ✅ Points award
- ✅ Database updates

### 3. Follow Task Verification (Rejected)
- ✅ Task completion attempt
- ✅ Verification check
- ✅ User not following detection
- ✅ Rejection handling
- ✅ Retry mechanism

### 4. Token Expiration & Refresh
- ✅ Expired token detection
- ✅ Automatic refresh attempt
- ✅ New tokens storage
- ✅ Verification continuation

### 5. Rate Limiting
- ✅ Rate limit detection
- ✅ 429 response handling
- ✅ Request queuing
- ✅ Automatic retry

### 6. Batch Verification
- ✅ Multiple completions
- ✅ Concurrent processing
- ✅ Mixed results
- ✅ Summary generation

### 7. Analytics Dashboard
- ✅ Metrics calculation
- ✅ Success rate
- ✅ Performance stats
- ✅ Task type breakdown

## 📊 Beklenen Çıktı

Simulation çalıştığında şöyle bir çıktı göreceksiniz:

```
╔════════════════════════════════════════════════════════════╗
║     TWITTER INTEGRATION SIMULATION                        ║
║     Testing all scenarios without real Twitter API        ║
╚════════════════════════════════════════════════════════════╝

============================================================
📱 SCENARIO 1: Twitter Connection
============================================================

Step 1: User clicks "Connect Twitter"
→ Generating OAuth URL...
✓ OAuth URL generated

Step 2: User authorizes on Twitter
→ Redirecting to Twitter...
✓ User authorized app

...

🎉 SIMULATION COMPLETE
All scenarios executed successfully!

Scenarios tested:
  ✓ Twitter Connection
  ✓ Follow Task Verification (Success)
  ✓ Follow Task Verification (Rejected)
  ✓ Token Expiration & Refresh
  ✓ Rate Limiting
  ✓ Batch Verification
  ✓ Analytics Dashboard
```

## 🔍 Ne Kontrol Edilir

### Database Changes
Her senaryo için database değişiklikleri JSON formatında gösterilir:

```json
{
  "table": "TwitterConnection",
  "action": "INSERT",
  "data": {
    "userId": "sim_user_001",
    "twitterId": "1234567890",
    "username": "test_twitter_user",
    "isActive": true
  }
}
```

### API Calls
Simulated Twitter API calls:

```
→ Calling Twitter API...
  GET /2/users/:id/following
✓ API call successful
```

### Timing
Her işlem için gerçekçi timing simule edilir:
- OAuth flow: ~2.3 seconds
- Verification: ~1.8 seconds
- Token refresh: ~1.3 seconds

## 🎨 Renkli Çıktı

Simulation renkli console output kullanır:
- 🔵 Mavi: Adım başlıkları
- 🟡 Sarı: İşlem devam ediyor
- 🟢 Yeşil: Başarılı işlemler
- 🔴 Kırmızı: Hatalar
- 🔷 Cyan: Bilgi mesajları

## 📝 Simulation Sonrası

Simulation tamamlandıktan sonra:

1. **Çıktıyı İnceleyin**
   - Tüm senaryolar başarılı mı?
   - Database değişiklikleri doğru mu?
   - Timing'ler makul mü?

2. **Gerçek Test Planlayın**
   - Twitter Developer App oluşturun
   - Credentials'ları ekleyin
   - Staging'de test edin

3. **Production'a Hazırlanın**
   - Migration'ı çalıştırın
   - Environment variables'ları set edin
   - Monitoring'i aktif edin

## 🐛 Troubleshooting

### Script Çalışmıyor

**Hata**: `Cannot find module 'tsx'`

**Çözüm**:
```bash
npm install -D tsx
```

### Prisma Hatası

**Hata**: `PrismaClient is unable to run in the browser`

**Çözüm**: Script'i Node.js environment'ında çalıştırın, browser'da değil.

### TypeScript Hatası

**Hata**: Type errors

**Çözüm**:
```bash
npm install -D @types/node
```

## 🔧 Customization

Simulation'ı özelleştirmek için `scripts/simulate-twitter.ts` dosyasını düzenleyin:

### Mock Data Değiştirme

```typescript
const mockUser = {
  id: 'your_user_id',
  username: 'your_username',
  // ...
};
```

### Yeni Senaryo Ekleme

```typescript
async function simulateNewScenario() {
  section('🆕 NEW SCENARIO');
  // Your scenario code
}

// Add to runSimulation()
await simulateNewScenario();
```

### Timing Ayarlama

```typescript
// Daha hızlı simulation
await sleep(100); // 100ms yerine 500ms

// Daha yavaş simulation (detaylı izleme için)
await sleep(2000); // 2 saniye
```

## 📚 İlgili Dökümanlar

- [TWITTER_SIMULATION.md](./TWITTER_SIMULATION.md) - Detaylı senaryo açıklamaları
- [TWITTER_USER_GUIDE.md](../../docs/TWITTER_USER_GUIDE.md) - Kullanıcı kılavuzu
- [TWITTER_ADMIN_GUIDE.md](../../docs/TWITTER_ADMIN_GUIDE.md) - Admin kılavuzu

## ✅ Checklist

Simulation'dan önce:
- [ ] Node.js yüklü (v18+)
- [ ] Dependencies yüklü (`npm install`)
- [ ] TypeScript configured
- [ ] Prisma schema güncel

Simulation'dan sonra:
- [ ] Tüm senaryolar başarılı
- [ ] Database changes doğru
- [ ] Timing'ler makul
- [ ] Error handling çalışıyor
- [ ] Ready for real testing

## 🎉 Sonuç

Bu simulation ile Twitter entegrasyonunun tüm akışını gerçek API olmadan test edebilirsiniz. 

**Avantajlar:**
- ✅ API credentials gerekmez
- ✅ Rate limit yok
- ✅ Hızlı test
- ✅ Tekrarlanabilir
- ✅ Güvenli (production'ı etkilemez)

**Sonraki Adım:** Gerçek Twitter API ile test!

---

**Last Updated**: November 13, 2025  
**Version**: 1.0
