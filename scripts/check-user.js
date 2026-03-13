const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'zonetv@o2.pl' }
    });
    
    if (user) {
      console.log('USER_FOUND: ' + JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified
      }));
    } else {
      console.log('USER_NOT_FOUND');
    }
  } catch (error) {
    console.error('ERROR: ' + error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
