# Telegram Reaction Rewards

Kullanıcıların Telegram kanalındaki postlara reaction vererek puan kazanmasını sağlayan otomatik ödül sistemi.

## 📋 Özellikler

- ✅ **Otomatik Puan Verme**: Reaction başına 20 puan
- ✅ **Manipulation Detection**: Tekrarlı ekleme/kaldırma tespiti
- ✅ **Nightly Verification**: Her gece 23:00'te otomatik doğrulama
- ✅ **User Notifications**: Popup bildirimler ile puan değişiklikleri
- ✅ **Admin Dashboard**: İstatistikler ve manuel doğrulama
- ✅ **Rate Limiting**: Günlük 100 reaction limiti
- ✅ **Cooldown System**: 1 saat cooldown

## 🚀 Hızlı Başlangıç

[Quick Start Guide](QUICK_START.md) - 5 dakikada kurulum

## 📚 Dökümanlar

- [Requirements](requirements.md) - Feature gereksinimleri ve user stories
- [Design](design.md) - Teknik tasarım ve mimari
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Detaylı deployment adımları
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Implementation detayları

## 🎯 Nasıl Çalışır?

1. **User Reaction Verir**: Telegram kanalındaki bir posta reaction verir
2. **Webhook Alır**: Telegram webhook gönderir
3. **Puan Verilir**: Sistem +20 puan verir ve notification oluşturur
4. **Nightly Verification**: Her gece reaction'lar doğrulanır
5. **Kaldırılan Reaction**: Kaldırılan reaction'lar için -20 puan

## 🔧 Teknik Stack

- **Backend**: Next.js API Routes
- **Database**: Prisma + PostgreSQL
- **Webhook**: Telegram Bot API
- **Cron**: Vercel Cron Jobs
- **UI**: React + Radix UI

## 📊 Database Models

### TelegramReaction
```prisma
model TelegramReaction {
  id              String    @id @default(cuid())
  userId          String
  telegramUserId  String
  postId          String
  chatId          String
  reactionEmoji   String
  pointsAwarded   Int       @default(20)
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  removedAt       DateTime?
  lastVerifiedAt  DateTime?
}
```

### PointAdjustment
```prisma
model PointAdjustment {
  id              String    @id @default(cuid())
  userId          String
  amount          Int
  reason          String
  reactionId      String?
  createdAt       DateTime  @default(now())
  verifiedAt      DateTime?
}
```

### UserNotification
```prisma
model UserNotification {
  id              String    @id @default(cuid())
  userId          String
  type            String
  title           String
  message         String
  pointsChange    Int
  isRead          Boolean   @default(false)
  showOnLogin     Boolean   @default(true)
  createdAt       DateTime  @default(now())
  readAt          DateTime?
}
```

## 🔌 API Endpoints

### Webhook
- `POST /api/telegram/webhook` - Telegram webhook handler

### User APIs
- `GET /api/user/notifications` - Get unread notifications
- `POST /api/user/notifications/[id]/read` - Mark as read

### Cron Jobs
- `GET /api/cron/verify-reactions` - Nightly verification (23:00 UTC)

## 🧪 Testing

```bash
# Simulation test
npm run simulate:reactions

# Unit tests (gelecekte)
npm test

# Integration tests (gelecekte)
npm run test:integration
```

## 📈 Monitoring

### Webhook Logs
```bash
vercel logs --follow
```

### Database Queries
```sql
-- Recent reactions
SELECT * FROM "TelegramReaction" 
ORDER BY "createdAt" DESC LIMIT 10;

-- Point adjustments
SELECT * FROM "PointAdjustment" 
ORDER BY "createdAt" DESC LIMIT 10;

-- Unread notifications
SELECT * FROM "UserNotification" 
WHERE "isRead" = false;
```

## ⚙️ Configuration

### Environment Variables

```bash
# Required
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_WEBHOOK_SECRET="your-webhook-secret"
CRON_SECRET="your-cron-secret"

# Optional (defaults shown)
TELEGRAM_POINTS_PER_REACTION="20"
TELEGRAM_MAX_REACTIONS_PER_DAY="100"
TELEGRAM_MANIPULATION_THRESHOLD="3"
TELEGRAM_COOLDOWN_HOURS="1"
```

### Vercel Cron

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

## 🎨 UI Components

### PointChangeNotification
Popup notification component for point changes:
- Multiple notifications support
- Next/Skip functionality
- Beautiful icons and animations
- Auto-dismiss option

## 🔒 Security

- ✅ Webhook signature verification
- ✅ CRON_SECRET for cron jobs
- ✅ Rate limiting (100/day)
- ✅ Manipulation detection
- ✅ Cooldown system (1 hour)

## 🐛 Troubleshooting

### Webhook Issues
```bash
# Check webhook info
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Delete and reset
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
```

### Points Not Awarded
- Check user's `telegramUsername` matches Telegram ID
- Verify daily limit not exceeded
- Check cooldown period

### Cron Job Issues
- Verify CRON_SECRET is correct
- Check Vercel cron job is active
- Test endpoint manually

## 📝 Implementation Status

- ✅ Database models
- ✅ Reaction service
- ✅ Webhook handler
- ✅ Notification APIs
- ✅ UI components
- ✅ Nightly verification
- ✅ Cron job setup
- ✅ Simulation script
- ✅ Documentation

## 🎯 Future Enhancements

- [ ] Admin dashboard for reaction stats
- [ ] Real-time reaction tracking
- [ ] Custom reaction emojis
- [ ] Reaction leaderboard
- [ ] Bonus points for specific reactions
- [ ] Reaction streaks
- [ ] Weekly/monthly reports

## 🤝 Contributing

Bu feature için katkıda bulunmak isterseniz:
1. Requirements ve Design dökümanlarını okuyun
2. Implementation Summary'yi inceleyin
3. Test coverage'ı artırın
4. Documentation'ı güncelleyin

## 📄 License

MIT License - Sylvan Token Project

## 🆘 Support

Sorun yaşarsanız:
1. [Deployment Guide](DEPLOYMENT_GUIDE.md) kontrol edin
2. Logs'u inceleyin
3. Simulation script'i çalıştırın
4. GitHub issue açın
