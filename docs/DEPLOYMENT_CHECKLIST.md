# 🚀 Deployment Checklist

Bu checklist, Sylvan Token Airdrop platformunu production'a deploy etmeden önce kontrol etmeniz gereken tüm adımları içerir.

## 📋 Pre-Deployment Checklist

### 1. Code & Repository

- [ ] Tüm değişiklikler commit edildi
- [ ] `.env` dosyası `.gitignore`'da
- [ ] `.env.example` dosyası güncel
- [ ] Hassas bilgiler koddan temizlendi
- [ ] Console.log'lar temizlendi (production için)
- [ ] TODO yorumları kontrol edildi
- [ ] Code review tamamlandı

### 2. Environment Variables

- [ ] `.env.example` dosyası oluşturuldu
- [ ] Tüm gerekli environment variables listelendi
- [ ] Production values hazırlandı
- [ ] NEXTAUTH_SECRET yenilendi (production için)
- [ ] NEXTAUTH_URL production domain'e ayarlandı
- [ ] Admin credentials güvenli ve güçlü
- [ ] API keys production keys ile değiştirildi

### 3. Database

- [ ] Production database oluşturuldu (Supabase/PostgreSQL)
- [ ] Database connection string hazır
- [ ] Migrations test edildi
- [ ] Database backup stratejisi belirlendi
- [ ] Connection pooling ayarlandı
- [ ] Database user permissions kontrol edildi

### 4. Email Configuration

- [ ] SMTP credentials doğru
- [ ] Email templates test edildi
- [ ] Rate limiting ayarlandı
- [ ] Sender email verified
- [ ] Test emails gönderildi
- [ ] Email queue çalışıyor

### 5. Security

- [ ] HTTPS enabled
- [ ] CORS ayarları yapıldı
- [ ] Rate limiting aktif
- [ ] Bot protection (Turnstile) enabled
- [ ] SQL injection koruması
- [ ] XSS koruması
- [ ] CSRF koruması
- [ ] Helmet.js veya benzeri güvenlik headers

### 6. Performance

- [ ] Images optimize edildi
- [ ] Code splitting yapıldı
- [ ] Lazy loading uygulandı
- [ ] Caching stratejisi belirlendi
- [ ] CDN ayarlandı (opsiyonel)
- [ ] Bundle size kontrol edildi

### 7. Testing

- [ ] Unit tests passed
- [ ] Integration tests passed
- [ ] E2E tests passed
- [ ] Manual testing tamamlandı
- [ ] Cross-browser testing yapıldı
- [ ] Mobile responsive test edildi
- [ ] Performance testing yapıldı

### 8. Monitoring & Logging

- [ ] Error tracking ayarlandı (Sentry, etc.)
- [ ] Analytics eklendi (Google Analytics, etc.)
- [ ] Logging stratejisi belirlendi
- [ ] Uptime monitoring ayarlandı
- [ ] Alert sistemi kuruldu

## 🎯 Deployment Platform Checklist

### Vercel Deployment

- [ ] Vercel hesabı oluşturuldu
- [ ] GitHub repository bağlandı
- [ ] Environment variables eklendi
- [ ] Build settings yapılandırıldı
- [ ] Custom domain bağlandı (opsiyonel)
- [ ] SSL certificate aktif
- [ ] Preview deployments test edildi

### Netlify Deployment

- [ ] Netlify hesabı oluşturuldu
- [ ] GitHub repository bağlandı
- [ ] Environment variables eklendi
- [ ] Build settings yapılandırıldı
- [ ] Custom domain bağlandı (opsiyonel)
- [ ] SSL certificate aktif
- [ ] Deploy previews test edildi

## 🔧 Post-Deployment Checklist

### 1. Immediate Checks (İlk 5 Dakika)

- [ ] Site erişilebilir
- [ ] Homepage yükleniyor
- [ ] Login çalışıyor
- [ ] Register çalışıyor
- [ ] Database connection başarılı
- [ ] Email gönderimi çalışıyor
- [ ] API endpoints yanıt veriyor

### 2. Functionality Tests (İlk 30 Dakika)

- [ ] User registration flow
- [ ] User login flow
- [ ] Password reset flow
- [ ] Task completion flow
- [ ] Wallet connection
- [ ] Admin panel erişimi
- [ ] Email notifications
- [ ] Telegram notifications
- [ ] Token distribution
- [ ] Leaderboard güncelleniyor

### 3. Performance Checks (İlk 1 Saat)

- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimize
- [ ] No memory leaks
- [ ] No console errors
- [ ] Lighthouse score > 90

### 4. Security Verification (İlk 24 Saat)

- [ ] SSL certificate geçerli
- [ ] Security headers aktif
- [ ] Bot protection çalışıyor
- [ ] Rate limiting çalışıyor
- [ ] No exposed secrets
- [ ] CORS properly configured
- [ ] Authentication working

### 5. Monitoring Setup (İlk Hafta)

- [ ] Error tracking çalışıyor
- [ ] Analytics data geliyor
- [ ] Uptime monitoring aktif
- [ ] Alert notifications test edildi
- [ ] Backup stratejisi çalışıyor
- [ ] Log aggregation çalışıyor

## 📊 Environment Variables Verification

### Critical Variables

```bash
# Check these are set correctly:
✓ DATABASE_URL
✓ NEXTAUTH_URL
✓ NEXTAUTH_SECRET
✓ ADMIN_EMAIL
✓ ADMIN_PASSWORD
```

### Email Variables

```bash
✓ EMAIL_FROM
✓ SMTP_HOST
✓ SMTP_USER
✓ SMTP_PASSWORD
✓ RESEND_API_KEY
```

### Supabase Variables

```bash
✓ SUPABASE_URL
✓ SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Security Variables

```bash
✓ TURNSTILE_SECRET_KEY
✓ NEXT_PUBLIC_TURNSTILE_SITE_KEY
✓ TURNSTILE_ENABLED="true"
```

## 🚨 Rollback Plan

Eğer deployment başarısız olursa:

1. **Immediate Actions:**
   - [ ] Previous version'a geri dön
   - [ ] Error logs'u topla
   - [ ] Kullanıcılara bilgi ver
   - [ ] Database backup'ı kontrol et

2. **Investigation:**
   - [ ] Error logs'u analiz et
   - [ ] Environment variables'ı kontrol et
   - [ ] Database state'i kontrol et
   - [ ] Recent changes'i gözden geçir

3. **Fix & Redeploy:**
   - [ ] Sorunu düzelt
   - [ ] Local'de test et
   - [ ] Staging'de test et
   - [ ] Production'a redeploy et

## 📞 Emergency Contacts

```
Team Lead: [Name] - [Email] - [Phone]
DevOps: [Name] - [Email] - [Phone]
Database Admin: [Name] - [Email] - [Phone]
```

## 📚 Useful Commands

### Build & Test

```bash
# Local build test
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm run test
```

### Database

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Database studio
npx prisma studio
```

### Deployment

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

## ✅ Final Sign-Off

- [ ] Technical Lead approval
- [ ] QA approval
- [ ] Product Owner approval
- [ ] Stakeholder notification sent
- [ ] Documentation updated
- [ ] Team briefed on deployment

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Version:** _______________
**Notes:** _______________

---

## 🎉 Post-Deployment

Congratulations on your deployment! 🚀

Remember to:
- Monitor the first 24 hours closely
- Be ready for quick fixes
- Communicate with users
- Celebrate with the team! 🎊
