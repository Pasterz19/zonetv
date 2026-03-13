'use client';

import Link from 'next/link';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type SubscriptionRestrictedProps = {
  requiredTierName: string;
};

export function SubscriptionRestricted({ requiredTierName }: SubscriptionRestrictedProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full p-4">
      <Card className="max-w-md w-full border-white/5 bg-white/5 backdrop-blur-sm text-center">
        <CardHeader className="pt-10 pb-2">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">
            Dostęp <span className="text-primary">Zablokowany</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <div className="flex items-center justify-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest">
            <ShieldAlert className="h-4 w-4" />
            <span>Wymagana Subskrypcja</span>
          </div>
          <p className="text-muted-foreground">
            Ta treść jest dostępna wyłącznie dla użytkowników z pakietem 
            <span className="font-bold text-foreground"> {requiredTierName} </span> 
            lub wyższym.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-10 px-10">
          <Button asChild className="w-full font-bold uppercase py-6">
            <Link href="/dashboard/plans">
              Ulepsz swój plan <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-xs text-muted-foreground hover:text-foreground">
            <Link href="/dashboard">Wróć do panelu</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}