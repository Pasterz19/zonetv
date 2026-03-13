import { auth } from '@/lib/auth';
import { query as dbQuery } from '@/server/db';
import { MoviesContent } from './movies-content';

export const dynamic = 'force-dynamic';

interface Movie {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  externalUrl: string;
  duration: number | null;
  releaseYear: number | null;
  rating: number | null;
  createdAt: string;
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

export default async function MoviesPage(props: {
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

  // Get movies
  const moviesRaw = await dbQuery<Movie>(
    `SELECT id, title, category, description, imageUrl, externalUrl, duration, releaseYear, rating, createdAt
     FROM Movie ${whereClause}
     ORDER BY createdAt DESC`,
    params
  );

  // Get categories
  const categoriesRaw = await dbQuery<Category>(
    `SELECT category, COUNT(*) as count FROM Movie WHERE isPublished = 1 GROUP BY category ORDER BY count DESC`
  );

  // Get favorites
  let favorites: string[] = [];
  if (session?.user?.id) {
    const favs = await dbQuery<{ contentId: string }>(
      `SELECT contentId FROM Favorite WHERE userId = ? AND contentType = 'MOVIE'`,
      [session.user.id]
    );
    favorites = favs.map(f => f.contentId);
  }

  // Convert to plain objects for client components
  const movies = moviesRaw.map(m => toPlainObject(m));
  const categories = categoriesRaw.map(c => toPlainObject(c));

  return (
    <MoviesContent
      movies={movies}
      categories={categories}
      favorites={favorites}
      initialQuery={searchQuery}
      initialCategory={categoryFilter}
      isLoggedIn={!!session?.user}
    />
  );
}
