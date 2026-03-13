'use client';

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  Settings,
  ChevronUp,
  ChevronDown,
  Loader2,
  Radio,
  Info
} from 'lucide-react';
import { formatTimeFromDate, calculateProgress, isM3u8 } from '@/lib/video-utils';

interface EpgProgram {
  id: string;
  start: Date;
  stop: Date;
  title: string;
  description: string | null;
}

interface Channel {
  id: string;
  name: string;
  imageUrl: string;
  streamUrl: string | null;
  epgPrograms?: EpgProgram[];
}

interface TVPlayerProps {
  channel: Channel | null;
  isPlaying: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  liveBufferSeconds?: number;
  className?: string;
}

export interface TVPlayerRef {
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  setBuffer: (seconds: number) => void;
}

export const TVPlayer = forwardRef<TVPlayerRef, TVPlayerProps>(function TVPlayer(
  { channel, isPlaying, onPlayStateChange, liveBufferSeconds = 15, className },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bufferSeconds, setBufferSeconds] = useState(liveBufferSeconds);
  const [showBufferSettings, setShowBufferSettings] = useState(false);
  const [programProgress, setProgramProgress] = useState(0);

  const currentProgram = channel?.epgPrograms?.[0];

  // Check for missing stream URL
  const missingStreamUrl = channel && !channel.streamUrl;

  // Update program progress
  useEffect(() => {
    if (!currentProgram) return;

    const updateProgress = () => {
      setProgramProgress(calculateProgress(currentProgram.start, currentProgram.stop));
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000);
    return () => clearInterval(interval);
  }, [currentProgram]);

  // Initialize HLS player
  useEffect(() => {
    if (!channel?.streamUrl || !videoRef.current) return;

    const video = videoRef.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Use proxy URL to bypass CORS
    const streamUrl = channel.streamUrl;
    const proxyUrl = `/api/stream?url=${encodeURIComponent(streamUrl)}`;

    console.log('[TV Player] Loading stream:', streamUrl.substring(0, 100));
    console.log('[TV Player] Proxy URL:', proxyUrl.substring(0, 100));

    const useHls = isM3u8(streamUrl) && Hls.isSupported();
    console.log('[TV Player] Using HLS:', useHls, 'HLS supported:', Hls.isSupported());

    if (useHls) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        liveDurationInfinity: true,
        liveBackBufferLength: 0,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1, // Auto quality
        capLevelToPlayerSize: true,
        debug: false, // Set to true for verbose logging
      });

      hlsRef.current = hls;
      hls.attachMedia(video);
      hls.loadSource(proxyUrl);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        console.log('[TV Player] Manifest parsed, levels:', data.levels?.length);
        setIsLoading(false);
        // Seek to live edge with buffer offset
        if (video.duration && bufferSeconds > 0) {
          video.currentTime = Math.max(0, video.duration - bufferSeconds);
        }
        video.play().catch((e) => {
          console.error('[TV Player] Autoplay failed:', e);
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('[TV Player] HLS Error:', {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          url: data.url,
          response: data.response,
        });

        if (data.fatal) {
          let errorMessage = 'Nie można załadować strumienia';
          
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            switch (data.details) {
              case Hls.ErrorDetails.MANIFEST_LOAD_ERROR:
                errorMessage = 'Nie można załadować playlisty - sprawdź URL';
                break;
              case Hls.ErrorDetails.MANIFEST_PARSING_ERROR:
                errorMessage = 'Błąd parsowania playlisty - nieprawidłowy format';
                break;
              case Hls.ErrorDetails.LEVEL_LOAD_ERROR:
                errorMessage = 'Nie można załadować jakości wideo';
                break;
              case Hls.ErrorDetails.FRAG_LOAD_ERROR:
                errorMessage = 'Błąd ładowania segmentu - problemy z siecią';
                break;
              default:
                errorMessage = `Błąd sieci: ${data.details}`;
            }
            
            // Try to recover from network errors
            console.log('[TV Player] Attempting to recover from network error...');
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            errorMessage = 'Błąd dekodowania - nieobsługiwany format';
            // Try to recover from media errors
            console.log('[TV Player] Attempting to recover from media error...');
            hls.recoverMediaError();
          } else {
            errorMessage = `Błąd HLS: ${data.details}`;
          }
          
          setError(errorMessage);
          setIsLoading(false);
        }
      });

      hls.on(Hls.Events.FRAG_LOAD_EMERGENCY_ABORTED, () => {
        console.warn('[TV Player] Fragment load emergency aborted - buffer full');
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      console.log('[TV Player] Using native HLS (Safari)');
      video.src = proxyUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (video.duration && bufferSeconds > 0) {
          video.currentTime = Math.max(0, video.duration - bufferSeconds);
        }
        video.play().catch(() => {});
      });
      video.addEventListener('error', (e) => {
        console.error('[TV Player] Native HLS error:', e);
        setError('Nie można załadować strumienia');
        setIsLoading(false);
      });
    } else {
      // For non-HLS streams, try direct URL with proxy
      console.log('[TV Player] Using direct video source');
      video.src = proxyUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(() => {});
      });
      video.addEventListener('error', (e) => {
        console.error('[TV Player] Video error:', e);
        setError('Nie można załadować strumienia - możliwy błąd CORS lub nieprawidłowy URL');
        setIsLoading(false);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel?.streamUrl, bufferSeconds]);

  // Auto-hide controls
  const hideControls = useCallback(() => {
    if (isPlaying && !showBufferSettings) {
      setShowControls(false);
    }
  }, [isPlaying, showBufferSettings]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  }, [hideControls]);

  // Show controls when playback state changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowControls(true);
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Exposed methods
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  const setBuffer = useCallback((seconds: number) => {
    setBufferSeconds(seconds);
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.duration - seconds);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    togglePlay,
    toggleMute,
    toggleFullscreen,
    setBuffer,
  }));

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      showControlsTemporarily();
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
            setVolume(videoRef.current.volume);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
            setVolume(videoRef.current.volume);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, showControlsTemporarily]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const bufferPresets = [
    { label: 'Szybki', seconds: 15, desc: 'Minimalne opóźnienie' },
    { label: 'Średni', seconds: 40, desc: 'Zbalansowany' },
    { label: 'Wolny', seconds: 60, desc: 'Maksymalna stabilność' },
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full bg-black overflow-hidden group',
        isFullscreen && 'fixed inset-0 z-50',
        className
      )}
      onMouseMove={showControlsTemporarily}
      onClick={showControlsTemporarily}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
        onPlay={() => onPlayStateChange?.(true)}
        onPause={() => onPlayStateChange?.(false)}
        suppressHydrationWarning
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-center text-white">
            <p className="text-lg font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary rounded-lg text-white"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      )}

      {/* No Channel Selected */}
      {!channel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
          <Radio className="h-20 w-20 mb-4" />
          <p className="text-lg">Wybierz kanał aby rozpocząć oglądanie</p>
        </div>
      )}

      {/* Missing Stream URL */}
      {missingStreamUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white max-w-md p-8">
            <Info className="h-16 w-16 mx-auto mb-4 text-amber-500" />
            <p className="text-xl font-bold mb-2">Brak URL strumienia</p>
            <p className="text-white/70 text-sm">
              Ten kanał nie ma skonfigurowanego adresu strumienia. 
              Skontaktuj się z administratorem.
            </p>
          </div>
        </div>
      )}

      {/* Live Badge */}
      {channel && !isLoading && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          'absolute inset-0 z-10 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Top Gradient */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />

        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          {/* Channel Info */}
          {channel && currentProgram && (
            <div className="hidden md:block ml-20 mt-12 bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-white/10 max-w-md">
              <h3 className="text-lg font-bold text-white">{currentProgram.title}</h3>
              <p className="text-sm text-white/70 mt-1 line-clamp-2">{currentProgram.description}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-white/50">
                <span>{formatTimeFromDate(currentProgram.start)}</span>
                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${programProgress}%` }}
                  />
                </div>
                <span>{formatTimeFromDate(currentProgram.stop)}</span>
              </div>
            </div>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setShowBufferSettings(!showBufferSettings)}
            className="p-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-black/60 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Buffer Settings Panel */}
        {showBufferSettings && (
          <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 p-4 w-64">
            <h4 className="text-sm font-bold text-white mb-3">Ustawienia bufora</h4>
            <div className="space-y-2">
              {bufferPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setBuffer(preset.seconds);
                    setShowBufferSettings(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                    bufferSeconds === preset.seconds
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  )}
                >
                  <div>
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-xs ml-2 text-white/50">({preset.seconds}s)</span>
                  </div>
                  <span className="text-xs text-white/50">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-colors"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-colors"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <div className="hidden md:flex items-center gap-2 w-24">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    if (videoRef.current) {
                      videoRef.current.volume = newVolume;
                      setIsMuted(newVolume === 0);
                    }
                  }}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Channel Name */}
            {channel && (
              <div className="hidden md:flex items-center gap-2 ml-4">
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/10">
                  <img
                    src={channel.imageUrl}
                    alt={channel.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-white font-bold">{channel.name}</span>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Buffer Delay Info */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white/50 text-xs">
              Opóźnienie: ~{bufferSeconds}s
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
