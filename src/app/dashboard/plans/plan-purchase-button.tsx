'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, Crown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface PlanPurchaseButtonProps {
  planId: string;
  planName: string;
  price: number;
  currency: string;
  hasActiveSubscription: boolean;
}

export function PlanPurchaseButton({
  planId,
  planName,
  price,
  currency,
  hasActiveSubscription,
}: PlanPurchaseButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'STRIPE' | 'PRZELEWY24'>('STRIPE');

  const handlePurchase = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          provider,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.checkoutUrl) {
        // Redirect to payment provider
        window.location.href = data.checkoutUrl;
      } else {
        toast.success('Płatność zainicjowana');
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Wystąpił błąd podczas inicjowania płatności');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <Crown className="h-4 w-4" />
          Wybierz plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Kup subskrypcję: {planName}
          </DialogTitle>
          <DialogDescription>
            Wybierz metodę płatności i przejdź do bezpiecznej bramki
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Price Summary */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Kwota do zapłaty</span>
              <span className="text-2xl font-bold">{price} {currency}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Miesięczna subskrypcja</p>
          </div>

          {/* Active Subscription Warning */}
          {hasActiveSubscription && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <p className="text-sm text-amber-500">
                  Masz już aktywną subskrypcję. Nowa subskrypcja rozpocznie się po wygaśnięciu obecnej.
                </p>
              </div>
            </div>
          )}

          {/* Payment Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Metoda płatności</label>
            <Select value={provider} onValueChange={(v) => setProvider(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz metodę płatności" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STRIPE">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Karta płatnicza (Stripe)
                  </div>
                </SelectItem>
                <SelectItem value="PRZELEWY24">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">P24</span>
                    Przelewy24
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Bezpieczna płatność szyfrowana SSL</p>
            <p>• Subskrypcja odnawia się automatycznie co miesiąc</p>
            <p>• Możesz anulować w dowolnym momencie</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button onClick={handlePurchase} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Przetwarzanie...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Przejdź do płatności
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
