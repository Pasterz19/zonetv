"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay failed:", error);
        // Autoplay policy might block unmuted, but we have muted.
      });
    }
  }, []);

  if (hasError) {
    return (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-primary/20 to-black flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto">
                    <div className="h-0 w-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                </div>
                <p className="text-muted-foreground text-sm">Wideo niedostępne</p>
            </div>
        </div>
    );
  }

  return (
    <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline 
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
        onError={() => setHasError(true)}
    >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-lines-2769-large.mp4" type="video/mp4" />
        {/* Backup source if the first one fails or is slow */}
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
    </video>
  );
}
