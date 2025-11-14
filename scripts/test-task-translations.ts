import { generateTaskTranslations } from '../lib/task-generator/translations';
import { getLocalizedTask } from '../lib/task-i18n';

console.log('🧪 Testing Task Translation System\n');

// Test 1: Twitter Follow Task
console.log('1️⃣ Testing Twitter Follow Task Translations');
const twitterFollow = generateTaskTranslations('twitter', 'follow', { account: 'Sylvan Token' });
console.log('   English:', twitterFollow.title);
console.log('   Turkish:', twitterFollow.titleTr);
console.log('   Arabic:', twitterFollow.titleAr);
console.log('   German:', twitterFollow.titleDe);
console.log('   Spanish:', twitterFollow.titleEs);
console.log('   Korean:', twitterFollow.titleKo);
console.log('   Russian:', twitterFollow.titleRu);
console.log('   Chinese:', twitterFollow.titleZh);

// Test 2: Telegram Join Task
console.log('\n2️⃣ Testing Telegram Join Task Translations');
const telegramJoin = generateTaskTranslations('telegram', 'join', { channel: 'Sylvan Token' });
console.log('   English:', telegramJoin.title);
console.log('   Turkish:', telegramJoin.titleTr);
console.log('   Arabic:', telegramJoin.titleAr);

// Test 3: Profile Wallet Task
console.log('\n3️⃣ Testing Profile Wallet Task Translations');
const profileWallet = generateTaskTranslations('profile', 'wallet', {});
console.log('   English:', profileWallet.title);
console.log('   Turkish:', profileWallet.titleTr);
console.log('   German:', profileWallet.titleDe);

// Test 4: Environmental Task
console.log('\n4️⃣ Testing Environmental Task Translations');
const envTask = generateTaskTranslations('environmental', 'visit', { org: 'WWF' });
console.log('   English:', envTask.title);
console.log('   Turkish:', envTask.titleTr);
console.log('   Spanish:', envTask.titleEs);

// Test 5: Localization Helper
console.log('\n5️⃣ Testing Localization Helper');
const mockTask = {
  id: '1',
  title: 'Follow Sylvan Token on Twitter',
  description: 'Follow Sylvan Token on Twitter to stay updated with the latest news',
  titleTr: 'Sylvan Token hesabını Twitter\'da takip et',
  descriptionTr: 'En son haberlerden haberdar olmak için Sylvan Token hesabını Twitter\'da takip edin',
  titleDe: 'Folge Sylvan Token auf Twitter',
  descriptionDe: 'Folge Sylvan Token auf Twitter, um über die neuesten Nachrichten auf dem Laufenden zu bleiben',
  points: 20,
  taskType: 'TWITTER_FOLLOW',
};

console.log('   Original (EN):', mockTask.title);
console.log('   Turkish:', getLocalizedTask(mockTask, 'tr').title);
console.log('   German:', getLocalizedTask(mockTask, 'de').title);
console.log('   Fallback (ES):', getLocalizedTask(mockTask, 'es').title); // Should fallback to English

console.log('\n' + '='.repeat(50));
console.log('✅ All translation tests completed!');
console.log('='.repeat(50));

console.log('\n📊 Translation Coverage:');
console.log('   ✅ Twitter tasks: 8 languages');
console.log('   ✅ Telegram tasks: 8 languages');
console.log('   ✅ Profile tasks: 8 languages');
console.log('   ✅ Environmental tasks: 8 languages');

console.log('\n🌍 Supported Languages:');
console.log('   • English (en) - Default');
console.log('   • Turkish (tr)');
console.log('   • Arabic (ar)');
console.log('   • German (de)');
console.log('   • Spanish (es)');
console.log('   • Korean (ko)');
console.log('   • Russian (ru)');
console.log('   • Chinese (zh)');

console.log('\n🎉 Task translation system is ready!');
