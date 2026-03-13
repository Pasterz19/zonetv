/**
 * TV Utility functions for the ZONEtv interface
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Default TV channel categories with icons
 */
export const TV_CATEGORIES = [
  { id: "all", name: "Wszystkie", icon: "tv" },
  { id: "favorites", name: "Ulubione", icon: "heart" },
  { id: "sport", name: "Sport", icon: "trophy" },
  { id: "filmy", name: "Filmy", icon: "film" },
  { id: "informacje", name: "Informacje", icon: "newspaper" },
  { id: "rozrywka", name: "Rozrywka", icon: "sparkles" },
  { id: "dla-dzieci", name: "Dla Dzieci", icon: "baby" },
  { id: "muzyka", name: "Muzyka", icon: "music" },
  { id: "dokument", name: "Dokument", icon: "book-open" },
  { id: "news", name: "News", icon: "radio" },
] as const;

export type TvCategoryId = (typeof TV_CATEGORIES)[number]["id"];

/**
 * Get category name by id
 */
export function getCategoryName(categoryId: string): string {
  const category = TV_CATEGORIES.find((c) => c.id === categoryId);
  return category?.name ?? categoryId;
}

/**
 * Buffer presets for live streaming
 */
export const BUFFER_PRESETS = [
  { label: "Szybki", seconds: 15, desc: "Dla szybkich łączy" },
  { label: "Średni", seconds: 40, desc: "Dla średnich łączy" },
  { label: "Wolny", seconds: 60, desc: "Dla wolnych łączy" },
] as const;

/**
 * Format duration from seconds
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}

/**
 * Check if a channel is in favorites
 */
export function isChannelFavorite(
  channelId: string,
  favorites: { contentId: string; contentType: string }[]
): boolean {
  return favorites.some(
    (f) => f.contentId === channelId && f.contentType === "CHANNEL"
  );
}

/**
 * Group channels by category
 */
export function groupChannelsByCategory<T extends { groupTitle: string | null }>(
  channels: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  
  for (const channel of channels) {
    const category = channel.groupTitle || "Inne";
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(channel);
  }
  
  return groups;
}

/**
 * Calculate grid position for keyboard navigation
 */
export function calculateGridPosition(
  index: number,
  columns: number
): { row: number; col: number } {
  return {
    row: Math.floor(index / columns),
    col: index % columns,
  };
}

/**
 * Get index from grid position
 */
export function getGridIndex(row: number, col: number, columns: number): number {
  return row * columns + col;
}
