import { NextRequest, NextResponse } from 'next/server';
import { query, runQuery } from '@/server/db';
import { VideoSourceManager, getVideoSourceManager } from '@/lib/video-source';

export const dynamic = 'force-dynamic';

/**
 * POST /api/video-source/auto-refresh
 * Auto-refresh an expired video URL (called by player when URL expires)
 * This endpoint is public but rate-limited and validates the content exists
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, contentType } = body;

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'Missing contentId or contentType' },
        { status: 400 }
      );
    }

    // Validate content type
    const validTypes = ['MOVIE', 'EPISODE'];
    if (!validTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid contentType' },
        { status: 400 }
      );
    }

    // Get content info
    let content: {
      id: string;
      title: string;
      externalUrl: string;
      sourceType: string | null;
      sourceId: string | null;
      sourceExpiresAt: string | null;
    } | null = null;

    if (contentType === 'MOVIE') {
      const results = await query<{
        id: string;
        title: string;
        externalUrl: string;
        sourceType: string | null;
        sourceId: string | null;
        sourceExpiresAt: string | null;
      }>(
        'SELECT id, title, externalUrl, sourceType, sourceId, sourceExpiresAt FROM Movie WHERE id = ?',
        [contentId]
      );
      content = results[0] || null;
    } else if (contentType === 'EPISODE') {
      const results = await query<{
        id: string;
        title: string;
        externalUrl: string;
        sourceType: string | null;
        sourceId: string | null;
        sourceExpiresAt: string | null;
      }>(
        'SELECT id, title, externalUrl, sourceType, sourceId, sourceExpiresAt FROM Episode WHERE id = ?',
        [contentId]
      );
      content = results[0] || null;
    }

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check if URL actually expired or is about to expire (within 5 minutes)
    const fiveMinutes = 5 * 60 * 1000;
    if (content.sourceExpiresAt) {
      const expiresAt = new Date(content.sourceExpiresAt);
      if (expiresAt.getTime() > Date.now() + fiveMinutes) {
        // URL is still valid, no need to refresh
        return NextResponse.json({
          success: true,
          url: content.externalUrl,
          message: 'URL is still valid',
        });
      }
    }

    // Get video source manager
    const manager = await getVideoSourceManager();
    
    // Detect source type if not set
    const sourceType = content.sourceType || VideoSourceManager.detectSourceType(content.externalUrl);
    
    // Sources that don't need refresh
    if (['DIRECT', 'M3U8', 'MP4'].includes(sourceType)) {
      return NextResponse.json({
        success: false,
        error: 'This source type does not support auto-refresh',
        url: content.externalUrl,
      });
    }

    // Extract source ID if not set
    let sourceId = content.sourceId;
    if (!sourceId && sourceType === 'SAVEFILES') {
      sourceId = VideoSourceManager.extractSaveFilesId(content.externalUrl);
    }

    if (!sourceId) {
      sourceId = content.externalUrl;
    }

    // Refresh the URL
    const result = await manager.refreshUrl(sourceType as any, sourceId);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to refresh URL',
      }, { status: 400 });
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
      url: result.newUrl,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('Error in auto-refresh:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/video-source/auto-refresh?contentId=xxx&contentType=MOVIE
 * Check if URL needs refresh and get new URL if needed
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');

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
      sourceExpiresAt: string | null;
    } | null = null;

    if (contentType === 'MOVIE') {
      const results = await query<{
        id: string;
        externalUrl: string;
        sourceType: string | null;
        sourceExpiresAt: string | null;
      }>(
        'SELECT id, externalUrl, sourceType, sourceExpiresAt FROM Movie WHERE id = ?',
        [contentId]
      );
      content = results[0] || null;
    } else if (contentType === 'EPISODE') {
      const results = await query<{
        id: string;
        externalUrl: string;
        sourceType: string | null;
        sourceExpiresAt: string | null;
      }>(
        'SELECT id, externalUrl, sourceType, sourceExpiresAt FROM Episode WHERE id = ?',
        [contentId]
      );
      content = results[0] || null;
    }

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check expiration
    const needsRefresh = content.sourceExpiresAt && 
      new Date(content.sourceExpiresAt).getTime() < Date.now() + 5 * 60 * 1000;

    return NextResponse.json({
      url: content.externalUrl,
      sourceType: content.sourceType,
      expiresAt: content.sourceExpiresAt,
      needsRefresh: needsRefresh,
    });
  } catch (error) {
    console.error('Error checking URL status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
