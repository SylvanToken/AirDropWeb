# 🔐 Giriş Bilgileri - Sylvan Token Airdrop Platform

## ⚠️ ÖNEMLİ: Doğru Şifreler

Seed script'inde oluşturulan kullanıcıların şifreleri:

### Admin Kullanıcı
```
Email: admin@sylvantoken.org
Şifre: Admin123!
```

### Test Kullanıcıları
**Tüm test kullanıcıları için şifre:**
```
Şifre: Test123!
```

## 📋 Test Kullanıcı Listesi

### Yüksek Puanlı Kullanıcılar (1500+ puan)

```
Email: cryptophoenix@example.com
Username: CryptoPhoenix
Şifre: Test123!
Puan: ~2000+

Email: airdropscout@example.com
Username: AirdropScout
Şifre: Test123!
Puan: ~2000+

Email: cryptomaverick@example.com
Username: CryptoMaverick
Şifre: Test123!
Puan: ~2000+

Email: tokenwarrior@example.com
Username: TokenWarrior
Şifre: Test123!
Puan: ~1800+

Email: airdropmaster@example.com
Username: AirdropMaster
Şifre: Test123!
Puan: ~1800+
```

### Orta Puanlı Kullanıcılar (1000-1500 puan)

```
Email: tokenhunter@example.com
Username: TokenHunter
Şifre: Test123!
Puan: ~1700+

Email: cryptoking@example.com
Username: CryptoKing
Şifre: Test123!
Puan: ~1500+

Email: coinmaster@example.com
Username: CoinMaster
Şifre: Test123!
Puan: ~1600+

Email: airdrophero@example.com
Username: AirdropHero
Şifre: Test123!
Puan: ~1200+

Email: coinminer@example.com
Username: CoinMiner
Şifre: Test123!
Puan: ~1200+
```

### Düşük Puanlı Kullanıcılar (100-1000 puan)

```
Email: blockchainpro@example.com
Username: BlockchainPro
Şifre: Test123!
Puan: ~100-500

Email: defiexplorer@example.com
Username: DeFiExplorer
Şifre: Test123!
Puan: ~100-500

Email: coincollector@example.com
Username: CoinCollector
Şifre: Test123!
Puan: ~100-500

Email: digitalnomad@example.com
Username: DigitalNomad
Şifre: Test123!
Puan: ~700+

Email: cryptowhale@example.com
Username: CryptoWhale
Şifre: Test123!
Puan: ~900+
```

## 🎯 Hızlı Test İçin Önerilen Kullanıcılar

### 1. Yeni Başlayan Kullanıcı
```
Email: blockchainpro@example.com
Şifre: Test123!
```
- Az puan
- Wallet ekleyebilirsiniz
- Görev tamamlayabilirsiniz

### 2. Aktif Kullanıcı
```
Email: tokenhunter@example.com
Şifre: Test123!
```
- Orta seviye puan
- Bazı görevler tamamlanmış
- Leaderboard'da görünür

### 3. İleri Seviye Kullanıcı
```
Email: cryptomaverick@example.com
Şifre: Test123!
```
- Yüksek puan
- Çoğu görev tamamlanmış
- Leaderboard'da üst sıralarda

## 🔧 Admin Paneli Erişimi

### Admin Girişi
```
URL: http://localhost:3005/admin/login
Email: admin@sylvantoken.org
Şifre: Admin123!
```

### Admin Yetkileri
- ✅ Tüm kullanıcıları görüntüleme
- ✅ Görev oluşturma/düzenleme
- ✅ Kampanya yönetimi
- ✅ Wallet onaylama/reddetme
- ✅ Görev tamamlama onaylama/reddetme
- ✅ Analytics görüntüleme
- ✅ Audit logs görüntüleme

## 🚨 Yaygın Giriş Hataları

### Hata 1: "Invalid email or password"

**Neden:** Yanlış şifre kullanıyorsunuz

