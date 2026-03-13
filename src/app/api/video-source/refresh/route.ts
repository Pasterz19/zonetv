import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query, runQuery } from '@/server/db';
import { VideoSourceManager, getVideoSourceManager } from '@/lib/video-source';

export const dynamic = 'force-dynamic';

/**
 * POST /api/video-source/refresh
 * Refresh a single video URL
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contentId, contentType } = body;

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'Missing contentId or contentType' },
        { status: 400 }
      );
    }

    // Get content info
    let content: {
      id: string;
      externalUrl: string;
      sourceType: string | null;
      sourceId: string | null;
      sourceExpiresAt: string | null;
    } | null = null;

    if (contentType === 'MOVIE') {
      const results = await query<{
        id: string;
        externalUrl: string;
        sourceType: string | null;
        sourceId: string | null;
        sourceExpiresAt: string | null;
      }>(
        'SELECT id, externalUrl, sourceType, sourceId, sourceExpiresAt FROM Movie WHERE id = ?',
        [contentId]
      );
      content = results[0] || null;
    } else if (contentType === 'EPISODE') {
      const results = await query<{
        id: string;
        externalUrl: string;
        sourceType: string | null;
        sourceId: string | null;
        sourceExpiresAt: string | null;
      }>(
        'SELECT id, externalUrl, sourceType, sourceId, sourceExpiresAt FROM Episode WHERE id = ?',
        [contentId]
      );
      content = results[0] || null;
    }

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Get video source manager
    const manager = await getVideoSourceManager();
    
    // Detect source type if not set
    const sourceType = content.sourceType || VideoSourceManager.detectSourceType(content.externalUrl);
    
    // Extract source ID if not set
    let sourceId = content.sourceId;
    if (!sourceId && sourceType === 'SAVEFILES') {
      sourceId = VideoSourceManager.extractSaveFilesId(content.externalUrl);
    }

    if (!sourceId) {
      sourceId = content.externalUrl; // Use full URL as source ID
    }

    // Refresh the URL
    const result = await manager.refreshUrl(sourceType as any, sourceId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to refresh URL' },
        { status: 400 }
      );
    }

    // Update the database
    const now = new Date().toISOString();
    const expiresAt = result.expiresAt?.toISOString() || null;

    if (contentType === 'MOVIE') {
      await runQuery(
        `UPDATE Movie SET 
          externalUrl = ?,
          sourceType = ?,
          sourceId = ?,
          sourceExpiresAt = ?,
          lastRefreshedAt = ?,
          updatedAt = datetime('now')
        WHERE id = ?`,
        [result.newUrl, sourceType, sourceId, expiresAt, now, contentId]
      );
    } else if (contentType === 'EPISODE') {
      await runQuery(
        `UPDATE Episode SET 
          externalUrl = ?,
          sourceType = ?,
          sourceId = ?,
          sourceExpiresAt = ?,
          lastRefreshedAt = ?,
          updatedAt = datetime('now')
        WHERE id = ?`,
        [result.newUrl, sourceType, sourceId, expiresAt, now, contentId]
      );
    }

    return NextResponse.json({
      success: true,
      newUrl: result.newUrl,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('Error refreshing video URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/video-source/refresh
 * Get list of expiring content or bulk refresh
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bulk = searchParams.get('bulk') === 'true';

    if (!bulk) {
      // Return list of expiring content
      const threshold = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

      const [movies, episodes] = await Promise.all([
        query<{
          id: string;
          title: string;
          sourceType: string | null;
          sourceExpiresAt: string | null;
        }>(
          `SELECT id, title, sourceType, sourceExpiresAt 
           FROM Movie 
           WHERE sourceExpiresAt IS NOT NULL AND sourceExpiresAt < ?
           ORDER BY sourceExpiresAt ASC
           LIMIT 50`,
          [threshold]
        ),
        query<{
          id: string;
          title: string;
          sourceType: string | null;
          sourceExpiresAt: string | null;
        }>(
          `SELECT e.id, e.title, e.sourceType, e.sourceExpiresAt
           FROM Episode e
           WHERE e.sourceExpiresAt IS NOT NULL AND e.sourceExpiresAt < ?
           ORDER BY e.sourceExpiresAt ASC
           LIMIT 50`,
          [threshold]
        ),
      ]);

      return NextResponse.json({
        expiringMovies: movies,
        expiringEpisodes: episodes,
      });
    }

    // Bulk refresh
    const manager = await getVideoSourceManager();
    const threshold = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const results = {
      refreshed: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Get expiring movies with SAVEFILES source
    const expiringMovies = await query<{
      id: string;
      title: string;
      externalUrl: string;
      sourceType: string | null;
      sourceId: string | null;
    }>(
      `SELECT id, title, externalUrl, sourceType, sourceId 
       FROM Movie 
       WHERE sourceType = 'SAVEFILES' 
       AND sourceExpiresAt IS NOT NULL 
       AND sourceExpiresAt < ?
       LIMIT 20`,
      [threshold]
    );

    for (const movie of expiringMovies) {
      try {
        const sourceId = movie.sourceId || VideoSourceManager.extractSaveFilesId(movie.externalUrl);
        if (!sourceId) continue;

        const result = await manager.refreshUrl('SAVEFILES', sourceId);
        
        if (result.success && result.newUrl) {
          const now = new Date().toISOString();
          await runQuery(
            `UPDATE Movie SET 
              externalUrl = ?,
              sourceExpiresAt = ?,
              lastRefreshedAt = ?,
              updatedAt = datetime('now')
            WHERE id = ?`,
            [result.newUrl, result.expiresAt?.toISOString() || null, now, movie.id]
          );
          results.refreshed++;
        } else {
          results.failed++;
          results.errors.push(`Movie "${movie.title}": ${result.error}`);
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Movie "${movie.title}": ${error.message}`);
      }
    }

    // Get expiring episodes
    const expiringEpisodes = await query<{
      id: string;
      title: string;
      externalUrl: string;
      sourceType: string | null;
      sourceId: string | null;
    }>(
      `SELECT id, title, externalUrl, sourceType, sourceId 
       FROM Episode 
       WHERE sourceType = 'SAVEFILES' 
       AND sourceExpiresAt IS NOT NULL 
       AND sourceExpiresAt < ?
       LIMIT 20`,
      [threshold]
    );

    for (const episode of expiringEpisodes) {
      try {
        const sourceId = episode.sourceId || VideoSourceManager.extractSaveFilesId(episode.externalUrl);
        if (!sourceId) continue;

        const result = await manager.refreshUrl('SAVEFILES', sourceId);
        
        if (result.success && result.newUrl) {
          const now = new Date().toISOString();
          await runQuery(
            `UPDATE Episode SET 
              externalUrl = ?,
              sourceExpiresAt = ?,
              lastRefreshedAt = ?,
              updatedAt = datetime('now')
            WHERE id = ?`,
            [result.newUrl, result.expiresAt?.toISOString() || null, now, episode.id]
          );
          results.refreshed++;
        } else {
          results.failed++;
          results.errors.push(`Episode "${episode.title}": ${result.error}`);
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Episode "${episode.title}": ${error.message}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in bulk refresh:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
