import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/server/db';
import ZAI from 'z-ai-web-dev-sdk';

export const dynamic = 'force-dynamic';

interface ContentItem {
  id: string;
  title: string;
  type: 'movie' | 'series';
  category: string;
  description: string;
  imageUrl: string;
  rating: number | null;
  releaseYear: number | null;
}

/**
 * GET /api/recommendations
 * Get personalized content recommendations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Get user's watch history and favorites
    const userId = session?.user?.id;
    
    let watchHistory: { contentId: string; contentType: string; title: string; category: string }[] = [];
    let favorites: { contentId: string; contentType: string; title: string; category: string }[] = [];
    let preferredCategories: { category: string; count: number }[] = [];
    
    if (userId) {
      // Get watch history
      watchHistory = await query<{
        contentId: string;
        contentType: string;
        title: string;
        category: string;
      }>(
        `SELECT 
          wh.contentId, wh.contentType,
          COALESCE(m.title, s.title) as title,
          COALESCE(m.category, s.category) as category
         FROM WatchHistory wh
         LEFT JOIN Movie m ON wh.contentId = m.id AND wh.contentType = 'MOVIE'
         LEFT JOIN Series s ON wh.contentId = s.id AND wh.contentType = 'SERIES'
         WHERE wh.userId = ?
         ORDER BY wh.watchedAt DESC
         LIMIT 20`,
        [userId]
      );

      // Get favorites
      favorites = await query<{
        contentId: string;
        contentType: string;
        title: string;
        category: string;
      }>(
        `SELECT 
          f.contentId, f.contentType,
          COALESCE(m.title, s.title) as title,
          COALESCE(m.category, s.category) as category
         FROM Favorite f
         LEFT JOIN Movie m ON f.contentId = m.id AND f.contentType = 'MOVIE'
         LEFT JOIN Series s ON f.contentId = s.id AND f.contentType = 'SERIES'
         WHERE f.userId = ?`,
        [userId]
      );

      // Get preferred categories based on watch history
      preferredCategories = await query<{ category: string; count: number }>(
        `SELECT category, COUNT(*) as count
         FROM (
           SELECT m.category
           FROM WatchHistory wh
           JOIN Movie m ON wh.contentId = m.id AND wh.contentType = 'MOVIE'
           WHERE wh.userId = ?
           UNION ALL
           SELECT s.category
           FROM WatchHistory wh
           JOIN Series s ON wh.contentId = s.id AND wh.contentType = 'SERIES'
           WHERE wh.userId = ?
           UNION ALL
           SELECT m.category
           FROM Favorite f
           JOIN Movie m ON f.contentId = m.id AND f.contentType = 'MOVIE'
           WHERE f.userId = ?
           UNION ALL
           SELECT s.category
           FROM Favorite f
           JOIN Series s ON f.contentId = s.id AND f.contentType = 'SERIES'
           WHERE f.userId = ?
         )
         GROUP BY category
         ORDER BY count DESC
         LIMIT 5`,
        [userId, userId, userId, userId]
      );
    }

    // Get all available content
    const movies = await query<{
      id: string;
      title: string;
      category: string;
      description: string;
      imageUrl: string;
      rating: number | null;
      releaseYear: number | null;
    }>(
      `SELECT id, title, category, description, imageUrl, rating, releaseYear
       FROM Movie
       WHERE isPublished = 1
       ORDER BY rating DESC, createdAt DESC
       LIMIT 100`
    );

    const series = await query<{
      id: string;
      title: string;
      category: string;
      description: string;
      imageUrl: string;
      rating: number | null;
      releaseYear: number | null;
    }>(
      `SELECT id, title, category, description, imageUrl, rating, releaseYear
       FROM Series
       WHERE isPublished = 1
       ORDER BY rating DESC, createdAt DESC
       LIMIT 100`
    );

    const allContent: ContentItem[] = [
      ...movies.map(m => ({ ...m, type: 'movie' as const })),
      ...series.map(s => ({ ...s, type: 'series' as const })),
    ];

    // Get content user has already seen
    const seenIds = new Set([
      ...watchHistory.map(h => h.contentId),
      ...favorites.map(f => f.contentId),
    ]);

    // Filter out seen content
    const unseenContent = allContent.filter(c => !seenIds.has(c.id));

    // Generate recommendations
    let recommendations: ContentItem[] = [];

    if (preferredCategories.length > 0 && unseenContent.length > 0) {
      // Content-based filtering - prioritize preferred categories
      const categoryScores = new Map<string, number>();
      preferredCategories.forEach((c, i) => {
        categoryScores.set(c.category, 5 - i); // Higher score for top categories
      });

      // Score content
      const scoredContent = unseenContent.map(content => {
        const categoryScore = categoryScores.get(content.category) || 0;
        const ratingScore = (content.rating || 0) / 10 * 3;
        const recencyScore = content.releaseYear 
          ? (content.releaseYear - 2000) / 100 
          : 0;
        
        return {
          content,
          score: categoryScore + ratingScore + recencyScore,
        };
      });

      // Sort by score and take top recommendations
      scoredContent.sort((a, b) => b.score - a.score);
      recommendations = scoredContent.slice(0, 20).map(s => s.content);
    } else {
      // Cold start - recommend popular content
      recommendations = unseenContent
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 20);
    }

    // Try to enhance with AI-generated descriptions if available
    if (recommendations.length > 0 && process.env.ZAI_API_KEY) {
      try {
        const zai = await ZAI.create();
        
        // Generate AI-enhanced recommendation reason
        const topRecs = recommendations.slice(0, 5);
        const titles = topRecs.map(r => r.title).join(', ');
        const categories = preferredCategories.map(c => c.category).join(', ');
        
        const prompt = `Jako ekspert filmowy, wyjaśnij w 1-2 zdaniach po polsku dlaczego te tytuły mogą spodobać się użytkownikowi, który lubi kategorie: ${categories || 'różnorodne'}. Tytuły: ${titles}. Odpowiedz krótko i naturalnie.`;

        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'Jesteś ekspertem filmowym. Odpowiadasz krótko i po polsku.' },
            { role: 'user', content: prompt },
          ],
        });

        const aiReason = completion.choices[0]?.message?.content;
        
        return NextResponse.json({
          recommendations: recommendations.map(r => ({
            ...r,
            aiRecommended: true,
          })),
          aiReason,
          basedOn: {
            watchHistoryCount: watchHistory.length,
            favoritesCount: favorites.length,
            preferredCategories: preferredCategories.map(c => c.category),
          },
        });
      } catch (aiError) {
        console.warn('AI enhancement failed:', aiError);
      }
    }

    return NextResponse.json({
      recommendations,
      basedOn: {
        watchHistoryCount: watchHistory.length,
        favoritesCount: favorites.length,
        preferredCategories: preferredCategories.map(c => c.category),
      },
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