**Çözüm:** 
- Test kullanıcıları için: `Test123!`
- Admin için: `Admin123!`

### Hata 2: "Your account has been blocked"

**Neden:** Kullanıcı hesabı bloke edilmiş

**Çözüm:** 
- Farklı bir test kullanıcısı deneyin
- Veya veritabanını sıfırlayın: `npm run seed`

### Hata 3: "This account no longer exists"

**Neden:** Kullanıcı silinmiş

**Çözüm:**
- Farklı bir test kullanıcısı deneyin
- Veya veritabanını sıfırlayın: `npm run seed`

## 🔄 Veritabanını Sıfırlama

Eğer giriş yapamıyorsanız veya test verilerini sıfırlamak istiyorsanız:

```bash
# Veritabanını sıfırla ve yeniden seed et
npm run seed
```

Bu komut:
- ✅ Tüm eski verileri temizler
- ✅ Admin kullanıcısını oluşturur
- ✅ 40 test kullanıcısı oluşturur
- ✅ Varsayılan kampanya ve görevleri oluşturur

## 📝 Şifre Gereksinimleri

Yeni kullanıcı oluştururken şifre gereksinimleri:
- ✅ En az 8 karakter
- ✅ En az 1 büyük harf
- ✅ En az 1 küçük harf
- ✅ En az 1 rakam
- ✅ En az 1 özel karakter (!@#$%^&*)

**Örnek geçerli şifreler:**
- `Test123!`
- `Admin123!`
- `MyPass123!`
- `Secure@2025`

## 🎮 Test Senaryoları

### Senaryo 1: Yeni Kullanıcı Deneyimi
```
1. Kayıt ol: http://localhost:3005/register
   Email: yenikullanici@test.com
   Username: yenikullanici
   Şifre: Test123!

2. Giriş yap
3. Dashboard'u incele
4. Görev tamamla
5. Wallet ekle
```

### Senaryo 2: Mevcut Kullanıcı
```
1. Giriş yap: blockchainpro@example.com / Test123!
2. Dashboard'u kontrol et
3. Görevleri görüntüle
4. Wallet ekle
5. Profil güncelle
```

### Senaryo 3: Admin İşlemleri
```
1. Admin girişi: admin@sylvantoken.org / Admin123!
2. Kullanıcıları görüntüle
3. Görev oluştur
4. Wallet onaylama yap
5. Analytics kontrol et
```

## 🔐 Güvenlik Notları

### Geliştirme Ortamı
- ⚠️ Bu şifreler sadece **lokal test** içindir
- ⚠️ Production'da **asla** bu şifreleri kullanmayın
- ⚠️ Production'da güçlü, benzersiz şifreler kullanın

### Production Önerileri
- ✅ Şifre politikası uygulayın
- ✅ 2FA (Two-Factor Authentication) ekleyin
- ✅ Rate limiting kullanın
- ✅ Şifre sıfırlama mekanizması ekleyin
- ✅ Email doğrulama zorunlu yapın

## 📞 Yardım

Hala giriş yapamıyorsanız:

1. **Console loglarını kontrol edin:**
   - Browser DevTools (F12)
   - Network tab
   - Console tab

2. **Sunucu loglarını kontrol edin:**
   - Terminal'de Next.js sunucusunun çıktısını inceleyin

3. **Veritabanını kontrol edin:**
   ```bash
   npx prisma studio
   # http://localhost:5555
   ```

4. **Veritabanını sıfırlayın:**
   ```bash
   npm run seed
   ```

## ✅ Başarılı Giriş Kontrolü

Giriş başarılı olduğunda:
- ✅ Dashboard'a yönlendirilirsiniz
- ✅ Sağ üst köşede kullanıcı adınız görünür
- ✅ Sol menüde navigasyon linkleri aktif olur
- ✅ Puan ve istatistikleriniz görünür

**Şimdi doğru şifrelerle tekrar deneyin!** 🚀

---

**Son Güncelleme:** 11 Kasım 2025
**Versiyon:** 1.0
