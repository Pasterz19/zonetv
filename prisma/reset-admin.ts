import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database reset and admin creation...');

  try {
    // 1. Delete all existing users
    const deleteResult = await prisma.user.deleteMany();
    console.log(`Successfully deleted ${deleteResult.count} users.`);

    // 2. Hash the new admin password
    const adminPassword = 'admin_password_123'; // Change this in production
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // 3. Create a new administrator user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: passwordHash,
        role: UserRole.ADMIN,
        name: 'System Admin'
      },
    });

    console.log('Successfully created new admin user:', adminUser.email);
    console.log('Login with: admin@example.com / admin_password_123');

  } catch (error) {
    console.error('Error during reset operation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  }
}

main();
