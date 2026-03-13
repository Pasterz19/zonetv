/**
 * API do eksportu kanałów do formatu M3U
 * GET /api/e2-import/export
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/server/db';

/**
 * Generuje playlistę M3U z kanałów w bazie
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    const format = searchParams.get('format') || 'm3u';
    
    // Pobierz kanały
    let channels: Array<{
      name: string;
      streamUrl: string;
      country: string | null;
      groupTitle: string | null;
    }>;
    
    if (category) {
      channels = await query(`
        SELECT c.name, c.streamUrl as streamUrl, c.country, c.groupTitle
        FROM Channel c
        WHERE c.enabled = 1
        AND c.groupTitle = ?
        ORDER BY c.name
      `, [category]);
    } else {
      channels = await query(`
        SELECT c.name, c.streamUrl as streamUrl, c.country, c.groupTitle
        FROM Channel c
        WHERE c.enabled = 1
        ORDER BY c.groupTitle, c.name
      `);
    }
    
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        count: channels.length,
        channels: channels.map(c => ({
          name: c.name,
          url: c.streamUrl,
          groupTitle: c.groupTitle,
          country: c.country,
        }))
      });
    }
    
    // Generuj M3U
    const lines: string[] = [
      '#EXTM3U url-tvg="https://raw.githubusercontent.com/iptv-org/epg/master/guide/pl/tvp.pl.guide.xml"',
      ''
    ];
    
    let currentCategory = '';
    
    for (const channel of channels) {
      const groupTitle = channel.groupTitle || 'Inne';
      
      // Dodaj komentarz sekcji jeśli zmiana grupy
      if (groupTitle !== currentCategory) {
        lines.push(`# === ${groupTitle} ===`);
        currentCategory = groupTitle;
      }
      
      // EXTINF z metadanymi
      const tvgName = escapeM3UField(channel.name);
      const groupTitleEscaped = escapeM3UField(groupTitle);
      
      lines.push(`#EXTINF:-1 tvg-name="${tvgName}" group-title="${groupTitleEscaped}",${tvgName}`);
      lines.push(channel.streamUrl);
      lines.push('');
    }
    
    const m3uContent = lines.join('\n');
    
    return new NextResponse(m3uContent, {
      headers: {
        'Content-Type': 'audio/x-mpegurl',
        'Content-Disposition': 'attachment; filename="zonetv_channels.m3u"',
      },
    });
    
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function escapeM3UField(field: string): string {
  return field
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
}
