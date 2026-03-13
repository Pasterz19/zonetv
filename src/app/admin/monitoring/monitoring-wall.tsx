'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Radio,
  Activity,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Grid3X3,
  Grid2X2,
  Square,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  imageUrl: string;
  streamUrl: string;
  groupTitle: string | null;
  enabled: number;
}

interface MonitoringWallProps {
  channels: Channel[];
}

function ChannelPreview({
  channel,
  isPlaying,
  onToggle,
  isMuted,
  onMuteToggle
}: {
  channel: Channel;
  isPlaying: boolean;
  onToggle: () => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error' | 'idle'>('idle');

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (isPlaying) {
      video.src = channel.streamUrl;
      video.load();
      video.play().catch(() => {
        // Use timeout to avoid setState in effect
        setTimeout(() => setStatus('error'), 0);
      });
    } else {
      video.pause();
      video.src = '';
      // Use timeout to avoid setState in effect
      setTimeout(() => setStatus('idle'), 0);
    }
  }, [isPlaying, channel.streamUrl]);

  return (
    <Card className="overflow-hidden border-white/5 bg-white/5 group">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className={cn(
            "w-full h-full object-contain",
            !isPlaying && "hidden"
          )}
          muted={isMuted}
          autoPlay={isPlaying}
          playsInline
          onPlaying={() => setStatus('playing')}
          onError={() => setStatus('error')}
          onWaiting={() => setStatus('loading')}
        />

        {/* Idle State */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {channel.imageUrl ? (
                <Image
                  src={channel.imageUrl}
                  alt={channel.name}
                  width={80}
                  height={80}
                  unoptimized
                  className="mx-auto mb-2 rounded-lg object-contain"
                />
              ) : (
                <Radio className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground">Kliknij aby odtworzyć</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <p className="text-sm text-red-500">Błąd strumienia</p>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="absolute top-2 left-2">
          <Badge
            variant={status === 'playing' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}
            className={cn(
              "text-[10px] uppercase tracking-wider",
              status === 'playing' && "bg-emerald-500"
            )}
          >
            {status === 'playing' ? (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
            ) : status === 'loading' ? (
              'Ładowanie...'
            ) : status === 'error' ? (
              'Błąd'
            ) : (
              'Gotowy'
            )}
          </Badge>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20"
                onClick={onToggle}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20"
                onClick={onMuteToggle}
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20"
              asChild
            >
              <a href={channel.streamUrl} target="_blank" rel="noopener noreferrer">
                <Maximize2 className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{channel.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {channel.groupTitle || 'Bez grupy'}
            </p>
          </div>
          {channel.enabled ? (
            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MonitoringWall({ channels }: MonitoringWallProps) {
  const [playingChannels, setPlayingChannels] = useState<Set<string>>(new Set());
  const [mutedChannels, setMutedChannels] = useState<Set<string>>(new Set());
  const [gridSize, setGridSize] = useState<2 | 3 | 4>(3);
  const [searchTerm, setSearchTerm] = useState('');

  const togglePlay = (channelId: string) => {
    const newPlaying = new Set(playingChannels);
    if (newPlaying.has(channelId)) {
      newPlaying.delete(channelId);
    } else {
      newPlaying.add(channelId);
    }
    setPlayingChannels(newPlaying);
  };

  const toggleMute = (channelId: string) => {
    const newMuted = new Set(mutedChannels);
    if (newMuted.has(channelId)) {
      newMuted.delete(channelId);
    } else {
      newMuted.add(channelId);
    }
    setMutedChannels(newMuted);
  };

  const stopAll = () => {
    setPlayingChannels(new Set());
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.groupTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const playingCount = playingChannels.size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Monitoring <span className="text-primary">TV</span>
          </h1>
          <p className="text-muted-foreground">
            {channels.length} kanałów • {playingCount} odtwarzanych
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid Size */}
          <div className="flex rounded-lg bg-white/5 p-1">
            {[2, 3, 4].map((size) => (
              <Button
                key={size}
                variant={gridSize === size ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGridSize(size as 2 | 3 | 4)}
                className="h-8 px-3"
              >
                {size}x{size}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={stopAll} className="gap-2">
            <Square className="h-4 w-4" />
            Zatrzymaj wszystkie
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Szukaj kanałów..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-4 text-sm"
        />
      </div>

      {/* Grid */}
      <div
        className={cn(
          "grid gap-4",
          gridSize === 2 && "grid-cols-1 md:grid-cols-2",
          gridSize === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          gridSize === 4 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        )}
      >
        {filteredChannels.map((channel) => (
          <ChannelPreview
            key={channel.id}
            channel={channel}
            isPlaying={playingChannels.has(channel.id)}
            onToggle={() => togglePlay(channel.id)}
            isMuted={mutedChannels.has(channel.id)}
            onMuteToggle={() => toggleMute(channel.id)}
          />
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <div className="text-center py-16">
          <Radio className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Brak kanałów do wyświetlenia</p>
        </div>
      )}
    </div>
  );
}
