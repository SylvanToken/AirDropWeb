# Telegram Entegrasyonu Dokümantasyonu

## Genel Bakış

Bu doküman, Sylvan Token platformunun Telegram entegrasyonunu açıklar. Telegram kanal ID'si ve ilgili yapılandırmalar burada detaylandırılmıştır.

---

## Telegram Kanal Bilgileri

### Resmi Kanal ID
```
-1002857056222
```

**Format Açıklaması:**
- Telegram kanal ID'leri `-100` ile başlar
- Ardından benzersiz sayısal ID gelir
- Negatif sayı formatı, kanallar ve gruplar için kullanılır

---

## Yapılandırma

### Environment Variables

`.env` dosyanıza aşağıdaki değişkenleri ekleyin:

```env
# Telegram Configuration
TELEGRAM_CHANNEL_ID="-1002857056222"
TELEGRAM_INVITE_LINK="https://t.me/your_channel"

# Optional: Bot Configuration
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_BOT_USERNAME="your_bot_username"

# Verification Settings
TELEGRAM_VERIFICATION_ENABLED="true"
TELEGRAM_REQUIRE_MEMBERSHIP="true"
TELEGRAM_AUTO_VERIFY="false"
```

---

## Kullanım

### 1. Temel Kullanım

```typescript
import { TelegramConfig } from '@/lib/telegram-config';

// Kanal ID'sini al
const channelId = TelegramConfig.channelId;
console.log('Telegram Channel ID:', channelId);
// Output: -1002857056222

// Kanal URL'ini al
const channelUrl = TelegramConfig.channelUrl;
console.log('Channel URL:', channelUrl);
// Output: https://t.me/c/2857056222

// Yapılandırma durumunu kontrol et
if (TelegramConfig.isConfigured) {
  console.log('Telegram is properly configured');
}
```

### 2. Doğrulama Kontrolü

```typescript
import { isValidTelegramChannelId, isTelegramConfigured } from '@/lib/telegram-config';

// Kanal ID'sinin geçerliliğini kontrol et
const isValid = isValidTelegramChannelId('-1002857056222');
console.log('Is valid:', isValid); // true

// Tam yapılandırma kontrolü
const isConfigured = isTelegramConfigured();
console.log('Is configured:', isConfigured); // true
```

### 3. Yapılandırma Durumu

```typescript
import { getTelegramConfigStatus } from '@/lib/telegram-config';

const status = getTelegramConfigStatus();
console.log(status);
/*
{
  channelId: '-1002857056222',
  isValid: true,
  isConfigured: true,
  botConfigured: false,
  verificationEnabled: false
}
*/
```

---

## API Entegrasyonu

### Telegram Üyelik Doğrulama Endpoint'i

```typescript
// app/api/telegram/verify-membership/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TelegramConfig } from '@/lib/telegram-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { telegramUsername } = await request.json();

    // Telegram Bot API kullanarak üyelik kontrolü
    // Not: Bu özellik için TELEGRAM_BOT_TOKEN gereklidir
    
    if (!TelegramConfig.botToken) {
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 500 }
      );
    }

    // Bot API ile üyelik kontrolü
    const response = await fetch(
      `https://api.telegram.org/bot${TelegramConfig.botToken}/getChatMember`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TelegramConfig.channelId,
          user_id: telegramUsername, // veya user ID
        }),
      }
    );

    const data = await response.json();

    if (data.ok && ['member', 'administrator', 'creator'].includes(data.result.status)) {
      return NextResponse.json({
        success: true,
        isMember: true,
        status: data.result.status,
      });
    }

    return NextResponse.json({
      success: true,
      isMember: false,
    });
  } catch (error) {
    console.error('Telegram verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
```

---

## Frontend Kullanımı

### Telegram Katılım Butonu

```typescript
// components/social/TelegramJoinButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { TelegramConfig } from '@/lib/telegram-config';

export function TelegramJoinButton() {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleJoinTelegram = () => {
    // Telegram kanalını yeni sekmede aç
    window.open(TelegramConfig.inviteLink, '_blank');
  };

  const handleVerifyMembership = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/telegram/verify-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUsername: '@username', // Kullanıcıdan alınmalı
        }),
      });

      const data = await response.json();

      if (data.isMember) {
        alert('Telegram üyeliğiniz doğrulandı!');
      } else {
        alert('Telegram kanalına katılmanız gerekiyor.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Doğrulama başarısız oldu.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleJoinTelegram}
        className="w-full"
        variant="outline"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Telegram Kanalına Katıl
      </Button>

      <Button
        onClick={handleVerifyMembership}
        disabled={isVerifying}
        className="w-full"
      >
        {isVerifying ? 'Doğrulanıyor...' : 'Üyeliği Doğrula'}
      </Button>
    </div>
  );
}
```

---

## Telegram Bot Kurulumu (Opsiyonel)

Otomatik üyelik doğrulaması için Telegram Bot gereklidir.

### 1. Bot Oluşturma

1. Telegram'da [@BotFather](https://t.me/botfather) ile konuşun
2. `/newbot` komutunu gönderin
3. Bot adını ve kullanıcı adını belirleyin
4. Bot token'ınızı alın

### 2. Bot'u Kanala Ekleme

1. Telegram kanalınızı açın
2. Kanal ayarlarına gidin
3. "Administrators" bölümüne gidin
4. "Add Administrator" tıklayın
5. Bot'unuzu arayın ve ekleyin
6. Bot'a gerekli izinleri verin

### 3. Environment Variables Güncelleme

```env
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_BOT_USERNAME="your_bot_username"
```

---

## Güvenlik Notları

### 1. Token Güvenliği

⚠️ **ÖNEMLİ:** Bot token'ınızı asla public repository'lerde paylaşmayın!

```env
# ✅ Doğru - .env dosyasında
TELEGRAM_BOT_TOKEN="your-secret-token"

