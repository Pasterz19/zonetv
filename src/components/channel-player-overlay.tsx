"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { HlsVideo } from "@/components/hls-video";
import { Maximize2, Pause, Play, SlidersHorizontal, X } from "lucide-react";

type ChannelPlayerOverlayProps = {
  channelId: string;
  name: string;
  streamUrl: string;
  ytId: string | null;
  initialBufferSeconds: number;
};

export function ChannelPlayerOverlay({
  channelId,
  name,
  streamUrl,
  ytId,
  initialBufferSeconds,
}: ChannelPlayerOverlayProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerFrameRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLiveBadge, setShowLiveBadge] = useState(true);
  const [bufferOpen, setBufferOpen] = useState(false);
  const [bufferSeconds, setBufferSeconds] = useState<number>(initialBufferSeconds);
  const [customBuffer, setCustomBuffer] = useState<number>(initialBufferSeconds);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(!ytId);
  const hideTimerRef = useRef<number | null>(null);

  const getFullscreenElement = () =>
    document.fullscreenElement ?? (document as any).webkitFullscreenElement ?? null;

  const exitFullscreen = async () => {
    if (!getFullscreenElement()) return;
    const exit =
      (document as any).exitFullscreen?.bind(document) ??
      (document as any).webkitExitFullscreen?.bind(document);
    await exit?.().catch?.(() => null);
  };

  const handleClose = async () => {
    await exitFullscreen();
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const presetOptions = useMemo(
    () => [
      { label: "Szybkie", seconds: 15, desc: "Dla szybkich łączy (15s)" },
      { label: "Średnie", seconds: 40, desc: "Dla średnich łączy (40s)" },
      { label: "Wolne", seconds: 60, desc: "Dla wolnych łączy (1 min)" },
      { label: "Własny Bufor", seconds: customBuffer, desc: "Ustaw własne opóźnienie" },
    ],
    [customBuffer],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        void handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setShowLiveBadge(false), 3500);
    return () => window.clearTimeout(t);
  }, []);

  const scheduleHide = () => {
    if (ytId) return;
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      setBufferOpen(false);
    }, 3000);
  };

  const showControls = () => {
    if (ytId) return;
    setControlsVisible(true);
    scheduleHide();
  };

  useEffect(() => {
    if (ytId) return;
    scheduleHide();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [ytId]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play().catch(() => null);
    } else {
      video.pause();
    }
  };

  const goFullscreen = async () => {
    if (getFullscreenElement()) {
      await exitFullscreen();
      return;
    }

    const el = playerFrameRef.current ?? videoRef.current ?? containerRef.current;
    if (!el) return;
    const request =
      (el as any).requestFullscreen?.bind(el) ?? (el as any).webkitRequestFullscreen?.bind(el);
    await request?.().catch?.(() => null);
  };

  const saveBuffer = async () => {
    if (ytId) return; // nie dotyczy YouTube
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/channel-buffer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          channelId,
          bufferSeconds: bufferSeconds,
        }),
      });
      if (res.ok) {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl rounded-2xl border border-border bg-background/95 p-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
      >
        <div className="space-y-3 pr-12">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h1 className="text-lg font-semibold">{name}</h1>
              <p className="text-xs text-muted-foreground">TV Live</p>
            </div>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
            {showLiveBadge && !ytId && (
              <div className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/10 animate-in fade-in-0 duration-200">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />
                LIVE
              </div>
            )}

            {/* Close button (top-right, works in fullscreen too) */}
            <button
              type="button"
              onClick={() => void handleClose()}
              className={[
                "absolute z-20 inline-flex h-10 w-10 items-center justify-center rounded-full",
                "bg-black/35 text-white backdrop-blur hover:bg-primary ring-1 ring-white/10",
                "right-[calc(env(safe-area-inset-right)+12px)] top-[calc(env(safe-area-inset-top)+12px)]",
                ytId ? "opacity-100" : controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none",
                "transition-all duration-200",
              ].join(" ")}
              aria-label="Zamknij"
              title="Zamknij"
            >
              <X className="h-4 w-4" />
            </button>

            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div
                ref={playerFrameRef}
                className="relative h-full w-full"
                onMouseMove={showControls}
                onPointerDown={showControls}
                onTouchStart={showControls}
              >
                <HlsVideo
                  ref={videoRef}
                  src={streamUrl}
                  liveBufferSeconds={bufferSeconds}
                  showNativeControls={false}
                  onPlayStateChange={setIsPlaying}
                  className="h-full w-full"
                />

                {/* Controls overlay (auto-hide) */}
                <div
                  className={[
                    "pointer-events-none absolute inset-x-0 bottom-0 z-10",
                    "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
                    "transition-opacity duration-200",
                    controlsVisible ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                >
                  <div className="pointer-events-auto flex items-center justify-between gap-2 px-3 pt-10 pb-[calc(env(safe-area-inset-bottom)+12px)]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur hover:bg-white/15 ring-1 ring-white/10"
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={goFullscreen}
                        className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur hover:bg-white/15 ring-1 ring-white/10"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBufferOpen((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur hover:bg-white/15 ring-1 ring-white/10"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Bufor
                      </button>
                    </div>

                    <div className="rounded-full bg-black/50 px-3 py-1 text-[11px] text-white ring-1 ring-white/10">
                      Opóźnienie: ~{bufferSeconds}s
                    </div>
                  </div>
                </div>

                {/* Buffer panel (inside player, auto-hide with controls) */}
                <div
                  className={[
                    "absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+64px)] z-20",
                    "transition-all duration-200",
                    controlsVisible && bufferOpen
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-2 pointer-events-none",
                  ].join(" ")}
                >
                  <div className="rounded-xl border border-border bg-background/95 shadow-2xl backdrop-blur">
                    <div className="flex items-start justify-between gap-4 p-4">
                      <div>
                        <h2 className="text-sm font-semibold">Ustawienia bufora</h2>
                        <p className="text-xs text-muted-foreground">
                          Większy bufor = większe opóźnienie, ale stabilniejszy obraz.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={saveBuffer}
                          disabled={saving}
                          className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary/90 disabled:opacity-60 uppercase tracking-tight"
                        >
                          {saving ? "Zapisuję…" : "Zapisz"}
                        </button>
                        {saved && (
                          <span className="text-xs text-emerald-400">Zapisano</span>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <div className="overflow-hidden rounded-lg border border-border/60">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-background/40 text-muted-foreground">
                            <tr>
                              <th className="px-3 py-2">Tryb</th>
                              <th className="px-3 py-2">Opóźnienie</th>
                              <th className="px-3 py-2">Akcja</th>
                            </tr>
                          </thead>
                          <tbody>
                            {presetOptions.map((opt) => {
                              const seconds =
                                opt.label === "Własny Bufor"
                                  ? customBuffer
                                  : opt.seconds;
                              const selected = bufferSeconds === seconds;
                              return (
                                <tr
                                  key={opt.label}
                                  className="border-t border-border/60"
                                >
                                  <td className="px-3 py-2">
                                    <div className="font-medium text-foreground">
                                      {opt.label}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                      {opt.desc}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {opt.label === "Własny Bufor" ? (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          min={5}
                                          max={600}
                                          value={customBuffer}
                                          onChange={(e) =>
                                            setCustomBuffer(
                                              Math.max(
                                                5,
                                                Math.min(
                                                  600,
                                                  Number(e.target.value || 0),
                                                ),
                                              ),
                                            )
                                          }
                                          className="w-24 rounded-md border border-input bg-background px-2 py-1 text-xs"
                                        />
                                        <span className="text-[11px]">sek.</span>
                                      </div>
                                    ) : (
                                      <span>{seconds}s</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBufferSeconds(seconds);
                                        scheduleHide();
                                      }}
                                      className={[
                                        "rounded-full px-3 py-1 text-xs font-bold border uppercase tracking-tight",
                                        selected
                                          ? "bg-primary text-white border-primary"
                                          : "border-border text-muted-foreground hover:bg-white/10",
                                      ].join(" ")}
                                    >
                                      {selected ? "Wybrane" : "Wybierz"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Źródło: {streamUrl}
          </p>
        </div>
      </div>
    </div>
  );
}

