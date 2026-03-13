'use client';

import { useState, useTransition } from 'react';
import {
  CreditCard,
  Check,
  Star,
  Users,
  Save,
  Loader2,
  Sparkles,
  Edit,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string | null;
  features: string;
  isPromoted: number;
  tier: number;
  subscriberCount: number;
}

interface PlansManagerProps {
  plans: Plan[];
  updatePlan: (formData: FormData) => Promise<void>;
}

const planColors = {
  0: { bg: 'bg-gray-500', border: 'border-gray-500/20', text: 'text-gray-500' },
  1: { bg: 'bg-blue-500', border: 'border-blue-500/20', text: 'text-blue-500' },
  2: { bg: 'bg-purple-500', border: 'border-purple-500/20', text: 'text-purple-500' },
  3: { bg: 'bg-amber-500', border: 'border-amber-500/20', text: 'text-amber-500' },
};

function EditPlanDialog({
  plan,
  onUpdate,
  trigger
}: {
  plan: Plan;
  onUpdate: (formData: FormData) => Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [features, setFeatures] = useState(() => {
    try {
      return JSON.parse(plan.features);
    } catch {
      return [];
    }
  });

  const handleSubmit = (formData: FormData) => {
    formData.set('features', JSON.stringify(features));
    startTransition(async () => {
      await onUpdate(formData);
      setOpen(false);
    });
  };

  const colors = planColors[plan.tier as keyof typeof planColors] || planColors[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edytuj Plan: {plan.name}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          <input type="hidden" name="planId" value={plan.id} />

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nazwa</label>
            <Input name="name" defaultValue={plan.name} className="bg-white/5 border-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cena (PLN)</label>
              <Input
                name="price"
                type="number"
                step="0.01"
                defaultValue={plan.price}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tier</label>
              <Input
                name="tier"
                type="number"
                defaultValue={plan.tier}
                disabled
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Opis</label>
            <textarea
              name="description"
              defaultValue={plan.description || ''}
              className="w-full rounded-md bg-white/5 border border-white/10 p-3 text-sm min-h-[60px]"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <label className="text-sm font-medium">Polecany Plan</label>
            <input
              type="hidden"
              name="isPromoted"
              value={plan.isPromoted ? 'true' : 'false'}
            />
            <Switch
              name="isPromoted"
              defaultChecked={plan.isPromoted === 1}
              onCheckedChange={(checked) => {
                const input = document.querySelector('input[name="isPromoted"]') as HTMLInputElement;
                if (input) input.value = checked ? 'true' : 'false';
              }}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Zapisz Zmiany
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PlansManager({ plans, updatePlan }: PlansManagerProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">
          Plany <span className="text-primary">Subskrypcji</span>
        </h1>
        <p className="text-muted-foreground">
          Zarządzaj planami i cenami subskrypcji
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="border-white/5 bg-white/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                planColors[plan.tier as keyof typeof planColors]?.bg + "/10",
                planColors[plan.tier as keyof typeof planColors]?.text
              )}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{plan.subscriberCount}</p>
                <p className="text-xs text-muted-foreground">{plan.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const colors = planColors[plan.tier as keyof typeof planColors] || planColors[0];
          let features: string[] = [];
          try {
            features = JSON.parse(plan.features);
          } catch {
            features = [];
          }

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden border transition-all",
                colors.border,
                plan.isPromoted && "ring-2 ring-primary"
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
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.currency}/mies.</span>
                </div>

                {plan.description && (
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                )}

                {features.length > 0 && (
                  <ul className="space-y-2">
                    {features.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {plan.subscriberCount} subskrybentów
                  </div>
                  <EditPlanDialog
                    plan={plan}
                    onUpdate={updatePlan}
                    trigger={
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit className="h-3 w-3" />
                        Edytuj
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
