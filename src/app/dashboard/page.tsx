import { auth } from '@/lib/auth';
import { queryOne, query } from '@/server/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Film,
  MonitorPlay,
  Radio,
  Heart,
  Play,
  Settings,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Favorite {
  contentId: string;
  contentType: string;
}

interface Movie {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

interface Series {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

interface Channel {
  id: string;
  name: string;
  imageUrl: string;
  groupTitle: string | null;
}

interface Subscription {
  active: number;
  planId: string;
  planName: string;
  endsAt: string | null;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Get user data
  const user = await queryOne<User>(
    'SELECT id, email, name, role FROM User WHERE id = ?',
    [session.user.id]
  );

  if (!user) {
    redirect('/');
  }

  // Get subscription
  const subscription = await queryOne<Subscription>(
    `SELECT s.active, s.planId, s.endsAt, p.name as planName
     FROM Subscription s
     JOIN SubscriptionPlan p ON s.planId = p.id
     WHERE s.userId = ?
     ORDER BY s.startedAt DESC LIMIT 1`,
    [user.id]
  );

  const isSubscriptionActive = subscription?.active === 1 &&
    (!subscription.endsAt || new Date(subscription.endsAt) > new Date());

  // Get favorites
  const favorites = await query<Favorite>(
    'SELECT contentId, contentType FROM Favorite WHERE userId = ?',
    [user.id]
  );

  const favoriteMovieIds = favorites
    .filter(f => f.contentType === 'MOVIE')
    .map(f => f.contentId);

  const favoriteSeriesIds = favorites
    .filter(f => f.contentType === 'SERIES')
    .map(f => f.contentId);

  const favoriteChannelIds = favorites
    .filter(f => f.contentType === 'CHANNEL')
    .map(f => f.contentId);

  // Get favorite content
  let favoriteMovies: Movie[] = [];
  let favoriteSeries: Series[] = [];
  let favoriteChannels: Channel[] = [];

  if (favoriteMovieIds.length > 0) {
    const placeholders = favoriteMovieIds.map(() => '?').join(',');
    favoriteMovies = await query<Movie>(
      `SELECT id, title, imageUrl, category FROM Movie WHERE id IN (${placeholders})`,
      favoriteMovieIds
    );
  }

  if (favoriteSeriesIds.length > 0) {
    const placeholders = favoriteSeriesIds.map(() => '?').join(',');
    favoriteSeries = await query<Series>(
      `SELECT id, title, imageUrl, category FROM Series WHERE id IN (${placeholders})`,
      favoriteSeriesIds
    );
  }

  if (favoriteChannelIds.length > 0) {
    const placeholders = favoriteChannelIds.map(() => '?').join(',');
    favoriteChannels = await query<Channel>(
      `SELECT id, name, imageUrl, groupTitle FROM Channel WHERE id IN (${placeholders})`,
      favoriteChannelIds
    );
  }

  // Get totals
  const [totalMovies, totalSeries, totalChannels] = await Promise.all([
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Movie WHERE isPublished = 1'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Series WHERE isPublished = 1'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Channel WHERE enabled = 1'),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              Mój <span className="text-primary">Panel</span>
            </h1>
            <p className="text-muted-foreground">
              Witaj, {user.name || user.email.split('@')[0]}!
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user.role === 'ADMIN' && (
              <Link href="/admin">
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Panel Admina
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Subscription Banner */}
        {isSubscriptionActive && subscription && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">Plan: {subscription.planName}</p>
                  {subscription.endsAt && (
                    <p className="text-sm text-muted-foreground">
                      Ważny do: {new Date(subscription.endsAt).toLocaleDateString('pl-PL')}
                    </p>
                  )}
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500">
                Aktywny
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Film className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filmy</p>
                <p className="text-2xl font-bold">{totalMovies?.count || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <MonitorPlay className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seriale</p>
                <p className="text-2xl font-bold">{totalSeries?.count || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Radio className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TV Live</p>
                <p className="text-2xl font-bold">{totalChannels?.count || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ulubione</p>
                <p className="text-2xl font-bold">{favorites.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Szybki Dostęp</h2>
          <div className="grid grid-cols-3 gap-4">
            <Link href="/movies">
              <Card className="border-white/5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center gap-2">
                  <Film className="h-8 w-8 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Filmy</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/series">
              <Card className="border-white/5 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 transition-all cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center gap-2">
                  <MonitorPlay className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Seriale</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/tv">
              <Card className="border-white/5 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center gap-2">
                  <Radio className="h-8 w-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">TV Live</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Favorites */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Moje Ulubione</h2>

          {favorites.length === 0 ? (
            <Card className="border-white/5 bg-white/5">
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Twoja lista ulubionych jest pusta</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Dodaj filmy, seriale lub kanały do ulubionych, aby je tutaj widzieć
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Favorite Movies */}
              {favoriteMovies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Film className="h-5 w-5 text-red-500" />
                    Filmy ({favoriteMovies.length})
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {favoriteMovies.map((movie) => (
                      <Link
                        key={movie.id}
                        href={`/dashboard/movies/${movie.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-colors"
                      >
                        <div className="relative h-16 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {movie.imageUrl ? (
                            <Image src={movie.imageUrl} alt={movie.title} fill unoptimized className="object-cover" />
                          ) : (
                            <Film className="h-6 w-6 m-auto text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{movie.title}</p>
                          <p className="text-xs text-muted-foreground">{movie.category}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Series */}
              {favoriteSeries.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MonitorPlay className="h-5 w-5 text-purple-500" />
                    Seriale ({favoriteSeries.length})
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {favoriteSeries.map((series) => (
                      <Link
                        key={series.id}
                        href={`/dashboard/series/${series.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="relative h-16 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {series.imageUrl ? (
                            <Image src={series.imageUrl} alt={series.title} fill unoptimized className="object-cover" />
                          ) : (
                            <MonitorPlay className="h-6 w-6 m-auto text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{series.title}</p>
                          <p className="text-xs text-muted-foreground">{series.category}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Channels */}
              {favoriteChannels.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Radio className="h-5 w-5 text-emerald-500" />
                    Kanały TV ({favoriteChannels.length})
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {favoriteChannels.map((channel) => (
                      <Link
                        key={channel.id}
                        href="/tv"
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors"
                      >
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white/10 p-1 flex-shrink-0">
                          {channel.imageUrl ? (
                            <Image src={channel.imageUrl} alt={channel.name} fill unoptimized className="object-contain" />
                          ) : (
                            <Radio className="h-6 w-6 m-auto text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{channel.name}</p>
                          <p className="text-xs text-muted-foreground">{channel.groupTitle || 'TV'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
