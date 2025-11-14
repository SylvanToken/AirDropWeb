const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWalletStatus() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        walletAddress: true,
        walletVerified: true,
      },
    });

    console.log('\n=== Wallet Status Report ===\n');
    users.forEach(user => {
      console.log(`User: ${user.username} (${user.email})`);
      console.log(`  Wallet: ${user.walletAddress || 'Not set'}`);
      console.log(`  Verified: ${user.walletVerified ? 'Yes' : 'No'}`);
      console.log('---');
    });
    console.log(`\nTotal users: ${users.length}\n`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWalletStatus();
