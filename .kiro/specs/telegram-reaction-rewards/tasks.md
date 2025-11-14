# Telegram Reaction Rewards - Implementation Plan

## Overview

Bu plan, Telegram Reaction Rewards sisteminin adım adım implementasyonunu içerir. Her görev, önceki görevler üzerine inşa edilir ve test edilebilir parçalara ayrılmıştır.

---

## Task List

- [ ] 1. Database schema ve migrations
  - TelegramReaction ve ReactionAuditLog modellerini oluştur
  - User modelini genişlet
  - Gerekli indexleri ekle
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 1.1 Create TelegramReaction model
  - `prisma/schema.prisma`'da TelegramReaction modelini tanımla
  - Tüm alanları ekle (userId, telegramPostId, reactionEmoji, vb.)
  - Unique constraint ekle (userId + telegramPostId + reactionEmoji)
  - İndexleri tanımla (userId, telegramPostId, isActive, verifiedAt)
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 1.2 Create ReactionAuditLog model
  - `prisma/schema.prisma`'da ReactionAuditLog modelini tanımla
  - Action, pointsChange, reason alanlarını ekle
  - İndexleri tanımla (userId, createdAt, action)
  - _Requirements: 5.5, 7.5_

- [ ] 1.3 Extend User model
  - User modeline telegramUserId ve telegramUsername ekle
  - Reaction ve audit log ilişkilerini ekle
  - Manipulation tracking alanlarını ekle (isFlaggedForManipulation, vb.)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 1.4 Generate and apply migration
  - `npx prisma migrate dev --name add_telegram_reactions` çalıştır
  - Migration SQL'ini kontrol et
  - Development database'de test et
  - _Requirements: Tüm database requirements_

- [ ] 2. ReactionTracker service implementasyonu
  - Tepki kaydetme ve kaldırma fonksiyonlarını oluştur
  - Manipülasyon kontrolü ekle
  - Puan hesaplama ve güncelleme
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 2.1 Create ReactionTracker service base
  - `lib/telegram/reaction-tracker.ts` oluştur
  - ReactionTracker interface'ini tanımla
  - ReactionResult type'ını tanımla
  - Temel servis yapısını kur
  - _Requirements: 1.1, 1.2_

- [ ] 2.2 Implement recordReaction method
  - Mevcut tepkiyi kontrol et (duplicate prevention)
  - Manipülasyon kontrolü yap
  - Cooldown kontrolü yap
  - Yeni tepki kaydı oluştur
  - 20 puan ekle (atomic transaction)
  - Audit log oluştur
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.5_

- [ ] 2.3 Implement removeReaction method
  - Tepkiyi bul ve kontrol et
  - Manipülasyon kontrolü yap
  - Tepkiyi pasif yap (isActive = false)
  - 20 puan düş (atomic transaction)
  - removedAt timestamp'i güncelle
  - Audit log oluştur
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.5_

- [ ] 2.4 Implement hasReaction method
  - Aktif tepkiyi database'de ara
  - Boolean sonuç döndür
  - Cache ile optimize et
  - _Requirements: 1.1_

- [ ] 2.5 Add error handling
  - Database hatalarını yakala
  - Transaction rollback ekle
  - Hata loglaması ekle
  - User-friendly hata mesajları
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 3. ManipulationDetector service implementasyonu
  - Add/remove cycle tracking
  - Cooldown enforcement
  - User flagging
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 3.1 Create ManipulationDetector service
  - `lib/telegram/manipulation-detector.ts` oluştur
  - ManipulationDetector interface'ini tanımla
  - ManipulationCheck type'ını tanımla
  - _Requirements: 4.1, 4.2_

- [ ] 3.2 Implement checkManipulation method
  - Son 24 saatteki add/remove cycle'ları say
  - >3 cycle varsa manipulative olarak işaretle
  - Son değişiklikten bu yana geçen süreyi hesapla
  - 1 saat cooldown kontrolü yap
  - Flagging gerekip gerekmediğini belirle
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 3.3 Implement flagUser method
  - User'ı flag olarak işaretle (isFlaggedForManipulation = true)
  - Flag reason'ı kaydet
  - flaggedAt timestamp'i ekle
  - Admin notification oluştur
  - Audit log ekle
  - _Requirements: 4.2, 4.4_

- [ ] 3.4 Implement getManipulationScore method
  - User'ın son 7 gündeki cycle sayısını hesapla
  - Flagged durumunu kontrol et
  - Manipulation score döndür (0-100)
  - _Requirements: 4.1, 4.2_

