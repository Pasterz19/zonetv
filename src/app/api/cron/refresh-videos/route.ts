import { NextRequest, NextResponse } from 'next/server';
import { query, runQuery } from '@/server/db';
import { VideoSourceManager, getVideoSourceManager } from '@/lib/video-source';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/refresh-videos
 * Cron job endpoint to automatically refresh expiring video URLs
 * 
 * Security: Should be called with a CRON_SECRET header
 * Configure in your cron service (Vercel Cron, cron-job.org, etc.)
 * 
 * Recommended schedule: Every hour
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;
    
    // In development, allow without secret
    // In production, require secret
    if (process.env.NODE_ENV === 'production' && expectedSecret) {
      if (!cronSecret || cronSecret !== expectedSecret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const manager = await getVideoSourceManager();
    const results = {
      refreshed: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
      details: [] as { type: string; id: string; title: string; status: string }[],
    };

    // Find content expiring in the next 2 hours
    const threshold = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    // Get expiring movies
    const expiringMovies = await query<{
      id: string;
      title: string;
      externalUrl: string;
      sourceType: string | null;
      sourceId: string | null;
    }>(
      `SELECT id, title, externalUrl, sourceType, sourceId 
       FROM Movie 
       WHERE sourceExpiresAt IS NOT NULL 
       AND sourceExpiresAt < ?
       AND isPublished = 1
       ORDER BY sourceExpiresAt ASC
       LIMIT 50`,
      [threshold]
    );

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
       WHERE sourceExpiresAt IS NOT NULL 
       AND sourceExpiresAt < ?
       AND isPublished = 1
       ORDER BY sourceExpiresAt ASC
       LIMIT 50`,
      [threshold]
    );

    // Process movies
    for (const movie of expiringMovies) {
      try {
        const sourceType = movie.sourceType || VideoSourceManager.detectSourceType(movie.externalUrl);
        
        // Skip sources that don't need refresh
        if (['DIRECT', 'M3U8', 'MP4'].includes(sourceType)) {
          results.skipped++;
          results.details.push({
            type: 'movie',
            id: movie.id,
            title: movie.title,
            status: 'skipped (no refresh needed)',
          });
          continue;
        }

        const sourceId = movie.sourceId || 
          (sourceType === 'SAVEFILES' ? VideoSourceManager.extractSaveFilesId(movie.externalUrl) : movie.externalUrl);

        if (!sourceId) {
          results.skipped++;
          results.details.push({
            type: 'movie',
            id: movie.id,
            title: movie.title,
            status: 'skipped (no source ID)',
          });
          continue;
        }

        const refreshResult = await manager.refreshUrl(sourceType as any, sourceId);

        if (refreshResult.success && refreshResult.newUrl) {
          const now = new Date().toISOString();
          await runQuery(
            `UPDATE Movie SET 
              externalUrl = ?,
              sourceType = ?,
              sourceId = ?,
              sourceExpiresAt = ?,
              lastRefreshedAt = ?,
              updatedAt = datetime('now')
            WHERE id = ?`,
            [
              refreshResult.newUrl,
              sourceType,
              sourceId,
              refreshResult.expiresAt?.toISOString() || null,
              now,
              movie.id
            ]
          );
          results.refreshed++;
          results.details.push({
            type: 'movie',
            id: movie.id,
            title: movie.title,
            status: 'refreshed',
          });
        } else {
          results.failed++;
          results.errors.push(`Movie "${movie.title}": ${refreshResult.error}`);
          results.details.push({
            type: 'movie',
            id: movie.id,
            title: movie.title,
            status: `failed: ${refreshResult.error}`,
          });
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Movie "${movie.title}": ${error.message}`);
        results.details.push({
          type: 'movie',
          id: movie.id,
          title: movie.title,
          status: `error: ${error.message}`,
        });
      }
    }

    // Process episodes
    for (const episode of expiringEpisodes) {
      try {
        const sourceType = episode.sourceType || VideoSourceManager.detectSourceType(episode.externalUrl);
        
        // Skip sources that don't need refresh
        if (['DIRECT', 'M3U8', 'MP4'].includes(sourceType)) {
          results.skipped++;
          results.details.push({
            type: 'episode',
            id: episode.id,
            title: episode.title,
            status: 'skipped (no refresh needed)',
          });
          continue;
        }

        const sourceId = episode.sourceId || 
          (sourceType === 'SAVEFILES' ? VideoSourceManager.extractSaveFilesId(episode.externalUrl) : episode.externalUrl);

        if (!sourceId) {
          results.skipped++;
          results.details.push({
            type: 'episode',
            id: episode.id,
            title: episode.title,
            status: 'skipped (no source ID)',
          });
          continue;
        }

        const refreshResult = await manager.refreshUrl(sourceType as any, sourceId);

        if (refreshResult.success && refreshResult.newUrl) {
          const now = new Date().toISOString();
          await runQuery(
            `UPDATE Episode SET 
              externalUrl = ?,
              sourceType = ?,
              sourceId = ?,
              sourceExpiresAt = ?,
              lastRefreshedAt = ?,
              updatedAt = datetime('now')
            WHERE id = ?`,
            [
              refreshResult.newUrl,
              sourceType,
              sourceId,
              refreshResult.expiresAt?.toISOString() || null,
              now,
              episode.id
            ]
          );
          results.refreshed++;
          results.details.push({
            type: 'episode',
            id: episode.id,
            title: episode.title,
            status: 'refreshed',
          });
        } else {
          results.failed++;
          results.errors.push(`Episode "${episode.title}": ${refreshResult.error}`);
          results.details.push({
            type: 'episode',
            id: episode.id,
            title: episode.title,
            status: `failed: ${refreshResult.error}`,
          });
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Episode "${episode.title}": ${error.message}`);
        results.details.push({
          type: 'episode',
          id: episode.id,
          title: episode.title,
          status: `error: ${error.message}`,
        });
      }
    }

    // Log results
    console.log('[CRON] Video refresh completed:', {
      refreshed: results.refreshed,
      failed: results.failed,
      skipped: results.skipped,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        refreshed: results.refreshed,
        failed: results.failed,
        skipped: results.skipped,
        totalProcessed: expiringMovies.length + expiringEpisodes.length,
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
      details: results.details,
    });
  } catch (error) {
    console.error('[CRON] Error in video refresh:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
