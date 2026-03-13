'use client';

import { HlsVideo } from '@/components/hls-video';
import { getYouTubeId, isM3u8 } from '@/lib/video-utils';

type EpisodePlayerProps = {
  externalUrl: string;
  userId?: string;
  contentId?: string;
  contentType?: 'movie' | 'series' | 'episode';
};

export function EpisodePlayer({ 
  externalUrl, 
  userId, 
  contentId, 
  contentType = 'episode' 
}: EpisodePlayerProps) {
  const ytId = getYouTubeId(externalUrl);

  if (ytId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (isM3u8(externalUrl)) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
        <HlsVideo
          src={externalUrl}
          showNativeControls={false}
          className="h-full w-full"
          liveBufferSeconds={20}
          userId={userId}
          contentId={contentId}
          contentType={contentType}
        />
      </div>
    );
  }

  return (
    <video
      src={externalUrl}
      controls
      className="aspect-video w-full rounded-lg border border-border bg-black"
    />
  );
}