- [ ] 4. PointReconciler service implementasyonu
  - Gece doğrulama logic'i
  - Puan reconciliation
  - Telegram API entegrasyonu
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 4.1 Create PointReconciler service
  - `lib/telegram/point-reconciler.ts` oluştur
  - PointReconciler interface'ini tanımla
  - ReconciliationResult ve ReconciliationReport type'larını tanımla
  - _Requirements: 3.1, 3.2, 5.1, 5.2_

- [ ] 4.2 Implement verifyReactions method
  - Belirtilen zaman aralığındaki tüm tepkileri getir
  - Her tepki için Telegram Bot API'yi çağır
  - Stored vs actual karşılaştırması yap
  - Kaldırılmış tepkileri tespit et
  - Puan farkını hesapla
  - adjustUserPoints'i çağır
  - ReconciliationResult döndür
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.3 Implement adjustUserPoints method
  - User'ın mevcut puanını al
  - Puan değişikliğini uygula (atomic)
  - Negatif puana izin verme
  - Audit log oluştur
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 4.4 Implement getReconciliationReport method
  - Belirtilen tarih için istatistikleri hesapla
  - Toplam tepki, aktif, kaldırılmış sayıları
  - Puan awarded/deducted toplamları
  - Manipulation attempt sayısı
  - ReconciliationReport döndür
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 4.5 Add Telegram Bot API integration
  - Bot token'ı environment variable'dan al
  - `getMessageReactions()` fonksiyonu oluştur
  - Rate limiting ekle
  - Retry logic ekle (exponential backoff)
  - Error handling ekle
  - _Requirements: 3.2, 10.1, 10.2, 10.3_

- [ ] 5. Telegram webhook endpoint
  - Webhook signature verification
  - Reaction event handling
  - User identification
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 12.1, 12.2_

- [ ] 5.1 Create webhook route
  - `app/api/telegram/webhook/route.ts` oluştur
  - POST handler ekle
  - Request body validation ekle
  - _Requirements: 1.1, 12.1_

- [ ] 5.2 Implement webhook signature verification
  - Telegram webhook secret'ı environment variable'dan al
  - Request signature'ı doğrula
  - Invalid signature için 401 döndür
  - _Requirements: 12.1, 12.2_

- [ ] 5.3 Implement user identification
  - Telegram user ID/username'den platform user'ı bul
  - referralCode ile eşleştir
  - Case-insensitive matching
  - User bulunamazsa log ve skip
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5.4 Handle reaction added event
  - message_reaction.new_reaction'ı parse et
  - Her yeni emoji için recordReaction çağır
  - Manipulation kontrolü yap
  - Success/error response döndür
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5.5 Handle reaction removed event
  - message_reaction.old_reaction vs new_reaction karşılaştır
  - Kaldırılan emoji'leri tespit et
  - Her kaldırılan emoji için removeReaction çağır
  - Success/error response döndür
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5.6 Add rate limiting
  - Per-user rate limiting ekle (10 req/min)
  - IP-based rate limiting ekle (100 req/min)
  - Rate limit aşımında 429 döndür
  - _Requirements: 12.4_

- [ ] 6. Cron job for nightly verification
  - Scheduled verification at 23:00 UTC
  - Error handling and retry
  - Admin notifications
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 6.1 Create cron endpoint
  - `app/api/cron/verify-reactions/route.ts` oluştur
  - POST handler ekle
  - Vercel cron secret verification ekle
  - _Requirements: 3.1_

- [ ] 6.2 Implement verification logic
  - Son 24 saatin zaman aralığını hesapla
  - PointReconciler.verifyReactions() çağır
  - Sonuçları logla
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6.3 Add error handling and retry
  - Try-catch ile hataları yakala
  - Kritik hatalar için admin notification gönder
  - Partial success durumunu handle et
  - Error details'i logla
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 6.4 Configure Vercel cron
  - `vercel.json`'a cron job ekle
  - Schedule: "0 23 * * *" (23:00 UTC daily)
  - CRON_SECRET environment variable ekle
  - _Requirements: 3.1_

- [ ] 7. User notification system
  - Notification component
  - Login check
  - Popup display
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7.1 Create notification data model
  - ReactionNotification interface tanımla
  - Database'de notification tablosu oluştur (optional)
  - Veya audit log'dan notification'ları çek
  - _Requirements: 6.1, 6.2_

- [ ] 7.2 Create ReactionNotification component
  - `components/notifications/ReactionNotification.tsx` oluştur
  - Popup modal UI tasarla
  - Points change, reason, new total göster
  - Dismiss button ekle
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 7.3 Implement notification check on login
  - User login olduğunda pending notification'ları kontrol et
  - Son 24 saatteki audit log'ları getir
  - Shown olmayan notification'ları filtrele
  - _Requirements: 6.1, 6.2_

