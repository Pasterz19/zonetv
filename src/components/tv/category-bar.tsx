'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Radio, Film, Trophy, Newspaper, Music, Baby, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Category {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

interface CategoryBarProps {
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  focusedIndex?: number;
  showFocusRing?: boolean;
}

const DEFAULT_ICONS: Record<string, React.ReactNode> = {
  'Wszystkie': <Zap className="h-4 w-4" />,
  'Ulubione': <Heart className="h-4 w-4" />,
  'Filmy': <Film className="h-4 w-4" />,
  'Sport': <Trophy className="h-4 w-4" />,
  'Informacje': <Newspaper className="h-4 w-4" />,
  'Muzyka': <Music className="h-4 w-4" />,
  'Dla Dzieci': <Baby className="h-4 w-4" />,
  'Rozrywka': <Radio className="h-4 w-4" />,
};

export function CategoryBar({
  categories,
  activeCategory,
  onSelectCategory,
  focusedIndex = -1,
  showFocusRing = false,
}: CategoryBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  // Scroll handlers
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && scrollContainerRef.current) {
      const items = scrollContainerRef.current.querySelectorAll('[data-category-item]');
      const targetItem = items[focusedIndex];
      if (targetItem) {
        targetItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
        setTimeout(checkScroll, 300);
      }
    }
  }, [focusedIndex]);

  return (
    <div ref={containerRef} className="relative">
      {/* Left scroll button & gradient */}
      {canScrollLeft && (
        <>
          <div className="absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category, index) => {
          const isActive = activeCategory === category.id;
          const isFocused = focusedIndex === index && showFocusRing;
          const isHovered = hoveredIndex === index;

          return (
            <button
              key={category.id}
              data-category-item
              onClick={() => onSelectCategory(category.id)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200',
                'border backdrop-blur-sm flex-shrink-0',
                // Active state
                isActive && 'bg-primary text-white border-primary shadow-lg shadow-primary/30',
                // Focused state (keyboard)
                isFocused && !isActive && 'ring-2 ring-primary scale-105',
                // Hover state
                isHovered && !isActive && 'bg-white/10 border-white/20',
                // Default state
                !isActive && !isFocused && !isHovered && 'bg-white/5 border-white/5 text-white/70 hover:text-white'
              )}
            >
              {DEFAULT_ICONS[category.name] || category.icon}
              <span>{category.name}</span>
              
              {/* Active indicator */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right scroll button & gradient */}
      {canScrollRight && (
        <>
          <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
