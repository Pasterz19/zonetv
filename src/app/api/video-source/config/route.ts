import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query, runQuery } from '@/server/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/video-source/config
 * List all video source configurations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configs = await query<{
      id: string;
      name: string;
      provider: string;
      apiKey: string | null;
      apiEndpoint: string | null;
      isActive: number;
      settings: string | null;
      createdAt: string;
      updatedAt: string;
    }>(`
      SELECT id, name, provider, apiKey, apiEndpoint, isActive, settings, createdAt, updatedAt
      FROM VideoSourceConfig
      ORDER BY createdAt DESC
    `);

    // Mask API keys for security
    const maskedConfigs = configs.map(c => ({
      ...c,
      apiKey: c.apiKey ? `${c.apiKey.slice(0, 8)}...${c.apiKey.slice(-4)}` : null,
      hasApiKey: !!c.apiKey,
    }));

    return NextResponse.json({ configs: maskedConfigs });
  } catch (error) {
    console.error('Error fetching video source configs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/video-source/config
 * Create or update video source configuration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, provider, apiKey, apiEndpoint, isActive, settings } = body;

    if (!name || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: name, provider' },
        { status: 400 }
      );
    }

    const validProviders = ['SAVEFILES', 'DIRECT', 'M3U8', 'MP4', 'CUSTOM'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` },
        { status: 400 }
      );
    }

    if (id) {
      // Update existing config
      // Check if we need to update API key or keep existing
      let finalApiKey = apiKey;
      if (apiKey && apiKey.includes('...')) {
        // This is a masked key, fetch the real one
        const existing = await query<{ apiKey: string | null }>(
          'SELECT apiKey FROM VideoSourceConfig WHERE id = ?',
          [id]
        );
        finalApiKey = existing[0]?.apiKey;
      }

      await runQuery(
        `UPDATE VideoSourceConfig SET 
          name = ?,
          provider = ?,
          apiKey = ?,
          apiEndpoint = ?,
          isActive = ?,
          settings = ?,
          updatedAt = datetime('now')
        WHERE id = ?`,
        [
          name,
          provider,
          finalApiKey || null,
          apiEndpoint || null,
          isActive ? 1 : 0,
          settings ? JSON.stringify(settings) : null,
          id,
        ]
      );

      return NextResponse.json({ success: true, id });
    } else {
      // Create new config
      const newId = crypto.randomUUID();
      
      await runQuery(
        `INSERT INTO VideoSourceConfig (id, name, provider, apiKey, apiEndpoint, isActive, settings)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          name,
          provider,
          apiKey || null,
          apiEndpoint || null,
          isActive !== false ? 1 : 0,
          settings ? JSON.stringify(settings) : null,
        ]
      );

      return NextResponse.json({ success: true, id: newId });
    }
  } catch (error) {
    console.error('Error saving video source config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/video-source/config?id=xxx
 * Delete a video source configuration
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    await runQuery('DELETE FROM VideoSourceConfig WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video source config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