- [ ] 7.4 Implement notification display
  - Notification varsa popup'ı göster
  - User dismiss edince shown olarak işaretle
  - Session'da bir kez göster
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 8. Admin dashboard
  - Statistics display
  - Recent activity
  - Top users
  - Export functionality
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 8.1 Create admin stats API
  - `app/api/admin/reactions/stats/route.ts` oluştur
  - GET handler ekle
  - Admin authentication kontrolü
  - _Requirements: 9.1, 9.2_

- [ ] 8.2 Implement stats calculation
  - Today, week, month için istatistikleri hesapla
  - Total reactions, points awarded, manipulation attempts
  - Top users listesi (reaction count, points earned)
  - Cache ile optimize et (5 min TTL)
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 8.3 Create admin dashboard page
  - `app/admin/(dashboard)/reactions/page.tsx` oluştur
  - Stats card'ları göster
  - Recent activity table ekle
  - Top users listesi ekle
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 8.4 Add export functionality
  - Export button ekle
  - CSV/JSON format seçeneği
  - Audit log'ları export et
  - Download trigger
  - _Requirements: 9.5_

- [ ] 8.5 Add real-time updates (optional)
  - WebSocket veya polling ile real-time stats
  - Auto-refresh her 30 saniyede
  - _Requirements: 9.1_

- [ ] 9. Testing
  - Unit tests
  - Integration tests
  - Performance tests
  - _Requirements: Tüm requirements_

- [ ]* 9.1 Unit tests for ReactionTracker
  - Test recordReaction method
  - Test removeReaction method
  - Test duplicate prevention
  - Test point calculation
  - Test manipulation detection
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 9.2 Unit tests for ManipulationDetector
  - Test cycle counting
  - Test cooldown enforcement
  - Test flagging logic
  - Test edge cases
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 9.3 Unit tests for PointReconciler
  - Test verification logic
  - Test point adjustment
  - Test atomic updates
  - Test error handling
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 9.4 Integration tests for webhook flow
  - Test end-to-end reaction flow
  - Test point award/deduction
  - Test audit log creation
  - Test user identification
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ]* 9.5 Integration tests for verification flow
  - Test nightly verification
  - Test reconciliation
  - Test admin notifications
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 9.6 Performance tests
  - Test with 1000+ reactions per day
  - Test concurrent webhook processing
  - Test verification completion time (<30 min)
  - Test database query performance
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 10. Documentation and deployment
  - Setup guide
  - Environment variables
  - Deployment checklist
  - _Requirements: Tüm requirements_

- [ ] 10.1 Create Telegram Bot setup guide
  - BotFather ile bot oluşturma adımları
  - Webhook URL konfigürasyonu
  - Required permissions
  - Bot token güvenliği
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 10.2 Document environment variables
  - TELEGRAM_BOT_TOKEN
  - TELEGRAM_WEBHOOK_SECRET
  - CRON_SECRET
  - Example .env file
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 10.3 Create deployment checklist
  - Database migration steps
  - Environment variable setup
  - Webhook registration
  - Cron job configuration
  - Testing procedures
  - Rollback plan
  - _Requirements: Tüm requirements_

- [ ] 10.4 Create user guide
  - Telegram grubuna katılma
  - Referral code ile hesap bağlama
  - Tepki verme ve puan kazanma
  - Notification'ları görüntüleme
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10.5 Create admin guide
  - Dashboard kullanımı
  - Manipulation detection
  - Manual point adjustment
  - Troubleshooting
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

---

## Implementation Order

**Phase 1: Foundation (Tasks 1-2)**
- Database schema
- ReactionTracker service

**Phase 2: Core Services (Tasks 3-4)**
- ManipulationDetector
- PointReconciler

**Phase 3: API Layer (Tasks 5-6)**
- Webhook endpoint
- Cron job

**Phase 4: User Interface (Tasks 7-8)**
- Notifications
- Admin dashboard

**Phase 5: Polish (Tasks 9-10)**
- Testing
- Documentation

---

## Estimated Timeline

- **Phase 1**: 2-3 days
- **Phase 2**: 2-3 days
- **Phase 3**: 2 days
- **Phase 4**: 2 days
- **Phase 5**: 2 days

**Total**: 10-12 days

---

## Dependencies

- Telegram Bot Token (from BotFather)
- Telegram group/channel for testing
- Vercel account for cron jobs
- PostgreSQL database

---

**Document Version**: 1.0  
**Date**: November 13, 2025  
**Status**: Ready for Implementation
