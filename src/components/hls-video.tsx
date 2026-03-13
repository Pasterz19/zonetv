'use client';

import Hls from 'hls.js';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { isM3u8, formatTime } from '@/lib/video-utils';

type HlsVideoProps = {
  src: string;
  className?: string;
  liveBufferSeconds?: number;
  showNativeControls?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  drm?: {
    licenseUrl: string;
    system: 'widevine' | 'playready';
  };
  userId?: string;
  contentId?: string;
  contentType?: 'movie' | 'series' | 'episode';
};

export const HlsVideo = forwardRef<HTMLVideoElement, HlsVideoProps>(function HlsVideo(
  { src, className, liveBufferSeconds = 10, showNativeControls = false, onPlayStateChange, drm, userId, contentId, contentType },
  ref
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastSyncedTimeRef = useRef<number>(0);

  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [bufferLevel, setBufferLevel] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [initialSeekDone, setInitialSeekDone] = useState(false);

  const shouldUseHlsJs = useMemo(() => isM3u8(src) && Hls.isSupported(), [src]);

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, []);

  // 1. Fetch Initial Progress
  useEffect(() => {
    if (!userId || !contentId) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/watch/progress?userId=${userId}&contentId=${contentId}`);
        const data = await res.json();
        if (data.timestamp > 0) {
          lastSyncedTimeRef.current = data.timestamp;
          if (videoRef.current) {
             // We'll seek when metadata is loaded or if it's already ready
             if (videoRef.current.readyState >= 1) {
                videoRef.current.currentTime = data.timestamp;
                setInitialSeekDone(true);
             }
          }
        } else {
          setInitialSeekDone(true);
        }
      } catch (err) {
        console.error('Failed to fetch progress:', err);
        setInitialSeekDone(true);
      }
    };

    fetchProgress();
  }, [userId, contentId]);

  // 2. Periodic Sync Logic
  const syncProgress = useCallback(async (time: number) => {
    if (!userId || !contentId || !contentType) return;
    if (Math.abs(time - lastSyncedTimeRef.current) < 5) return; // Avoid too frequent updates

    try {
      await fetch('/api/watch/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          contentId,
          contentType,
          timestamp: Math.floor(time),
        }),
      });
      lastSyncedTimeRef.current = time;
    } catch (err) {
      console.error('Failed to sync progress:', err);
    }
  }, [userId, contentId, contentType]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (videoRef.current) {
        syncProgress(videoRef.current.currentTime);
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [isPlaying, syncProgress]);

  // Final sync on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.currentTime > 0) {
        const finalTime = videoRef.current.currentTime;
        const data = JSON.stringify({
           userId, contentId, contentType, timestamp: Math.floor(finalTime)
        });
        // Use sendBeacon for more reliable unmount syncing if available
        if (navigator.sendBeacon) {
           navigator.sendBeacon('/api/watch/progress', data);
        }
      }
    };
  }, [userId, contentId, contentType]);

  // Original Player Effects & Callbacks...
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showControls && isPlaying) {
      timer = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [showControls, isPlaying]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBufferLevel((bufferedEnd / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
       setDuration(video.duration);
       // Resume progress if we have it
       if (lastSyncedTimeRef.current > 0 && !initialSeekDone) {
          video.currentTime = lastSyncedTimeRef.current;
          setInitialSeekDone(true);
       }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onPlayStateChange, initialSeekDone]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setStatus('loading');
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (shouldUseHlsJs) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(src));
      hls.on(Hls.Events.MANIFEST_PARSED, () => setStatus('ready'));
      hls.attachMedia(video);
    } else {
      video.src = src;
      video.addEventListener('loadedmetadata', () => setStatus('ready'));
    }
    return () => hlsRef.current?.destroy();
  }, [src, shouldUseHlsJs]);

  return (
    <div ref={containerRef} className={cn('group relative h-full w-full overflow-hidden bg-black rounded-xl', className)} onMouseMove={() => setShowControls(true)}>
      <video ref={videoRef} playsInline className="h-full w-full object-contain" onClick={togglePlay} />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
      <div className={cn('absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 p-6 transition-all', showControls ? 'opacity-100' : 'opacity-0')}>
        <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleSeek} />
        <div className="flex justify-between text-white/60 text-xs mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Button size="icon" variant="ghost" onClick={togglePlay} className="text-white">
          {isPlaying ? <Pause /> : <Play />}
        </Button>
      </div>
    </div>
  );
});