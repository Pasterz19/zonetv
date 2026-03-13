import { auth } from '@/lib/auth';
import { query, queryOne } from '@/server/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Check,
  Crown,
  Sparkles,
  ArrowLeft,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanPurchaseButton } from './plan-purchase-button';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string | null;
  features: string;
  isPromoted: number;
  tier: number;
}

interface Subscription {
  id: string;
  active: number;
  planId: string;
  planName: string;
  endsAt: string | null;
  startedAt: string;
}

const planColors = {
  0: { bg: 'bg-gray-500', border: 'border-gray-500/20', text: 'text-gray-500', gradient: 'from-gray-500/10' },
  1: { bg: 'bg-blue-500', border: 'border-blue-500/20', text: 'text-blue-500', gradient: 'from-blue-500/10' },
  2: { bg: 'bg-purple-500', border: 'border-purple-500/20', text: 'text-purple-500', gradient: 'from-purple-500/10' },
  3: { bg: 'bg-amber-500', border: 'border-amber-500/20', text: 'text-amber-500', gradient: 'from-amber-500/10' },
};

export default async function PlansPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Get current subscription
  const subscription = await queryOne<Subscription>(
    `SELECT s.id, s.active, s.planId, s.endsAt, s.startedAt, p.name as planName
     FROM Subscription s
     JOIN SubscriptionPlan p ON s.planId = p.id
     WHERE s.userId = ?
     ORDER BY s.startedAt DESC LIMIT 1`,
    [session.user.id]
  );

  const isSubscriptionActive = subscription?.active === 1 &&
    (!subscription.endsAt || new Date(subscription.endsAt) > new Date());

  // Get available plans
  const plans = await query<Plan>(
    `SELECT id, name, price, currency, description, features, isPromoted, tier
     FROM SubscriptionPlan
     ORDER BY tier ASC`
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Powrót do panelu
          </Link>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Plany <span className="text-primary">Subskrypcji</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Wybierz plan najlepiej dopasowany do Twoich potrzeb
          </p>
        </div>

        {/* Current Subscription */}
        {isSubscriptionActive && subscription && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Twój obecny plan</p>
                    <p className="font-bold text-xl">{subscription.planName}</p>
                    {subscription.endsAt && (
                      <p className="text-sm text-muted-foreground">
                        Ważny do: {new Date(subscription.endsAt).toLocaleDateString('pl-PL')}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 text-sm py-1 px-3">
                  <Check className="h-4 w-4 mr-1" />
                  Aktywny
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const colors = planColors[plan.tier as keyof typeof planColors] || planColors[0];
            let features: string[] = [];
            try {
              features = JSON.parse(plan.features);
            } catch {
              features = ['Dostęp do biblioteki', 'Wsparcie techniczne'];
            }

            const isCurrentPlan = subscription?.planId === plan.id;
            const canPurchase = !isSubscriptionActive || !isCurrentPlan;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all",
                  colors.border,
                  plan.isPromoted && "ring-2 ring-primary shadow-lg shadow-primary/10"
                )}
              >
                {plan.isPromoted && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Polecany
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", colors.bg)}>
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  {plan.description && (
                    <CardDescription>{plan.description}</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.currency}/mies.</span>
                  </div>

                  {features.length > 0 && (
                    <ul className="space-y-2">
                      {features.slice(0, 6).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10">
                      <Check className="h-4 w-4 mr-2" />
                      Twój plan
                    </Button>
                  ) : (
                    <PlanPurchaseButton
                      planId={plan.id}
                      planName={plan.name}
                      price={plan.price}
                      currency={plan.currency}
                      hasActiveSubscription={isSubscriptionActive || false}
                    />
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <Card className="mt-8 border-white/5 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Często Zadawane Pytania
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Jak mogę zapłacić?</h4>
              <p className="text-sm text-muted-foreground">
                Akceptujemy płatności kartą (Stripe) oraz szybkie przelewy bankowe (Przelewy24).
                Wszystkie płatności są bezpieczne i szyfrowane.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Czy mogę anulować subskrypcję?</h4>
              <p className="text-sm text-muted-foreground">
                Tak, możesz anulować subskrypcję w dowolnym momencie. Dostęp do treści pozostanie
                aktywny do końca okresu rozliczeniowego.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Co się stanie po wygaśnięciu subskrypcji?</h4>
              <p className="text-sm text-muted-foreground">
                Po wygaśnięciu subskrypcji dostęp do treści premium zostanie zablokowany.
                Twoje ulubione i historia oglądania zostaną zachowane.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Bezpieczne metody płatności</p>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            <div className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              <CreditCard className="h-8 w-8" />
            </div>
            <div className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              <span className="text-lg font-bold">Przelewy24</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
