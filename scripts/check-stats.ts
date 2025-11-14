/**
 * Check Database Stats Script
 * 
 * This script checks the current database statistics
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStats() {
  try {
    console.log('📊 Checking Database Statistics...\n');

    // Get total users
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        status: 'ACTIVE',
      },
    });
    const regularUsers = await prisma.user.count({
      where: {
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    console.log('👥 Users:');
    console.log(`  - Total Users: ${totalUsers}`);
    console.log(`  - Active Users: ${activeUsers}`);
    console.log(`  - Regular Users (non-admin): ${regularUsers}`);

    // Get total completions
    const totalCompletions = await prisma.completion.count();
    console.log(`\n✅ Completions: ${totalCompletions}`);

    // Get total points
    const totalPoints = await prisma.completion.aggregate({
      _sum: {
        pointsAwarded: true,
      },
    });
    console.log(`\n🎁 Total Points Distributed: ${totalPoints._sum.pointsAwarded || 0}`);

    // Get total tasks
    const totalTasks = await prisma.task.count();
    const activeTasks = await prisma.task.count({
      where: {
        isActive: true,
      },
    });
    console.log(`\n📋 Tasks:`);
    console.log(`  - Total Tasks: ${totalTasks}`);
    console.log(`  - Active Tasks: ${activeTasks}`);

    // List all users
    console.log('\n\n📝 User List:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        totalPoints: true,
        _count: {
          select: {
            completions: true,
          },
        },
      },
    });

    if (users.length === 0) {
      console.log('  No users found in database.');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.username || 'N/A'} (${user.email})`);
        console.log(`   Role: ${user.role} | Status: ${user.status}`);
        console.log(`   Points: ${user.totalPoints} | Completions: ${user._count.completions}`);
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Stats check complete!');

  } catch (error) {
    console.error('❌ Error occurred:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkStats()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
