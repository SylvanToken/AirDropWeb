import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Random user data
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

// Task templates with i18n keys
const taskTemplates = [
  {
    titleKey: 'tasks.templates.twitterFollow',
    descriptionKey: 'tasks.templates.twitterFollowDesc',
    points: 50,
    taskType: 'TWITTER_FOLLOW',
    taskUrl: 'https://twitter.com/SylvanToken',
  },
  {
    titleKey: 'tasks.templates.twitterLike',
    descriptionKey: 'tasks.templates.twitterLikeDesc',
    points: 25,
    taskType: 'TWITTER_LIKE',
    taskUrl: 'https://twitter.com/SylvanToken/status/123456789',
  },
  {
    titleKey: 'tasks.templates.twitterRetweet',
    descriptionKey: 'tasks.templates.twitterRetweetDesc',
    points: 30,
    taskType: 'TWITTER_RETWEET',
    taskUrl: 'https://twitter.com/SylvanToken/status/987654321',
  },
  {
    titleKey: 'tasks.templates.telegramJoin',
    descriptionKey: 'tasks.templates.telegramJoinDesc',
    points: 40,
    taskType: 'TELEGRAM_JOIN',
    taskUrl: 'https://t.me/SylvanToken',
  },
  {
    titleKey: 'tasks.templates.websiteVisit',
    descriptionKey: 'tasks.templates.websiteVisitDesc',
    points: 20,
    taskType: 'CUSTOM',
    taskUrl: 'https://sylvantoken.org',
  },
  {
    titleKey: 'tasks.templates.whitepaperRead',
    descriptionKey: 'tasks.templates.whitepaperReadDesc',
    points: 35,
    taskType: 'CUSTOM',
    taskUrl: 'https://sylvantoken.org/whitepaper',
  },
  {
    titleKey: 'tasks.templates.discordJoin',
    descriptionKey: 'tasks.templates.discordJoinDesc',
    points: 45,
    taskType: 'CUSTOM',
    taskUrl: 'https://discord.gg/sylvantoken',
  },
  {
    titleKey: 'tasks.templates.youtubeSubscribe',
    descriptionKey: 'tasks.templates.youtubeSubscribeDesc',
    points: 40,
    taskType: 'CUSTOM',
    taskUrl: 'https://youtube.com/@sylvantoken',
  },
  {
    titleKey: 'tasks.templates.mediumFollow',
    descriptionKey: 'tasks.templates.mediumFollowDesc',
    points: 30,
    taskType: 'CUSTOM',
    taskUrl: 'https://medium.com/@sylvantoken',
  },
  {
    titleKey: 'tasks.templates.githubStar',
    descriptionKey: 'tasks.templates.githubStarDesc',
    points: 35,
    taskType: 'CUSTOM',
    taskUrl: 'https://github.com/sylvantoken',
  },
];

async function main() {
  console.log('🌱 Starting demo data seed...\n');

  // 1. Create/Update Admin
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('SylvanAdmin2025!', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sylvantoken.org' },
    update: {
      password: adminPassword,
    },
    create: {
      email: 'admin@sylvantoken.org',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      totalPoints: 0,
      acceptedTerms: true,
      acceptedPrivacy: true,
    },
  });

  console.log('✅ Admin created:');
  console.log('   Email: admin@sylvantoken.org');
  console.log('   Password: SylvanAdmin2025!\n');

  // 2. Get or create default campaign
  console.log('📋 Setting up campaign...');
  let campaign = await prisma.campaign.findFirst({
    where: { isActive: true },
  });

  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        id: 'default-campaign-2025',
        title: 'Sylvan Token Airdrop 2025',
        description: 'Complete tasks to earn points and qualify for the token distribution.',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
      },
    });
  }
  console.log(`✅ Campaign: ${campaign.title}\n`);

  // 3. Create 10 tasks with i18n keys
  console.log('📝 Creating 10 tasks...');
  const createdTasks = [];
  
  for (const template of taskTemplates) {
    const task = await prisma.task.create({
      data: {
        title: template.titleKey, // Store i18n key
        description: template.descriptionKey, // Store i18n key
        points: template.points,
        taskType: template.taskType,
        taskUrl: template.taskUrl,
        isActive: true,
        campaignId: campaign.id,
      },
    });
    createdTasks.push(task);
    console.log(`   ✓ ${template.titleKey} (${template.points} points)`);
  }
  console.log(`✅ ${createdTasks.length} tasks created\n`);

  // 4. Create 10 random users
  console.log('👥 Creating 10 random users...');
  const users = [];
  const userPassword = await bcrypt.hash('User123!', 12);

  for (let i = 0; i < 10; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
    const email = `${username}@example.com`;

    try {
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: userPassword,
          role: 'USER',
          totalPoints: Math.floor(Math.random() * 500),
          walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
          walletVerified: Math.random() > 0.5,
          twitterUsername: Math.random() > 0.3 ? `@${username}` : null,
          twitterVerified: Math.random() > 0.5,
          telegramUsername: Math.random() > 0.3 ? username : null,
          telegramVerified: Math.random() > 0.5,
          acceptedTerms: true,
          acceptedPrivacy: true,
        },
      });
      users.push(user);
      console.log(`   ✓ ${user.username} (${user.totalPoints} points)`);
    } catch (error) {
      console.log(`   ⚠ Skipped ${username} (already exists)`);
    }
  }
  console.log(`✅ ${users.length} users created\n`);

  // 5. Create some random completions
  console.log('🎯 Creating random task completions...');
  let completionCount = 0;
  
  for (const user of users) {
    const numCompletions = Math.floor(Math.random() * 5) + 1;
    const shuffledTasks = [...createdTasks].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numCompletions && i < shuffledTasks.length; i++) {
      try {
        await prisma.completion.create({
          data: {
            userId: user.id,
            taskId: shuffledTasks[i].id,
            status: 'APPROVED',
            pointsAwarded: shuffledTasks[i].points,
          },
        });
        completionCount++;
      } catch (error) {
        // Skip if already completed
      }
    }
  }
  console.log(`✅ ${completionCount} task completions created\n`);

  console.log('🎉 Demo data seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - 1 Admin user`);
  console.log(`   - ${createdTasks.length} Tasks`);
  console.log(`   - ${users.length} Random users`);
  console.log(`   - ${completionCount} Task completions`);
  console.log('\n🔐 Admin Login:');
  console.log('   Email: admin@sylvantoken.org');
  console.log('   Password: SylvanAdmin2025!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
