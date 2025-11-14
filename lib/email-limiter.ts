/**
 * Email Rate Limiter
 * Gmail SMTP limitlerini aşmamak için email gönderimini kısıtlar
 */

interface EmailLimit {
  count: number;
  resetAt: Date;
}

// In-memory rate limiting (production'da Redis kullan)
const emailLimits = new Map<string, EmailLimit>();

// Kısıtlama ayarları
const LIMITS = {
  // Kullanıcı başına limitler
  perUser: {
    perHour: 5,        // Kullanıcı başına saatte 5 email
    perDay: 20,        // Kullanıcı başına günde 20 email
  },
  // Email tipi başına limitler
  perType: {
    welcome: {
      perUser: 1,      // Hoşgeldin maili sadece 1 kez
      cooldown: 24 * 60 * 60 * 1000, // 24 saat
    },
    verification: {
      perUser: 3,      // Email doğrulama günde 3 kez
      cooldown: 60 * 60 * 1000, // 1 saat
    },
    passwordReset: {
      perUser: 3,      // Şifre sıfırlama günde 3 kez
      cooldown: 60 * 60 * 1000, // 1 saat
    },
    taskCompletion: {
      perUser: 50,     // Görev bildirimi günde 50
      cooldown: 5 * 60 * 1000, // 5 dakika
    },
  },
  // Global limitler
  global: {
    perMinute: 20,     // Dakikada 20 email (Gmail limiti)
    perHour: 100,      // Saatte 100 email
    perDay: 500,       // Günde 500 email (Gmail limiti)
  },
};

/**
 * Email gönderim izni kontrol et
 */
export function canSendEmail(
  userId: string,
  emailType: 'welcome' | 'verification' | 'passwordReset' | 'taskCompletion'
): { allowed: boolean; reason?: string; retryAfter?: number } {
  const now = new Date();
  
  // Kullanıcı başına limit kontrolü
  const userKey = `user:${userId}`;
  const userLimit = emailLimits.get(userKey);
  
  if (userLimit && userLimit.resetAt > now) {
    if (userLimit.count >= LIMITS.perUser.perHour) {
      return {
        allowed: false,
        reason: 'Hourly limit exceeded',
        retryAfter: Math.ceil((userLimit.resetAt.getTime() - now.getTime()) / 1000),
      };
    }
  }
  
  // Email tipi başına limit kontrolü
  const typeKey = `type:${userId}:${emailType}`;
  const typeLimit = emailLimits.get(typeKey);
  const typeLimitConfig = LIMITS.perType[emailType];
  
  if (typeLimit && typeLimit.resetAt > now) {
    if (typeLimit.count >= typeLimitConfig.perUser) {
      return {
        allowed: false,
        reason: `${emailType} limit exceeded`,
        retryAfter: Math.ceil((typeLimit.resetAt.getTime() - now.getTime()) / 1000),
      };
    }
  }
  
  // Global limit kontrolü
  const globalKey = 'global:minute';
  const globalLimit = emailLimits.get(globalKey);
  
  if (globalLimit && globalLimit.resetAt > now) {
    if (globalLimit.count >= LIMITS.global.perMinute) {
      return {
        allowed: false,
        reason: 'Global rate limit exceeded',
        retryAfter: Math.ceil((globalLimit.resetAt.getTime() - now.getTime()) / 1000),
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Email gönderimini kaydet
 */
export function recordEmailSent(
  userId: string,
  emailType: 'welcome' | 'verification' | 'passwordReset' | 'taskCompletion'
) {
  const now = new Date();
  
  // Kullanıcı başına sayacı güncelle
  const userKey = `user:${userId}`;
  const userLimit = emailLimits.get(userKey);
  
  if (!userLimit || userLimit.resetAt <= now) {
    emailLimits.set(userKey, {
      count: 1,
      resetAt: new Date(now.getTime() + 60 * 60 * 1000), // 1 saat
    });
  } else {
    userLimit.count++;
  }
  
  // Email tipi başına sayacı güncelle
  const typeKey = `type:${userId}:${emailType}`;
  const typeLimit = emailLimits.get(typeKey);
  const typeLimitConfig = LIMITS.perType[emailType];
  
  if (!typeLimit || typeLimit.resetAt <= now) {
    emailLimits.set(typeKey, {
      count: 1,
      resetAt: new Date(now.getTime() + typeLimitConfig.cooldown),
    });
  } else {
    typeLimit.count++;
  }
  
  // Global sayacı güncelle
  const globalKey = 'global:minute';
  const globalLimit = emailLimits.get(globalKey);
  
  if (!globalLimit || globalLimit.resetAt <= now) {
    emailLimits.set(globalKey, {
      count: 1,
      resetAt: new Date(now.getTime() + 60 * 1000), // 1 dakika
    });
  } else {
    globalLimit.count++;
  }
}

/**
 * Kullanıcının email istatistiklerini getir
 */
export function getEmailStats(userId: string) {
  const now = new Date();
  const userKey = `user:${userId}`;
  const userLimit = emailLimits.get(userKey);
  
  const stats = {
    hourly: {
      sent: 0,
      limit: LIMITS.perUser.perHour,
      remaining: LIMITS.perUser.perHour,
      resetAt: null as Date | null,
    },
    types: {} as Record<string, { sent: number; limit: number; remaining: number }>,
  };
  
  if (userLimit && userLimit.resetAt > now) {
    stats.hourly.sent = userLimit.count;
    stats.hourly.remaining = LIMITS.perUser.perHour - userLimit.count;
    stats.hourly.resetAt = userLimit.resetAt;
  }
  
  // Her email tipi için istatistik
  Object.keys(LIMITS.perType).forEach((type) => {
    const typeKey = `type:${userId}:${type}`;
    const typeLimit = emailLimits.get(typeKey);
    const typeLimitConfig = LIMITS.perType[type as keyof typeof LIMITS.perType];
    
    if (typeLimit && typeLimit.resetAt > now) {
      stats.types[type] = {
        sent: typeLimit.count,
        limit: typeLimitConfig.perUser,
        remaining: typeLimitConfig.perUser - typeLimit.count,
      };
    } else {
      stats.types[type] = {
        sent: 0,
        limit: typeLimitConfig.perUser,
        remaining: typeLimitConfig.perUser,
      };
    }
  });
  
  return stats;
}

/**
 * Tüm limitleri sıfırla (test için)
 */
export function resetAllLimits() {
  emailLimits.clear();
}

/**
 * Global email istatistikleri
 */
export function getGlobalStats() {
  const now = new Date();
  const globalKey = 'global:minute';
  const globalLimit = emailLimits.get(globalKey);
  
  return {
    perMinute: {
      sent: globalLimit && globalLimit.resetAt > now ? globalLimit.count : 0,
      limit: LIMITS.global.perMinute,
      remaining: LIMITS.global.perMinute - (globalLimit && globalLimit.resetAt > now ? globalLimit.count : 0),
    },
    limits: LIMITS,
  };
}
