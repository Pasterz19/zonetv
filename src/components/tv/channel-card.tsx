'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatTimeFromDate, calculateProgress } from '@/lib/video-utils';
import { Heart } from 'lucide-react';

export interface EpgProgram {
  id: string;
  start: Date;
  stop: Date;
  title: string;
  description: string | null;
}

export interface Channel {
  id: string;
  name: string;
  imageUrl: string;
  streamUrl: string | null;
  groupTitle?: string | null;
  epgPrograms: EpgProgram[];
  isFavorite?: boolean;
}

interface ChannelCardProps {
  channel: Channel;
  isFocused: boolean;
  isSelected: boolean;
  showFocusRing: boolean;
  onSelect: () => void;
  onFocus: () => void;
  onToggleFavorite?: () => void;
}

export function ChannelCard({
  channel,
  isFocused,
  isSelected,
  showFocusRing,
  onSelect,
  onFocus,
  onToggleFavorite,
}: ChannelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const currentProgram = channel.epgPrograms?.[0];

  // Update progress bar every minute
  useEffect(() => {
    if (!currentProgram) return;

    const updateProgress = () => {
      setProgress(calculateProgress(currentProgram.start, currentProgram.stop));
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000);
    return () => clearInterval(interval);
  }, [currentProgram]);

  // Scroll into view when focused
  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [isFocused]);

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={isFocused ? 0 : -1}
      onClick={onSelect}
      onMouseEnter={onFocus}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200 cursor-pointer',
        'bg-gradient-to-br from-white/5 to-transparent border',
        'hover:scale-[1.02]',
        // Focus state for keyboard navigation
        isFocused && showFocusRing && 'scale-105 ring-4 ring-primary shadow-2xl shadow-primary/30 z-10',
        isFocused && showFocusRing ? 'border-primary/50' : 'border-white/5',
        // Selected state
        isSelected && !isFocused && 'border-primary/30 bg-primary/5',
        // Default hover
        !isFocused && !isSelected && 'hover:border-white/20'
      )}
    >
      {/* Live Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-600/90 backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
      </div>

      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={cn(
            'absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all',
            channel.isFavorite
              ? 'bg-red-600/90 text-white'
              : 'bg-black/40 text-white/50 hover:text-white hover:bg-black/60'
          )}
        >
          <Heart className={cn('h-4 w-4', channel.isFavorite && 'fill-current')} />
        </button>
      )}

      {/* Channel Logo */}
      <div className="relative h-32 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center p-4">
        {channel.imageUrl ? (
          <Image
            src={channel.imageUrl}
            alt={channel.name}
            fill
            className="object-contain p-4"
            unoptimized
          />
        ) : (
          <div className="text-2xl font-bold text-white/30">{channel.name[0]}</div>
        )}
      </div>

      {/* Channel Info */}
      <div className="flex-1 flex flex-col p-4 space-y-2">
        {/* Channel Name */}
        <h3 className="font-bold text-white truncate">{channel.name}</h3>

        {/* Current Program */}
        {currentProgram ? (
          <div className="flex-1 space-y-1">
            <p className="text-sm text-primary font-medium truncate">{currentProgram.title}</p>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span>{formatTimeFromDate(currentProgram.start)}</span>
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>{formatTimeFromDate(currentProgram.stop)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/30">Brak informacji o programie</p>
        )}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
      )}
    </div>
  );
}
