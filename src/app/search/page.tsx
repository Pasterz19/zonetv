'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search as SearchIcon,
  Film,
  MonitorPlay,
  Radio,
  X,
  SlidersHorizontal,
  Star,
  Calendar,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'channel';
  category: string;
  description: string;
  imageUrl: string;
  releaseYear?: number;
  rating?: number;
  duration?: number;
  groupTitle?: string;
}

interface SearchFilters {
  type: 'all' | 'movie' | 'series' | 'channel';
  category: string;
  yearFrom: number;
  yearTo: number;
  ratingMin: number;
  sortBy: 'relevance' | 'newest' | 'rating' | 'title';
}

const currentYear = new Date().getFullYear();

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}

function ResultCard({ result }: { result: SearchResult }) {
  const typeColors = {
    movie: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'hover:border-red-500/30' },
    series: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'hover:border-purple-500/30' },
    channel: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'hover:border-emerald-500/30' },
  };

  const colors = typeColors[result.type];

  const href = result.type === 'movie' 
    ? `/dashboard/movies/${result.id}`
    : result.type === 'series'
    ? `/dashboard/series/${result.id}`
    : '/tv';

  return (
    <Link href={href}>
      <Card className={cn(
        "group overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer",
        colors.border
      )}>
        <div className="flex gap-4 p-4">
          <div className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
            {result.imageUrl ? (
              <Image
                src={result.imageUrl}
                alt={result.title}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className={cn("h-full w-full flex items-center justify-center", colors.bg)}>
                {result.type === 'movie' && <Film className={cn("h-8 w-8", colors.text)} />}
                {result.type === 'series' && <MonitorPlay className={cn("h-8 w-8", colors.text)} />}
                {result.type === 'channel' && <Radio className={cn("h-8 w-8", colors.text)} />}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                  {result.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn("text-xs", colors.text, colors.bg)}>
                    {result.type === 'movie' ? 'Film' : result.type === 'series' ? 'Serial' : 'Kanał TV'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {result.category}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              {result.releaseYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {result.releaseYear}
                </span>
              )}
              {result.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(result.duration)}
                </span>
              )}
              {result.rating && (
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-3 w-3 fill-yellow-500" />
                  {result.rating.toFixed(1)}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {result.description || result.groupTitle || 'Brak opisu'}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function SearchSkeleton() {
  return (
    <Card className="border-white/5 bg-white/5">
      <div className="flex gap-4 p-4">
        <Skeleton className="h-28 w-20 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </Card>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<SearchFilters>({
    type: (searchParams.get('type') as any) || 'all',
    category: searchParams.get('category') || '',
    yearFrom: parseInt(searchParams.get('yearFrom') || '1900'),
    yearTo: parseInt(searchParams.get('yearTo') || String(currentYear)),
    ratingMin: parseInt(searchParams.get('ratingMin') || '0'),
    sortBy: (searchParams.get('sort') as any) || 'relevance',
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/search/categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim() && searchFilters.type === 'all' && !searchFilters.category) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (searchFilters.type !== 'all') params.set('type', searchFilters.type);
      if (searchFilters.category) params.set('category', searchFilters.category);
      if (searchFilters.yearFrom > 1900) params.set('yearFrom', String(searchFilters.yearFrom));
      if (searchFilters.yearTo < currentYear) params.set('yearTo', String(searchFilters.yearTo));
      if (searchFilters.ratingMin > 0) params.set('ratingMin', String(searchFilters.ratingMin));
      if (searchFilters.sortBy !== 'relevance') params.set('sort', searchFilters.sortBy);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update URL params
  const updateUrl = useCallback((newQuery: string, newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newFilters.type !== 'all') params.set('type', newFilters.type);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.yearFrom > 1900) params.set('yearFrom', String(newFilters.yearFrom));
    if (newFilters.yearTo < currentYear) params.set('yearTo', String(newFilters.yearTo));
    if (newFilters.ratingMin > 0) params.set('ratingMin', String(newFilters.ratingMin));
    if (newFilters.sortBy !== 'relevance') params.set('sort', newFilters.sortBy);

    const url = params.toString() ? `/search?${params.toString()}` : '/search';
    router.push(url, { scroll: false });
  }, [router]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, filters);
      updateUrl(query, filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filters, performSearch, updateUrl]);

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: '',
      yearFrom: 1900,
      yearTo: currentYear,
      ratingMin: 0,
      sortBy: 'relevance',
    });
  };

  const hasActiveFilters = filters.type !== 'all' || filters.category || 
    filters.yearFrom > 1900 || filters.yearTo < currentYear || filters.ratingMin > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tighter uppercase">
            <span className="text-primary">Wyszukiwanie</span> Zaawansowane
          </h1>
          <p className="text-muted-foreground mt-2">
            Szukaj filmów, seriali i kanałów TV w całej bibliotece
          </p>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Wpisz tytuł, aktora, reżysera..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 pl-12 pr-12 text-lg rounded-2xl bg-white/5 border-white/10 focus:ring-primary focus:border-primary"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtry
            {hasActiveFilters && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">!</Badge>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Wyczyść filtry
              </Button>
            )}
            <Select
              value={filters.sortBy}
              onValueChange={(v) => setFilters({ ...filters, sortBy: v as any })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sortuj" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Trafność</SelectItem>
                <SelectItem value="newest">Najnowsze</SelectItem>
                <SelectItem value="rating">Ocena</SelectItem>
                <SelectItem value="title">Alfabetycznie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 border-white/5 bg-white/5">
            <CardContent className="p-6 space-y-6">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Typ zawartości</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'Wszystkie' },
                    { value: 'movie', label: 'Filmy' },
                    { value: 'series', label: 'Seriale' },
                    { value: 'channel', label: 'Kanały TV' },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={filters.type === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters({ ...filters, type: option.value as any })}
                      className="rounded-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategoria</label>
                <Select
                  value={filters.category}
                  onValueChange={(v) => setFilters({ ...filters, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Wszystkie kategorie</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Rok produkcji: {filters.yearFrom} - {filters.yearTo}
                </label>
                <div className="flex items-center gap-4">
                  <Select
                    value={String(filters.yearFrom)}
                    onValueChange={(v) => setFilters({ ...filters, yearFrom: parseInt(v) })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Od" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i).map((year) => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">do</span>
                  <Select
                    value={String(filters.yearTo)}
                    onValueChange={(v) => setFilters({ ...filters, yearTo: parseInt(v) })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Do" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i).map((year) => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Minimalna ocena: {filters.ratingMin > 0 ? `${filters.ratingMin}/10` : 'Dowolna'}
                </label>
                <Slider
                  value={[filters.ratingMin]}
                  onValueChange={(v) => setFilters({ ...filters, ratingMin: v[0] })}
                  max={10}
                  step={1}
                  className="w-full max-w-md"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="space-y-4">
          {/* Results Header */}
          {!loading && results.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Znaleziono {results.length} {results.length === 1 ? 'wynik' : results.length < 5 ? 'wyniki' : 'wyników'}
            </p>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SearchSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result) => (
                <ResultCard key={`${result.type}-${result.id}`} result={result} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && query && results.length === 0 && (
            <div className="text-center py-16">
              <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-bold mb-2">Brak wyników</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Nie znaleźliśmy treści pasujących do Twojego wyszukiwania. Spróbuj innych słów kluczowych lub wyłącz niektóre filtry.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Wyczyść filtry
                </Button>
              )}
            </div>
          )}

          {/* Initial State */}
          {!loading && !query && results.length === 0 && (
            <div className="text-center py-16">
              <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-bold mb-2">Wyszukaj treści</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Wpisz frazę wyszukiwania lub użyj filtrów, aby znaleźć filmy, seriale i kanały TV.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
