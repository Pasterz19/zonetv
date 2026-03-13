import { NextResponse } from 'next/server';
import { query } from '@/server/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search/categories
 * Get all unique categories from movies, series, and channels
 */
export async function GET() {
  try {
    // Get categories from movies
    const movieCategories = await query<{ category: string }>(
      'SELECT DISTINCT category FROM Movie WHERE isPublished = 1 AND category IS NOT NULL AND category != ""'
    );

    // Get categories from series
    const seriesCategories = await query<{ category: string }>(
      'SELECT DISTINCT category FROM Series WHERE isPublished = 1 AND category IS NOT NULL AND category != ""'
    );

    // Get group titles from channels
    const channelGroups = await query<{ groupTitle: string }>(
      'SELECT DISTINCT groupTitle FROM Channel WHERE enabled = 1 AND groupTitle IS NOT NULL AND groupTitle != ""'
    );

    // Combine and deduplicate
    const allCategories = new Set<string>();

    movieCategories.forEach((m) => allCategories.add(m.category));
    seriesCategories.forEach((s) => allCategories.add(s.category));
    channelGroups.forEach((c) => {
      if (c.groupTitle) allCategories.add(c.groupTitle);
    });

    const categories = Array.from(allCategories).sort();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
