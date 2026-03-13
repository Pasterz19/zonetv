'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { ChannelCard, Channel } from './channel-card';
import { useTVNavigation, useGridNavigation } from '@/hooks/use-tv-navigation';
import { cn } from '@/lib/utils';

interface ChannelGridProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite?: (channelId: string) => void;
  columns?: number;
}

export function ChannelGrid({
  channels,
  selectedChannelId,
  onSelectChannel,
  onToggleFavorite,
  columns = 4,
}: ChannelGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusSection, setFocusSection] = useState<'grid'>('grid');

  const handleSelect = useCallback((index: number) => {
    const channel = channels[index];
    if (channel) {
      onSelectChannel(channel);
    }
  }, [channels, onSelectChannel]);

  const grid = useGridNavigation(columns, channels.length, handleSelect);

  // Keyboard navigation
  const { isKeyboardNavigation } = useTVNavigation({
    onArrowUp: () => grid.moveUp(),
    onArrowDown: () => grid.moveDown(),
    onArrowLeft: () => grid.moveLeft(),
    onArrowRight: () => grid.moveRight(),
    onEnter: () => grid.select(),
    onSpace: () => grid.select(),
  });

  // Group channels by category for section headers
  const groupedChannels = useMemo(() => {
    const groups = new Map<string, Channel[]>();
    channels.forEach(channel => {
      const group = channel.groupTitle || 'Inne';
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(channel);
    });
    return groups;
  }, [channels]);

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* Grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {channels.map((channel, index) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isFocused={grid.focusIndex === index}
            isSelected={selectedChannelId === channel.id}
            showFocusRing={isKeyboardNavigation}
            onSelect={() => {
              grid.goToIndex(index);
              grid.select();
            }}
            onFocus={() => grid.goToIndex(index)}
            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(channel.id) : undefined}
          />
        ))}
      </div>

      {/* Empty State */}
      {channels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-20 h-20 mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium">Brak kanałów w tej kategorii</p>
        </div>
      )}
    </div>
  );
}
