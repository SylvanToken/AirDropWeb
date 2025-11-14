/**
 * Task Translation Service
 * Provides multi-language support for generated tasks
 */

export interface TaskTranslations {
  title: string;
  description: string;
  titleTr?: string;
  descriptionTr?: string;
  titleAr?: string;
  descriptionAr?: string;
  titleDe?: string;
  descriptionDe?: string;
  titleEs?: string;
  descriptionEs?: string;
  titleKo?: string;
  descriptionKo?: string;
  titleRu?: string;
  descriptionRu?: string;
  titleZh?: string;
  descriptionZh?: string;
}

// Translation templates for common task patterns
const translationTemplates = {
  // Twitter tasks
  twitter: {
    follow: {
      title: {
        en: 'Follow {account} on Twitter',
        tr: '{account} hesabını Twitter\'da takip et',
        ar: 'تابع {account} على تويتر',
        de: 'Folge {account} auf Twitter',
        es: 'Sigue a {account} en Twitter',
        ko: 'Twitter에서 {account} 팔로우',
        ru: 'Подпишитесь на {account} в Twitter',
        zh: '在 Twitter 上关注 {account}'
      },
      description: {
        en: 'Follow {account} on Twitter to stay updated with the latest news',
        tr: 'En son haberlerden haberdar olmak için {account} hesabını Twitter\'da takip edin',
        ar: 'تابع {account} على تويتر للبقاء على اطلاع بآخر الأخبار',
        de: 'Folge {account} auf Twitter, um über die neuesten Nachrichten auf dem Laufenden zu bleiben',
        es: 'Sigue a {account} en Twitter para mantenerte actualizado con las últimas noticias',
        ko: '최신 뉴스를 받아보려면 Twitter에서 {account}를 팔로우하세요',
        ru: 'Подпишитесь на {account} в Twitter, чтобы быть в курсе последних новостей',
        zh: '在 Twitter 上关注 {account} 以获取最新消息'
      }
    },
    like: {
      title: {
        en: 'Like Tweet from {account}',
        tr: '{account} hesabının tweet\'ini beğen',
        ar: 'أعجب بتغريدة من {account}',
        de: 'Like Tweet von {account}',
        es: 'Dale me gusta al tweet de {account}',
        ko: '{account}의 트윗 좋아요',
        ru: 'Поставьте лайк твиту от {account}',
        zh: '点赞 {account} 的推文'
      },
      description: {
        en: 'Show your support by liking the tweet',
        tr: 'Tweet\'i beğenerek desteğinizi gösterin',
        ar: 'أظهر دعمك بالإعجاب بالتغريدة',
        de: 'Zeige deine Unterstützung, indem du den Tweet likest',
        es: 'Muestra tu apoyo dando me gusta al tweet',
        ko: '트윗에 좋아요를 눌러 지지를 표시하세요',
        ru: 'Покажите свою поддержку, поставив лайк твиту',
        zh: '通过点赞推文表示支持'
      }
    },
    retweet: {
      title: {
        en: 'Retweet from {account}',
        tr: '{account} hesabının tweet\'ini retweetle',
        ar: 'أعد تغريد من {account}',
        de: 'Retweete von {account}',
        es: 'Retuitea de {account}',
        ko: '{account}의 리트윗',
        ru: 'Ретвитните от {account}',
        zh: '转发 {account} 的推文'
      },
      description: {
        en: 'Help spread the word by retweeting',
        tr: 'Retweetleyerek haberi yaymaya yardımcı olun',
        ar: 'ساعد في نشر الكلمة عن طريق إعادة التغريد',
        de: 'Hilf dabei, die Nachricht zu verbreiten, indem du retweetest',
        es: 'Ayuda a difundir la palabra retuiteando',
        ko: '리트윗하여 소식을 퍼뜨리는 데 도움을 주세요',
        ru: 'Помогите распространить информацию, сделав ретвит',
        zh: '通过转发帮助传播消息'
      }
    }
  },
  
  // Telegram tasks
  telegram: {
    join: {
      title: {
        en: 'Join {channel} on Telegram',
        tr: 'Telegram\'da {channel} kanalına katıl',
        ar: 'انضم إلى {channel} على تيليجرام',
        de: 'Tritt {channel} auf Telegram bei',
        es: 'Únete a {channel} en Telegram',
        ko: 'Telegram에서 {channel} 참여',
        ru: 'Присоединяйтесь к {channel} в Telegram',
        zh: '在 Telegram 上加入 {channel}'
      },
      description: {
        en: 'Join our Telegram channel to stay connected with the community',
        tr: 'Toplulukla bağlantıda kalmak için Telegram kanalımıza katılın',
        ar: 'انضم إلى قناتنا على تيليجرام للبقاء على اتصال مع المجتمع',
        de: 'Tritt unserem Telegram-Kanal bei, um mit der Community in Verbindung zu bleiben',
        es: 'Únete a nuestro canal de Telegram para mantenerte conectado con la comunidad',
        ko: '커뮤니티와 연결을 유지하려면 Telegram 채널에 참여하세요',
        ru: 'Присоединяйтесь к нашему каналу Telegram, чтобы оставаться на связи с сообществом',
        zh: '加入我们的 Telegram 频道以与社区保持联系'
      }
    }
  },
  
  // Profile tasks
  profile: {
    wallet: {
      title: {
        en: 'Connect Your Wallet',
        tr: 'Cüzdanınızı Bağlayın',
        ar: 'اربط محفظتك',
        de: 'Verbinde deine Wallet',
        es: 'Conecta tu billetera',
        ko: '지갑 연결',
        ru: 'Подключите свой кошелек',
        zh: '连接您的钱包'
      },
      description: {
        en: 'Connect your BEP-20 wallet address to receive airdrop rewards',
        tr: 'Airdrop ödüllerini almak için BEP-20 cüzdan adresinizi bağlayın',
        ar: 'اربط عنوان محفظة BEP-20 الخاصة بك لتلقي مكافآت الإيردروب',
        de: 'Verbinde deine BEP-20 Wallet-Adresse, um Airdrop-Belohnungen zu erhalten',
        es: 'Conecta tu dirección de billetera BEP-20 para recibir recompensas de airdrop',
        ko: '에어드롭 보상을 받으려면 BEP-20 지갑 주소를 연결하세요',
        ru: 'Подключите свой адрес кошелька BEP-20, чтобы получать награды за аирдроп',
        zh: '连接您的 BEP-20 钱包地址以接收空投奖励'
      }
    },
    twitter: {
      title: {
        en: 'Link Twitter Account',
        tr: 'Twitter Hesabını Bağla',
        ar: 'اربط حساب تويتر',
        de: 'Twitter-Konto verknüpfen',
        es: 'Vincular cuenta de Twitter',
        ko: 'Twitter 계정 연결',
        ru: 'Привязать аккаунт Twitter',
        zh: '关联 Twitter 账户'
      },
      description: {
        en: 'Link your Twitter account to verify social tasks',
        tr: 'Sosyal görevleri doğrulamak için Twitter hesabınızı bağlayın',
        ar: 'اربط حساب تويتر الخاص بك للتحقق من المهام الاجتماعية',
        de: 'Verknüpfe dein Twitter-Konto, um soziale Aufgaben zu verifizieren',
        es: 'Vincula tu cuenta de Twitter para verificar tareas sociales',
        ko: '소셜 작업을 확인하려면 Twitter 계정을 연결하세요',
        ru: 'Привяжите свой аккаунт Twitter для проверки социальных задач',
        zh: '关联您的 Twitter 账户以验证社交任务'
      }
    }
  },
  
  // Environmental tasks
  environmental: {
    visit: {
      title: {
        en: 'Visit {org} Website',
        tr: '{org} Web Sitesini Ziyaret Et',
        ar: 'قم بزيارة موقع {org}',
        de: 'Besuche {org} Website',
        es: 'Visita el sitio web de {org}',
        ko: '{org} 웹사이트 방문',
        ru: 'Посетите сайт {org}',
        zh: '访问 {org} 网站'
      },
      description: {
        en: 'Learn about {org} and their environmental initiatives',
        tr: '{org} ve çevresel girişimleri hakkında bilgi edinin',
        ar: 'تعرف على {org} ومبادراتهم البيئية',
        de: 'Erfahre mehr über {org} und ihre Umweltinitiativen',
        es: 'Aprende sobre {org} y sus iniciativas ambientales',
        ko: '{org}와 그들의 환경 이니셔티브에 대해 알아보세요',
        ru: 'Узнайте о {org} и их экологических инициативах',
        zh: '了解 {org} 及其环境倡议'
      }
    }
  }
};

