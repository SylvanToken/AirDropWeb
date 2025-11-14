/**
 * Task Test Fixtures
 * Predefined task data for consistent testing
 */

export const testTasks = {
  twitterFollow: {
    title: 'Follow on Twitter',
    description: 'Follow @SylvanToken on Twitter',
    titleTr: 'Twitter\'da Takip Et',
    descriptionTr: '@SylvanToken\'ı Twitter\'da takip edin',
    titleDe: 'Auf Twitter folgen',
    descriptionDe: 'Folgen Sie @SylvanToken auf Twitter',
    titleZh: '在Twitter上关注',
    descriptionZh: '在Twitter上关注@SylvanToken',
    titleRu: 'Подписаться в Twitter',
    descriptionRu: 'Подпишитесь на @SylvanToken в Twitter',
    points: 10,
    taskType: 'TWITTER_FOLLOW',
    taskUrl: 'https://twitter.com/SylvanToken',
    isActive: true,
  },
  
  twitterLike: {
    title: 'Like Tweet',
    description: 'Like our announcement tweet',
    titleTr: 'Tweet\'i Beğen',
    descriptionTr: 'Duyuru tweetimizi beğenin',
    titleDe: 'Tweet liken',
    descriptionDe: 'Liken Sie unseren Ankündigungs-Tweet',
    titleZh: '点赞推文',
    descriptionZh: '点赞我们的公告推文',
    titleRu: 'Лайкнуть твит',
    descriptionRu: 'Поставьте лайк нашему твиту с объявлением',
    points: 5,
    taskType: 'TWITTER_LIKE',
    taskUrl: 'https://twitter.com/SylvanToken/status/123456',
    isActive: true,
  },
  
  twitterRetweet: {
    title: 'Retweet',
    description: 'Retweet our announcement',
    titleTr: 'Retweetle',
    descriptionTr: 'Duyurumuzu retweetleyin',
    titleDe: 'Retweeten',
    descriptionDe: 'Retweeten Sie unsere Ankündigung',
    titleZh: '转发',
    descriptionZh: '转发我们的公告',
    titleRu: 'Ретвитнуть',
    descriptionRu: 'Сделайте ретвит нашего объявления',
    points: 8,
    taskType: 'TWITTER_RETWEET',
    taskUrl: 'https://twitter.com/SylvanToken/status/123456',
    isActive: true,
  },
  
  telegramJoin: {
    title: 'Join Telegram',
    description: 'Join our Telegram group',
    titleTr: 'Telegram\'a Katıl',
    descriptionTr: 'Telegram grubumuza katılın',
    titleDe: 'Telegram beitreten',
    descriptionDe: 'Treten Sie unserer Telegram-Gruppe bei',
    titleZh: '加入Telegram',
    descriptionZh: '加入我们的Telegram群组',
    titleRu: 'Присоединиться к Telegram',
    descriptionRu: 'Присоединяйтесь к нашей группе в Telegram',
    points: 15,
    taskType: 'TELEGRAM_JOIN',
    taskUrl: 'https://t.me/sylvantoken',
    isActive: true,
  },
  
  customTask: {
    title: 'Custom Task',
    description: 'Complete custom action',
    titleTr: 'Özel Görev',
    descriptionTr: 'Özel eylemi tamamlayın',
    titleDe: 'Benutzerdefinierte Aufgabe',
    descriptionDe: 'Benutzerdefinierte Aktion abschließen',
    titleZh: '自定义任务',
    descriptionZh: '完成自定义操作',
    titleRu: 'Пользовательская задача',
    descriptionRu: 'Выполните пользовательское действие',
    points: 20,
    taskType: 'CUSTOM',
    taskUrl: 'https://sylvantoken.org/custom',
    isActive: true,
  },
  
  highPointsTask: {
    title: 'High Value Task',
    description: 'Complete this for many points',
    points: 50,
    taskType: 'CUSTOM',
    taskUrl: 'https://sylvantoken.org/high-value',
    isActive: true,
  },
  
  lowPointsTask: {
    title: 'Low Value Task',
    description: 'Quick and easy task',
    points: 2,
    taskType: 'TWITTER_LIKE',
    taskUrl: 'https://twitter.com/SylvanToken/status/123',
    isActive: true,
  },
  
  inactiveTask: {
    title: 'Inactive Task',
    description: 'This task is not active',
    points: 10,
    taskType: 'TWITTER_FOLLOW',
    taskUrl: 'https://twitter.com/SylvanToken',
    isActive: false,
  },
}

export const invalidTasks = {
  missingTitle: {
    description: 'Task without title',
    points: 10,
    taskType: 'TWITTER_FOLLOW',
  },
  
  missingDescription: {
    title: 'Task without description',
    points: 10,
    taskType: 'TWITTER_FOLLOW',
  },
  
  negativePoints: {
    title: 'Negative Points',
    description: 'Task with negative points',
    points: -10,
    taskType: 'TWITTER_FOLLOW',
  },
  
  zeroPoints: {
    title: 'Zero Points',
    description: 'Task with zero points',
    points: 0,
    taskType: 'TWITTER_FOLLOW',
  },
  
  invalidTaskType: {
    title: 'Invalid Type',
    description: 'Task with invalid type',
    points: 10,
    taskType: 'INVALID_TYPE',
  },
  
  missingTaskType: {
    title: 'Missing Type',
    description: 'Task without type',
    points: 10,
  },
}

export const taskTypes = [
  'TWITTER_FOLLOW',
  'TWITTER_LIKE',
  'TWITTER_RETWEET',
  'TELEGRAM_JOIN',
  'CUSTOM',
]

export const taskUrls = {
  twitter: {
    profile: 'https://twitter.com/SylvanToken',
    tweet: 'https://twitter.com/SylvanToken/status/123456789',
  },
  telegram: {
    group: 'https://t.me/sylvantoken',
    channel: 'https://t.me/sylvantoken_announcements',
  },
  custom: {
    website: 'https://sylvantoken.org',
    form: 'https://sylvantoken.org/form',
  },
}
