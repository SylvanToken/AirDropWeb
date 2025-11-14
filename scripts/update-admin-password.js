const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'Mjkvebep_68';
  
  // Find admin user
  const adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: 'Admin' },
        { username: 'admin' },
        { role: 'ADMIN' }
      ]
    }
  });

  if (!adminUser) {
    console.log('❌ Admin user not found!');
    return;
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  // Update password
  await prisma.user.update({
    where: { id: adminUser.id },
    data: { password: hashedPassword }
  });
  
  console.log('✅ Admin password updated successfully!');
  console.log('');
  console.log('📋 Admin Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Username:', adminUser.username);
  console.log('Email:', adminUser.email);
  console.log('Password:', newPassword);
  console.log('Role:', adminUser.role);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🌐 Login URL: http://localhost:3005/admin/login');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
