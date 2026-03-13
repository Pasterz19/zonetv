'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { ChannelGrid, Channel } from './channel-grid';
import { CategoryBar, Category } from './category-bar';
import { TVPlayer, TVPlayerRef } from './tv-player';
import { useTVNavigation, useGridNavigation } from '@/hooks/use-tv-navigation';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { Search, Radio, ArrowLeft, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface TVInterfaceProps {
  channels: Channel[];
  hasSubscription: boolean;
  onToggleFavorite?: (channelId: string) => void;
}

export function TVInterface({ channels, hasSubscription, onToggleFavorite }: TVInterfaceProps) {
  const router = useRouter();
  const playerRef = useRef<TVPlayerRef>(null);
  
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEPG, setShowEPG] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusSection, setFocusSection] = useState<'categories' | 'grid' | 'search'>('grid');
  const [categoryFocusIndex, setCategoryFocusIndex] = useState(0);
  const [gridFocusIndex, setGridFocusIndex] = useState(0);

  // Extract unique categories from channels
  const categories: Category[] = useMemo(() => {
    const groupSet = new Set<string>();
    channels.forEach(ch => {
      if (ch.groupTitle) groupSet.add(ch.groupTitle);
    });

    const cats: Category[] = [
      { id: 'all', name: 'Wszystkie' },
      { id: 'favorites', name: 'Ulubione' },
    ];

    // Add known categories in preferred order
    const preferredOrder = ['Sport', 'Filmy', 'Informacje', 'Rozrywka', 'Muzyka', 'Dla Dzieci'];
    preferredOrder.forEach(name => {
      if (groupSet.has(name) || name === 'Ulubione') {
        cats.push({ id: name.toLowerCase(), name });
      }
    });

    // Add remaining categories
    groupSet.forEach(group => {
      if (!preferredOrder.includes(group)) {
        cats.push({ id: group.toLowerCase(), name: group });
      }
    });

    return cats;
  }, [channels]);

  // Filter channels by category and search
  const filteredChannels = useMemo(() => {
    let filtered = channels;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ch => 
        ch.name.toLowerCase().includes(query) ||
        ch.epgPrograms?.some(p => p.title.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (activeCategory && activeCategory !== 'all') {
      if (activeCategory === 'favorites') {
        filtered = filtered.filter(ch => ch.isFavorite);
      } else {
        filtered = filtered.filter(ch => 
          ch.groupTitle?.toLowerCase() === activeCategory.toLowerCase()
        );
      }
    }

    return filtered;
  }, [channels, activeCategory, searchQuery]);

  // Handle channel selection
  const handleSelectChannel = useCallback((channel: Channel) => {
    if (hasSubscription) {
      setSelectedChannel(channel);
      setIsPlaying(true);
    }
  }, [hasSubscription]);

  // Keyboard navigation
  const { isKeyboardNavigation } = useTVNavigation({
    onArrowUp: () => {
      if (focusSection === 'grid' && gridFocusIndex >= 4) {
        setGridFocusIndex(prev => prev - 4);
      } else if (focusSection === 'grid') {
        setFocusSection('categories');
        setCategoryFocusIndex(0);
      }
    },
    onArrowDown: () => {
      if (focusSection === 'categories') {
        setFocusSection('grid');
        setGridFocusIndex(0);
      } else if (focusSection === 'grid') {
        setGridFocusIndex(prev => Math.min(filteredChannels.length - 1, prev + 4));
      }
    },
    onArrowLeft: () => {
      if (focusSection === 'categories') {
        setCategoryFocusIndex(prev => Math.max(0, prev - 1));
      } else if (focusSection === 'grid') {
        if (gridFocusIndex % 4 === 0) {
          setFocusSection('categories');
        } else {
          setGridFocusIndex(prev => Math.max(0, prev - 1));
        }
      }
    },
    onArrowRight: () => {
      if (focusSection === 'categories') {
        setCategoryFocusIndex(prev => Math.min(categories.length - 1, prev + 1));
      } else if (focusSection === 'grid') {
        setGridFocusIndex(prev => Math.min(filteredChannels.length - 1, prev + 1));
      }
    },
    onEnter: () => {
      if (focusSection === 'categories') {
        const cat = categories[categoryFocusIndex];
        setActiveCategory(cat?.id === 'all' ? null : cat?.id || null);
      } else if (focusSection === 'grid') {
        const channel = filteredChannels[gridFocusIndex];
        if (channel) handleSelectChannel(channel);
      }
    },
    onEscape: () => {
      if (selectedChannel) {
        setSelectedChannel(null);
        setIsPlaying(false);
      } else {
        router.push('/');
      }
    },
    onKeyG: () => {
      setShowEPG(prev => !prev);
    },
  });

  // Auto-select first channel if none selected
  useEffect(() => {
    if (!selectedChannel && filteredChannels.length > 0 && hasSubscription) {
      // Don't auto-select, let user choose
    }
  }, [filteredChannels, selectedChannel, hasSubscription]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1800px] px-4 py-6 md:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">
                TV <span className="text-primary">Live</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                {channels.length} kanałów dostępnych
              </p>
            </div>
          </div>

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Player */}
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              <TVPlayer
                ref={playerRef}
                channel={selectedChannel}
                isPlaying={isPlaying}
                onPlayStateChange={setIsPlaying}
              />

              {/* Subscription Lock Overlay */}
              {selectedChannel && !hasSubscription && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20">
                  <div className="text-center space-y-6 max-w-md p-8">
                    <div className="mx-auto h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                      Tylko dla Subskrybentów
                    </h2>
                    <p className="text-muted-foreground">
                      Ten kanał jest dostępny wyłącznie w pakiecie Premium.
                    </p>
                    <Button asChild size="lg" className="rounded-full">
                      <a href="/dashboard/plans">Kup Subskrypcję</a>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Current Program Info */}
            {selectedChannel && selectedChannel.epgPrograms?.[0] && (
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-white/10 shrink-0">
                    <img
                      src={selectedChannel.imageUrl}
                      alt={selectedChannel.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{selectedChannel.name}</h3>
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        LIVE
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-primary mb-2">
                      {selectedChannel.epgPrograms[0].title}
                    </h4>
                    {selectedChannel.epgPrograms[0].description && (
                      <p className="text-white/70 text-sm line-clamp-2">
                        {selectedChannel.epgPrograms[0].description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Channels List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Categories */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
              <CategoryBar
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={(id) => setActiveCategory(id)}
                focusedIndex={focusSection === 'categories' ? categoryFocusIndex : -1}
                showFocusRing={isKeyboardNavigation}
              />
            </div>

            {/* Search + Channel Grid combined */}
            <div className="bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md overflow-hidden">
              {/* Search Header */}
              <div className="p-3 border-b border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj kanału lub programu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-10 bg-white/5 border-white/10 focus:border-primary/50"
                  />
                  {searchQuery && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSearchQuery('')}
                      onKeyDown={(e) => e.key === 'Enter' && setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-muted-foreground hover:text-white transition-all cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </div>
                  )}
                </div>
                {searchQuery && (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      Znaleziono {filteredChannels.length} z {channels.length} kanałów
                    </p>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSearchQuery('')}
                      onKeyDown={(e) => e.key === 'Enter' && setSearchQuery('')}
                      className="text-xs text-primary hover:text-primary/80 cursor-pointer font-medium"
                    >
                      Wyczyść wyszukiwanie
                    </div>
                  </div>
                )}
              </div>

              {/* Channel Grid */}
              <div className="p-4 max-h-[calc(100vh-420px)] overflow-y-auto">
                <ChannelGrid
                  channels={filteredChannels}
                  selectedChannelId={selectedChannel?.id || null}
                  onSelectChannel={handleSelectChannel}
                  onToggleFavorite={onToggleFavorite}
                  columns={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="fixed bottom-4 right-4 hidden lg:flex items-center gap-2 text-xs text-white/30">
          <span className="px-2 py-1 bg-white/5 rounded">↑↓←→ Nawigacja</span>
          <span className="px-2 py-1 bg-white/5 rounded">Enter Wybierz</span>
          <span className="px-2 py-1 bg-white/5 rounded">F Pełny ekran</span>
          <span className="px-2 py-1 bg-white/5 rounded">M Wycisz</span>
          <span className="px-2 py-1 bg-white/5 rounded">G Przewodnik</span>
        </div>
      </div>
    </div>
  );
}
