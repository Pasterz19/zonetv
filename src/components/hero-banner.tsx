"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react";
import { Button } from "./ui/button";

const BANNERS = [
  {
    id: 1,
    title: "Galaktyczne Wojny: Odrodzenie",
    description: "Epicka saga o przetrwaniu ludzkości w odległej galaktyce. Odkryj tajemnice, które zmienią bieg historii.",
    tag: "NOWOŚĆ",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1920",
  },
  {
    id: 2,
    title: "Smoczy Strażnik",
    description: "Ostatni ze smoków musi odnaleźć swojego następcę, zanim mroczne siły przejmą kontrolę nad królestwem.",
    tag: "HIT SEZONU",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1920",
  },
  {
    id: 3,
    title: "Finałowy Gwizdek",
    description: "Droga na szczyt nigdy nie jest łatwa. Poczuj emocje największego turnieju piłkarskiego w historii.",
    tag: "SPORT LIVE",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1920",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % BANNERS.length);
  const prev = () => setCurrent((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  return (
    <div className="group relative h-[60vh] w-full overflow-hidden rounded-3xl bg-black lg:h-[75vh]">
      {BANNERS.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            priority={index === 0}
            className="animate-slow-zoom object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 pt-24 md:p-20 md:pt-32 lg:max-w-5xl">
            <div className="mb-4 inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase">
              {banner.tag}
            </div>
            <h1 className="text-shadow-lg mb-4 text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl uppercase leading-[0.85]">
              {banner.title}
            </h1>
            <div className="max-w-2xl lg:max-w-3xl">
              <p className="text-shadow-lg mb-8 text-sm text-white/90 sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed">
                {banner.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="h-12 rounded-full px-6 text-sm font-black uppercase tracking-tight hover:scale-105 transition-transform md:h-16 md:px-10 md:text-xl !text-white">
                <Play className="mr-2 h-4 w-4 fill-white md:h-6 md:w-6" />
                Oglądaj teraz
              </Button>
              <Button size="lg" variant="secondary" className="h-12 rounded-full px-6 text-sm font-black uppercase tracking-tight bg-white/10 backdrop-blur-md hover:bg-white/20 border-white/10 md:h-16 md:px-10 md:text-xl text-white">
                <Info className="mr-2 h-4 w-4 md:h-6 md:w-6" />
                Szczegóły
              </Button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-3 text-white opacity-0 backdrop-blur-xl transition-all hover:bg-primary hover:scale-110 group-hover:opacity-100 border border-white/10"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button
        onClick={next}
        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-3 text-white opacity-0 backdrop-blur-xl transition-all hover:bg-primary hover:scale-110 group-hover:opacity-100 border border-white/10"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      <div className="absolute bottom-12 right-12 flex gap-3">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === current ? "w-12 bg-primary shadow-[0_0_15px_rgba(229,9,20,0.5)]" : "w-3 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
