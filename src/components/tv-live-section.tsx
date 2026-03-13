'use client';

import { useState, useEffect, useMemo } from 'react';
import { HlsVideo } from './hls-video';
import { Button } from '@/components/ui/button';
import { Lock, Zap, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

// Define types manually if Prisma types are not available in client component context yet
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
  streamUrl: string;
  epgPrograms: EpgProgram[];
}

interface TVLiveSectionProps {
  channels: Channel[];
  hasSubscription: boolean;
}

export function TVLiveSection({ channels, hasSubscription }: TVLiveSectionProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
    channels.length > 0 ? channels[0] : null
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Filter channels
  const filteredChannels = useMemo(
    () => channels.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [channels, searchTerm]
  );

  if (!channels.length) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center border border-white/10 rounded-3xl bg-white/5">
        <Zap className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
        <h3 className="text-xl font-bold text-muted-foreground">Brak dostępnych kanałów</h3>
      </div>
    );
  }

  const currentProgram = selectedChannel?.epgPrograms?.[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[90vh] min-h-[600px]">
      {/* Left/Center: Player */}
      <div className="lg:col-span-2 flex flex-col h-full gap-4">
        <div className="relative flex-1 bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl group min-h-[400px]">
          {selectedChannel ? (
            hasSubscription ? (
              <HlsVideo
                key={selectedChannel.id} // Force re-mount on channel change
                src={selectedChannel.streamUrl}
                className="h-full w-full"
                liveBufferSeconds={15}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-[5]">
                <div className="text-center space-y-6 max-w-md p-8">
                  <div className="mx-auto h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center text-primary animate-pulse">
                    <Lock className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">
                    Tylko dla Subskrybentów
                  </h2>
                  <p className="text-muted-foreground">
                    Ten kanał jest dostępny wyłącznie w pakiecie Premium. Odblokuj dostęp do ponad
                    100 kanałów TV.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="w-full font-bold uppercase tracking-widest rounded-full h-14 text-lg hover:scale-105 transition-transform"
                  >
                    <Link href="/pricing">Kup Subskrypcję</Link>
                  </Button>
                </div>
                {/* Background preview blurred */}
                <div className="absolute inset-0 -z-10 opacity-30">
                  <Image
                    src={selectedChannel.imageUrl}
                    alt=""
                    fill
                    className="object-cover blur-3xl"
                  />
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Wybierz kanał
            </div>
          )}
        </div>

        {/* Current Program Info under player */}
        {selectedChannel && (
          <div className="p-6 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md min-h-[180px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <Image
                src={selectedChannel.imageUrl}
                alt=""
                width={300}
                height={300}
                className="object-contain grayscale"
              />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black uppercase tracking-tighter text-white shadow-black drop-shadow-lg">
                    {selectedChannel.name}
                  </h1>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                    LIVE
                  </span>
                </div>

                {currentProgram ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h3 className="text-xl font-bold text-primary">{currentProgram.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 font-mono">
                      <span>
                        {new Date(currentProgram.start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div className="h-1 w-8 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/2" />
                        {/* Progress bar could be calculated based on current time */}
                      </div>
                      <span>
                        {new Date(currentProgram.stop).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {currentProgram.description && (
                      <p className="mt-4 text-white/70 leading-relaxed line-clamp-2">
                        {currentProgram.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-2">Brak informacji o programie EPG</p>
                )}
              </div>

              <div className="hidden md:block h-24 w-24 relative bg-white/10 rounded-2xl p-2 border border-white/10 shadow-xl backdrop-blur-xl">
                <Image
                  src={selectedChannel.imageUrl}
                  alt={selectedChannel.name}
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Channel List */}
      <div className="lg:col-span-1 bg-white/5 border border-white/5 rounded-3xl overflow-hidden flex flex-col h-full min-h-[500px] backdrop-blur-sm relative pointer-events-auto">
        <div className="p-4 border-b border-white/5 bg-black/20 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Kanały TV
            </h3>
            <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-muted-foreground">
              {channels.length}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj kanału..."
              className="pl-9 bg-black/20 border-white/10 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 pb-20" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {filteredChannels.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nie znaleziono kanałów
            </div>
          )}
          {filteredChannels.map((channel) => {
            const prog = channel.epgPrograms[0];
            const isSelected = selectedChannel?.id === channel.id;

            return (
              <div
                key={channel.id}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Channel clicked:', channel.name, channel.id, 'hasSubscription:', hasSubscription);
                  setSelectedChannel(channel);
                }}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 select-none ${
                  isSelected
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02] border border-primary/50'
                    : 'hover:bg-white/5 hover:border-white/10 hover:scale-[1.01] border border-transparent'
                }`}
              >
                <div className="relative h-10 w-10 min-w-[2.5rem] bg-white rounded-lg overflow-hidden border border-white/10 shadow-sm">
                  {channel.imageUrl ? (
                    <Image
                      src={channel.imageUrl}
                      alt={channel.name}
                      fill
                      className="object-contain p-1"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-bold truncate text-base ${isSelected ? 'text-white' : 'text-white/90 group-hover:text-primary'}`}
                    title={channel.name}
                  >
                    {channel.name}
                  </h4>
                  {prog ? (
                    <div className="flex items-center gap-2 text-[10px] opacity-70 mt-0.5 w-full">
                      <span className="font-mono bg-black/20 px-1 rounded whitespace-nowrap">
                        {new Date(prog.start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="truncate flex-1">{prog.title}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] opacity-40 mt-0.5 block">Brak EPG</span>
                  )}
                </div>
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
