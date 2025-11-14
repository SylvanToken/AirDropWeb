const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  await prisma.user.deleteMany({
    where: { email: { contains: 'bulktest' } }
  });
  console.log('Cleaned up test users');
  await prisma.$disconnect();
}

cleanup();
