import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/server/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=query&type=all&category=&yearFrom=1900&yearTo=2024&ratingMin=0&sort=relevance
 * Search across movies, series, and channels with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const category = searchParams.get('category') || '';
    const yearFrom = parseInt(searchParams.get('yearFrom') || '1900');
    const yearTo = parseInt(searchParams.get('yearTo') || String(new Date().getFullYear()));
    const ratingMin = parseFloat(searchParams.get('ratingMin') || '0');
    const sort = searchParams.get('sort') || 'relevance';

    const results: any[] = [];

    // Search movies
    if (type === 'all' || type === 'movie') {
      let movieQuery = `
        SELECT 
          id, title, 'movie' as type, category, description, imageUrl, 
          releaseYear, rating, duration
        FROM Movie 
        WHERE isPublished = 1
      `;
      const movieParams: any[] = [];

      if (q) {
        movieQuery += ` AND (title LIKE ? OR description LIKE ?)`;
        movieParams.push(`%${q}%`, `%${q}%`);
      }

      if (category) {
        movieQuery += ` AND category = ?`;
        movieParams.push(category);
      }

      if (yearFrom > 1900) {
        movieQuery += ` AND (releaseYear IS NULL OR releaseYear >= ?)`;
        movieParams.push(yearFrom);
      }

      if (yearTo < new Date().getFullYear()) {
        movieQuery += ` AND (releaseYear IS NULL OR releaseYear <= ?)`;
        movieParams.push(yearTo);
      }

      if (ratingMin > 0) {
        movieQuery += ` AND (rating IS NULL OR rating >= ?)`;
        movieParams.push(ratingMin);
      }

      const movies = await query<{
        id: string;
        title: string;
        type: string;
        category: string;
        description: string;
        imageUrl: string;
        releaseYear: number | null;
        rating: number | null;
        duration: number | null;
      }>(movieQuery, movieParams);

      results.push(...movies);
    }

    // Search series
    if (type === 'all' || type === 'series') {
      let seriesQuery = `
        SELECT 
          id, title, 'series' as type, category, description, imageUrl, 
          releaseYear, rating, NULL as duration
        FROM Series 
        WHERE isPublished = 1
      `;
      const seriesParams: any[] = [];

      if (q) {
        seriesQuery += ` AND (title LIKE ? OR description LIKE ?)`;
        seriesParams.push(`%${q}%`, `%${q}%`);
      }

      if (category) {
        seriesQuery += ` AND category = ?`;
        seriesParams.push(category);
      }

      if (yearFrom > 1900) {
        seriesQuery += ` AND (releaseYear IS NULL OR releaseYear >= ?)`;
        seriesParams.push(yearFrom);
      }

      if (yearTo < new Date().getFullYear()) {
        seriesQuery += ` AND (releaseYear IS NULL OR releaseYear <= ?)`;
        seriesParams.push(yearTo);
      }

      if (ratingMin > 0) {
        seriesQuery += ` AND (rating IS NULL OR rating >= ?)`;
        seriesParams.push(ratingMin);
      }

      const series = await query<{
        id: string;
        title: string;
        type: string;
        category: string;
        description: string;
        imageUrl: string;
        releaseYear: number | null;
        rating: number | null;
        duration: null;
      }>(seriesQuery, seriesParams);

      results.push(...series);
    }

    // Search channels
    if (type === 'all' || type === 'channel') {
      let channelQuery = `
        SELECT 
          id, name as title, 'channel' as type, 
          COALESCE(groupTitle, 'TV') as category, 
          '' as description, imageUrl, 
          NULL as releaseYear, NULL as rating, NULL as duration,
          groupTitle
        FROM Channel 
        WHERE enabled = 1
      `;
      const channelParams: any[] = [];

      if (q) {
        channelQuery += ` AND (name LIKE ? OR groupTitle LIKE ?)`;
        channelParams.push(`%${q}%`, `%${q}%`);
      }

      if (category && category !== 'TV') {
        channelQuery += ` AND groupTitle = ?`;
        channelParams.push(category);
      }

      const channels = await query<{
        id: string;
        title: string;
        type: string;
        category: string;
        description: string;
        imageUrl: string;
        releaseYear: null;
        rating: null;
        duration: null;
        groupTitle: string | null;
      }>(channelQuery, channelParams);

      results.push(...channels);
    }

    // Sort results
    switch (sort) {
      case 'newest':
        results.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
        break;
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'title':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'relevance':
      default:
        // For relevance, prioritize exact matches and then partial matches
        if (q) {
          const lowerQ = q.toLowerCase();
          results.sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            const aExact = aTitle === lowerQ;
            const bExact = bTitle === lowerQ;
            const aStarts = aTitle.startsWith(lowerQ);
            const bStarts = bTitle.startsWith(lowerQ);
            
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            // Then sort by rating
            return (b.rating || 0) - (a.rating || 0);
          });
        } else {
          // No query - sort by rating
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
        break;
    }

    // Limit results
    const limitedResults = results.slice(0, 50);

    return NextResponse.json({ 
      results: limitedResults,
      total: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
