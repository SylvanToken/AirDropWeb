# Basit Test Deployment - Özel Key ile Erişim

## Mevcut Durum
```
✅ https://airdrop.sylvantoken.org/ → Geri sayaç (çalışıyor)
✅ Vercel'de kayıtlı
✅ Hiçbir şeyi bozmadan test yapmak istiyorsunuz
```

---

## Çözüm: Özel Query Parameter ile Erişim

### Nasıl Çalışacak:
```
Normal kullanıcılar:
https://airdrop.sylvantoken.org/
→ Geri sayaç görür

Özel key ile siz:
https://airdrop.sylvantoken.org/?access=YOUR_SECRET_KEY
→ Next.js uygulamasını görür
```

---

## Adım 1: Middleware Ekle

Projenize `middleware.ts` dosyası oluşturun (root'ta):

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Özel erişim anahtarınız (güvenli bir key kullanın)
const SECRET_ACCESS_KEY = process.env.TEST_ACCESS_KEY || 'sylvan-test-2024-secret'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // Root path kontrolü
  if (pathname === '/') {
    const accessKey = searchParams.get('access')
    
    // Özel key varsa ve doğruysa, cookie set et ve dashboard'a yönlendir
    if (accessKey === SECRET_ACCESS_KEY) {
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      // Cookie ile erişimi kaydet (7 gün)
      response.cookies.set('test_access', 'granted', {
        maxAge: 60 * 60 * 24 * 7, // 7 gün
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      return response
    }
    
    // Cookie'de erişim varsa, dashboard'a yönlendir
    const hasAccess = request.cookies.get('test_access')?.value === 'granted'
    if (hasAccess) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Erişim yoksa, geri sayaç sayfasına yönlendir
    return NextResponse.rewrite(new URL('/countdown.html', request.url))
  }
  
  // Diğer sayfalar için cookie kontrolü
  if (pathname !== '/countdown.html') {
    const hasAccess = request.cookies.get('test_access')?.value === 'granted'
    if (!hasAccess) {
      // Erişim yoksa ana sayfaya yönlendir
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico|countdown.html).*)',
  ],
}
```

---

## Adım 2: Geri Sayaç HTML'i Ekle

`public/countdown.html` dosyası oluşturun:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sylvan Token - Coming Soon</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 800px;
        }
        
        .logo {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .countdown {
            display: flex;
            gap: 2rem;
            justify-content: center;
            margin: 3rem 0;
            flex-wrap: wrap;
        }
        
        .time-box {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 15px;
            min-width: 120px;
            border: 2px solid rgba(255,255,255,0.2);
        }
        
        .time-box .number {
            font-size: 3rem;
            font-weight: bold;
            display: block;
            color: #a8e063;
        }
        
        .time-box .label {
            font-size: 0.9rem;
            text-transform: uppercase;
            opacity: 0.8;
            margin-top: 0.5rem;
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }
            .countdown {
                gap: 1rem;
            }
            .time-box {
                min-width: 80px;
                padding: 1rem;
            }
            .time-box .number {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🌿</div>
        <h1>Sylvan Token</h1>
        <p class="subtitle">Something amazing is coming...</p>
        
        <div class="countdown">
            <div class="time-box">
                <span class="number" id="days">00</span>
                <span class="label">Days</span>
            </div>
            <div class="time-box">
                <span class="number" id="hours">00</span>
                <span class="label">Hours</span>
            </div>
            <div class="time-box">
                <span class="number" id="minutes">00</span>
                <span class="label">Minutes</span>
            </div>
            <div class="time-box">
                <span class="number" id="seconds">00</span>
                <span class="label">Seconds</span>
            </div>
        </div>
        
        <p class="subtitle">Stay tuned for updates!</p>
    </div>

    <script>
        // Hedef tarih (30 gün sonra)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 30);

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                document.querySelector('.countdown').innerHTML = '<h2 style="color: #a8e063;">We are live!</h2>';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    </script>
</body>
</html>
```

---

## Adım 3: Environment Variable Ekle

Vercel Dashboard → Settings → Environment Variables

```
TEST_ACCESS_KEY=sylvan-test-2024-your-secret-key
```

---

## Adım 4: GitHub'a Push

```bash
# Yeni dosyaları ekle
git add middleware.ts
git add public/countdown.html
git commit -m "Add test access with secret key"
git push origin main
```

Vercel otomatik olarak deploy edecek!

---

## Kullanım

### Normal Kullanıcılar:
```
https://airdrop.sylvantoken.org/
→ Geri sayaç görür
```

### Siz (Test için):
```
1. İlk erişim:
https://airdrop.sylvantoken.org/?access=sylvan-test-2024-your-secret-key

2. Cookie set edilir ve dashboard'a yönlendirilirsiniz

3. Sonraki 7 gün boyunca direkt erişebilirsiniz:
https://airdrop.sylvantoken.org/
→ Otomatik dashboard'a gider
```

### Cookie Temizleme (Geri sayaç görmek için):
```
Tarayıcı Developer Tools → Application → Cookies → test_access → Delete
```

---

## Alternatif: Daha Basit Çözüm (Sadece URL ile)

Eğer middleware istemiyorsanız, sadece Next.js sayfasında kontrol:

### app/page.tsx Güncelle:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessKey = searchParams.get('access');
    const storedAccess = localStorage.getItem('test_access');
    
    if (accessKey === 'sylvan-test-2024-secret') {
      localStorage.setItem('test_access', 'granted');
      setHasAccess(true);
    } else if (storedAccess === 'granted') {
      setHasAccess(true);
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    // Geri sayaç göster
    return (
      <div dangerouslySetInnerHTML={{ __html: countdownHTML }} />
    );
  }

  // Normal Next.js uygulaması
  return (
    <div>
      {/* Mevcut ana sayfa içeriği */}
    </div>
  );
}

const countdownHTML = `
  <!-- Yukarıdaki countdown.html içeriği buraya -->
`;
```

---

## Özet

### Yapılacaklar:
1. ✅ `middleware.ts` ekle (özel key kontrolü)
2. ✅ `public/countdown.html` ekle (geri sayaç)
3. ✅ Vercel'e environment variable ekle
4. ✅ GitHub'a push et

### Sonuç:
```
Normal: https://airdrop.sylvantoken.org/
→ Geri sayaç

Test: https://airdrop.sylvantoken.org/?access=YOUR_SECRET_KEY
→ Next.js uygulaması
```

### Avantajlar:
- ✅ Mevcut site bozulmaz
- ✅ Vercel ayarları değişmez
- ✅ Tek repo, tek deployment
- ✅ Özel key ile güvenli erişim
- ✅ Cookie ile 7 gün erişim

Hangi yöntemi tercih edersiniz? Middleware mi yoksa sayfa bazlı kontrol mü?
