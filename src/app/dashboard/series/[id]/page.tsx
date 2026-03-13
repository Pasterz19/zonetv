import { auth } from '@/lib/auth';
import { queryOne, query } from '@/server/db';
import { redirect, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MonitorPlay,
  Play,
  Clock,
  Calendar,
  Star,
  Heart,
  ArrowLeft,
  ChevronRight,
  Layers,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

interface Series {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  releaseYear: number | null;
  rating: number | null;
}

interface Season {
  id: string;
  number: number;
  episodeCount: number;
}

interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  imageUrl: string;
  externalUrl: string;
  duration: number | null;
  seasonNumber: number;
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const { id } = await params;

  // Get series
  const series = await queryOne<Series>(
    'SELECT id, title, category, description, imageUrl, releaseYear, rating FROM Series WHERE id = ?',
    [id]
  );

  if (!series) {
    notFound();
  }

  // Get seasons with episode counts
  const seasons = await query<Season & { episodeCount: number }>(
    `SELECT s.id, s.number, COUNT(e.id) as episodeCount
     FROM Season s
     LEFT JOIN Episode e ON e.seasonId = s.id
     WHERE s.seriesId = ?
     GROUP BY s.id
     ORDER BY s.number ASC`,
    [series.id]
  );

  // Get all episodes
  const episodes = await query<Episode>(
    `SELECT e.id, e.number, e.title, e.description, e.imageUrl, e.externalUrl, e.duration, s.number as seasonNumber
     FROM Episode e
     JOIN Season s ON e.seasonId = s.id
     WHERE s.seriesId = ?
     ORDER BY s.number ASC, e.number ASC`,
    [series.id]
  );

  // Check if in favorites
  const favorite = await queryOne<{ id: string }>(
    'SELECT id FROM Favorite WHERE userId = ? AND contentId = ? AND contentType = ?',
    [session.user.id, series.id, 'SERIES']
  );

  const isFavorite = !!favorite;

  // Group episodes by season
  const episodesBySeason = episodes.reduce((acc, ep) => {
    if (!acc[ep.seasonNumber]) {
      acc[ep.seasonNumber] = [];
    }
    acc[ep.seasonNumber].push(ep);
    return acc;
  }, {} as Record<number, Episode[]>);

  const totalEpisodes = episodes.length;
  const totalSeasons = seasons.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <Image
            src={series.imageUrl || '/placeholder-series.jpg'}
            alt={series.title}
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
            <Badge className="mb-4 bg-purple-500">{series.category}</Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
              {series.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {series.releaseYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {series.releaseYear}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                {totalSeasons} sezonów
              </span>
              <span className="flex items-center gap-1">
                <List className="h-4 w-4" />
                {totalEpisodes} odcinków
              </span>
              {series.rating && (
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-yellow-500" />
                  {series.rating.toFixed(1)}
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
            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {episodes.length > 0 && (
                <Link href={`/dashboard/series/${series.id}/watch?episode=${episodes[0].id}`}>
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Oglądaj
                  </Button>
                </Link>
              )}
              <form action="/api/favorites" method="POST">
                <input type="hidden" name="contentId" value={series.id} />
                <input type="hidden" name="contentType" value="SERIES" />
                <Button
                  type="submit"
                  variant={isFavorite ? 'default' : 'outline'}
                  size="lg"
                  className="gap-2"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'W ulubionych' : 'Dodaj do ulubionych'}
                </Button>
              </form>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Opis</h2>
              <p className="text-muted-foreground leading-relaxed">
                {series.description || 'Brak opisu dla tego serialu.'}
              </p>
            </div>

            {/* Episodes by Season */}
            {totalSeasons > 0 ? (
              <Tabs defaultValue={seasons[0]?.id || 's1'} className="space-y-6">
                <TabsList className="bg-white/5 border border-white/5 rounded-xl h-12 flex-wrap">
                  {seasons.map((season) => (
                    <TabsTrigger
                      key={season.id}
                      value={season.id}
                      className="rounded-lg data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                    >
                      Sezon {season.number}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {seasons.map((season) => (
                  <TabsContent key={season.id} value={season.id} className="space-y-4">
                    <div className="grid gap-3">
                      {(episodesBySeason[season.number] || []).map((episode) => (
                        <Link
                          key={episode.id}
                          href={`/dashboard/series/${series.id}/watch?episode=${episode.id}`}
                          className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors group"
                        >
                          <div className="relative h-24 w-40 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {episode.imageUrl ? (
                              <Image src={episode.imageUrl} alt={episode.title} fill unoptimized className="object-cover" />
                            ) : (
                              <MonitorPlay className="h-8 w-8 m-auto text-muted-foreground" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-10 w-10 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                E{episode.number}
                              </Badge>
                              <h3 className="font-bold truncate">{episode.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {episode.description || 'Brak opisu'}
                            </p>
                            {episode.duration && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.floor(episode.duration / 60)} min
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
                        </Link>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-16">
                <MonitorPlay className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Brak dostępnych odcinków</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Series Info */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <h3 className="font-bold">Informacje</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategoria</span>
                  <span>{series.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sezony</span>
                  <span>{totalSeasons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Odcinki</span>
                  <span>{totalEpisodes}</span>
                </div>
                {series.releaseYear && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rok</span>
                    <span>{series.releaseYear}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
