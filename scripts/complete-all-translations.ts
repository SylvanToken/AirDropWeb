import * as fs from 'fs';
import * as path from 'path';

const localesDir = path.join(process.cwd(), 'locales');

// Translation mappings for all missing translations
const translations: Record<string, Record<string, any>> = {
  // Profile.json translations
  'profile.socialMedia.twitter.title': {
    ru: 'Twitter',
    ar: 'تويتر',
    zh: 'Twitter',
    ko: 'Twitter',
    es: 'Twitter'
  },
  'profile.socialMedia.twitter.placeholder': {
    ru: '@имяпользователя',
    ar: '@اسم_المستخدم',
    zh: '@用户名',
    ko: '@사용자이름',
    es: '@nombreusuario'
  },
  'profile.socialMedia.twitter.verify': {
    ru: 'Верифицировать Twitter',
    ar: 'التحقق من تويتر',
    zh: '验证 Twitter',
    ko: 'Twitter 인증',
    es: 'Verificar Twitter'
  },
  'profile.socialMedia.twitter.verified': {
    ru: 'Верифицирован',
    ar: 'تم التحقق',
    zh: '已验证',
    ko: '인증됨',
    es: 'Verificado'
  },
  'profile.socialMedia.twitter.notSet': {
    ru: 'Не установлено',
    ar: 'غير محدد',
    zh: '未设置',
    ko: '설정되지 않음',
    es: 'No Configurado'
  },
  'profile.socialMedia.telegram.title': {
    ru: 'Telegram',
    ar: 'تيليجرام',
    zh: 'Telegram',
    ko: 'Telegram',
    es: 'Telegram'
  },
  'profile.socialMedia.telegram.placeholder': {
    ru: '@имяпользователя',
    ar: '@اسم_المستخدم',
    zh: '@用户名',
    ko: '@사용자이름',
    es: '@nombreusuario'
  },
  'profile.socialMedia.telegram.verify': {
    ru: 'Верифицировать Telegram',
    ar: 'التحقق من تيليجرام',
    zh: '验证 Telegram',
    ko: 'Telegram 인증',
    es: 'Verificar Telegram'
  },
  'profile.socialMedia.telegram.verified': {
    ru: 'Верифицирован',
    ar: 'تم التحقق',
    zh: '已验证',
    ko: '인증됨',
    es: 'Verificado'
  },
  'profile.socialMedia.telegram.notSet': {
    ru: 'Не установлено',
    ar: 'غير محدد',
    zh: '未设置',
    ko: '설정되지 않음',
    es: 'No Configurado'
  },
  'profile.socialMedia.title': {
    ru: 'Аккаунты социальных сетей',
    ar: 'حسابات وسائل التواصل الاجتماعي',
    zh: '社交媒体账户',
    ko: '소셜 미디어 계정',
    es: 'Cuentas de Redes Sociales'
  },
  'profile.socialMedia.description': {
    ru: 'Подключите свои аккаунты в социальных сетях для выполнения задач',
    ar: 'اربط حسابات وسائل التواصل الاجتماعي الخاصة بك لإكمال المهام',
    zh: '连接您的社交媒体账户以完成任务',
    ko: '과제를 완료하려면 소셜 미디어 계정을 연결하세요',
    es: 'Conecta tus cuentas de redes sociales para completar tareas'
  },
  'profile.referral.title': {
    ru: 'Ваш реферальный код',
    ar: 'رمز الإحالة الخاص بك',
    zh: '您的推荐代码',
    ko: '내 추천 코드',
    es: 'Tu Código de Referido'
  },
  'profile.referral.description': {
    ru: 'Поделитесь своим кодом с друзьями',
    ar: 'شارك رمزك مع الأصدقاء',
    zh: '与朋友分享您的代码',
    ko: '친구들과 코드를 공유하세요',
    es: 'Comparte tu código con amigos'
  },
  'profile.referral.copyButton': {
    ru: 'Скопировать код',
    ar: 'نسخ الرمز',
    zh: '复制代码',
    ko: '코드 복사',
    es: 'Copiar Código'
  },
  'profile.referral.copied': {
    ru: 'Скопировано!',
    ar: 'تم النسخ!',
    zh: '已复制！',
    ko: '복사됨!',
    es: '¡Copiado!'
  },
  'profile.referral.notGenerated': {
    ru: 'Реферальный код еще не сгенерирован',
    ar: 'لم يتم إنشاء رمز الإحالة بعد',
    zh: '推荐代码尚未生成',
    ko: '추천 코드가 아직 생성되지 않았습니다',
    es: 'Código de referido aún no generado'
  }
};

function setNestedValue(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Update profile.json files
const languages = ['ru', 'ar', 'zh', 'ko', 'es'];

for (const lang of languages) {
  const filePath = path.join(localesDir, lang, 'profile.json');
  
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    let updated = false;
    for (const [key, langTranslations] of Object.entries(translations)) {
      if (key.startsWith('profile.')) {
        const actualKey = key.replace('profile.', '');
        const translation = (langTranslations as any)[lang];
        
        if (translation) {
          setNestedValue(content, actualKey, translation);
          updated = true;
        }
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
      console.log(`✅ Updated ${lang}/profile.json`);
    }
  }
}

console.log('\n✅ All profile.json translations completed!');
