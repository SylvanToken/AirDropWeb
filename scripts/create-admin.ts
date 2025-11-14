/**
 * Admin Kullanıcısı Oluşturma Script'i
 * 
 * Bu script admin@sylvantoken.org kullanıcısını oluşturur veya günceller
 * 
 * Kullanım:
 * npx ts-node scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@sylvantoken.org';
const ADMIN_PASSWORD = 'Mjkvebep_Brn68o';
const ADMIN_USERNAME = 'admin';

async function createOrUpdateAdmin() {
  try {
    console.log('🔍 Checking for admin user...');

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    if (existingAdmin) {
      console.log('✏️  Updating existing admin user...');
      
      // Update existing admin
      const updatedAdmin = await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          username: ADMIN_USERNAME,
        },
      });

      console.log('✅ Admin user updated!');
      console.log('📧 Email:', updatedAdmin.email);
      console.log('👤 Username:', updatedAdmin.username);
      console.log('🔑 Role:', updatedAdmin.role);
      console.log('📊 Status:', updatedAdmin.status);
    } else {
      console.log('➕ Creating new admin user...');
      
      // Create new admin
      const newAdmin = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          username: ADMIN_USERNAME,
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          totalPoints: 0,
          acceptedTerms: true,
        },
      });

      console.log('✅ Admin user created!');
      console.log('📧 Email:', newAdmin.email);
      console.log('👤 Username:', newAdmin.username);
      console.log('🔑 Role:', newAdmin.role);
      console.log('📊 Status:', newAdmin.status);
    }

    console.log('\n🎉 Operation successful!');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Admin Panel: http://localhost:3005/admin/login');

  } catch (error) {
    console.error('❌ Error occurred:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Test password hashing
async function testPasswordHash() {
  console.log('\n🧪 Testing password hash...');
  const testHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const isValid = await bcrypt.compare(ADMIN_PASSWORD, testHash);
  console.log('Hash test result:', isValid ? '✅ Success' : '❌ Failed');
}

// Run the script
async function main() {
  console.log('🚀 Admin User Creation Script\n');
  
  await testPasswordHash();
  await createOrUpdateAdmin();
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
