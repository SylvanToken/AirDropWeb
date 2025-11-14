/**
 * 20 Rastgele Görev Oluşturma Script'i
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleTasks() {
  try {
    console.log('🚀 Creating sample campaign...\n');

    // Campaign oluştur
    const campaign = await prisma.campaign.create({
      data: {
        title: 'Sylvan Token Airdrop Campaign',
        description: 'Complete tasks to earn Sylvan Tokens',
        titleTr: 'Sylvan Token Airdrop Kampanyası',
        descriptionTr: 'Görevleri tamamlayarak Sylvan Token kazan',
        titleAr: 'حملة Sylvan Token Airdrop',
        descriptionAr: 'أكمل المهام لكسب رموز Sylvan',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 gün
        isActive: true,
      },
    });

    console.log('✅ Campaign created:', campaign.id);
    console.log('📝 Creating 20 tasks...\n');

    const tasks = [
      // Twitter Follow Tasks (5)
      {
        title: 'Follow Sylvan Token on Twitter',
        description: 'Follow our official Twitter account @SylvanToken',
        titleTr: 'Sylvan Token\'ı Twitter\'da Takip Et',
        descriptionTr: 'Resmi Twitter hesabımızı takip edin @SylvanToken',
        points: 50,
        taskType: 'TWITTER_FOLLOW',
        taskUrl: 'https://twitter.com/SylvanToken',
      },
      {
        title: 'Follow Sylvan CEO on Twitter',
        description: 'Follow our CEO for exclusive insights',
        titleTr: 'CEO\'yu Twitter\'da Takip Et',
        descriptionTr: 'CEO\'muzu takip ederek özel içeriklere ulaşın',
        points: 30,
        taskType: 'TWITTER_FOLLOW',
        taskUrl: 'https://twitter.com/SylvanCEO',
      },
      {
        title: 'Follow Sylvan Dev Team',
        description: 'Follow our development team for technical updates',
        titleTr: 'Geliştirme Ekibini Takip Et',
        descriptionTr: 'Teknik güncellemeler için geliştirme ekibimizi takip edin',
        points: 30,
        taskType: 'TWITTER_FOLLOW',
        taskUrl: 'https://twitter.com/SylvanDev',
      },
      {
        title: 'Follow Sylvan Marketing',
        description: 'Stay updated with our marketing campaigns',
        titleTr: 'Pazarlama Hesabını Takip Et',
        descriptionTr: 'Pazarlama kampanyalarımızdan haberdar olun',
        points: 25,
        taskType: 'TWITTER_FOLLOW',
        taskUrl: 'https://twitter.com/SylvanMarketing',
      },
      {
        title: 'Follow Sylvan Community',
        description: 'Join our community manager for direct engagement',
        titleTr: 'Topluluk Yöneticisini Takip Et',
        descriptionTr: 'Doğrudan etkileşim için topluluk yöneticimizi takip edin',
        points: 20,
        taskType: 'TWITTER_FOLLOW',
        taskUrl: 'https://twitter.com/SylvanCommunity',
      },

      // Twitter Like Tasks (5)
      {
        title: 'Like Launch Announcement',
        description: 'Show support by liking our launch tweet',
        titleTr: 'Lansman Duyurusunu Beğen',
        descriptionTr: 'Lansman tweetimizi beğenerek destek olun',
        points: 20,
        taskType: 'TWITTER_LIKE',
        taskUrl: 'https://twitter.com/SylvanToken/status/1234567890',
      },
      {
        title: 'Like Airdrop Announcement',
        description: 'Like our airdrop announcement tweet',
        titleTr: 'Airdrop Duyurusunu Beğen',
        descriptionTr: 'Airdrop duyuru tweetimizi beğenin',
        points: 25,
        taskType: 'TWITTER_LIKE',
        taskUrl: 'https://twitter.com/SylvanToken/status/1234567891',
      },
      {
        title: 'Like Partnership News',
        description: 'Like our latest partnership announcement',
        titleTr: 'Ortaklık Haberini Beğen',
        descriptionTr: 'Son ortaklık duyurumuzu beğenin',
        points: 20,
        taskType: 'TWITTER_LIKE',
        taskUrl: 'https://twitter.com/SylvanToken/status/1234567892',
      },
      {
        title: 'Like Roadmap Update',
        description: 'Like our Q2 roadmap update tweet',
        titleTr: 'Yol Haritası Güncellemesini Beğen',
        descriptionTr: 'Q2 yol haritası güncellememizi beğenin',
        points: 20,
        taskType: 'TWITTER_LIKE',
        taskUrl: 'https://twitter.com/SylvanToken/status/1234567893',
      },
      {
        title: 'Like Community Milestone',
        description: 'Celebrate our 10K followers milestone',
        titleTr: '10K Takipçi Başarısını Beğen',
        descriptionTr: '10K takipçi başarımızı kutlayın',
        points: 15,
        taskType: 'TWITTER_LIKE',
        taskUrl: 'https://twitter.com/SylvanToken/status/1234567894',
      },

      // Twitter Retweet Tasks (5)
      {
        title: 'Retweet Launch Post',
        description: 'Help spread the word by retweeting our launch',
        titleTr: 'Lansman Gönderisini Retweet Et',
        descriptionTr: 'Lansmanımızı retweet ederek yayın',
        points: 30,
        taskType: 'TWITTER_RETWEET',
        taskUrl: 'https://twitter.com/SylvanToken/status/1234567890',
      },
      {
        title: 'Retweet Airdrop Campaign',
        description: 'Share our airdrop with your followers',
        titleTr: 'Airdrop Kampanyasını Retweet Et',
        descriptionTr: 'Airdrop\'umuzu takipçilerinizle paylaşın',
        points: 35,
        taskType: 'TWITTER_RETWEET',
        taskUrl: 'https://twitter.com/SylvanToken/status/1234567891',
      },
      {
        title: 'Retweet Partnership News',
        description: 'Share our exciting partnership announcement',
        titleTr: 'Ortaklık Haberini Retweet Et',
        descriptionTr: 'Heyecan verici ortaklık duyurumuzu paylaşın',
        points: 25,
        taskType: 'TWITTER_RETWEET',
        taskUrl: 'https://twitter.com/SylvanToken/status/1234567892',
      },
      {
        title: 'Retweet Giveaway Post',
        description: 'Retweet our giveaway for a chance to win',
        titleTr: 'Çekiliş Gönderisini Retweet Et',
        descriptionTr: 'Kazanma şansı için çekilişimizi retweet edin',
        points: 30,
        taskType: 'TWITTER_RETWEET',
        taskUrl: 'https://twitter.com/SylvanToken/status/1234567895',
      },
      {
        title: 'Retweet Exchange Listing',
        description: 'Share our exchange listing announcement',
        titleTr: 'Borsa Listeleme Haberini Retweet Et',
        descriptionTr: 'Borsa listeleme duyurumuzu paylaşın',
        points: 35,
        taskType: 'TWITTER_RETWEET',
        taskUrl: 'https://twitter.com/SylvanToken/status/1234567896',
      },

      // Telegram Tasks (3)
      {
        title: 'Join Sylvan Token Telegram',
        description: 'Join our official Telegram channel',
        titleTr: 'Sylvan Token Telegram\'a Katıl',
        descriptionTr: 'Resmi Telegram kanalımıza katılın',
        points: 50,
        taskType: 'TELEGRAM_JOIN',
        taskUrl: 'https://t.me/SylvanToken',
      },
      {
        title: 'Join Announcements Channel',
        description: 'Join our announcements-only channel',
        titleTr: 'Duyuru Kanalına Katıl',
        descriptionTr: 'Sadece duyuru kanalımıza katılın',
        points: 30,
        taskType: 'TELEGRAM_JOIN',
        taskUrl: 'https://t.me/SylvanAnnouncements',
      },
      {
        title: 'Join Community Discussion',
        description: 'Join our community chat group',
        titleTr: 'Topluluk Sohbetine Katıl',
        descriptionTr: 'Topluluk sohbet grubumıza katılın',
        points: 40,
        taskType: 'TELEGRAM_JOIN',
        taskUrl: 'https://t.me/SylvanCommunity',
      },

      // Custom Tasks (2)
      {
        title: 'Complete Profile',
        description: 'Complete your profile with wallet and social media',
        titleTr: 'Profili Tamamla',
        descriptionTr: 'Cüzdan ve sosyal medya ile profilinizi tamamlayın',
        points: 100,
        taskType: 'CUSTOM',
        taskUrl: null,
      },
      {
        title: 'Refer 5 Friends',
        description: 'Invite 5 friends to join Sylvan Token',
        titleTr: '5 Arkadaş Davet Et',
        descriptionTr: 'Sylvan Token\'a 5 arkadaşınızı davet edin',
        points: 250,
        taskType: 'REFERRAL',
        taskUrl: null,
      },
    ];

    // Görevleri oluştur
    let createdCount = 0;
    for (const taskData of tasks) {
      const task = await prisma.task.create({
        data: {
          ...taskData,
          campaignId: campaign.id,
          isActive: true,
        },
      });
      createdCount++;
      console.log(`✅ Task ${createdCount}/20: ${task.title} (${task.points} points)`);
    }

    console.log('\n🎉 Successfully created 20 tasks!');
    console.log(`📊 Campaign ID: ${campaign.id}`);
    console.log(`📅 Campaign Duration: 90 days`);
    console.log(`💰 Total Points Available: ${tasks.reduce((sum, t) => sum + t.points, 0)}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSampleTasks()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
