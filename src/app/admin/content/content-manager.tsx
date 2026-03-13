'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Film,
  MonitorPlay,
  Radio,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  ChevronRight,
  Globe,
  CheckCircle2,
  Circle,
  Loader2,
  Check,
  Pencil,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  createdAt: string;
}

interface Series {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  releaseYear: number | null;
  createdAt: string;
  seasonCount: number;
  episodeCount: number;
}

interface Channel {
  id: string;
  name: string;
  imageUrl: string;
  streamUrl: string;
  groupTitle: string | null;
  enabled: number;
  createdAt: string;
}

interface ContentManagerProps {
  movies: Movie[];
  series: Series[];
  channels: Channel[];
  createMovie: (formData: FormData) => Promise<void>;
  deleteMovie: (formData: FormData) => Promise<void>;
  deleteManyMovies?: (formData: FormData) => Promise<void>;
  updateMovie: (formData: FormData) => Promise<void>;
  createSeries: (formData: FormData) => Promise<void>;
  deleteSeries: (formData: FormData) => Promise<void>;
  deleteManySeries?: (formData: FormData) => Promise<void>;
  updateSeries: (formData: FormData) => Promise<void>;
  createChannel: (formData: FormData) => Promise<void>;
  deleteChannel: (formData: FormData) => Promise<void>;
  deleteManyChannels?: (formData: FormData) => Promise<void>;
  updateChannel: (formData: FormData) => Promise<void>;
}

