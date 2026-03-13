'use client';

import { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Loader2,
  Film,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface Movie {
  id: string;
  title: string;
  externalUrl: string;
  duration: number | null;
}

interface MoviePlayerProps {
  movie: Movie;
  initialTimestamp: number;
  userId: string;
}

type PlayerError = {
  type: 'network' | 'media' | 'manifest' | 'unknown';
  message: string;
  details?: string;
} | null;

export function MoviePlayer({ movie, initialTimestamp, userId }: MoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSeekingRef = useRef(false);
  const retryAttemptsRef = useRef(0);
  const maxRetries = 3;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<PlayerError>(null);
  const [retryCount, setRetryCount] = useState(0);

  const videoUrl = movie?.externalUrl;
  const hasValidUrl = videoUrl && videoUrl.trim() !== '';

  // Parse error details
  const parseHlsError = (data: Hls.errorData): PlayerError => {
    const errorType = data.type;
    const errorDetails = data.details;
    const errorMessage = data.error?.message || '';
    const responseCode = (data as any).response?.code;

    // Check for expired URL (common with token-based URLs)
    if (data.details === 'fragLoadError') {
      const url = data.url || (data as any).frag?.url || '';
      // Check for common expired token indicators
      if (responseCode === 403 || responseCode === 401 || errorMessage.includes('403') || errorMessage.includes('401')) {
        return {
          type: 'network',
          message: 'Link do wideo wygasł',
          details: 'Token autoryzacyjny w URL wygasł. Musisz wygenerować nowy link do wideo.'
        };
      }
      // Generic fragment load error
      return {
        type: 'network',
        message: 'Nie można załadować fragmentu wideo',
        details: 'Sprawdź czy link nie wygasł lub czy serwer działa poprawnie.'
      };
    }

    // Network errors
    if (errorType === Hls.ErrorTypes.NETWORK_ERROR) {
      switch (errorDetails) {
        case 'manifestLoadError':
        case 'levelLoadError':
        case 'audioTrackLoadError':
          return {
            type: 'network',
            message: 'Nie można załadować manifestu wideo',
            details: 'Serwer nie odpowiada lub link wygasł. Sprawdź czy URL jest poprawny.'
          };
        case 'manifestLoadTimeOut':
        case 'levelLoadTimeOut':
          return {
            type: 'network',
            message: 'Przekroczono czas oczekiwania',
            details: 'Serwer odpowiedział zbyt wolno. Spróbuj ponownie za chwilę.'
          };
        case 'fragLoadTimeOut':
          return {
            type: 'network',
            message: 'Przekroczono czas ładowania fragmentu',
            details: 'Serwer odpowiada zbyt wolno. Sprawdź połączenie internetowe.'
          };
        default:
          return {
            type: 'network',
            message: 'Błąd sieci',
            details: `Szczegóły: ${errorDetails}${errorMessage ? ` - ${errorMessage}` : ''}`
          };
      }
    }

    // Media errors
    if (errorType === Hls.ErrorTypes.MEDIA_ERROR) {
      switch (errorDetails) {
        case 'bufferFullError':
          return {
            type: 'media',
            message: 'Bufor wideo jest pełny',
            details: 'Spróbuj odświeżyć stronę.'
          };
        case 'bufferStalledError':
          return {
            type: 'media',
            message: 'Odtwarzanie zostało wstrzymane',
            details: 'Brak danych do odtwarzania. Sprawdź połączenie internetowe.'
          };
        default:
          return {
            type: 'media',
            message: 'Błąd mediów',
            details: `Szczegóły: ${errorDetails}${errorMessage ? ` - ${errorMessage}` : ''}`
          };
      }
    }

    // Manifest errors
    if (errorType === Hls.ErrorTypes.MUX_ERROR) {
      return {
        type: 'manifest',
        message: 'Błąd formatu wideo',
        details: 'Ten format wideo nie jest obsługiwany lub plik jest uszkodzony.'
      };
    }

    return {
      type: 'unknown',
      message: 'Nieznany błąd',
      details: `Typ: ${errorType}, Szczegóły: ${errorDetails}${errorMessage ? ` - ${errorMessage}` : ''}`
    };
  };

  // Initialize player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasValidUrl) {
      const timer = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(timer);
    }

    // Reset error state on retry
    if (retryCount > 0) {
      setError(null);
      retryAttemptsRef.current = 0;
    }

    console.log('Loading video URL:', videoUrl);

    // Check if HLS stream
    if (videoUrl.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 120,
        maxBufferSize: 60 * 1000 * 1000, // 60MB
        maxBufferHole: 0.5,
        lowLatencyMode: false,
        backBufferLength: 90,
        enableWorker: true,
        startLevel: -1, // Auto quality
        capLevelToPlayerSize: true,
        startFragPrefetch: true,
        // Better error handling for seeking
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,
        fragLoadingMaxRetryTimeout: 64000,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 4,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 4,
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed successfully');
        retryAttemptsRef.current = 0;
        setTimeout(() => {
          setIsLoading(false);
          setError(null);
        }, 0);
        if (initialTimestamp > 0) {
          video.currentTime = initialTimestamp;
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        // Reset retry counter on successful fragment load
        retryAttemptsRef.current = 0;
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        // Don't show errors during seeking for non-fatal errors
        if (isSeekingRef.current && !data.fatal) {
          console.warn('HLS info during seeking:', data.details);
          return;
        }

        // Handle non-fatal errors
        if (!data.fatal) {
          // Buffer stalls during seeking are normal
          if (data.details === 'bufferStalledError' || data.details === 'bufferNudgeOnStall') {
            console.warn('HLS buffer stall (normal during seeking):', data.details);
            return;
          }
          console.warn('HLS non-fatal error:', data.details);
          return;
        }

        // Fatal errors handling
        console.error('HLS fatal error:', data.type, data.details, data);

        // Increment retry counter
        retryAttemptsRef.current++;

        const parsedError = parseHlsError(data);

        // Check for expired token (403/401) - no point retrying
        const response = (data as any).response;
        const isExpiredToken = response?.code === 403 || response?.code === 401 ||
                               String(data.error?.message || '').includes('403') ||
                               String(data.error?.message || '').includes('401');

        if (isExpiredToken) {
          console.error('Token expired, showing error immediately');
          setError({
            type: 'network',
            message: 'Link do wideo wygasł',
            details: 'Token autoryzacyjny wygasł. Musisz zaktualizować link do wideo w panelu administracyjnym.'
          });
          setTimeout(() => setIsLoading(false), 0);
          return;
        }

        // Check if we've exceeded max retries
        if (retryAttemptsRef.current > maxRetries) {
          console.error('Max retries exceeded, showing error to user');
          setError({
            ...parsedError,
            details: `${parsedError.details || ''}`
          });
          setTimeout(() => setIsLoading(false), 0);
          return;
        }

        // Try to recover from fatal errors
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // For fragment load errors, try to reload
            console.log(`Network error, retrying... (${retryAttemptsRef.current}/${maxRetries})`);

            // If it's a fragLoadError during seeking, just try to startLoad
            if (data.details === 'fragLoadError' || data.details === 'fragLoadTimeOut') {
              // Try to reload the fragment
              hls.startLoad(video.currentTime);

              // Set a timeout to show error if recovery fails
              const retryTimeout = setTimeout(() => {
                if (retryAttemptsRef.current <= maxRetries && hlsRef.current === hls) {
                  // Try again
                  hls.startLoad(video.currentTime);
                }
              }, 3000);

              // Clear timeout on successful playback
              const clearRetry = () => {
                clearTimeout(retryTimeout);
                video.removeEventListener('playing', clearRetry);
              };
              video.addEventListener('playing', clearRetry);
            } else {
              // Other network errors
              hls.startLoad();
            }

            // Show error after delay if still failing
            setTimeout(() => {
              if (hlsRef.current === hls && retryAttemptsRef.current > maxRetries) {
                setError(parsedError);
                setTimeout(() => setIsLoading(false), 0);
              }
            }, 8000);
            break;

          case Hls.ErrorTypes.MEDIA_ERROR:
            // Try to recover media errors
            console.log(`Media error, recovering... (${retryAttemptsRef.current}/${maxRetries})`);
            hls.recoverMediaError();

            // Show error after delay if still failing
            setTimeout(() => {
              if (hlsRef.current === hls && retryAttemptsRef.current > maxRetries) {
                setError(parsedError);
                setTimeout(() => setIsLoading(false), 0);
              }
            }, 5000);
            break;

          default:
            // Cannot recover - show error
            console.error('Unrecoverable error:', data.type);
            setError(parsedError);
            setTimeout(() => setIsLoading(false), 0);
            hls.destroy();
            break;
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = videoUrl;
      setTimeout(() => setIsLoading(false), 0);
    } else {
      // Regular video (MP4, etc.)
      video.src = videoUrl;
      
      video.onerror = () => {
        const mediaError = video.error;
        if (mediaError) {
          let errorMsg = 'Nie można odtworzyć wideo';
          let errorDetails = '';
          
          switch (mediaError.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMsg = 'Odtwarzanie zostało przerwane';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMsg = 'Błąd sieci';
              errorDetails = 'Nie można pobrać wideo. Sprawdź połączenie internetowe.';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMsg = 'Błąd dekodowania';
              errorDetails = 'Format wideo nie jest obsługiwany lub plik jest uszkodzony.';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMsg = 'Nieobsługiwany format';
              errorDetails = 'Ten format wideo nie jest obsługiwany przez przeglądarkę.';
              break;
          }
          
          setError({
            type: 'media',
            message: errorMsg,
            details: errorDetails || `Kod błędu: ${mediaError.code}`
          });
        }
        setTimeout(() => setIsLoading(false), 0);
      };
      
      setTimeout(() => setIsLoading(false), 0);
    }

    // Event listeners
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialTimestamp > 0) {
        video.currentTime = initialTimestamp;
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setTimeout(() => setIsLoading(true), 0);
    const onPlaying = () => {
      setTimeout(() => {
        setIsLoading(false);
        setError(null);
      }, 0);
    };
    const onCanPlay = () => setTimeout(() => setIsLoading(false), 0);
    const onSeeking = () => {
      isSeekingRef.current = true;
      setTimeout(() => setIsLoading(true), 0);
    };
    const onSeeked = () => {
      isSeekingRef.current = false;
      setTimeout(() => setIsLoading(false), 0);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('seeking', onSeeking);
    video.addEventListener('seeked', onSeeked);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [videoUrl, initialTimestamp, hasValidUrl, retryCount]);

  // Save progress periodically
  useEffect(() => {
    if (!isPlaying || !hasValidUrl) return;

    saveIntervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video) return;

      try {
        await fetch('/api/watch/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movieId: movie.id,
            timestamp: Math.floor(video.currentTime),
          }),
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }, 10000); // Save every 10 seconds

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [isPlaying, movie.id, hasValidUrl]);

  // Auto-hide controls
  useEffect(() => {
    if (!isPlaying) return;

    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);

    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = value[0] / 100;
    setVolume(value[0] / 100);
    setIsMuted(value[0] === 0);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = (value[0] / 100) * duration;
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show error if no valid URL
  if (!hasValidUrl) {
    return (
      <div className="aspect-video bg-black rounded-2xl flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <Film className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-bold text-white">Brak źródła wideo</h3>
          <p className="text-muted-foreground">Ten film nie ma przypisanego adresu URL.</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="aspect-video bg-black rounded-2xl flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 mx-auto text-red-500" />
          <h3 className="text-xl font-bold text-white">{error.message}</h3>
          <p className="text-muted-foreground text-sm">{error.details}</p>
          <div className="pt-4 space-y-3">
            <Button
              onClick={handleRetry}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Spróbuj ponownie
            </Button>
            <p className="text-xs text-muted-foreground">
              URL: {videoUrl?.substring(0, 50)}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video bg-black rounded-2xl overflow-hidden group",
        showControls && "cursor-auto"
      )}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        onClick={togglePlay}
        suppressHydrationWarning
      />

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Center Play Button */}
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center transition-transform hover:scale-110"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8 text-white" />
          ) : (
            <Play className="h-8 w-8 text-white ml-1" />
          )}
        </button>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white min-w-[50px]">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="flex-1 cursor-pointer"
            />
            <span className="text-sm text-white min-w-[50px] text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={() => skip(-10)}
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={() => skip(10)}
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-24 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">{movie.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
