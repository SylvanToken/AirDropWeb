/**
 * Reset Tasks Script
 * 
 * This script deletes all existing tasks and creates new ones with scheduled/unlimited options
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newTasks = [
  // Scheduled Tasks (with deadline)
  {
    title: 'Follow us on Twitter',
    titleTr: 'Twitter\'da Takip Et',
    description: 'Follow our official Twitter account and stay updated',
    descriptionTr: 'Resmi Twitter hesabımızı takip edin ve güncel kalın',
    points: 50,
    taskType: 'SOCIAL_FOLLOW',
    taskUrl: 'https://twitter.com/sylvantoken',
    isActive: true,
    isTimeSensitive: true,
    scheduledDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    estimatedDuration: 2,
  },
  {
    title: 'Join our Telegram Group',
    titleTr: 'Telegram Grubuna Katıl',
    description: 'Join our Telegram community and connect with other members',
    descriptionTr: 'Telegram topluluğumuza katılın ve diğer üyelerle bağlantı kurun',
    points: 75,
    taskType: 'SOCIAL_JOIN',
    taskUrl: 'https://t.me/sylvantoken',
    isActive: true,
    isTimeSensitive: true,
    scheduledDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    estimatedDuration: 3,
  },
  {
    title: 'Share on Social Media',
    titleTr: 'Sosyal Medyada Paylaş',
    description: 'Share our project on your social media accounts',
    descriptionTr: 'Projemizi sosyal medya hesaplarınızda paylaşın',
    points: 100,
    taskType: 'SOCIAL_SHARE',
    taskUrl: null,
    isActive: true,
    isTimeSensitive: true,
    scheduledDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    estimatedDuration: 5,
  },
  
  // Unlimited Tasks (no deadline)
  {
    title: 'Complete Daily Check-in',
    titleTr: 'Günlük Giriş Yap',
    description: 'Log in daily to earn bonus points',
    descriptionTr: 'Bonus puan kazanmak için her gün giriş yapın',
    points: 25,
    taskType: 'DAILY_CHECKIN',
    taskUrl: null,
    isActive: true,
    isTimeSensitive: false,
    scheduledDeadline: null,
    estimatedDuration: 1,
  },
  {
    title: 'Invite Friends',
    titleTr: 'Arkadaşlarını Davet Et',
    description: 'Invite your friends and earn rewards for each referral',
    descriptionTr: 'Arkadaşlarınızı davet edin ve her yönlendirme için ödül kazanın',
    points: 150,
    taskType: 'REFERRAL',
    taskUrl: null,
    isActive: true,
    isTimeSensitive: false,
    scheduledDeadline: null,
    estimatedDuration: 5,
  },
  {
    title: 'Complete Profile',
    titleTr: 'Profili Tamamla',
    description: 'Fill out your profile information completely',
    descriptionTr: 'Profil bilgilerinizi eksiksiz doldurun',
    points: 50,
    taskType: 'PROFILE_UPDATE',
    taskUrl: null,
    isActive: true,
    isTimeSensitive: false,
    scheduledDeadline: null,
    estimatedDuration: 10,
  },
];

async function resetTasks() {
  try {
    console.log('🗑️  Deleting all existing tasks...');
    
    // Delete all completions first (foreign key constraint)
    const deletedCompletions = await prisma.completion.deleteMany({});
    console.log(`   Deleted ${deletedCompletions.count} completions`);
    
    // Delete all tasks
    const deletedTasks = await prisma.task.deleteMany({});
    console.log(`   Deleted ${deletedTasks.count} tasks`);
    
    console.log('\n✨ Creating new tasks...\n');
    
    // Get or create default campaign
    let campaign = await prisma.campaign.findFirst({
      where: {
        isActive: true,
      },
    });
    
    if (!campaign) {
      console.log('📋 Creating default campaign...');
      campaign = await prisma.campaign.create({
        data: {
          name: 'Sylvan Token Launch Campaign',
          nameTr: 'Sylvan Token Başlangıç Kampanyası',
          description: 'Complete tasks to earn Sylvan Token airdrop points',
          descriptionTr: 'Sylvan Token airdrop puanları kazanmak için görevleri tamamlayın',
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          isActive: true,
          totalPoints: 0,
        },
      });
      console.log(`   Created campaign: ${campaign.name}\n`);
    }
    
    // Create new tasks
    for (const taskData of newTasks) {
      const task = await prisma.task.create({
        data: {
          ...taskData,
          campaignId: campaign.id,
        },
      });
      
      const deadlineInfo = task.isTimeSensitive && task.scheduledDeadline
        ? `⏰ Deadline: ${task.scheduledDeadline.toLocaleDateString()}`
        : '♾️  Unlimited';
      
      console.log(`✅ Created: ${task.title}`);
      console.log(`   Points: ${task.points} | ${deadlineInfo}`);
      console.log(`   Duration: ~${task.estimatedDuration} min\n`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Tasks reset complete!');
    console.log(`📊 Total tasks created: ${newTasks.length}`);
    console.log(`   - Scheduled tasks: ${newTasks.filter(t => t.isTimeSensitive).length}`);
    console.log(`   - Unlimited tasks: ${newTasks.filter(t => !t.isTimeSensitive).length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error occurred:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetTasks()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
