# 🌐 Vercel + Cloudflare Domain Setup - English Guide

## 📋 Overview

We'll connect your domain registered on Cloudflare (e.g., `sylvantoken.org`) to your Vercel project.

**Example:** `airdrop.sylvantoken.org` → Your Vercel project

**Duration:** 10-15 minutes
**Requirements:** Cloudflare account, Vercel account, Domain

---

## 🎯 ADIM 1: Vercel'de Domain Ekle

### 1.1 Vercel Dashboard'a Git

1. Tarayıcıda **vercel.com** aç
2. Giriş yap
3. Projenizi seç (örn: `sylvan-airdrop-platform`)

### 1.2 Settings → Domains

1. Üst menüden **"Settings"** tıkla
2. Sol menüden **"Domains"** seç

### 1.3 Domain Ekle

1. **"Add"** butonuna tıkla (veya domain input kutusunu gör)

2. Domain'inizi girin:
   ```
   airdrop.sylvantoken.org
   ```

3. **"Add"** butonuna bas

### 1.4 DNS Kayıtlarını Gör

Vercel size 2 seçenek sunacak:

**Seçenek A: CNAME (Önerilen - Subdomain için)**
```
Type: CNAME
Name: airdrop
Value: cname.vercel-dns.com
```

**Seçenek B: A Record (Root domain için)**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Bizim durumumuz:** Subdomain (`airdrop.sylvantoken.org`) kullanıyoruz, **CNAME** kullanacağız.

**⚠️ Bu bilgileri not alın veya sayfayı açık bırakın!**

---

## ☁️ ADIM 2: Cloudflare'de DNS Ayarları

### 2.1 Cloudflare'e Giriş Yap

1. Tarayıcıda yeni sekme aç
2. **cloudflare.com** git
3. Giriş yap

### 2.2 Domain'inizi Seç

1. Dashboard'da domain'inizi bulun: **sylvantoken.org**
2. Domain'e tıklayın

### 2.3 DNS Ayarlarına Git

1. Sol menüden **"DNS"** sekmesine tıklayın
2. **"Records"** bölümünü göreceksiniz

---

## 📝 ADIM 3: CNAME Kaydı Ekle

### 3.1 Add Record

1. **"Add record"** butonuna tıklayın

### 3.2 CNAME Kaydı Bilgileri

**Type:**
```
CNAME
```
Dropdown'dan **CNAME** seçin

**Name:**
```
airdrop
```
Sadece subdomain kısmını yazın (tam domain değil!)

**Target:**
```
cname.vercel-dns.com
```
Vercel'in verdiği değer

**Proxy status:**
```
🔴 DNS only (Proxied değil!)
```
**⚠️ ÖNEMLİ:** Turuncu bulut ikonuna tıklayıp **gri** yapın!
- 🟠 Proxied → ❌ YANLIŞ
- ⚪ DNS only → ✅ DOĞRU

**TTL:**
```
Auto
```
Olduğu gibi bırakın

### 3.3 Save

**"Save"** butonuna tıklayın

---

## ✅ ADIM 4: DNS Kaydını Doğrula

### 4.1 Cloudflare'de Kontrol

DNS Records listesinde yeni kaydı göreceksiniz:

```
Type: CNAME
Name: airdrop
Content: cname.vercel-dns.com
Proxy status: DNS only (gri bulut)
```

### 4.2 Vercel'e Dön

1. Vercel sekmesine geri dönün
2. Domain sayfasında **"Refresh"** veya **"Verify"** butonuna tıklayın

**Beklenen süre:** 1-5 dakika

### 4.3 Doğrulama Durumu

**✅ Başarılı:**
- Domain yanında yeşil ✅ işareti
- **"Valid Configuration"** yazısı
- SSL sertifikası otomatik oluşturuluyor

**⏳ Beklemede:**
- Sarı ⏳ işareti
- **"Pending Verification"** yazısı
- 5-10 dakika bekleyin, sayfayı yenileyin

