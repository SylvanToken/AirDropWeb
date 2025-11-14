# Hassas Bilgiler Listesi - Sylvan Token Projesi

Bu dokümanda projede bulunan **API key, şifre, token ve diğer hassas bilgilerin** bulunduğu dosyalar listelenmiştir.

⚠️ **UYARI**: Bu bilgiler GÜVENLİK RİSKİ oluşturmaktadır. Lütfen acilen aşağıdaki aksiyonları alın!

---

## 🔴 KRİTİK HASSAS BİLGİLER (.env dosyası)

### Dosya: `.env`

Bu dosya **ASLA** Git'e commit edilmemelidir ve **HEMEN** güvenli hale getirilmelidir!

#### 1. Veritabanı Bilgileri
- **PostgreSQL Şifresi**: `bkEOzJECBtU2SZcM`
- **Database URL**: `postgres://postgres.fahcabutajczylskmmgw:bkEOzJECBtU2SZcM@aws-1-us-east-1.pooler.supabase.com:5432/postgres`
- **Postgres Host**: `db.fahcabutajczylskmmgw.supabase.co`
- **Postgres User**: `postgres`
- **Postgres Password**: `bkEOzJECBtU2SZcM`

#### 2. NextAuth Güvenlik
- **NEXTAUTH_SECRET**: `your-secret-key-change-this-in-production` ⚠️ (Değiştirilmeli!)
- **NEXTAUTH_URL**: `http://localhost:3333`

#### 3. Admin Hesap Bilgileri
- **ADMIN_EMAIL**: `admin@sylvantoken.org`
- **ADMIN_PASSWORD**: `Mjkvebep_Brn68o` ⚠️ **KRİTİK!**

#### 4. Test Access Key
- **TEST_ACCESS_KEY**: `07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c`

#### 5. Email/SMTP Bilgileri
- **SMTP_USER**: `sylvantoken@gmail.com`
- **SMTP_PASSWORD**: `stnjueibsosjffbw` ⚠️ **Gmail App Password!**
- **EMAIL_FROM**: `noreply@sylvantoken.org`

#### 6. Resend API
- **RESEND_API_KEY**: `re_esWqEK4H_JANdaicdiRGjqfvUq4ZDmqLt` ⚠️ **KRİTİK!**

#### 7. Supabase Bilgileri
- **SUPABASE_URL**: `https://fahcabutajczylskmmgw.supabase.co`
- **SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaGNhYnV0YWpjenlsc2ttbWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Mzk3MTksImV4cCI6MjA3ODUxNTcxOX0.ZiANFTDtTqsYUXBbhQLxrUVU0H-4tX38n4nbxoBSngk`
- **SUPABASE_SERVICE_ROLE_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaGNhYnV0YWpjenlsc2ttbWd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTcxOSwiZXhwIjoyMDc4NTE1NzE5fQ._0cz1qZDF3c-QP9CBl01zo3M1wTEvkPanJso-d629a0`
- **SUPABASE_JWT_SECRET**: `Me/qAOyTMg6iDSQ/HlMbwq+rPyU0vRlQhqsKObpJnau1nWGs2faznjvGTyXDs/uFEZ7v2B7X7h0he7/F35I8tA==`

#### 8. Telegram Bot Bilgileri
- **TELEGRAM_BOT_TOKEN**: `8083809833:AAGMj_xHy12LwF89_inbwiifok6FjjuOJoE` ⚠️ **KRİTİK!**
- **TELEGRAM_BOT_USERNAME**: `SylvusBot`
- **TELEGRAM_CHANNEL_ID**: `-1002857056222`

#### 9. Cloudflare Turnstile
- **NEXT_PUBLIC_TURNSTILE_SITE_KEY**: `0x4AAAAAACArCE6b3EXA2mX4`
- **TURNSTILE_SECRET_KEY**: `0x4AAAAAACArCIAxxPkAefdXJYppUZPtiH4` ⚠️

#### 10. BscScan API
- **BSCSCAN_API_KEY**: `N8R5NJSDH686DGNJ85EJZP3IGG3GTU2UE4` ⚠️

