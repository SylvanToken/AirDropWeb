import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Auto-reject pending completions that are older than 48 hours
 * This script should be run periodically (e.g., every hour via cron job)
 */
async function autoRejectExpiredPending() {
  try {
    console.log('🔍 Checking for expired pending completions...\n');

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Find all PENDING completions older than 48 hours
    const expiredPending = await prisma.completion.findMany({
      where: {
        status: 'PENDING',
        completedAt: {
          lt: fortyEightHoursAgo,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            points: true,
          },
        },
      },
    });

    console.log(`Found ${expiredPending.length} expired pending completions:\n`);

    if (expiredPending.length === 0) {
      console.log('✅ No expired pending completions found.');
      return;
    }

    let rejectedCount = 0;

    for (const completion of expiredPending) {
      console.log(`Processing: ${completion.task.title}`);
      console.log(`  User: ${completion.user.username || completion.user.email}`);
      console.log(`  Completed At: ${completion.completedAt}`);
      console.log(`  Age: ${Math.round((Date.now() - completion.completedAt.getTime()) / (1000 * 60 * 60))} hours`);

      try {
        // Update completion to REJECTED and mark as missed
        await prisma.completion.update({
          where: { id: completion.id },
          data: {
            status: 'REJECTED',
            verificationStatus: 'REJECTED',
            rejectionReason: 'Automatically rejected after 48 hours without approval',
            missedAt: new Date(),
          },
        });

        rejectedCount++;
        console.log(`  ✅ Rejected and moved to missed tasks\n`);
      } catch (error) {
        console.error(`  ❌ Error rejecting completion:`, error);
      }
    }

    console.log(`\n✨ Summary:`);
    console.log(`   Total expired: ${expiredPending.length}`);
    console.log(`   Successfully rejected: ${rejectedCount}`);
    console.log(`   Failed: ${expiredPending.length - rejectedCount}`);

  } catch (error) {
    console.error('Error auto-rejecting expired pending completions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
autoRejectExpiredPending();