**❌ Hata:**
- Kırmızı ❌ işareti
- **"Invalid Configuration"** yazısı
- DNS kayıtlarını kontrol edin (Adım 5'e gidin)

---

## 🔍 ADIM 5: Sorun Giderme (Gerekirse)

### 5.1 DNS Propagation Kontrolü

DNS değişikliklerinin yayılması 5-60 dakika sürebilir.

**Online araçla kontrol edin:**
1. Tarayıcıda **dnschecker.org** açın
2. Domain'inizi girin: `airdrop.sylvantoken.org`
3. Type: **CNAME** seçin
4. **"Search"** tıklayın
5. Sonuçlara bakın:
   - ✅ Yeşil: `cname.vercel-dns.com` görünüyor
   - ❌ Kırmızı: Henüz yayılmamış, bekleyin

### 5.2 Cloudflare Proxy Kontrolü

**En yaygın hata:** Proxy açık bırakılması

1. Cloudflare → DNS → Records
2. `airdrop` kaydını bulun
3. Proxy status kontrol edin:
   - 🟠 Turuncu bulut → **YANLIŞ!** Tıklayıp gri yapın
   - ⚪ Gri bulut → **DOĞRU!**

### 5.3 CNAME Değeri Kontrolü

Cloudflare'de CNAME kaydının **Target** değeri:
```
cname.vercel-dns.com
```

**Yanlış değerler:**
- ❌ `cname.vercel-dns.com.` (nokta ile bitmemeli)
- ❌ `vercel.com`
- ❌ `76.76.21.21` (bu A record için)

### 5.4 Vercel'de Yeniden Dene

1. Vercel → Settings → Domains
2. Domain'in yanındaki **"..."** menüsüne tıklayın
3. **"Refresh"** veya **"Retry"** seçin

---

## 🔐 ADIM 6: SSL Sertifikası (Otomatik)

### 6.1 SSL Durumu

Domain doğrulandıktan sonra:

1. Vercel otomatik olarak SSL sertifikası oluşturur
2. **"Issuing Certificate"** yazısını göreceksiniz
3. 1-5 dakika içinde **"Valid Configuration"** olur

### 6.2 HTTPS Kontrolü

Tarayıcıda açın:
```
https://airdrop.sylvantoken.org
```

**✅ Başarılı:**
- Sayfa açılıyor
- Adres çubuğunda kilit 🔒 ikonu var
- Sertifika geçerli

**❌ Hata:**
- "Your connection is not private" hatası
- 5-10 dakika daha bekleyin
- Vercel SSL durumunu kontrol edin

---

## 🔄 ADIM 7: NEXTAUTH_URL Güncelle

### 7.1 Environment Variables

1. Vercel → Settings → Environment Variables
2. **NEXTAUTH_URL** variable'ını bulun
3. **"Edit"** butonuna tıklayın

### 7.2 Yeni Domain'i Gir

**Eski değer:**
```
https://sylvan-airdrop-platform.vercel.app
```

**Yeni değer:**
```
https://airdrop.sylvantoken.org
```

### 7.3 Save ve Redeploy

1. **"Save"** butonuna basın
2. Üst menüden **"Deployments"** gidin
3. En son deployment'ın yanındaki **"..."** menüsüne tıklayın
4. **"Redeploy"** seçin
5. 2-3 dakika bekleyin

---

## ✅ ADIM 8: Test Et!

### 8.1 Ana Domain

Tarayıcıda açın:
```
https://airdrop.sylvantoken.org
```

**✅ Başarılı:**
- Countdown sayfasına yönlendiriyor
- HTTPS çalışıyor (kilit ikonu)

### 8.2 Countdown Sayfası

```
https://airdrop.sylvantoken.org/countdown
```

**✅ Başarılı:**
- Countdown sayfası görünüyor
- Geri sayım çalışıyor

### 8.3 Admin Erişimi

Gizli pencere (Incognito) açın:
```
https://airdrop.sylvantoken.org/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

**✅ Başarılı:**
- Dashboard'a yönlendiriyor
- Admin paneli açılıyor

### 8.4 Eski Vercel Domain

Eski domain hala çalışmalı:
```
https://sylvan-airdrop-platform.vercel.app
```

**✅ Her iki domain de çalışıyor!**

---

## 🎯 ADIM 9: Eski Domain'i Yönlendir (Opsiyonel)

### 9.1 Redirect Ayarı

Eski Vercel domain'ini yeni domain'e yönlendirmek isterseniz:

1. Vercel → Settings → Domains
2. Eski domain'i bulun: `sylvan-airdrop-platform.vercel.app`
3. **"Redirect to"** seçeneğini işaretleyin
4. Yeni domain'i seçin: `airdrop.sylvantoken.org`
5. **"Save"** butonuna basın

**Sonuç:**
- `sylvan-airdrop-platform.vercel.app` → `airdrop.sylvantoken.org` yönlendirir

---

## 📊 ADIM 10: Cloudflare Ek Ayarlar (Opsiyonel)

### 10.1 SSL/TLS Modu

Cloudflare → SSL/TLS → Overview

**Önerilen mod:**
```
Full (strict)
```

Bu mod en güvenli seçenektir.

### 10.2 Always Use HTTPS

Cloudflare → SSL/TLS → Edge Certificates

**"Always Use HTTPS"** ayarını açın:
- HTTP istekleri otomatik HTTPS'e yönlendirilir

### 10.3 Automatic HTTPS Rewrites

Aynı sayfada:

**"Automatic HTTPS Rewrites"** açın:
- HTTP linkleri otomatik HTTPS'e çevrilir

### 10.4 Minimum TLS Version

**"Minimum TLS Version"** ayarı:
```
TLS 1.2 (önerilen)
```

---

## 🎉 Tamamlandı!

Domain başarıyla bağlandı!

### 🔗 Yeni URL'ler

**Ana Sayfa:**
```
https://airdrop.sylvantoken.org
```

**Countdown:**
```
https://airdrop.sylvantoken.org/countdown
```

**Admin Erişim:**
```
https://airdrop.sylvantoken.org/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

---

## 📋 Özet Checklist

- [ ] Vercel'de domain eklendi
- [ ] Cloudflare'de CNAME kaydı oluşturuldu
- [ ] Proxy status "DNS only" (gri bulut)
- [ ] DNS propagation tamamlandı
- [ ] Vercel'de domain doğrulandı
- [ ] SSL sertifikası oluşturuldu
- [ ] NEXTAUTH_URL güncellendi
- [ ] Redeploy yapıldı
- [ ] HTTPS çalışıyor
- [ ] Countdown sayfası açılıyor
- [ ] Admin access çalışıyor

---

## 🆘 Yaygın Sorunlar ve Çözümler

### Sorun 1: "Invalid Configuration"

**Sebep:** DNS kaydı yanlış veya henüz yayılmamış

**Çözüm:**
1. Cloudflare'de CNAME kaydını kontrol edin
2. Proxy status "DNS only" olmalı
3. Target: `cname.vercel-dns.com` olmalı
4. 10-15 dakika bekleyin
5. Vercel'de "Refresh" tıklayın

### Sorun 2: "Too Many Redirects"

**Sebep:** Cloudflare SSL modu yanlış

**Çözüm:**
1. Cloudflare → SSL/TLS → Overview
2. Mod: **"Full (strict)"** seçin
3. 5 dakika bekleyin
4. Sayfayı yenileyin

### Sorun 3: "Your connection is not private"

**Sebep:** SSL sertifikası henüz oluşmadı

**Çözüm:**
1. Vercel → Settings → Domains
2. SSL durumunu kontrol edin
3. "Issuing Certificate" yazıyorsa bekleyin
4. 5-10 dakika sonra tekrar deneyin

### Sorun 4: DNS Değişiklikleri Yayılmıyor

**Sebep:** DNS propagation süresi

**Çözüm:**
1. **dnschecker.org** ile kontrol edin
2. Farklı lokasyonlarda farklı sonuçlar normal
3. 24 saate kadar sürebilir (genelde 1 saat)
4. Sabırlı olun

### Sorun 5: Cloudflare Proxy Sorunu

**Sebep:** Proxy açık (turuncu bulut)

**Çözüm:**
1. Cloudflare → DNS → Records
2. `airdrop` kaydını bulun
3. Turuncu buluta tıklayın → Gri yapın
4. **"Save"** butonuna basın
5. 5 dakika bekleyin

---

## 🔧 DNS Kayıt Örnekleri

### Doğru CNAME Kaydı ✅

```
Type: CNAME
Name: airdrop
Target: cname.vercel-dns.com
Proxy: DNS only (gri bulut)
TTL: Auto
```

### Yanlış Örnekler ❌

**Yanlış 1: Proxy açık**
```
Type: CNAME
Name: airdrop
Target: cname.vercel-dns.com
Proxy: Proxied (turuncu bulut) ❌
```

**Yanlış 2: Tam domain kullanılmış**
```
Type: CNAME
Name: airdrop.sylvantoken.org ❌
Target: cname.vercel-dns.com
```

**Yanlış 3: Target yanlış**
```
Type: CNAME
Name: airdrop
Target: vercel.com ❌
```

---

## 📞 Yardım

Sorun yaşarsanız:

1. **DNS Checker:** https://dnschecker.org
2. **Vercel Docs:** https://vercel.com/docs/concepts/projects/domains
3. **Cloudflare Docs:** https://developers.cloudflare.com/dns/

---

## 🎓 Ek Bilgiler

### CNAME vs A Record

**CNAME (Subdomain için):**
- ✅ Subdomain: `airdrop.sylvantoken.org`
- ✅ Vercel IP değişirse otomatik güncellenir
- ✅ Önerilen yöntem

**A Record (Root domain için):**
- ✅ Root domain: `sylvantoken.org`
- ❌ IP değişirse manuel güncelleme gerekir
- ⚠️ Cloudflare proxy gerekebilir

### Cloudflare Proxy

**DNS only (gri bulut):**
- ✅ Vercel için gerekli
- ✅ Vercel SSL sertifikası çalışır
- ❌ Cloudflare CDN kullanılmaz

**Proxied (turuncu bulut):**
- ❌ Vercel domain doğrulaması başarısız olur
- ✅ Cloudflare CDN kullanılır
- ⚠️ Sadece A/AAAA record için önerilir

---

**Son Güncelleme:** 14 Kasım 2025
**Durum:** ✅ Vercel + Cloudflare Domain Ayarları Kılavuzu

**Başarılar! 🚀**
