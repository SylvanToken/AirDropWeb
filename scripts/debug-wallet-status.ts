import { prisma } from '../lib/prisma';

async function checkWalletStatus() {
  try {
    // Get first user with wallet
    const user = await prisma.user.findFirst({
      where: {
        walletAddress: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        walletAddress: true,
        walletVerified: true,
      }
    });

    if (user) {
      console.log('=== User with Wallet ===');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Username:', user.username);
      console.log('Wallet Address:', user.walletAddress);
      console.log('Wallet Verified:', user.walletVerified);
      console.log('Has Wallet:', !!user.walletAddress);
      console.log('Is Verified:', user.walletVerified || false);
    } else {
      console.log('No user with wallet found');
    }

    // Count users
    const totalUsers = await prisma.user.count();
    const usersWithWallet = await prisma.user.count({
      where: { walletAddress: { not: null } }
    });
    const verifiedWallets = await prisma.user.count({
      where: { walletVerified: true }
    });

    console.log('\n=== Statistics ===');
    console.log('Total Users:', totalUsers);
    console.log('Users with Wallet:', usersWithWallet);
    console.log('Verified Wallets:', verifiedWallets);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWalletStatus();
