import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma/client";
import { z } from "zod";

const db = new PrismaClient();

const bodySchema = z.object({
  channelId: z.string().min(1),
  bufferSeconds: z.number().int().min(5).max(600),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { channelId, bufferSeconds } = parsed.data;
  const userId = session.user.id as string;

  try {
    await db.channelBufferPreference.upsert({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
      update: {
        bufferSeconds,
      },
      create: {
        userId,
        channelId,
        bufferSeconds,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update channel buffer preference:", error);
    return NextResponse.json(
      { error: "Failed to update preference" },
      { status: 500 }
    );
  }
}
