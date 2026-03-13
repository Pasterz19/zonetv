import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Radio, Film, MonitorPlay, Play, ChevronRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in-up">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-[0_0_40px_rgba(229,9,20,0.5)]">
              <span className="text-3xl font-black text-white">Z</span>
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-white/10" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">
              Zone<span className="text-primary">TV</span>
            </h1>
          </div>

          {/* Tagline */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Nowa Era Streamingu
            </p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Kino w Twoim
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                Własnym Domu
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Odkryj tysiące filmów, seriali i kanałów TV w jakości 4K Ultra HD.
              Bez reklam, bez limitów, bez kompromisów.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/tv">
              <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_40px_-10px_rgba(229,9,20,0.5)] transition-all hover:scale-105">
                <Radio className="mr-2 h-5 w-5" />
                TV Live
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105">
                Dowiedz się więcej
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-lg mx-auto">
            <div className="text-center">
              <p className="text-3xl font-black">100+</p>
              <p className="text-sm text-muted-foreground">Kanałów TV</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black">4K</p>
              <p className="text-sm text-muted-foreground">Ultra HD</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black">24/7</p>
              <p className="text-sm text-muted-foreground">Dostęp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
              Rozrywka bez Granic
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Wszystko czego potrzebujesz w jednym miejscu. Zaprojektowane dla Twojej wygody.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Movies */}
            <div className="group relative p-1 rounded-3xl bg-gradient-to-br from-red-500/20 to-transparent hover:from-red-500/30 transition-all duration-500">
              <div className="relative h-full bg-card/80 backdrop-blur-xl rounded-[22px] p-8 border border-white/5 flex flex-col items-start gap-4">
                <div className="mb-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Film className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold">Filmy Premium</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Najnowsze hity kinowe dostępne zaraz po premierze. Oglądaj w najwyższej jakości 4K HDR.
                </p>
              </div>
            </div>

            {/* Series */}
            <div className="group relative p-1 rounded-3xl bg-gradient-to-br from-blue-500/20 to-transparent hover:from-blue-500/30 transition-all duration-500">
              <div className="relative h-full bg-card/80 backdrop-blur-xl rounded-[22px] p-8 border border-white/5 flex flex-col items-start gap-4">
                <div className="mb-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                  <MonitorPlay className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold">Seriale Original</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ekskluzywne produkcje, których nie znajdziesz nigdzie indziej. Całe sezony dostępne od ręki.
                </p>
              </div>
            </div>

            {/* TV Live */}
            <div className="group relative p-1 rounded-3xl bg-gradient-to-br from-green-500/20 to-transparent hover:from-green-500/30 transition-all duration-500">
              <div className="relative h-full bg-card/80 backdrop-blur-xl rounded-[22px] p-8 border border-white/5 flex flex-col items-start gap-4">
                <div className="mb-2 p-3 rounded-2xl bg-green-500/10 border border-green-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Radio className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold">Telewizja Live</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ponad 150 kanałów na żywo. Sport, informacje, rozrywka - wszystko w czasie rzeczywistym.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 text-center">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
            Gotowy na Nowy Wymiar Rozrywki?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dołącz do tysięcy zadowolonych użytkowników ZoneTV.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/tv">
              <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-full bg-white text-black hover:bg-white/90 shadow-2xl transition-all hover:scale-105">
                <Play className="mr-2 h-6 w-6" />
                Oglądaj TV Live
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-black text-white">Z</span>
            </div>
            <span className="font-bold">ZoneTV</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 ZoneTV. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  )
}
