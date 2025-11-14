/**
 * Admin Kullanıcısı Kontrol Script'i
 * 
 * Database'deki admin kullanıcılarını listeler ve şifre kontrolü yapar
 * 
 * Kullanım:
 * npx ts-node scripts/check-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TEST_PASSWORD = 'Mjkvebep_68';

async function checkAdminUsers() {
  try {
    console.log('🔍 Searching for admin users...\n');

    // Find all admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'SUPER_ADMIN' },
          { email: { contains: 'admin' } },
        ],
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        password: true,
        createdAt: true,
        lastActive: true,
      },
    });

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
      console.log('\n💡 To create an admin, run:');
      console.log('   npx ts-node scripts/create-admin.ts');
      return;
    }

    console.log(`✅ Found ${adminUsers.length} admin user(s):\n`);

    for (const user of adminUsers) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📧 Email:      ${user.email}`);
      console.log(`👤 Username:   ${user.username}`);
      console.log(`🔑 Role:       ${user.role}`);
      console.log(`📊 Status:     ${user.status}`);
      console.log(`📅 Created:    ${user.createdAt.toLocaleDateString('tr-TR')}`);
      console.log(`⏰ Last Active: ${user.lastActive ? user.lastActive.toLocaleDateString('tr-TR') : 'Never'}`);

      // Test password
      if (user.email === 'admin@sylvantoken.org') {
        console.log('\n🔐 Testing password...');
        try {
          const isPasswordValid = await bcrypt.compare(TEST_PASSWORD, user.password);
          if (isPasswordValid) {
            console.log(`✅ Password correct: "${TEST_PASSWORD}"`);
          } else {
            console.log(`❌ Password incorrect! Expected: "${TEST_PASSWORD}"`);
            console.log('💡 To update password, run:');
            console.log('   npx ts-node scripts/create-admin.ts');
          }
        } catch (error) {
          console.log('❌ Password check failed:', error);
        }
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Check for admin@sylvantoken.org specifically
    const targetAdmin = adminUsers.find(u => u.email === 'admin@sylvantoken.org');
    if (!targetAdmin) {
      console.log('⚠️  admin@sylvantoken.org user not found!');
      console.log('💡 To create it, run:');
      console.log('   npx ts-node scripts/create-admin.ts\n');
    }

  } catch (error) {
    console.error('❌ Error occurred:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
async function main() {
  console.log('🔍 Admin User Check Script\n');
  await checkAdminUsers();
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
