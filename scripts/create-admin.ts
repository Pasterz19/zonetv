import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

async function createAdmin() {
  const databaseUrl = (process.env.DATABASE_URL ?? "file:./prisma/dev.db").replace("file:", "");
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    const email = "zonetv@o2.pl";
    const name = "Zonetv";
    const password = "Damian95";
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "ADMIN",
        emailVerifiedAt: new Date(),
      },
    });

    console.log(`SUCCESS: Administrator created!`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error("ERROR: User with this email or name already exists.");
    } else {
      console.error("ERROR:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
