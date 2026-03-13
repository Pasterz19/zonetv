import { auth } from '@/lib/auth';
import { query, queryOne } from '@/server/db';
import { redirect } from 'next/navigation';
import {
  Users,
  Film,
  MonitorPlay,
  Radio,
  TrendingUp,
  Clock,
  Activity,
  Server,
  Eye,
  Heart,
  Play,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DashboardStats } from './dashboard-stats';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Get all stats
  const [
    userCount,
    movieCount,
    seriesCount,
    channelCount,
    activeSubs,
    totalFavorites,
    totalWatchProgress
  ] = await Promise.all([
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM User'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Movie WHERE isPublished = 1'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Series WHERE isPublished = 1'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Channel WHERE enabled = 1'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Subscription WHERE active = 1'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Favorite'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM WatchProgress'),
  ]);

  // Get recent users
  const latestUsers = await query<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
  }>(
    `SELECT id, email, name, role, createdAt FROM User ORDER BY createdAt DESC LIMIT 5`
  );

  // Get recent activity
  const recentFavorites = await query<{
    contentId: string;
    contentType: string;
    createdAt: string;
    userEmail: string;
  }>(
    `SELECT f.contentId, f.contentType, f.createdAt, u.email as userEmail
     FROM Favorite f
     JOIN User u ON f.userId = u.id
     ORDER BY f.createdAt DESC LIMIT 5`
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Panel <span className="text-primary">Administracyjny</span>
          </h1>
          <p className="text-muted-foreground">
            Witaj z powrotem! Oto przegląd Twojej platformy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/analytics">
              <BarChart3 className="h-4 w-4" />
              Statystyki
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/admin/content">
              <Film className="h-4 w-4" />
              Dodaj Treść
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Użytkownicy</p>
                <h3 className="text-3xl font-black mt-1">{userCount?.count || 0}</h3>
                <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +12% tym tygodniu
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Subskrypcje</p>
                <h3 className="text-3xl font-black mt-1">{activeSubs?.count || 0}</h3>
                <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  Aktywne
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-purple-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Biblioteka</p>
                <h3 className="text-3xl font-black mt-1">{(movieCount?.count || 0) + (seriesCount?.count || 0)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {movieCount?.count || 0} filmów • {seriesCount?.count || 0} seriali
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
                <Film className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Kanały TV</p>
                <h3 className="text-3xl font-black mt-1">{channelCount?.count || 0}</h3>
                <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Strumieniowanie
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Radio className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalFavorites?.count || 0}</p>
              <p className="text-xs text-muted-foreground">Polubień</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalWatchProgress?.count || 0}</p>
              <p className="text-xs text-muted-foreground">Obejrzanych</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">--</p>
              <p className="text-xs text-muted-foreground">Wyświetleń dziś</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card className="border-white/5 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Ostatni Użytkownicy
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">Zobacz wszystkich</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'ADMIN'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
              {latestUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Brak użytkowników</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-white/5 bg-white/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Ostatnia Aktywność
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentFavorites.map((fav, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {fav.userEmail.split('@')[0]} dodał do ulubionych
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fav.contentType === 'MOVIE' ? 'Film' : fav.contentType === 'SERIES' ? 'Serial' : 'Kanał'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(fav.createdAt).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              ))}
              {recentFavorites.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Brak ostatniej aktywności</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-white/5 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Szybkie Akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link
              href="/admin/content?tab=movies"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all"
            >
              <Film className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Dodaj Film</span>
            </Link>
            <Link
              href="/admin/content?tab=series"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all"
            >
              <MonitorPlay className="h-8 w-8 text-purple-500" />
              <span className="text-sm font-medium">Dodaj Serial</span>
            </Link>
            <Link
              href="/admin/content?tab=channels"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-white/10 transition-all"
            >
              <Radio className="h-8 w-8 text-amber-500" />
              <span className="text-sm font-medium">Dodaj Kanał</span>
            </Link>
            <Link
              href="/admin/importer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all"
            >
              <Zap className="h-8 w-8 text-emerald-500" />
              <span className="text-sm font-medium">Importuj Treści</span>
            </Link>
            <Link
              href="/admin/payments"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all"
            >
              <CreditCard className="h-8 w-8 text-blue-500" />
              <span className="text-sm font-medium">Płatności</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
