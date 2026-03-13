'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Film,
  MonitorPlay,
  Star,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Recommendation {
  id: string;
  title: string;
  type: 'movie' | 'series';
  category: string;
  description: string;
  imageUrl: string;
  rating: number | null;
  releaseYear: number | null;
  aiRecommended?: boolean;
}

interface RecommendationsData {
  recommendations: Recommendation[];
  aiReason?: string;
  basedOn: {
    watchHistoryCount: number;
    favoritesCount: number;
    preferredCategories: string[];
  };
}

function RecommendationCard({ item }: { item: Recommendation }) {
  const typeColors = {
    movie: { bg: 'bg-red-500/10', text: 'text-red-500', icon: Film },
    series: { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: MonitorPlay },
  };

  const colors = typeColors[item.type];
  const Icon = colors.icon;

  const href = item.type === 'movie' 
    ? `/dashboard/movies/${item.id}` 
    : `/dashboard/series/${item.id}`;

  return (
    <Link href={href} className="group">
      <Card className="overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all h-full">
        <div className="relative aspect-[2/3] overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className={cn("h-full w-full flex items-center justify-center", colors.bg)}>
              <Icon className={cn("h-12 w-12", colors.text)} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* AI Badge */}
          {item.aiRecommended && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary/80 text-white text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </div>
          )}
          
          {/* Rating */}
          {item.rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-yellow-500 backdrop-blur-sm">
              <Star className="h-3 w-3 fill-yellow-500" />
              {item.rating.toFixed(1)}
            </div>
          )}

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-bold text-white line-clamp-1">{item.title}</h3>
            <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
              <Badge variant="outline" className={cn("text-xs border-0", colors.bg, colors.text)}>
                {item.type === 'movie' ? 'Film' : 'Serial'}
              </Badge>
              {item.releaseYear && <span>{item.releaseYear}</span>}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function RecommendationSkeleton() {
  return (
    <Card className="overflow-hidden border-white/5 bg-white/5">
      <div className="relative aspect-[2/3]">
        <Skeleton className="h-full w-full" />
      </div>
    </Card>
  );
}

export function RecommendationsSection() {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/recommendations');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Nie udało się załadować rekomendacji');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (error) {
    return (
      <Card className="border-white/5 bg-white/5">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={fetchRecommendations} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Spróbuj ponownie
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/5 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Polecane dla Ciebie
          </CardTitle>
          {!loading && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchRecommendations}
              className="gap-1 text-muted-foreground hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Odśwież
            </Button>
          )}
        </div>
        
        {/* AI Reason */}
        {data?.aiReason && (
          <p className="text-sm text-muted-foreground mt-2">{data.aiReason}</p>
        )}
        
        {/* Based on info */}
        {data?.basedOn && !loading && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {data.basedOn.preferredCategories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <RecommendationSkeleton key={i} />
            ))}
          </div>
        ) : data?.recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Film className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              Zacznij oglądać, aby otrzymywać spersonalizowane rekomendacje
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Link href="/movies">
                <Button variant="outline" className="gap-2">
                  <Film className="h-4 w-4" />
                  Filmy
                </Button>
              </Link>
              <Link href="/series">
                <Button variant="outline" className="gap-2">
                  <MonitorPlay className="h-4 w-4" />
                  Seriale
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data?.recommendations.slice(0, 10).map((item) => (
              <RecommendationCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
