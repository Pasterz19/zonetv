/**
 * Shared video utility functions used across player components.
 */

/**
 * Extracts a YouTube video ID from a URL.
 * Supports youtube.com/watch?v=... and youtu.be/... formats.
 */
export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v');
    }
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1);
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Checks if a URL points to an HLS manifest (.m3u8).
 */
export function isM3u8(url: string): boolean {
  return url.toLowerCase().includes('.m3u8');
}

/**
 * Formats seconds into a MM:SS string for player UI.
 */
export function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/**
 * Formats date to time string (HH:MM)
 */
export function formatTimeFromDate(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Calculates progress percentage for EPG timeline
 */
export function calculateProgress(start: Date, stop: Date): number {
  const now = new Date();
  const total = stop.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
