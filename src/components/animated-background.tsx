"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse-slow delay-1000" />
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px] animate-pulse-slow delay-2000" />
    </div>
  );
}
