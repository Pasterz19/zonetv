import { NextResponse } from "next/server";
import { query } from "@/server/db";

export const dynamic = "force-dynamic";

interface EpgProgram {
  id: string;
  channelId: string;
  title: string;
  description: string | null;
  start: string;
  stop: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!channelId) {
      return NextResponse.json(
        { error: "channelId is required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Get programs for the channel, starting from now
    const programs = await query<EpgProgram>(
      `SELECT id, channelId, title, description, start, stop
       FROM EpgProgram
       WHERE channelId = ? AND stop >= ?
       ORDER BY start ASC
       LIMIT ?`,
      [channelId, now, limit]
    );

    return NextResponse.json({ programs });
  } catch (error) {
    console.error("Error fetching EPG:", error);
    return NextResponse.json(
      { error: "Failed to fetch EPG" },
      { status: 500 }
    );
  }
}
