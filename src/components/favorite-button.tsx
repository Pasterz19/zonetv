"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  contentId: string;
  contentType: "MOVIE" | "SERIES" | "EPISODE" | "CHANNEL";
  initialFavorited: boolean;
  className?: string;
};

export function FavoriteButton({
  contentId,
  contentType,
  initialFavorited,
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!contentId) return;
    const optimistic = !favorited;
    setFavorited(optimistic);

    startTransition(async () => {
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ contentId, contentType }),
        });

        if (!res.ok) {
          setFavorited(!optimistic);
          return;
        }

        const data = (await res.json().catch(() => null)) as
          | { favorited: boolean }
          | null;
        if (!data) return;

        setFavorited(data.favorited);
      } catch {
        setFavorited(!optimistic);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={cn(
        "group/fav relative flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95 disabled:opacity-50",
        favorited ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/20" : "hover:bg-white/10",
        className
      )}
      aria-pressed={favorited}
      aria-label={favorited ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all duration-300",
          favorited 
            ? "fill-primary text-primary scale-110" 
            : "text-white/70 group-hover/fav:text-white group-hover/fav:scale-110"
        )}
      />
      {favorited && (
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
      )}
    </button>
  );
}
