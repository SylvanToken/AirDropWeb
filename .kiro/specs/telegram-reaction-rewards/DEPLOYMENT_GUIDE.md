# Telegram Reaction Rewards - Deployment Guide

## 🚀 Deployment Checklist

### 1. Database Migration ✅

Migration zaten oluşturuldu ve uygulandı:
```bash
npx prisma migrate dev --name add_telegram_reaction_rewards
```

Production için:
```bash
npx prisma migrate deploy
```

### 2. Environment Variables

`.env` dosyanıza şu değişkenleri ekleyin:

```bash
# Telegram Reaction Rewards
TELEGRAM_WEBHOOK_SECRET="your-secure-random-string-here"

# Optional: Customize reward settings
TELEGRAM_POINTS_PER_REACTION="20"
TELEGRAM_MAX_REACTIONS_PER_DAY="100"
TELEGRAM_MANIPULATION_THRESHOLD="3"
TELEGRAM_COOLDOWN_HOURS="1"

# Cron job security (if not already set)
CRON_SECRET="your-cron-secret-key"
```

**Webhook Secret Oluşturma:**
```bash
# PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# veya Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Telegram Bot Setup

#### 3.1 Bot Ayarları

1. **BotFather'da bot'unuzu açın** (@BotFather)
2. `/mybots` komutunu gönderin
3. Bot'unuzu seçin
4. **Bot Settings** → **Group Privacy** → **Turn off** (bot tüm mesajları görebilmeli)

#### 3.2 Webhook Kurulumu

Uygulamanız deploy edildikten sonra webhook'u kaydedin:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/webhook",
    "allowed_updates": ["message_reaction"],
    "secret_token": "YOUR_WEBHOOK_SECRET"
  }'
```

**Webhook'u kontrol edin:**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

#### 3.3 Channel/Group Setup

1. **Bot'u kanalınıza/grubunuza admin olarak ekleyin**
2. **Admin yetkilerini verin:**
   - Read messages
   - Post messages (optional)
   - Delete messages (optional)

3. **Reaction'ları aktif edin:**
   - Channel/Group Settings
   - Reactions → Enable

### 4. Vercel Deployment

#### 4.1 Environment Variables

Vercel dashboard'da şu değişkenleri ekleyin:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `CRON_SECRET`
- Diğer tüm gerekli env variables

#### 4.2 Cron Job

`vercel.json` zaten yapılandırıldı:
```json
{
  "crons": [
    {
      "path": "/api/cron/verify-reactions",
      "schedule": "0 23 * * *"
    }
  ]
}
```

Cron job her gece 23:00 UTC'de çalışacak.

#### 4.3 Deploy

```bash
# Production'a deploy
vercel --prod

# veya
git push origin main  # (Vercel otomatik deploy edecek)
```

### 5. Test

#### 5.1 Simulation Script

```bash
npm run simulate:reactions
```

Bu script tüm senaryoları test eder:
- ✅ Reaction ekleme (+20 puan)
- ✅ Reaction kaldırma (-20 puan)
- ✅ Manipulation detection
- ✅ Nightly verification
- ✅ User notifications
- ✅ Admin dashboard

#### 5.2 Manuel Test

1. **Telegram'da test edin:**
   - Kanalınızdaki bir posta reaction verin
   - Webhook'un çalıştığını loglardan kontrol edin
   - User'ın puanlarının arttığını kontrol edin

2. **Notification test:**
   - User olarak login olun
   - Notification popup'ını görmelisiniz

3. **Admin dashboard:**
   - Admin olarak login olun
   - Reaction istatistiklerini görün

### 6. Monitoring

#### 6.1 Webhook Logs

```bash
# Vercel logs
vercel logs --follow

# veya Vercel dashboard'dan
```

#### 6.2 Database Kontrol

```sql
-- Reaction'ları kontrol et
SELECT * FROM "TelegramReaction" ORDER BY "createdAt" DESC LIMIT 10;

-- Point adjustments
SELECT * FROM "PointAdjustment" ORDER BY "createdAt" DESC LIMIT 10;

-- Notifications
SELECT * FROM "UserNotification" WHERE "isRead" = false;
```

#### 6.3 Cron Job Logs

Vercel dashboard'da:
- Settings → Cron Jobs
- Execution logs'u kontrol edin

### 7. Troubleshooting

#### Webhook çalışmıyor

1. **Webhook info kontrol:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

2. **Webhook'u sil ve tekrar kur:**
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
# Sonra tekrar setWebhook
```

3. **Bot yetkilerini kontrol et:**
   - Bot channel/group'ta admin mi?
   - "Read messages" yetkisi var mı?

#### Puanlar verilmiyor

1. **User Telegram ID'si doğru mu?**
   - User'ın `telegramUsername` field'ı Telegram ID'si ile eşleşmeli

2. **Daily limit aşıldı mı?**
   - Default: 100 reaction/gün

3. **Cooldown aktif mi?**
   - Default: 1 saat cooldown

#### Cron job çalışmıyor

1. **CRON_SECRET doğru mu?**
2. **Vercel'de cron job aktif mi?**
3. **Endpoint erişilebilir mi?**
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/verify-reactions
```

## 🎯 Production Checklist

- [ ] Database migration çalıştırıldı
- [ ] Environment variables eklendi
- [ ] Telegram bot ayarları yapıldı
- [ ] Webhook kuruldu ve test edildi
- [ ] Bot channel/group'a admin olarak eklendi
- [ ] Reactions aktif edildi
- [ ] Vercel'e deploy edildi
- [ ] Cron job aktif
- [ ] Simulation script çalıştırıldı
- [ ] Manuel test yapıldı
- [ ] Monitoring kuruldu
- [ ] Documentation güncellendi

## 📚 İlgili Dökümanlar

- [Requirements](.kiro/specs/telegram-reaction-rewards/requirements.md)
- [Design](.kiro/specs/telegram-reaction-rewards/design.md)
- [Implementation Summary](.kiro/specs/telegram-reaction-rewards/IMPLEMENTATION_SUMMARY.md)
- [Telegram Integration](docs/TELEGRAM_INTEGRATION.md)

## 🆘 Support

Sorun yaşarsanız:
1. Logs'u kontrol edin
2. Webhook info'yu kontrol edin
3. Database'i kontrol edin
4. Simulation script'i çalıştırın
