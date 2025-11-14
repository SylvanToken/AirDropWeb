// Auto-translation utility for tasks and campaigns
// This provides basic translations for common terms and phrases

interface TranslationMap {
  [key: string]: {
    tr: string;
    de: string;
    zh: string;
    ru: string;
  };
}

// Common task-related translations
const commonTranslations: TranslationMap = {
  // Actions
  "Follow": { tr: "Takip Et", de: "Folgen", zh: "关注", ru: "Подписаться" },
  "Like": { tr: "Beğen", de: "Liken", zh: "点赞", ru: "Лайк" },
  "Retweet": { tr: "Retweetle", de: "Retweeten", zh: "转发", ru: "Ретвит" },
  "Join": { tr: "Katıl", de: "Beitreten", zh: "加入", ru: "Присоединиться" },
  "Share": { tr: "Paylaş", de: "Teilen", zh: "分享", ru: "Поделиться" },
  "Complete": { tr: "Tamamla", de: "Abschließen", zh: "完成", ru: "Завершить" },
  
  // Social media
  "Twitter": { tr: "Twitter", de: "Twitter", zh: "推特", ru: "Твиттер" },
  "Telegram": { tr: "Telegram", de: "Telegram", zh: "电报", ru: "Телеграм" },
  "Discord": { tr: "Discord", de: "Discord", zh: "Discord", ru: "Дискорд" },
  
  // Common phrases
  "Follow us on": { tr: "Bizi takip edin", de: "Folgen Sie uns auf", zh: "在以下平台关注我们", ru: "Подпишитесь на нас в" },
  "Join our": { tr: "Katılın", de: "Treten Sie bei", zh: "加入我们的", ru: "Присоединяйтесь к нашему" },
  "Like our post": { tr: "Gönderimizi beğenin", de: "Liken Sie unseren Beitrag", zh: "点赞我们的帖子", ru: "Лайкните наш пост" },
  "Retweet our post": { tr: "Gönderimizi retweetleyin", de: "Retweeten Sie unseren Beitrag", zh: "转发我们的帖子", ru: "Сделайте ретвит нашего поста" },
  "channel": { tr: "kanalı", de: "Kanal", zh: "频道", ru: "канал" },
  "group": { tr: "grubu", de: "Gruppe", zh: "群组", ru: "группу" },
  "account": { tr: "hesabı", de: "Konto", zh: "账户", ru: "аккаунт" },
  "page": { tr: "sayfası", de: "Seite", zh: "页面", ru: "страницу" },
  
  // Task descriptions
  "Follow our official": { tr: "Resmi hesabımızı takip edin", de: "Folgen Sie unserem offiziellen", zh: "关注我们的官方", ru: "Подпишитесь на наш официальный" },
  "Join our official": { tr: "Resmi kanalımıza katılın", de: "Treten Sie unserem offiziellen bei", zh: "加入我们的官方", ru: "Присоединяйтесь к нашему официальному" },
  "Like and retweet": { tr: "Beğenin ve retweetleyin", de: "Liken und retweeten", zh: "点赞并转发", ru: "Лайкните и сделайте ретвит" },
  "Complete the task": { tr: "Görevi tamamlayın", de: "Schließen Sie die Aufgabe ab", zh: "完成任务", ru: "Выполните задание" },
  "Earn points": { tr: "Puan kazanın", de: "Punkte verdienen", zh: "赚取积分", ru: "Заработайте баллы" },
  "Daily task": { tr: "Günlük görev", de: "Tägliche Aufgabe", zh: "每日任务", ru: "Ежедневное задание" },
  "Special task": { tr: "Özel görev", de: "Spezielle Aufgabe", zh: "特殊任务", ru: "Специальное задание" },
};

/**
 * Auto-translate text using common translations
 * This is a simple keyword-based translation system
 */
export function autoTranslate(text: string, targetLang: 'tr' | 'de' | 'zh' | 'ru'): string {
  let translated = text;
  
  // Try to find and replace common phrases
  for (const [english, translations] of Object.entries(commonTranslations)) {
    const regex = new RegExp(english, 'gi');
    if (regex.test(translated)) {
      translated = translated.replace(regex, translations[targetLang]);
    }
  }
  
  return translated;
}

/**
 * Generate translations for a task
 */
export function generateTaskTranslations(title: string, description: string) {
  return {
    titleTr: autoTranslate(title, 'tr'),
    descriptionTr: autoTranslate(description, 'tr'),
    titleDe: autoTranslate(title, 'de'),
    descriptionDe: autoTranslate(description, 'de'),
    titleZh: autoTranslate(title, 'zh'),
    descriptionZh: autoTranslate(description, 'zh'),
    titleRu: autoTranslate(title, 'ru'),
    descriptionRu: autoTranslate(description, 'ru'),
  };
}

/**
 * Generate translations for a campaign
 */
export function generateCampaignTranslations(title: string, description: string) {
  return generateTaskTranslations(title, description);
}

/**
 * Get localized task content based on locale
 */
export function getLocalizedTask(task: any, locale: string) {
  const localeMap: { [key: string]: string } = {
    'en': '',
    'tr': 'Tr',
    'de': 'De',
    'zh': 'Zh',
    'ru': 'Ru',
  };
  
  const suffix = localeMap[locale] || '';
  
  return {
    ...task,
    title: suffix ? (task[`title${suffix}`] || task.title) : task.title,
    description: suffix ? (task[`description${suffix}`] || task.description) : task.description,
  };
}

/**
 * Get localized campaign content based on locale
 */
export function getLocalizedCampaign(campaign: any, locale: string) {
  return getLocalizedTask(campaign, locale);
}
