import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { auth } from '@/lib/auth';
import { Film, MonitorPlay, Radio, User, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ZoneTV – Twoja Strefa Rozrywki',
  description: 'Najlepsze filmy, seriale i TV na żywo w jakości 4K. Dołącz do ZoneTV już dziś.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="pl" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {/* Header */}
        <header className="sticky top-0 z-[100] w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 h-16 md:px-8">
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(229,9,20,0.3)] transition-transform group-hover:scale-110">
                  <span className="text-xl font-black text-white">Z</span>
                  <div className="absolute inset-0 animate-pulse rounded-xl bg-white/10" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white uppercase hidden sm:block">
                  Zone<span className="text-primary">TV</span>
                </span>
              </Link>

              <nav className="hidden items-center gap-6 md:flex">
                <Link
                  href="/"
                  className="text-sm font-semibold text-muted-foreground transition-colors hover:text-white"
                >
                  Start
                </Link>
                {session?.user && (
                  <>
                    <Link
                      href="/tv"
                      className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-white"
                    >
                      <Radio className="h-4 w-4" />
                      TV Live
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {!session?.user ? (
                <div className="flex items-center gap-3">
                  <a
                    href="/auth/login"
                    className="text-sm font-bold text-muted-foreground transition-colors hover:text-white"
                  >
                    Logowanie
                  </a>
                  <a
                    href="/auth/register"
                    className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    Zacznij teraz
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {session.user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="text-sm font-bold text-primary transition-colors hover:text-primary/80 hover:underline cursor-pointer"
                    >
                      Panel Admina
                    </Link>
                  )}
                  <div className="h-8 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="group flex items-center gap-2 rounded-full bg-white/5 p-1.5 pr-4 transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white font-bold text-xs">
                        {session.user.email?.[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-white hidden sm:block">Mój profil</span>
                    </Link>
                    <form action="/api/auth/logout" method="POST">
                      <button
                        type="submit"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-all hover:bg-destructive hover:text-white hover:border-destructive hover:scale-105 active:scale-95 cursor-pointer"
                        title="Wyloguj się"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="relative">{children}</main>
      </body>
    </html>
  );
}
