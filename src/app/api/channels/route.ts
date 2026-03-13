import { NextResponse } from "next/server";
import { query } from "@/server/db";

export const dynamic = "force-dynamic";

interface Channel {
  id: string;
  name: string;
  imageUrl: string | null;
  streamUrl: string | null;
  groupTitle: string | null;
  tvgLogo: string | null;
  enabled: number;
}

interface EpgProgram {
  id: string;
  channelId: string;
  title: string;
  start: string;
  stop: string;
}

interface GroupResult {
  groupTitle: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");
    const queryParam = searchParams.get("query");
    const withEpg = searchParams.get("epg") === "true";

    const now = new Date().toISOString();

    // Build query conditions
    let sql = `SELECT id, name, imageUrl, streamUrl, groupTitle, tvgLogo, enabled FROM Channel WHERE enabled = 1`;
    const args: (string | null)[] = [];

    if (group) {
      sql += ` AND groupTitle = ?`;
      args.push(group);
    }

    if (queryParam) {
      sql += ` AND name LIKE ?`;
      args.push(`%${queryParam}%`);
    }

    sql += ` ORDER BY name ASC`;

    const channels = await query<Channel>(sql, args);

    // Get EPG data if requested
    let channelsWithEpg: (Channel & { epgPrograms?: EpgProgram[] })[] = channels;
    if (withEpg && channels.length > 0) {
      const channelIds = channels.map(c => c.id);
      const placeholders = channelIds.map(() => '?').join(',');
      
      const epgData = await query<EpgProgram>(
        `SELECT id, channelId, title, start, stop 
         FROM EpgProgram 
         WHERE channelId IN (${placeholders}) 
           AND start <= ? 
           AND stop >= ?`,
        [...channelIds, now, now]
      );

      // Group EPG by channelId
      const epgByChannel = new Map<string, EpgProgram[]>();
      for (const program of epgData) {
        if (!epgByChannel.has(program.channelId)) {
          epgByChannel.set(program.channelId, []);
        }
        epgByChannel.get(program.channelId)!.push(program);
      }

      channelsWithEpg = channels.map(channel => ({
        ...channel,
        epgPrograms: epgByChannel.get(channel.id) || []
      }));
    }

    // Get unique groups
    const groups = await query<GroupResult>(
      `SELECT DISTINCT groupTitle FROM Channel WHERE enabled = 1 AND groupTitle IS NOT NULL`
    );

    return NextResponse.json({
      channels: channelsWithEpg,
      groups: groups.map(g => g.groupTitle).filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}
