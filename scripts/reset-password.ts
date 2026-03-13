import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

async function reset() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  // Strip 'file:' prefix if needed for the adapter, but PrismaBetterSqlite3 usually takes the URL
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl.replace("file:", "") });
  
  const prisma = new PrismaClient({
    adapter,
  });

  try {
    const email = "zonetv@o2.pl";
    const newPassword = "haslo1234";
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    console.log(`SUCCESS: Password for ${email} has been reset to "${newPassword}"`);
    console.log(`User ID: ${user.id}`);
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error("ERROR: User not found.");
    } else {
      console.error("ERROR:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

reset();
