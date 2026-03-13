"use client";

import { useState, useEffect } from "react";
import { Film, MonitorPlay, Radio, Trophy, Star, Gamepad2, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: "vod",
    title: "Nieograniczona Rozrywka",
    subtitle: "Filmy i Seriale w 4K Ultra HD",
    description: "Odkryj bibliotekę tysięcy tytułów. Od najnowszych premier kinowych po kultowe seriale. Wszystko w jednym miejscu, bez reklam.",
    tags: ["Netflix Originals", "Disney+", "Prime Video", "Apple TV+"],
    icon: Film,
    color: "from-red-600 to-rose-900",
    bgImage: "radial-gradient(circle at 70% 50%, rgba(220, 38, 38, 0.3), transparent 60%)",
  },
  {
    id: "sport",
    title: "Wielkie Emocje Sportowe",
    subtitle: "Najlepsze Ligi Świata na Żywo",
    description: "Nie przegap żadnego meczu. Oglądaj Ligę Mistrzów, Premier League, La Liga, NBA, Formułę 1 oraz żużel w najwyższej jakości.",
    tags: ["Canal+ Sport", "Eleven Sports", "Eurosport", "Polsat Sport Premium"],
    icon: Trophy,
    color: "from-green-600 to-emerald-900",
    bgImage: "radial-gradient(circle at 70% 50%, rgba(16, 185, 129, 0.3), transparent 60%)",
  },
  {
    id: "premium",
    title: "Kino Premium",
    subtitle: "Hity Kinowe w Twoim Domu",
    description: "Największe blockbustery prosto z kina. Dostęp do ekskluzywnych kanałów filmowych i premierowych produkcji.",
    tags: ["Canal+ Premium", "HBO", "Cinemax", "FilmBox"],
    icon: Star,
    color: "from-amber-500 to-yellow-800",
    bgImage: "radial-gradient(circle at 70% 50%, rgba(245, 158, 11, 0.3), transparent 60%)",
  },
  {
    id: "kids",
    title: "Strefa Najmłodszych",
    subtitle: "Bajki, Filmy i Edukacja",
    description: "Bezpieczna rozrywka dla dzieci w każdym wieku. Ulubieni bohaterowie, pouczające historie i rodzinne kino.",
    tags: ["Disney Junior", "Cartoon Network", "Nickelodeon", "MiniMini+"],
    icon: Gamepad2,
    color: "from-blue-500 to-indigo-900",
    bgImage: "radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.3), transparent 60%)",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div 
      className="relative w-full h-full overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div 
        className="flex h-full transition-transform duration-700 ease-out will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div key={slide.id} className="min-w-full h-full relative flex items-center justify-center p-8 md:p-16">
            {/* Dynamic Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-20`} />
            <div 
                className="absolute inset-0" 
                style={{ background: slide.bgImage }} 
            />
            
            {/* Content */}
            <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center space-y-6 animate-fade-in-up">
              {/* Icon Badge */}
              <div className={`h-20 w-20 rounded-3xl bg-gradient-to-br ${slide.color} p-[1px] shadow-2xl shadow-black/50 mb-4`}>
                <div className="h-full w-full bg-black/40 backdrop-blur-xl rounded-[23px] flex items-center justify-center border border-white/10">
                   <slide.icon className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest text-white/80">{slide.subtitle}</h3>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
                    {slide.title}
                </h2>
              </div>

              <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
                {slide.description}
              </p>

              {/* Tags/Channels */}
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                {slide.tags.map((tag) => (
                    <span key={tag} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-white/90 backdrop-blur-md">
                        {tag}
                    </span>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-8">
                <Link href="/auth/register">
                    <Button size="lg" className={`h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r ${slide.color} hover:brightness-110 border border-white/20 shadow-xl transition-all hover:scale-105`}>
                        <Play className="mr-2 h-5 w-5 fill-current" />
                        Zacznij Oglądać
                    </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {SLIDES.map((_, idx) => (
            <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    current === idx ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                )}
            />
        ))}
      </div>
    </div>
  );
}
