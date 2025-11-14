# Wallet Güncelleme Hatası Çözümü

## Sorun: "Failed to update wallet address"

Bu hata, session'ınızın geçersiz olması durumunda ortaya çıkar. Genellikle şu durumlarda görülür:
- Veritabanı sıfırlandıktan sonra eski session kullanılıyor
- Kullanıcı hesabı silinmiş ama session hala aktif
- Session cookie'si bozulmuş

## ✅ Çözüm Adımları

### 1. Logout Yapın
1. Sağ üst köşedeki profil menüsüne tıklayın
2. "Logout" butonuna tıklayın
3. Login sayfasına yönlendirileceksiniz

### 2. Tekrar Login Yapın
1. Email ve şifrenizi girin
2. "Sign In" butonuna tıklayın
3. Dashboard'a yönlendirileceksiniz

### 3. Wallet Adresinizi Ekleyin
1. Sol menüden "Wallet" sayfasına gidin
2. BEP-20 wallet adresinizi girin
3. "Save Wallet Address" butonuna tıklayın
4. ✅ Başarılı! Wallet adresiniz kaydedildi

## 🔧 Alternatif Çözüm: Browser Cache Temizleme

Eğer logout/login çalışmazsa:

### Chrome/Edge:
1. `Ctrl + Shift + Delete` tuşlarına basın
2. "Cookies and other site data" seçeneğini işaretleyin
3. "Clear data" butonuna tıklayın
4. Sayfayı yenileyin (`F5`)

### Firefox:
1. `Ctrl + Shift + Delete` tuşlarına basın
2. "Cookies" seçeneğini işaretleyin
3. "Clear Now" butonuna tıklayın
4. Sayfayı yenileyin (`F5`)

## 🧪 Test Kullanıcıları

Eğer yeni bir hesap oluşturmak istemiyorsanız, test kullanıcılarından birini kullanabilirsiniz:

```
Email: cryptoking@example.com
Password: password123

Email: tokenhunter@example.com
Password: password123

Email: airdropmaster@example.com
Password: password123
```

## 📝 Geliştirici Notları

### Hata Detayları
```
Error: PrismaClientKnownRequestError
Code: P2025
Message: Record to update not found
```

Bu hata, `prisma.user.update()` çağrısında belirtilen user ID'nin veritabanında bulunamaması durumunda oluşur.

### Çözüm
Wallet route'una eklenen kontrol:
```typescript
// First verify user exists
const currentUser = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { 
    id: true, 
    walletAddress: true, 
    walletVerified: true,
    email: true,
    username: true,
  },
});

if (!currentUser) {
  return NextResponse.json(
    {
      error: "User Not Found",
      message: "Your session is invalid. Please logout and login again.",
    },
    { status: 401 }
  );
}
```

Bu kontrol sayesinde kullanıcı daha açıklayıcı bir hata mesajı alır ve ne yapması gerektiğini bilir.

## 🚀 Önleme

Bu hatayı önlemek için:
1. Veritabanını sıfırladıktan sonra her zaman logout yapın
2. Geliştirme sırasında farklı tarayıcı profilleri kullanın
3. Session timeout süresini ayarlayın (şu anda 7 gün)

## ✅ Düzeltme Tamamlandı

Artık wallet güncelleme hatası daha iyi yönetiliyor:
- ✅ Kullanıcı varlığı kontrol ediliyor
- ✅ Açıklayıcı hata mesajı gösteriliyor
- ✅ Kullanıcıya ne yapması gerektiği söyleniyor
- ✅ Session geçersizse 401 hatası dönüyor

**Şimdi tekrar deneyin!** 🎉
