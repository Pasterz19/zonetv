import { auth } from '@/lib/auth';
import { queryOne, query } from '@/server/db';
import { redirect, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Film,
  Play,
  Clock,
  Calendar,
  Star,
  Heart,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoviePlayer } from './movie-player';

export const dynamic = 'force-dynamic';

// Helper to convert libsql results to plain objects
function toPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

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
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const { id } = await params;

  const movie = await queryOne<Movie>(
    'SELECT id, title, category, description, imageUrl, externalUrl, duration, releaseYear, rating FROM Movie WHERE id = ?',
    [id]
  );

  if (!movie) {
    notFound();
  }

  // Check if in favorites
  const favorite = await queryOne<{ id: string }>(
    'SELECT id FROM Favorite WHERE userId = ? AND contentId = ? AND contentType = ?',
    [session.user.id, movie.id, 'MOVIE']
  );

  const isFavorite = !!favorite;

  // Get related movies
  const relatedMovies = await query<Movie>(
    'SELECT id, title, category, imageUrl, rating FROM Movie WHERE category = ? AND id != ? AND isPublished = 1 ORDER BY RANDOM() LIMIT 6',
    [movie.category, movie.id]
  );

  // Get watch progress
  const progress = await queryOne<{ timestamp: number }>(
    'SELECT timestamp FROM WatchProgress WHERE userId = ? AND movieId = ?',
    [session.user.id, movie.id]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <Image
            src={movie.imageUrl || '/placeholder-movie.jpg'}
            alt={movie.title}
            fill
            unoptimized
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        <div className="absolute top-4 left-4 z-10">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 bg-black/50 backdrop-blur">
              <ArrowLeft className="h-4 w-4" />
              Powrót
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-[1600px] mx-auto">
            <Badge className="mb-4">{movie.category}</Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {movie.releaseYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {movie.releaseYear}
                </span>
              )}
              {movie.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}min
                </span>
              )}
              {movie.rating && (
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-yellow-500" />
                  {movie.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Player */}
            <MoviePlayer
              movie={toPlainObject(movie)}
              initialTimestamp={progress?.timestamp || 0}
              userId={session.user.id}
            />

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Opis</h2>
              <p className="text-muted-foreground leading-relaxed">
                {movie.description || 'Brak opisu dla tego filmu.'}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex gap-2">
              <form action="/api/favorites" method="POST">
                <input type="hidden" name="contentId" value={movie.id} />
                <input type="hidden" name="contentType" value="MOVIE" />
                <Button
                  type="submit"
                  variant={isFavorite ? 'default' : 'outline'}
                  className="w-full gap-2"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'W ulubionych' : 'Dodaj do ulubionych'}
                </Button>
              </form>
            </div>

            {/* Related Movies */}
            {relatedMovies.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Podobne filmy</h3>
                <div className="space-y-3">
                  {relatedMovies.map((m) => (
                    <Link
                      key={m.id}
                      href={`/dashboard/movies/${m.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="relative h-16 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                        {m.imageUrl && (
                          <Image src={m.imageUrl} alt={m.title} fill unoptimized className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.category}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