#### 11. Blockchain Wallet Adresleri
- **TOKEN_DEPLOYER_ADDRESS**: `0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469`
- **TOKEN_OWNER_ADDRESS**: `0x465b54282e4885f61df7eB7CcDc2493DB35C9501`
- **TOKEN_MAD_ADDRESS**: `0x58F30f0aAAaF56DaFA93cd03103C3B9f264a999d`
- **TOKEN_LEB_ADDRESS**: `0x8df5ec091133fcebc40f964c5c9dda16dd8771b1`
- **TOKEN_CNK_ADDRESS**: `0x106A637D825e562168678b7fd0f75cFf2cF2845B`
- **TOKEN_KDR_ADDRESS**: `0xaD1EAc033Ff56e7295abDfB46f5A94016D760460`
- **TOKEN_LOCKED_ADDRESS**: `0x687A2c7E494c3818c20AD2856d453514970d6aac`
- **TOKEN_DONATION_ADDRESS**: `0xa697645Fdfa5d9399eD18A6575256F81343D4e17`
- **TOKEN_FEE_ADDRESS**: `0x46a4AF3bdAD67d3855Af42Ba0BBe9248b54F7915`
- **TOKEN_BURN_ADDRESS**: `0x000000000000000000000000000000000000dEaD`
- **TOKEN_CONTRACT_ADDRESS**: `0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85`

---

## 🟡 Test Dosyalarında Bulunan Hassas Bilgiler

### Dosya: `__tests__/workflows.test.ts`
- **ADMIN_EMAIL**: `admin@sylvantoken.org`
- **ADMIN_PASSWORD**: `Mjkvebep_68` ⚠️

### Dosya: `__tests__/utils/test-helpers.ts`
- Test için kullanılan default password: `Test123!`
- JWT token oluşturma fonksiyonu mevcut
- NEXTAUTH_SECRET kullanımı var

---

## 📋 Örnek Dosyalar (Güvenli)

Bu dosyalar sadece örnek içerir, gerçek bilgi yok:

- `.env.example` - Sadece placeholder değerler
- `.env.production.example` - Sadece placeholder değerler

---

## 🚨 ACİL YAPILMASI GEREKENLER

### 1. Hemen Yapılması Gerekenler (0-24 saat)

1. **`.env` dosyasını Git'ten kaldırın**:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from repository"
   git push
   ```

2. **`.gitignore` dosyasını kontrol edin**:
   - `.env` dosyasının ignore listesinde olduğundan emin olun

3. **Tüm API Key'leri yenileyin**:
   - ✅ Resend API Key'i yenileyin
   - ✅ Telegram Bot Token'ı yenileyin
   - ✅ Supabase Key'lerini yenileyin
   - ✅ BscScan API Key'i yenileyin
   - ✅ Turnstile Secret Key'i yenileyin

4. **Şifreleri değiştirin**:
   - ✅ Admin şifresini değiştirin
   - ✅ Gmail SMTP şifresini yenileyin
   - ✅ PostgreSQL database şifresini değiştirin
   - ✅ NEXTAUTH_SECRET'ı yenileyin

5. **Git History'den temizleyin**:
   ```bash
   # BFG Repo-Cleaner veya git filter-branch kullanın
   # Tüm commit history'den .env dosyasını kaldırın
   ```

### 2. Orta Vadeli Aksiyonlar (1-7 gün)

1. **Secret Management Sistemi kurun**:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Vercel Environment Variables

2. **Güvenlik Audit yapın**:
   - Tüm erişim loglarını kontrol edin
   - Şüpheli aktivite araştırın

3. **2FA (Two-Factor Authentication) aktif edin**:
   - GitHub hesabı
   - Supabase hesabı
   - Email hesabı
   - Tüm kritik servislerde

### 3. Uzun Vadeli İyileştirmeler

1. **Güvenlik politikaları oluşturun**
2. **Automated secret scanning** kurun (GitHub Secret Scanning)
3. **Pre-commit hooks** ekleyin (hassas bilgi kontrolü)
4. **Security training** yapın ekip için

---

## 📝 Notlar

- Bu dosya oluşturulma tarihi: 2025-01-XX
- Proje: Sylvan Token
- Tarama kapsamı: Tüm proje dosyaları (node_modules hariç)

---

## ⚠️ UYARI

Bu liste **sadece bilgilendirme amaçlıdır**. Gerçek hassas bilgiler içermemelidir.
Bu dosyayı da `.gitignore`'a ekleyin veya güvenli bir yerde saklayın!

