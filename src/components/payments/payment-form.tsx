'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Check,
  Lock,
  Shield,
  Sparkles,
  Loader2,
  Tag,
  X,
  Crown,
  Radio,
  Film,
  MonitorPlay,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string | null;
  features: string[];
  isPromoted: boolean;
  tier: number;
  maxProfiles: number;
  maxDevices: number;
  quality: string;
}

interface PaymentFormProps {
  plans: Plan[];
  selectedPlanId?: string;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}

const planStyles: Record<number, { gradient: string; icon: typeof Crown; color: string }> = {
  0: { 
    gradient: 'from-gray-500/10 to-gray-600/10', 
    icon: Film, 
    color: 'text-gray-400' 
  },
  1: { 
    gradient: 'from-blue-500/10 to-blue-600/10', 
    icon: MonitorPlay, 
    color: 'text-blue-500' 
  },
  2: { 
    gradient: 'from-purple-500/10 to-purple-600/10', 
    icon: Crown, 
    color: 'text-purple-500' 
  },
  3: { 
    gradient: 'from-amber-500/10 to-amber-600/10', 
    icon: Radio, 
    color: 'text-amber-500' 
  },
};

const paymentProviders = [
  { id: 'stripe', name: 'Karta płatnicza', icon: '💳', description: 'Visa, Mastercard, Maestro' },
  { id: 'przelewy24', name: 'Przelewy24', icon: '🏦', description: 'BLIK, przelew, karta' },
  { id: 'payu', name: 'PayU', icon: '💰', description: 'Szybkie płatności online' },
];

export function PaymentForm({ plans, selectedPlanId, onSuccess, onCancel }: PaymentFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(selectedPlanId || null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherValid, setVoucherValid] = useState<boolean | null>(null);
  const [voucherInfo, setVoucherInfo] = useState<{
    discountAmount: number;
    type: string;
    value: number;
  } | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoucherLoading, setIsVoucherLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'przelewy24' | 'payu'>('stripe');

  const { toast } = useToast();

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);
  const finalAmount = selectedPlanData ? Math.max(0, selectedPlanData.price - discountAmount) : 0;

  const handleValidateVoucher = useCallback(async () => {
    if (!voucherCode.trim() || !selectedPlan) return;

    setIsVoucherLoading(true);
    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: voucherCode,
          planId: selectedPlan,
        }),
      });

      const data = await response.json();

      if (data.success && data.valid) {
        setVoucherValid(true);
        setVoucherInfo({
          discountAmount: data.voucher?.discountAmount || 0,
          type: data.voucher?.type || 'FIXED_AMOUNT',
          value: data.voucher?.value || 0,
        });
        setDiscountAmount(data.voucher?.discountAmount || 0);
        toast({
          title: 'Kod aktywny!',
          description: `Zniżka: ${data.voucher?.discountAmount?.toFixed(2)} PLN`,
        });
      } else {
        setVoucherValid(false);
        setVoucherInfo(null);
        setDiscountAmount(0);
        toast({
          title: 'Nieprawidłowy kod',
          description: data.error || 'Sprawdź kod i spróbuj ponownie',
          variant: 'destructive',
        });
      }
    } catch {
      setVoucherValid(false);
      setDiscountAmount(0);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zweryfikować kodu',
        variant: 'destructive',
      });
    } finally {
      setIsVoucherLoading(false);
    }
  }, [voucherCode, selectedPlan, toast]);

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          provider: selectedProvider,
          voucherCode: voucherValid ? voucherCode : undefined,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirect to payment page
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: 'Błąd płatności',
          description: data.error || 'Wystąpił błąd podczas inicjowania płatności',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Błąd połączenia',
        description: 'Sprawdź połączenie internetowe',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset voucher when plan changes
  useEffect(() => {
    setVoucherValid(null);
    setVoucherInfo(null);
    setDiscountAmount(0);
  }, [selectedPlan]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Wybierz plan subskrypcji</h2>
        <p className="text-muted-foreground">
          Elastyczne plany dopasowane do Twoich potrzeb
        </p>
      </div>

      {/* Plan Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const style = planStyles[plan.tier] || planStyles[0];
          const IconComponent = style.icon;
          const isSelected = selectedPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative cursor-pointer transition-all overflow-hidden',
                'hover:shadow-lg hover:scale-[1.02]',
                isSelected && 'ring-2 ring-primary shadow-lg',
                plan.isPromoted && 'ring-2 ring-amber-500'
              )}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {/* Background gradient */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-50',
                style.gradient
              )} />

              {/* Promoted badge */}
              {plan.isPromoted && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-amber-500 text-white border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Polecany
                  </Badge>
                </div>
              )}

              <CardHeader className="relative pb-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center bg-background/80',
                    style.color
                  )}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4">
                {/* Price */}
                <div>
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.currency}/mies.</span>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plan.description}
                  </p>
                )}

                {/* Features */}
                <ul className="space-y-1.5">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Meta info */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span>{plan.maxProfiles} {plan.maxProfiles === 1 ? 'profil' : 'profile'}</span>
                  <span>•</span>
                  <span>{plan.maxDevices} ur.</span>
                  <span>•</span>
                  <span>{plan.quality}</span>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Voucher */}
      {selectedPlan && selectedPlanData && selectedPlanData.price > 0 && (
        <Card className="border-white/5 bg-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Tag className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <Input
                  placeholder="Masz kod promocyjny?"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    if (voucherValid) {
                      setVoucherValid(null);
                      setVoucherInfo(null);
                      setDiscountAmount(0);
                    }
                  }}
                  className="bg-background border-border"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleValidateVoucher}
                disabled={isVoucherLoading || !voucherCode.trim()}
              >
                {isVoucherLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Sprawdź'
                )}
              </Button>
            </div>

            {voucherValid && voucherInfo && (
              <div className="mt-3 flex items-center gap-2 text-emerald-500">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Kod aktywny! Zniżka: {voucherInfo.type === 'PERCENTAGE' 
                    ? `${voucherInfo.value}%` 
                    : `${voucherInfo.discountAmount.toFixed(2)} PLN`}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      {selectedPlan && selectedPlanData && selectedPlanData.price > 0 && (
        <Card className="border-white/5 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Metoda płatności
            </CardTitle>
            <CardDescription>
              Wybierz preferowaną metodę płatności
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {paymentProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id as typeof selectedProvider)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-left',
                    selectedProvider === provider.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <span className="text-3xl">{provider.icon}</span>
                  <div className="text-center">
                    <span className="font-medium">{provider.name}</span>
                    <p className="text-xs text-muted-foreground">{provider.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {selectedPlanData && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Podsumowanie</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-semibold">{selectedPlanData.name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cena podstawowa:</span>
                  <span className="font-semibold">{selectedPlanData.price.toFixed(2)} PLN</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-500">
                    <span>Zniżka:</span>
                    <span className="font-semibold">-{discountAmount.toFixed(2)} PLN</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between text-lg">
                <span className="font-bold">Do zapłaty:</span>
                <span className="font-black text-2xl text-primary">
                  {finalAmount.toFixed(2)} PLN
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Shield className="h-4 w-4" />
                <span>Płatność szyfrowana SSL • Bezpieczna transakcja</span>
              </div>

              <div className="flex gap-3 pt-4">
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    Anuluj
                  </Button>
                )}
                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      {finalAmount === 0 ? 'Aktywuj za darmo' : `Zapłać ${finalAmount.toFixed(2)} PLN`}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
