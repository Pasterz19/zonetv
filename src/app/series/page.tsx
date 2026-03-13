import { auth } from '@/lib/auth';
import { query as dbQuery } from '@/server/db';
import { SeriesContent } from './series-content';

export const dynamic = 'force-dynamic';

interface Series {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  releaseYear: number | null;
  rating: number | null;
  createdAt: string;
  seasonCount: number;
  episodeCount: number;
}

interface Category {
  category: string;
  count: number;
}

// Helper to convert libsql results to plain objects for Client Components
function toPlainObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(JSON.stringify(obj));
}

export default async function SeriesPage(props: {
  searchParams?: Promise<{ query?: string; category?: string; sort?: string }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const searchQuery = searchParams?.query?.toLowerCase() || '';
  const categoryFilter = searchParams?.category || '';

  // Build WHERE clause
  let whereClause = 'WHERE isPublished = 1';
  const params: string[] = [];

  if (searchQuery) {
    whereClause += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)';
    params.push(`%${searchQuery}%`, `%${searchQuery}%`);
  }

  if (categoryFilter) {
    whereClause += ' AND category = ?';
    params.push(categoryFilter);
  }

  // Get series with season and episode counts
  const seriesRaw = await dbQuery<Series>(
    `SELECT 
      s.id, s.title, s.category, s.description, s.imageUrl, s.releaseYear, s.rating, s.createdAt,
      (SELECT COUNT(*) FROM Season WHERE seriesId = s.id) as seasonCount,
      (SELECT COUNT(*) FROM Episode e JOIN Season se ON e.seasonId = se.id WHERE se.seriesId = s.id) as episodeCount
     FROM Series s
     ${whereClause}
     ORDER BY createdAt DESC`,
    params
  );

  // Get categories
  const categoriesRaw = await dbQuery<Category>(
    `SELECT category, COUNT(*) as count FROM Series WHERE isPublished = 1 GROUP BY category ORDER BY count DESC`
  );

  // Get favorites
  let favorites: string[] = [];
  if (session?.user?.id) {
    const favs = await dbQuery<{ contentId: string }>(
      `SELECT contentId FROM Favorite WHERE userId = ? AND contentType = 'SERIES'`,
      [session.user.id]
    );
    favorites = favs.map(f => f.contentId);
  }

  // Convert to plain objects for client components
  const series = seriesRaw.map(s => toPlainObject(s));
  const categories = categoriesRaw.map(c => toPlainObject(c));

  return (
    <SeriesContent
      series={series}
      categories={categories}
      favorites={favorites}
      initialQuery={searchQuery}
      initialCategory={categoryFilter}
      isLoggedIn={!!session?.user}
    />
  );
}
