import { Film, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Film className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center border-4 border-background">
              <WifiOff className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Brak <span className="text-primary">połączenia</span>
          </h1>
          <p className="text-muted-foreground">
            Wygląda na to, że jesteś offline. Sprawdź połączenie internetowe i spróbuj ponownie.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Spróbuj ponownie
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Wróć na stronę główną
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Niektóre treści mogą być dostępne offline, jeśli zostały wcześniej załadowane.
        </p>
      </div>
    </div>
  );
}