function AddContentDialog({
  type,
  onSubmit,
  trigger
}: {
  type: 'movie' | 'series' | 'channel';
  onSubmit: (formData: FormData) => Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await onSubmit(formData);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            {type === 'movie' && 'Dodaj Nowy Film'}
            {type === 'series' && 'Dodaj Nowy Serial'}
            {type === 'channel' && 'Dodaj Nowy Kanał TV'}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          {type === 'movie' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tytuł</label>
                <Input name="title" placeholder="np. Incepcja" required className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kategoria</label>
                <Input name="category" placeholder="np. Sci-Fi" className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Wideo (HLS/MP4)</label>
                <Input name="externalUrl" placeholder="https://..." required className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Okładki</label>
                <Input name="imageUrl" placeholder="https://..." className="bg-white/5 border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rok</label>
                  <Input name="releaseYear" type="number" placeholder="2024" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Czas (min)</label>
                  <Input name="duration" type="number" placeholder="120" className="bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Opis</label>
                <textarea name="description" className="w-full rounded-md bg-white/5 border border-white/10 p-3 text-sm min-h-[80px]" placeholder="Krótki opis filmu..." />
              </div>
            </>
          )}

          {type === 'series' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tytuł</label>
                <Input name="title" placeholder="np. Breaking Bad" required className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kategoria</label>
                <Input name="category" placeholder="np. Dramat" className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Okładki</label>
                <Input name="imageUrl" placeholder="https://..." className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rok Premiery</label>
                <Input name="releaseYear" type="number" placeholder="2024" className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Opis</label>
                <textarea name="description" className="w-full rounded-md bg-white/5 border border-white/10 p-3 text-sm min-h-[80px]" placeholder="Krótki opis serialu..." />
              </div>
            </>
          )}

          {type === 'channel' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nazwa Kanału</label>
                <Input name="name" placeholder="np. Polsat News" required className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Grupa / Kategoria</label>
                <Input name="groupTitle" placeholder="np. Informacyjne" className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Strumienia (M3U8/TS)</label>
                <Input name="streamUrl" placeholder="https://..." required className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Logo</label>
                <Input name="imageUrl" placeholder="https://..." className="bg-white/5 border-white/10" />
              </div>
            </>
          )}

          <Button type="submit" className="w-full h-12 font-bold uppercase tracking-tight" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Utwórz
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Content Dialog Component
function EditContentDialog({
  type,
  data,
  onSubmit,
  trigger
}: {
  type: 'movie' | 'series' | 'channel';
  data: Movie | Series | Channel;
  onSubmit: (formData: FormData) => Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await onSubmit(formData);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            {type === 'movie' && 'Edytuj Film'}
            {type === 'series' && 'Edytuj Serial'}
            {type === 'channel' && 'Edytuj Kanał TV'}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          {/* Hidden ID field */}
          <input type="hidden" name="id" value={data.id} />
          
          {type === 'movie' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tytuł</label>
                <Input name="title" placeholder="np. Incepcja" required className="bg-white/5 border-white/10" defaultValue={(data as Movie).title} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kategoria</label>
                <Input name="category" placeholder="np. Sci-Fi" className="bg-white/5 border-white/10" defaultValue={(data as Movie).category} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Wideo (HLS/MP4)</label>
                <Input name="externalUrl" placeholder="https://..." required className="bg-white/5 border-white/10" defaultValue={(data as Movie).externalUrl} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Okładki</label>
                <Input name="imageUrl" placeholder="https://..." className="bg-white/5 border-white/10" defaultValue={(data as Movie).imageUrl} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rok</label>
                  <Input name="releaseYear" type="number" placeholder="2024" className="bg-white/5 border-white/10" defaultValue={(data as Movie).releaseYear ?? ''} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Czas (min)</label>
                  <Input name="duration" type="number" placeholder="120" className="bg-white/5 border-white/10" defaultValue={(data as Movie).duration ?? ''} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Opis</label>
                <textarea name="description" className="w-full rounded-md bg-white/5 border border-white/10 p-3 text-sm min-h-[80px]" placeholder="Krótki opis filmu..." defaultValue={(data as Movie).description} />
              </div>
            </>
          )}

          {type === 'series' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tytuł</label>
                <Input name="title" placeholder="np. Breaking Bad" required className="bg-white/5 border-white/10" defaultValue={(data as Series).title} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kategoria</label>
                <Input name="category" placeholder="np. Dramat" className="bg-white/5 border-white/10" defaultValue={(data as Series).category} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Okładki</label>
                <Input name="imageUrl" placeholder="https://..." className="bg-white/5 border-white/10" defaultValue={(data as Series).imageUrl} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rok Premiery</label>
                <Input name="releaseYear" type="number" placeholder="2024" className="bg-white/5 border-white/10" defaultValue={(data as Series).releaseYear ?? ''} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Opis</label>
                <textarea name="description" className="w-full rounded-md bg-white/5 border border-white/10 p-3 text-sm min-h-[80px]" placeholder="Krótki opis serialu..." defaultValue={(data as Series).description} />
              </div>
            </>
          )}

          {type === 'channel' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nazwa Kanału</label>
                <Input name="name" placeholder="np. Polsat News" required className="bg-white/5 border-white/10" defaultValue={(data as Channel).name} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Grupa / Kategoria</label>
                <Input name="groupTitle" placeholder="np. Informacyjne" className="bg-white/5 border-white/10" defaultValue={(data as Channel).groupTitle ?? ''} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Strumienia (M3U8/TS)</label>
                <Input name="streamUrl" placeholder="https://..." required className="bg-white/5 border-white/10" defaultValue={(data as Channel).streamUrl} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Logo</label>
                <Input name="imageUrl" placeholder="https://..." className="bg-white/5 border-white/10" defaultValue={(data as Channel).imageUrl} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</label>
                <select name="enabled" className="w-full rounded-md bg-white/5 border border-white/10 p-3 text-sm" defaultValue={(data as Channel).enabled ? 'true' : 'false'}>
                  <option value="true">Aktywny</option>
                  <option value="false">Nieaktywny</option>
                </select>
              </div>
            </>
          )}

          <Button type="submit" className="w-full h-12 font-bold uppercase tracking-tight" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Zapisz zmiany
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContentManager({
  movies,
  series,
  channels,
  createMovie,
  deleteMovie,
  deleteManyMovies,
  updateMovie,
  createSeries,
  deleteSeries,
  deleteManySeries,
  updateSeries,
  createChannel,
  deleteChannel,
  deleteManyChannels,
  updateChannel
}: ContentManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('movies');
  const [selectedMovies, setSelectedMovies] = useState<Set<string>>(new Set());
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set());
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const filterBySearch = <T extends { title?: string; name?: string }>(items: T[]) =>
    items.filter(item =>
      (item.title || item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredMovies = filterBySearch(movies);
  const filteredSeries = filterBySearch(series);
  const filteredChannels = filterBySearch(channels);

  // Movie selection handlers
  const toggleMovieSelection = (movieId: string) => {
    setSelectedMovies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  };

  const toggleAllMovies = () => {
    if (selectedMovies.size === filteredMovies.length) {
      setSelectedMovies(new Set());
    } else {
      setSelectedMovies(new Set(filteredMovies.map(m => m.id)));
    }
  };

  const handleDeleteSelectedMovies = () => {
    if (!deleteManyMovies || selectedMovies.size === 0) return;
    
    const formData = new FormData();
    formData.append('movieIds', JSON.stringify(Array.from(selectedMovies)));
    
    startTransition(async () => {
      await deleteManyMovies(formData);
      setSelectedMovies(new Set());
    });
  };

  // Series selection handlers
  const toggleSeriesSelection = (seriesId: string) => {
    setSelectedSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesId)) {
        newSet.delete(seriesId);
      } else {
        newSet.add(seriesId);
      }
      return newSet;
    });
  };

  const toggleAllSeries = () => {
    if (selectedSeries.size === filteredSeries.length) {
      setSelectedSeries(new Set());
    } else {
      setSelectedSeries(new Set(filteredSeries.map(s => s.id)));
    }
  };

  const handleDeleteSelectedSeries = () => {
    if (!deleteManySeries || selectedSeries.size === 0) return;
    
    const formData = new FormData();
    formData.append('seriesIds', JSON.stringify(Array.from(selectedSeries)));
    
    startTransition(async () => {
      await deleteManySeries(formData);
      setSelectedSeries(new Set());
    });
  };

  // Channel selection handlers
  const toggleChannelSelection = (channelId: string) => {
    setSelectedChannels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channelId)) {
        newSet.delete(channelId);
      } else {
        newSet.add(channelId);
      }
      return newSet;
    });
  };

  const toggleAllChannels = () => {
    if (selectedChannels.size === filteredChannels.length) {
      setSelectedChannels(new Set());
    } else {
      setSelectedChannels(new Set(filteredChannels.map(c => c.id)));
    }
  };

  const handleDeleteSelectedChannels = () => {
    if (!deleteManyChannels || selectedChannels.size === 0) return;
    
    const formData = new FormData();
    formData.append('channelIds', JSON.stringify(Array.from(selectedChannels)));
    
    startTransition(async () => {
      await deleteManyChannels(formData);
      setSelectedChannels(new Set());
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Zarządzanie <span className="text-primary">Treścią</span>
          </h1>
          <p className="text-muted-foreground">
            Dodawaj, edytuj i usuwaj filmy, seriale oraz kanały TV.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-white/5 border-white/10"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl h-12">
            <TabsTrigger value="movies" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              <Film className="h-4 w-4 mr-2" /> Filmy ({filteredMovies.length})
            </TabsTrigger>
            <TabsTrigger value="series" className="rounded-lg px-6 font-bold data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <MonitorPlay className="h-4 w-4 mr-2" /> Seriale ({filteredSeries.length})
            </TabsTrigger>
            <TabsTrigger value="channels" className="rounded-lg px-6 font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Radio className="h-4 w-4 mr-2" /> Kanały ({filteredChannels.length})
            </TabsTrigger>
          </TabsList>

          <AddContentDialog
            type={activeTab === 'movies' ? 'movie' : activeTab === 'series' ? 'series' : 'channel'}
            onSubmit={activeTab === 'movies' ? createMovie : activeTab === 'series' ? createSeries : createChannel}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Dodaj {activeTab === 'movies' ? 'Film' : activeTab === 'series' ? 'Serial' : 'Kanał'}
              </Button>
            }
          />
        </div>

        {/* Movies Tab */}
        <TabsContent value="movies" className="space-y-4">
          {/* Selection Header */}
          {filteredMovies.length > 0 && (
            <>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 flex-wrap">
                {/* Select All Button */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={toggleAllMovies}
                  onKeyDown={(e) => e.key === 'Enter' && toggleAllMovies()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-sm font-medium transition-colors cursor-pointer"
                >
                  {selectedMovies.size === filteredMovies.length ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Odznacz wszystkie</span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-5 w-5 text-muted-foreground" />
                      <span>Zaznacz wszystkie ({filteredMovies.length})</span>
                    </>
                  )}
                </div>
                
                {/* Badge showing count */}
                <span className="text-sm text-muted-foreground">
                  {selectedMovies.size > 0 ? `${selectedMovies.size} zaznaczonych` : 'Nic nie zaznaczono'}
                </span>
              </div>
              
              {/* Delete Button - SEPARATE ROW FOR VISIBILITY */}
              {selectedMovies.size > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-400">
                    Wybrano {selectedMovies.size} filmów do usunięcia
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedMovies}
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all bg-red-600 hover:bg-red-700 text-white ml-auto"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Usuń zaznaczone ({selectedMovies.size})
                  </button>
                </div>
              )}
            </>
          )}

          {filteredMovies.length === 0 ? (
            <div className="text-center py-16">
              <Film className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Brak filmów w bibliotece</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredMovies.map((movie) => {
                const isSelected = selectedMovies.has(movie.id);
                return (
                  <div
                    key={movie.id}
                    onClick={() => toggleMovieSelection(movie.id)}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                      isSelected 
                        ? "bg-primary/10 border-primary/30" 
                        : "bg-white/5 border-white/5 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                        isSelected 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "border-input bg-background"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="relative h-16 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {movie.imageUrl ? (
                          <Image src={movie.imageUrl} alt="" fill unoptimized className="object-cover" />
                        ) : (
                          <Film className="h-6 w-6 m-auto text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold">{movie.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{movie.category}</Badge>
                          {movie.externalUrl && (
                            <span className="truncate max-w-[200px]">{movie.externalUrl.slice(0, 30)}...</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <EditContentDialog
                        type="movie"
                        data={movie}
                        onSubmit={updateMovie}
                        trigger={
                          <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-blue-500/10 hover:text-blue-400">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-white/10">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <form action={deleteMovie}>
                        <input type="hidden" name="movieId" value={movie.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Series Tab */}
        <TabsContent value="series" className="space-y-4">
          {/* Selection Header */}
          {filteredSeries.length > 0 && (
            <>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 flex-wrap">
                {/* Select All Button */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={toggleAllSeries}
                  onKeyDown={(e) => e.key === 'Enter' && toggleAllSeries()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-sm font-medium transition-colors cursor-pointer"
                >
                  {selectedSeries.size === filteredSeries.length ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-purple-500" />
                      <span>Odznacz wszystkie</span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-5 w-5 text-muted-foreground" />
                      <span>Zaznacz wszystkie ({filteredSeries.length})</span>
                    </>
                  )}
                </div>
                
                {/* Badge showing count */}
                <span className="text-sm text-muted-foreground">
                  {selectedSeries.size > 0 ? `${selectedSeries.size} zaznaczonych` : 'Nic nie zaznaczono'}
                </span>
              </div>
              
              {/* Delete Button - SEPARATE ROW FOR VISIBILITY */}
              {selectedSeries.size > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-400">
                    Wybrano {selectedSeries.size} seriali do usunięcia
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedSeries}
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all bg-red-600 hover:bg-red-700 text-white ml-auto"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Usuń zaznaczone ({selectedSeries.size})
                  </button>
                </div>
              )}
            </>
          )}

          {filteredSeries.length === 0 ? (
            <div className="text-center py-16">
              <MonitorPlay className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Brak seriali w bibliotece</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredSeries.map((item) => {
                const isSelected = selectedSeries.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSeriesSelection(item.id)}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                      isSelected 
                        ? "bg-purple-500/10 border-purple-500/30" 
                        : "bg-white/5 border-white/5 hover:border-purple-500/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                        isSelected 
                          ? "bg-purple-500 border-purple-500 text-white" 
                          : "border-input bg-background"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="relative h-16 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt="" fill unoptimized className="object-cover" />
                        ) : (
                          <MonitorPlay className="h-6 w-6 m-auto text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold">{item.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          <span>{item.seasonCount} sezonów • {item.episodeCount} odcinków</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <EditContentDialog
                        type="series"
                        data={item}
                        onSubmit={updateSeries}
                        trigger={
                          <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-purple-500/10 hover:text-purple-400">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-white/10">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <form action={deleteSeries}>
                        <input type="hidden" name="seriesId" value={item.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          {/* Selection Header */}
          {filteredChannels.length > 0 && (
            <>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 flex-wrap">
                {/* Select All Button */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={toggleAllChannels}
                  onKeyDown={(e) => e.key === 'Enter' && toggleAllChannels()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-sm font-medium transition-colors cursor-pointer"
                >
                  {selectedChannels.size === filteredChannels.length ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-amber-500" />
                      <span>Odznacz wszystkie</span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-5 w-5 text-muted-foreground" />
                      <span>Zaznacz wszystkie ({filteredChannels.length})</span>
                    </>
                  )}
                </div>
                
                {/* Badge showing count */}
                <span className="text-sm text-muted-foreground">
                  {selectedChannels.size > 0 ? `${selectedChannels.size} zaznaczonych` : 'Nic nie zaznaczono'}
                </span>
              </div>
              
              {/* Delete Button - SEPARATE ROW FOR VISIBILITY */}
              {selectedChannels.size > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-400">
                    Wybrano {selectedChannels.size} kanałów do usunięcia
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedChannels}
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all bg-red-600 hover:bg-red-700 text-white ml-auto"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Usuń zaznaczone ({selectedChannels.size})
                  </button>
                </div>
              )}
            </>
          )}

          {filteredChannels.length === 0 ? (
            <div className="text-center py-16">
              <Radio className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Brak kanałów TV</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredChannels.map((channel) => {
                const isSelected = selectedChannels.has(channel.id);
                return (
                  <div
                    key={channel.id}
                    onClick={() => toggleChannelSelection(channel.id)}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                      isSelected 
                        ? "bg-amber-500/10 border-amber-500/30" 
                        : "bg-white/5 border-white/5 hover:border-amber-500/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                        isSelected 
                          ? "bg-amber-500 border-amber-500 text-white" 
                          : "border-input bg-background"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white/10 p-2 flex-shrink-0">
                        {channel.imageUrl ? (
                          <Image src={channel.imageUrl} alt="" fill unoptimized className="object-contain" />
                        ) : (
                          <Radio className="h-full w-full text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold">{channel.name}</h4>
                          {channel.enabled ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px]">AKTYWNY</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">NIEAKTYWNY</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {channel.groupTitle || 'Bez grupy'} • {channel.streamUrl.slice(0, 40)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <EditContentDialog
                        type="channel"
                        data={channel}
                        onSubmit={updateChannel}
                        trigger={
                          <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-amber-500/10 hover:text-amber-400">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-white/10">
                        <Globe className="h-4 w-4" />
                      </Button>
                      <form action={deleteChannel}>
                        <input type="hidden" name="channelId" value={channel.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
