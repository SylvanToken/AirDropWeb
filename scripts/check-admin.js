const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Check if admin user exists
  const adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: 'admin' },
        { role: 'ADMIN' }
      ]
    }
  });

  if (adminUser) {
    console.log('✅ Admin user found:');
    console.log('Username:', adminUser.username);
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Created:', adminUser.createdAt);
  } else {
    console.log('❌ No admin user found. Creating one...');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('Mjkvebep_68', 12);
    
    const newAdmin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@sylvantoken.com',
        password: hashedPassword,
        role: 'ADMIN',
        totalPoints: 0,
        acceptedTerms: true,
        acceptedPrivacy: true,
        termsAcceptedAt: new Date(),
      }
    });
    
    console.log('✅ Admin user created:');
    console.log('Username: admin');
    console.log('Email: admin@sylvantoken.com');
    console.log('Password: Mjkvebep_68');
    console.log('Role:', newAdmin.role);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
