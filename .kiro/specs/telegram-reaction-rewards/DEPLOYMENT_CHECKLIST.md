# Telegram Reaction Rewards - Deployment Checklist

## ✅ Pre-Deployment

### Database
- [x] Migration oluşturuldu (`20251113080157_add_telegram_reaction_rewards`)
- [x] Migration test edildi (development)
- [ ] Migration production'a deploy edilecek

### Code
- [x] Database models eklendi (TelegramReaction, PointAdjustment, UserNotification)
- [x] Reaction service yazıldı (`lib/telegram/reaction-service.ts`)
- [x] Webhook handler oluşturuldu (`app/api/telegram/webhook/route.ts`)
- [x] Notification APIs hazır (`app/api/user/notifications/`)
- [x] Nightly verification service (`lib/telegram/nightly-verification.ts`)
- [x] Cron job endpoint (`app/api/cron/verify-reactions/route.ts`)
- [x] UI component (`components/notifications/PointChangeNotification.tsx`)
- [x] Simulation script (`scripts/simulate-reactions.ts`)

### Configuration
- [x] `vercel.json` cron job eklendi
- [x] `.env.example` güncellendi
- [x] `package.json` script eklendi

### Testing
- [x] Simulation script çalıştırıldı
- [ ] Unit tests yazılacak (optional)
- [ ] Integration tests yazılacak (optional)

### Documentation
- [x] Requirements document
- [x] Design document
- [x] Implementation summary
- [x] Deployment guide
- [x] Quick start guide
- [x] README

## 🚀 Deployment Steps

### 1. Environment Variables

#### Development (.env)
```bash
TELEGRAM_BOT_TOKEN="8083809833:AAGMj_xHy12LwF89_inbwiifok6FjjuOJoE"
TELEGRAM_WEBHOOK_SECRET="<generate-random-string>"
CRON_SECRET="<generate-random-string>"
```

#### Production (Vercel)
- [ ] `TELEGRAM_BOT_TOKEN` eklendi
- [ ] `TELEGRAM_WEBHOOK_SECRET` eklendi
- [ ] `CRON_SECRET` eklendi
- [ ] Optional settings eklendi (isteğe bağlı)

**Secret Generation:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Database Migration

#### Development
```bash
npx prisma migrate dev
```
- [x] Çalıştırıldı

#### Production
```bash
npx prisma migrate deploy
```
- [ ] Çalıştırılacak

### 3. Telegram Bot Configuration

#### Bot Settings
- [ ] @BotFather'da bot açıldı
- [ ] `/mybots` → Bot seçildi
- [ ] **Bot Settings** → **Group Privacy** → **Turn off**

#### Webhook Setup
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/webhook",
    "allowed_updates": ["message_reaction"],
    "secret_token": "YOUR_WEBHOOK_SECRET"
  }'
```
- [ ] Webhook kuruldu
- [ ] Webhook info kontrol edildi

**Webhook Verification:**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

#### Channel/Group Setup
- [ ] Bot channel/group'a admin olarak eklendi
- [ ] **Read messages** yetkisi verildi
- [ ] Reactions aktif edildi (Channel Settings → Reactions)

### 4. Vercel Deployment

#### Pre-Deploy
- [ ] Git changes committed
- [ ] Environment variables Vercel'e eklendi
- [ ] `vercel.json` committed

#### Deploy
```bash
vercel --prod
```
- [ ] Deploy başarılı
- [ ] Build errors yok
- [ ] Deployment URL alındı

#### Post-Deploy
- [ ] Webhook URL güncellendi (Telegram'da)
- [ ] Cron job aktif (Vercel dashboard)
- [ ] API endpoints erişilebilir

### 5. Testing

#### Simulation Test
```bash
npm run simulate:reactions
```
- [x] Development'ta çalıştırıldı
- [ ] Production'da test edilecek

#### Manual Testing
- [ ] Telegram'da reaction verildi
- [ ] Webhook logs kontrol edildi
- [ ] User puanları arttı
- [ ] Notification oluşturuldu
- [ ] User login'de notification görüldü
- [ ] Reaction kaldırıldı
- [ ] Puanlar düşürüldü

#### Cron Job Test
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/verify-reactions
```
- [ ] Cron endpoint çalışıyor
- [ ] Verification başarılı
- [ ] Logs temiz

### 6. Monitoring Setup

#### Vercel Logs
- [ ] Logs dashboard açıldı
- [ ] Webhook logs görünüyor
- [ ] Error tracking aktif

#### Database Monitoring
```sql
-- Recent reactions
SELECT * FROM "TelegramReaction" ORDER BY "createdAt" DESC LIMIT 10;

-- Point adjustments
SELECT * FROM "PointAdjustment" ORDER BY "createdAt" DESC LIMIT 10;

-- Unread notifications
SELECT * FROM "UserNotification" WHERE "isRead" = false;
```
- [ ] Queries çalışıyor
- [ ] Data doğru

#### Cron Job Monitoring
- [ ] Vercel dashboard'da cron job görünüyor
- [ ] Schedule doğru (23:00 UTC)
- [ ] Execution logs temiz

## 📊 Post-Deployment Verification

### Day 1
- [ ] İlk reaction'lar alındı
- [ ] Puanlar doğru verildi
- [ ] Notifications çalışıyor
- [ ] Webhook stable

### Day 2
- [ ] Nightly verification çalıştı (23:00 UTC)
- [ ] Cron logs kontrol edildi
- [ ] Point adjustments doğru
- [ ] No errors

### Week 1
- [ ] 100+ reactions işlendi
- [ ] Manipulation detection test edildi
- [ ] Daily limits çalışıyor
- [ ] Cooldown system çalışıyor
- [ ] User feedback toplandı

## 🐛 Known Issues & Solutions

### Issue: Webhook çalışmıyor
**Solution:**
```bash
# Webhook info kontrol et
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Webhook sil ve tekrar kur
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
```

### Issue: Puanlar verilmiyor
**Solution:**
- User'ın `telegramUsername` field'ını kontrol et
- Daily limit kontrolü yap
- Cooldown period kontrol et

### Issue: Cron job çalışmıyor
**Solution:**
- CRON_SECRET doğru mu?
- Vercel'de cron job aktif mi?
- Endpoint erişilebilir mi?

## 🎯 Success Metrics

### Technical Metrics
- [ ] Webhook response time < 500ms
- [ ] 99.9% uptime
- [ ] Zero data loss
- [ ] Cron job success rate > 99%

### Business Metrics
- [ ] 100+ reactions/day
- [ ] User engagement arttı
- [ ] Manipulation rate < 1%
- [ ] User satisfaction yüksek

## 📝 Rollback Plan

Eğer sorun çıkarsa:

1. **Webhook'u devre dışı bırak:**
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
```

2. **Previous deployment'a dön:**
```bash
vercel rollback
```

3. **Database rollback (gerekirse):**
```bash
npx prisma migrate reset
```

## ✅ Final Checklist

- [ ] Tüm environment variables set
- [ ] Database migration başarılı
- [ ] Telegram bot configured
- [ ] Webhook active
- [ ] Vercel deployed
- [ ] Cron job running
- [ ] Manual tests passed
- [ ] Monitoring active
- [ ] Documentation complete
- [ ] Team informed

## 🎉 Deployment Complete!

Feature production'da! 🚀

**Next Steps:**
1. Monitor logs for first 24 hours
2. Collect user feedback
3. Optimize based on metrics
4. Plan future enhancements

---

**Deployed by:** [Your Name]  
**Date:** [Deployment Date]  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
