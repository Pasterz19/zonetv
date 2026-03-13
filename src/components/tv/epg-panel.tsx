"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/tv-utils";
import { formatTimeShort, calculateEpgProgress } from "@/lib/video-utils";
import { EpgProgram, Channel } from "./channel-card";
import { X, Clock, ChevronRight } from "lucide-react";

export interface EpgPanelProps {
  channel: Channel;
  programs: EpgProgram[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function EpgPanel({
  channel,
  programs,
  isOpen,
  onClose,
  className,
}: EpgPanelProps) {
  const now = new Date();

  // Group programs by time slots
  const { currentProgram, upcomingPrograms } = useMemo(() => {
    const current = programs.find(
      (p) => new Date(p.start) <= now && new Date(p.stop) >= now
    );
    const upcoming = programs
      .filter((p) => new Date(p.start) > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
    return { currentProgram: current, upcomingPrograms: upcoming };
  }, [programs, now]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={cn(
            "fixed right-0 top-0 bottom-0 w-full max-w-md z-50",
            "bg-black/95 backdrop-blur-xl border-l border-white/10",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white">{channel.name}</h2>
              <p className="text-sm text-muted-foreground">Program TV</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto h-[calc(100%-80px)] tv-scrollbar">
            {/* Current Program */}
            {currentProgram && (
              <div className="mb-8">
                <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  TERAZ
                </div>
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {currentProgram.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatTimeShort(currentProgram.start)} -{" "}
                      {formatTimeShort(currentProgram.stop)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Trwa</span>
                      <span>
                        {Math.round(calculateEpgProgress(currentProgram.start, currentProgram.stop))}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${calculateEpgProgress(currentProgram.start, currentProgram.stop)}%`,
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  {currentProgram.description && (
                    <p className="text-sm text-white/70">
                      {currentProgram.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming Programs */}
            {upcomingPrograms.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-3">
                  <ChevronRight className="h-4 w-4" />
                  NASTĘPNIE
                </div>
                <div className="space-y-3">
                  {upcomingPrograms.map((program, index) => (
                    <motion.div
                      key={program.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-sm text-muted-foreground font-mono">
                          {formatTimeShort(program.start)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">
                            {program.title}
                          </h4>
                          {program.description && (
                            <p className="text-xs text-white/50 mt-1 line-clamp-2">
                              {program.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* No programs */}
            {!currentProgram && upcomingPrograms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Brak danych EPG</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Timeline component for EPG
export interface EpgTimelineProps {
  programs: EpgProgram[];
  startDate?: Date;
  hoursToShow?: number;
  className?: string;
}

export function EpgTimeline({
  programs,
  startDate,
  hoursToShow = 4,
  className,
}: EpgTimelineProps) {
  const start = startDate ?? new Date();

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i < hoursToShow; i++) {
      const slotStart = new Date(start.getTime() + i * 60 * 60 * 1000);
      slots.push(slotStart);
    }
    return slots;
  }, [start, hoursToShow]);

  // Filter programs within timeline
  const visiblePrograms = useMemo(() => {
    const end = new Date(start.getTime() + hoursToShow * 60 * 60 * 1000);
    return programs
      .filter(
        (p) =>
          new Date(p.start) < end &&
          new Date(p.stop) > start
      )
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [programs, start, hoursToShow]);

  // Calculate position and width for a program
  const getProgramStyle = (program: EpgProgram) => {
    const timelineStart = start.getTime();
    const timelineEnd = timelineStart + hoursToShow * 60 * 60 * 1000;
    const programStart = new Date(program.start).getTime();
    const programEnd = new Date(program.stop).getTime();

    const left = Math.max(
      0,
      ((programStart - timelineStart) / (hoursToShow * 60 * 60 * 1000)) * 100
    );
    const width = Math.min(
      100 - left,
      ((programEnd - Math.max(timelineStart, programStart)) /
        (hoursToShow * 60 * 60 * 1000)) *
        100
    );

    return {
      left: `${left}%`,
      width: `${width}%`,
    };
  };

  return (
    <div className={cn("relative", className)}>
      {/* Time markers */}
      <div className="flex border-b border-white/10">
        {timeSlots.map((slot, index) => (
          <div
            key={index}
            className="flex-1 text-xs text-muted-foreground py-2 pl-2"
          >
            {formatTimeShort(slot)}
          </div>
        ))}
      </div>

      {/* Programs */}
      <div className="relative h-16 mt-2">
        {/* Current time indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
          style={{
            left: `${((Date.now() - start.getTime()) / (hoursToShow * 60 * 60 * 1000)) * 100}%`,
          }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
        </div>

        {/* Program blocks */}
        {visiblePrograms.map((program) => {
          const style = getProgramStyle(program);
          const isNow =
            new Date(program.start) <= new Date() &&
            new Date(program.stop) >= new Date();

          return (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "absolute top-0 h-full rounded-lg px-2 py-1 overflow-hidden",
                "border border-white/10",
                isNow
                  ? "bg-primary/20 border-primary/50"
                  : "bg-white/5"
              )}
              style={style}
            >
              <p className="text-xs font-medium text-white truncate">
                {program.title}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatTimeShort(program.start)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
