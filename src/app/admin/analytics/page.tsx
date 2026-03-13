import { auth } from '@/lib/auth';
import { query, queryOne } from '@/server/db';
import { redirect } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Film,
  MonitorPlay,
  Radio,
  Heart,
  Play,
  Calendar,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsChart } from './analytics-chart';

export const dynamic = 'force-dynamic';

// Helper to convert libsql results to plain objects
function toPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  // Get comprehensive stats
  const [
    totalUsers,
    totalMovies,
    totalSeries,
    totalChannels,
    totalFavorites,
    totalWatchProgress,
    activeSubscriptions,
    usersByMonthRaw,
    favoritesByTypeRaw
  ] = await Promise.all([
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM User'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Movie'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Series'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Channel'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Favorite'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM WatchProgress'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Subscription WHERE active = 1'),
    query<{ month: string; count: number }>(
      `SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count
       FROM User
       WHERE createdAt >= datetime('now', '-12 months')
       GROUP BY month
       ORDER BY month ASC`
    ),
    query<{ contentType: string; count: number }>(
      `SELECT contentType, COUNT(*) as count FROM Favorite GROUP BY contentType`
    )
  ]);

  // Convert to plain objects
  const usersByMonth = usersByMonthRaw.map(u => toPlainObject(u));
  const favoritesByType = favoritesByTypeRaw.map(f => toPlainObject(f));

  const favoritesStats = {
    movies: favoritesByType.find(f => f.contentType === 'MOVIE')?.count || 0,
    series: favoritesByType.find(f => f.contentType === 'SERIES')?.count || 0,
    channels: favoritesByType.find(f => f.contentType === 'CHANNEL')?.count || 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">
          Statystyki & <span className="text-primary">Analityka</span>
        </h1>
        <p className="text-muted-foreground">
          Przegląd aktywności i wzrostów platformy
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/5 bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Użytkownicy</p>
                <h3 className="text-3xl font-black mt-1">{totalUsers?.count || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aktywne Subskrypcje</p>
                <h3 className="text-3xl font-black mt-1">{activeSubscriptions?.count || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-gradient-to-br from-red-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Polubienia</p>
                <h3 className="text-3xl font-black mt-1">{totalFavorites?.count || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center">
                <Heart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-gradient-to-br from-purple-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Obejrzane</p>
                <h3 className="text-3xl font-black mt-1">{totalWatchProgress?.count || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
                <Play className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats */}
      <Card className="border-white/5 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Biblioteka Treści</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <Film className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMovies?.count || 0}</p>
                <p className="text-sm text-muted-foreground">Filmów</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <MonitorPlay className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSeries?.count || 0}</p>
                <p className="text-sm text-muted-foreground">Seriali</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalChannels?.count || 0}</p>
                <p className="text-sm text-muted-foreground">Kanałów TV</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <Card className="border-white/5 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Wzrost Użytkowników (12 mies.)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={usersByMonth.map(u => ({
                label: u.month,
                value: u.count
              }))}
              type="line"
              color="blue"
            />
          </CardContent>
        </Card>

        {/* Favorites Distribution */}
        <Card className="border-white/5 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Rozkład Ulubionych
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Filmy</span>
                  <span className="text-muted-foreground">{favoritesStats.movies}</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${totalFavorites?.count ? (favoritesStats.movies / totalFavorites.count) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Seriale</span>
                  <span className="text-muted-foreground">{favoritesStats.series}</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${totalFavorites?.count ? (favoritesStats.series / totalFavorites.count) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Kanały</span>
                  <span className="text-muted-foreground">{favoritesStats.channels}</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${totalFavorites?.count ? (favoritesStats.channels / totalFavorites.count) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-white/5 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Aktywność w Czasie Rzeczywistym
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Funkcja w trakcie rozwoju</p>
            <p className="text-sm">Wkrótce będziesz widzieć aktywność użytkowników w czasie rzeczywistym</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
