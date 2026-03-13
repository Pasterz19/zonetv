'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Film,
  Search,
  Play,
  Clock,
  Star,
  Calendar,
  Heart,
  TrendingUp,
  Sparkles,
  Grid3X3,
  LayoutList,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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

interface MoviesContentProps {
  movies: Movie[];
  categories: Category[];
  favorites: string[];
  initialQuery: string;
  initialCategory: string;
  isLoggedIn: boolean;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}

function MovieCard({
  movie,
  isFavorite,
  viewMode,
  onToggleFavorite
}: {
  movie: Movie;
  isFavorite: boolean;
  viewMode: 'grid' | 'list';
  onToggleFavorite: (id: string) => void;
}) {
  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all">
        <div className="flex gap-4 p-4">
          <Link href={`/dashboard/movies/${movie.id}`} className="flex-shrink-0">
            <div className="relative h-32 w-24 overflow-hidden rounded-xl">
              <Image
                src={movie.imageUrl || '/placeholder-movie.jpg'}
                alt={movie.title}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link href={`/dashboard/movies/${movie.id}`}>
                  <h3 className="text-lg font-bold hover:text-primary transition-colors">{movie.title}</h3>
                </Link>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {movie.releaseYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {movie.releaseYear}
                    </span>
                  )}
                  {movie.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(movie.duration)}
                    </span>
                  )}
                  {movie.rating && (
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-3 w-3 fill-yellow-500" />
                      {movie.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {movie.category}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(movie.id)}
                className={cn(
                  "flex-shrink-0 rounded-full transition-all",
                  isFavorite ? "text-red-500 hover:text-red-400" : "text-muted-foreground hover:text-red-500"
                )}
              >
                <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {movie.description || 'Brak opisu'}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group relative aspect-[2/3] overflow-hidden rounded-2xl border-none bg-muted/20 transition-all hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-primary/10">
      <Link href={`/dashboard/movies/${movie.id}`}>
        <Image
          src={movie.imageUrl || '/placeholder-movie.jpg'}
          alt={movie.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Rating Badge */}
        {movie.rating && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-yellow-500 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-500" />
            {movie.rating.toFixed(1)}
          </div>
        )}

        {/* Duration Badge */}
        {movie.duration && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {formatDuration(movie.duration)}
          </div>
        )}

        {/* Play Button & Info */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg">
            <Play className="h-5 w-5 fill-current" />
          </div>
          <h3 className="line-clamp-1 font-bold text-white text-shadow">{movie.title}</h3>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>{movie.category}</span>
            {movie.releaseYear && (
              <>
                <span>•</span>
                <span>{movie.releaseYear}</span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggleFavorite(movie.id);
        }}
        className={cn(
          "absolute right-3 top-12 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur transition-all hover:scale-110",
          isFavorite ? "text-red-500" : "text-white/60 hover:text-red-500"
        )}
      >
        <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </button>
    </Card>
  );
}

export function MoviesContent({
  movies: initialMovies,
  categories,
  favorites: initialFavorites,
  initialQuery,
  initialCategory,
  isLoggedIn
}: MoviesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [favorites, setFavorites] = useState(new Set(initialFavorites));
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'title'>('newest');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('query', searchQuery);
    } else {
      params.delete('query');
    }
    router.push(`/movies?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.push(`/movies?${params.toString()}`);
  };

  const toggleFavorite = async (movieId: string) => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    try {
      const isFav = favorites.has(movieId);
      const response = await fetch('/api/favorites', {
        method: isFav ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: movieId, contentType: 'MOVIE' }),
      });

      if (response.ok) {
        const newFavorites = new Set(favorites);
        if (isFav) {
          newFavorites.delete(movieId);
        } else {
          newFavorites.add(movieId);
        }
        setFavorites(newFavorites);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const sortedMovies = [...initialMovies].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-8">
        <div className="text-center max-w-md space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Film className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter uppercase">
              Dostęp tylko dla <span className="text-primary">zalogowanych</span>
            </h2>
            <p className="text-muted-foreground font-medium">
              Zaloguj się aby przeglądać nasz ekskluzywny katalog filmów w jakości 4K.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-full px-12 h-14 text-lg font-bold uppercase tracking-tight"
          >
            <Link href="/auth/login">Zaloguj się teraz</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-[1600px] px-4 py-12 md:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                  <Film className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-5xl font-black tracking-tighter uppercase">
                    Katalog <span className="text-primary">Filmów</span>
                  </h1>
                  <p className="text-muted-foreground font-medium">
                    {initialMovies.length} tytułów dostępnych w Twoim planie
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Szukaj filmów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-12 rounded-2xl bg-white/5 border-white/10 focus:ring-primary focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    router.push('/movies');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>

          {/* Categories */}
          <div className="mt-8 flex flex-wrap gap-2">
            <Button
              variant={!initialCategory ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleCategoryChange('')}
              className="rounded-full px-6 font-bold uppercase tracking-tight"
            >
              Wszystkie
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.category}
                variant={initialCategory === cat.category ? 'default' : 'secondary'}
                size="sm"
                onClick={() => handleCategoryChange(cat.category)}
                className="rounded-full px-6 font-bold uppercase tracking-tight"
              >
                {cat.category}
                <span className="ml-2 opacity-50">{cat.count}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* Toolbar */}
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {sortedMovies.length} {sortedMovies.length === 1 ? 'film' : 'filmów'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                  <SlidersHorizontal className="h-4 w-4" />
                  Sortuj
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  Najnowsze
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                  Najstarsze
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('rating')}>
                  Najlepiej oceniane
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('title')}>
                  Alfabetycznie
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-white/5 p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Grid/List */}
      <div className="mx-auto max-w-[1600px] px-4 pb-12 md:px-8">
        {sortedMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
              <Film className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Brak wyników</h3>
              <p className="text-muted-foreground max-w-xs">
                Nie znaleźliśmy filmów pasujących do Twoich kryteriów.
              </p>
            </div>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/movies">Wyczyść filtry</Link>
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {sortedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={favorites.has(movie.id)}
                viewMode="grid"
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={favorites.has(movie.id)}
                viewMode="list"
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