# ❌ Yanlış - Kodda hardcoded
const botToken = "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz";
```

### 2. Kanal ID Doğrulama

```typescript
import { isValidTelegramChannelId } from '@/lib/telegram-config';

// Her zaman kanal ID'sini doğrulayın
const channelId = process.env.TELEGRAM_CHANNEL_ID;

if (!isValidTelegramChannelId(channelId)) {
  throw new Error('Invalid Telegram channel ID');
}
```

### 3. Rate Limiting

Telegram Bot API rate limit'leri:
- Grup başına: 20 mesaj/dakika
- Global: 30 mesaj/saniye

```typescript
// Rate limiting implementasyonu
import rateLimit from 'express-rate-limit';

const telegramLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 20, // 20 istek
  message: 'Too many requests to Telegram API',
});
```

---

## Hata Ayıklama

### Yaygın Hatalar ve Çözümleri

#### 1. "Invalid channel ID" Hatası

**Sebep:** Kanal ID formatı yanlış

**Çözüm:**
```typescript
// Doğru format
const channelId = '-1002857056222'; // ✅

// Yanlış formatlar
const channelId = '2857056222'; // ❌ - eksi işareti eksik
const channelId = '-2857056222'; // ❌ - -100 prefix eksik
```

#### 2. "Bot not found in channel" Hatası

**Sebep:** Bot kanala admin olarak eklenmemiş

**Çözüm:**
1. Kanal ayarlarına gidin
2. Bot'u administrator olarak ekleyin
3. "Get Chat Member" iznini verin

#### 3. "Unauthorized" Hatası

**Sebep:** Bot token yanlış veya geçersiz

**Çözüm:**
1. BotFather'dan yeni token alın
2. .env dosyasını güncelleyin
3. Uygulamayı yeniden başlatın

---

## Test Etme

### Manuel Test

```bash
# Kanal ID'sini test et
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getChat \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "-1002857056222"}'

# Üyelik kontrolü test et
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getChatMember \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "-1002857056222", "user_id": <USER_ID>}'
```

### Otomatik Test

```typescript
// __tests__/telegram-config.test.ts
import { 
  isValidTelegramChannelId, 
  isTelegramConfigured,
  TelegramConfig 
} from '@/lib/telegram-config';

describe('Telegram Configuration', () => {
  it('should have valid channel ID', () => {
    expect(isValidTelegramChannelId(TelegramConfig.channelId)).toBe(true);
  });

  it('should be properly configured', () => {
    expect(isTelegramConfigured()).toBe(true);
  });

  it('should have correct channel ID format', () => {
    expect(TelegramConfig.channelId).toMatch(/^-100\d+$/);
  });
});
```

---

## Referanslar

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Channel IDs](https://core.telegram.org/api/obtaining_api_id)
- [BotFather Guide](https://core.telegram.org/bots#6-botfather)

---

## Destek

Telegram entegrasyonu ile ilgili sorunlar için:
- Email: support@sylvantoken.org
- Telegram: @sylvantoken_support

---

**Son Güncelleme:** 12 Kasım 2025  
**Versiyon:** 1.0.0  
**Kanal ID:** -1002857056222
