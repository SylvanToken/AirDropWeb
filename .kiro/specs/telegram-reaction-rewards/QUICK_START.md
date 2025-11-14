# Telegram Reaction Rewards - Quick Start Guide

## 🚀 5 Dakikada Başlangıç

### 1. Environment Variables (2 dakika)

`.env` dosyanıza ekleyin:

```bash
# Telegram Reaction Rewards
TELEGRAM_WEBHOOK_SECRET="your-secure-random-string"
CRON_SECRET="your-cron-secret"
```

**Secret oluştur:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Database Migration (30 saniye)

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

### 3. Test (1 dakika)

```bash
npm run simulate:reactions
```

Tüm senaryoları test eder ve sonuçları gösterir.

### 4. Telegram Bot Setup (2 dakika)

#### 4.1 Bot Ayarları

1. @BotFather'a git
2. `/mybots` → Bot'unuzu seçin
3. **Bot Settings** → **Group Privacy** → **Turn off**

#### 4.2 Webhook Kur

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/webhook",
    "allowed_updates": ["message_reaction"],
    "secret_token": "YOUR_WEBHOOK_SECRET"
  }'
```

#### 4.3 Bot'u Ekle

1. Bot'u kanalınıza/grubunuza admin olarak ekleyin
2. **Read messages** yetkisi verin
3. Reactions'ı aktif edin

### 5. Deploy (30 saniye)

```bash
vercel --prod
```

## ✅ Kontrol Listesi

- [ ] Environment variables eklendi
- [ ] Database migration çalıştırıldı
- [ ] Simulation test edildi
- [ ] Bot ayarları yapıldı
- [ ] Webhook kuruldu
- [ ] Bot channel'a eklendi
- [ ] Deploy edildi

## 🎯 İlk Test

1. Telegram kanalınızda bir posta reaction verin
2. Webhook loglarını kontrol edin
3. User puanlarını kontrol edin
4. Platform'a login olun ve notification'ı görün

## 📚 Detaylı Dökümanlar

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Detaylı deployment adımları
- [Requirements](requirements.md) - Feature gereksinimleri
- [Design](design.md) - Teknik tasarım
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Implementation detayları

## 🆘 Sorun mu var?

**Webhook çalışmıyor:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

**Puanlar verilmiyor:**
- User'ın `telegramUsername` field'ı Telegram ID'si ile eşleşmeli
- Daily limit: 100 reaction/gün
- Cooldown: 1 saat

**Cron job çalışmıyor:**
- CRON_SECRET doğru mu?
- Vercel'de cron job aktif mi?

## 🎉 Tamamlandı!

Feature hazır! Artık kullanıcılar Telegram'da reaction vererek puan kazanabilir.
