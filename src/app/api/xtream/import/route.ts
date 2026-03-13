import { NextRequest, NextResponse } from 'next/server';
import { query, runQuery } from '@/server/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface XtreamChannel {
  num: number;
  name: string;
  stream_icon: string;
  stream_url?: string;
  category_id: string;
  epg_channel_id?: string;
}

interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  updated: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Brak uprawnień' }, { status: 401 });
    }

    const body = await request.json();
    const { config, channels } = body as { 
      config: { host: string; port: string; username: string; password: string };
      channels: XtreamChannel[] 
    };

    if (!config || !channels || channels.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Brak danych do importu' 
      });
    }

    // Build stream URL prefix
    const cleanHost = config.host.replace(/^https?:\/\//, '');
    const portPart = config.port && config.port !== '80' ? `:${config.port}` : '';
    const serverUrl = `http://${cleanHost}${portPart}`;

    const stats: ImportStats = {
      total: channels.length,
      imported: 0,
      skipped: 0,
      updated: 0
    };

    // Get existing channels
    const existingChannels = await query<{ streamUrl: string }>(
      'SELECT streamUrl FROM Channel'
    );
    const existingUrls = new Set(existingChannels.map(c => c.streamUrl));

    // Get category mapping
    interface CategoryMap {
      xtreamId: string;
      id: string;
      name: string;
    }
    
    // Import channels
    for (const channel of channels) {
      const streamUrl = `${serverUrl}/live/${config.username}/${config.password}/${channel.num}.m3u8`;
      
      // Check if channel already exists
      if (existingUrls.has(streamUrl)) {
        stats.skipped++;
        continue;
      }

      // Get category name from category_id
      const categoryId = channel.category_id;
      
      // Create the channel
      await runQuery(
        `INSERT INTO Channel (id, name, imageUrl, streamUrl, groupTitle, enabled, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
        [
          crypto.randomUUID(),
          channel.name.substring(0, 255), // Limit name length
          channel.stream_icon || null,
          streamUrl,
          categoryId || 'Inne'
        ]
      );

      stats.imported++;
      existingUrls.add(streamUrl);
    }

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Błąd importu: ${(error as Error).message}` 
    });
  }
}
