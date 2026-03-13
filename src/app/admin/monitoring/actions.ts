"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

const db = new PrismaClient();

export async function getMonitoredChannels() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return [];

  // Get active channels
  // Removed 'enabled' filter as it is not in the schema yet
  return db.channel.findMany({
    take: 12,
    orderBy: { createdAt: "desc" },
  });
}
