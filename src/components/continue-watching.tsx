'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';

type ProgressItem = {
  id: string;
  timestamp: number;
  updatedAt: string;
  movie?: { id: string; title: string; imageUrl: string; duration: number };
  series?: { id: string; title: string; imageUrl: string };
  episode?: { id: string; title: string; imageUrl: string; duration: number; season: { number: number }; number: number };
};

export function ContinueWatching({ userId }: { userId: string }) {
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContinue() {
      try {
        const res = await fetch(`/api/watch/continue?userId=${userId}`);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch continue watching:', err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchContinue();
  }, [userId]);

  if (loading || items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Continue Watching</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => {
          const content = item.movie || item.episode;
          if (!content) return null;
          
          const progress = Math.min(100, (item.timestamp / (content.duration || 1)) * 100);
          const link = item.movie 
            ? `/dashboard/movies/${item.movie.id}?t=${item.timestamp}`
            : `/dashboard/series/${item.series?.id}?episode=${item.episode?.id}&t=${item.timestamp}`;

          return (
            <Link key={item.id} href={link} className="group relative min-w-[280px] overflow-hidden rounded-xl border bg-card transition-all hover:scale-105">
              <div className="aspect-video w-full overflow-hidden">
                <img src={content.imageUrl} alt={content.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="p-3">
                <p className="font-medium truncate">{content.title}</p>
                {item.episode && (
                  <p className="text-xs text-muted-foreground">
                    S{item.episode.season.number} : E{item.episode.number}
                  </p>
                )}
                <div className="mt-2 h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}