/**
 * Replace placeholders in translation string
 */
function replacePlaceholders(text: string, replacements: Record<string, string>): string {
  let result = text;
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  return result;
}

/**
 * Generate translations for a task
 */
export function generateTaskTranslations(
  taskType: string,
  action: string,
  replacements: Record<string, string> = {}
): TaskTranslations {
  const template = translationTemplates[taskType as keyof typeof translationTemplates]?.[action as any];
  
  if (!template) {
    // Return empty translations if template not found
    return {
      title: replacePlaceholders(replacements.title || '', replacements),
      description: replacePlaceholders(replacements.description || '', replacements)
    };
  }
  
  return {
    title: replacePlaceholders(template.title.en, replacements),
    description: replacePlaceholders(template.description.en, replacements),
    titleTr: replacePlaceholders(template.title.tr, replacements),
    descriptionTr: replacePlaceholders(template.description.tr, replacements),
    titleAr: replacePlaceholders(template.title.ar, replacements),
    descriptionAr: replacePlaceholders(template.description.ar, replacements),
    titleDe: replacePlaceholders(template.title.de, replacements),
    descriptionDe: replacePlaceholders(template.description.de, replacements),
    titleEs: replacePlaceholders(template.title.es, replacements),
    descriptionEs: replacePlaceholders(template.description.es, replacements),
    titleKo: replacePlaceholders(template.title.ko, replacements),
    descriptionKo: replacePlaceholders(template.description.ko, replacements),
    titleRu: replacePlaceholders(template.title.ru, replacements),
    descriptionRu: replacePlaceholders(template.description.ru, replacements),
    titleZh: replacePlaceholders(template.title.zh, replacements),
    descriptionZh: replacePlaceholders(template.description.zh, replacements)
  };
}

/**
 * Get translation for a specific language
 */
export function getTaskTranslation(
  translations: TaskTranslations,
  locale: string
): { title: string; description: string } {
  const localeMap: Record<string, keyof TaskTranslations> = {
    en: 'title',
    tr: 'titleTr',
    ar: 'titleAr',
    de: 'titleDe',
    es: 'titleEs',
    ko: 'titleKo',
    ru: 'titleRu',
    zh: 'titleZh'
  };
  
  const titleKey = localeMap[locale] || 'title';
  const descKey = titleKey.replace('title', 'description') as keyof TaskTranslations;
  
  return {
    title: (translations[titleKey] as string) || translations.title,
    description: (translations[descKey] as string) || translations.description
  };
}

export default {
  generateTaskTranslations,
  getTaskTranslation,
  translationTemplates
};
