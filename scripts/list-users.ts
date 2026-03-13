import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

async function listUsers() {
  const databaseUrl = (process.env.DATABASE_URL ?? "file:./prisma/dev.db").replace("file:", "");
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    if (users.length === 0) {
      console.log("NO_USERS_FOUND");
    } else {
      console.log("USERS_LIST:");
      console.table(users);
    }
  } catch (error: any) {
    console.error("ERROR:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
