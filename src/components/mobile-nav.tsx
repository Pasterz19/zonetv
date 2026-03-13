'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Film, MonitorPlay, Radio, User, LogOut, Shield } from 'lucide-react';

interface MobileNavProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userInitial?: string;
}

export function MobileNav({ isLoggedIn, isAdmin, userInitial }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-all hover:bg-white/10 hover:text-white"
        aria-label={isOpen ? 'Zamknij menu' : 'Otwórz menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu panel */}
          <nav className="fixed right-0 top-0 z-[95] h-full w-72 border-l border-white/10 bg-background/95 backdrop-blur-xl p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-black tracking-tighter uppercase">
                Zone<span className="text-primary">TV</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                aria-label="Zamknij menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
              >
                Start
              </Link>

              {isLoggedIn && (
                <>
                  <Link
                    href="/movies"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Film className="h-4 w-4" />
                    Filmy
                  </Link>
                  <Link
                    href="/series"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <MonitorPlay className="h-4 w-4" />
                    Seriale
                  </Link>
                  <Link
                    href="/tv"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Radio className="h-4 w-4" />
                    TV Live
                  </Link>
                </>
              )}
            </div>

            <div className="my-6 h-px bg-white/10" />

            <div className="space-y-1">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    Logowanie
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                  >
                    Zacznij teraz
                  </Link>
                </>
              ) : (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                      <Shield className="h-4 w-4" />
                      Panel Admina
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {userInitial}
                    </div>
                    Mój profil
                  </Link>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Wyloguj się
                    </button>
                  </form>
                </>
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
