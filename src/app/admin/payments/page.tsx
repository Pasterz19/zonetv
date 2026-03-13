import { auth } from '@/lib/auth';
import { query, queryOne } from '@/server/db';
import { redirect } from 'next/navigation';
import {
  CreditCard,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Crown,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Get subscription stats
  const [
    activeSubscriptions,
    totalSubscriptions,
    expiredSubscriptions,
    planStats
  ] = await Promise.all([
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Subscription WHERE active = 1'),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Subscription'),
    queryOne<{ count: number }>("SELECT COUNT(*) as count FROM Subscription WHERE active = 0 OR (endsAt IS NOT NULL AND endsAt < datetime('now'))"),
    query<{
      planId: string;
      planName: string;
      price: number;
      currency: string;
      activeCount: number;
      totalCount: number;
    }>(
      `SELECT 
        p.id as planId, 
        p.name as planName, 
        p.price, 
        p.currency,
        COUNT(CASE WHEN s.active = 1 THEN 1 END) as activeCount,
        COUNT(s.id) as totalCount
       FROM SubscriptionPlan p
       LEFT JOIN Subscription s ON p.id = s.planId
       GROUP BY p.id
       ORDER BY p.tier ASC`
    )
  ]);

  // Get recent subscriptions with user info
  const recentSubscriptions = await query<{
    id: string;
    userId: string;
    planId: string;
    planName: string;
    price: number;
    currency: string;
    active: number;
    startedAt: string;
    endsAt: string | null;
    userEmail: string;
    userName: string | null;
  }>(
    `SELECT 
      s.id, s.userId, s.planId, s.active, s.startedAt, s.endsAt,
      p.name as planName, p.price, p.currency,
      u.email as userEmail, u.name as userName
     FROM Subscription s
     JOIN SubscriptionPlan p ON s.planId = p.id
     JOIN User u ON s.userId = u.id
     ORDER BY s.startedAt DESC
     LIMIT 20`
  );

  // Calculate total revenue (potential monthly revenue)
  const totalRevenue = planStats.reduce((sum, plan) => {
    return sum + (plan.price * plan.activeCount);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Płatności & <span className="text-primary">Subskrypcje</span>
          </h1>
          <p className="text-muted-foreground">
            Zarządzaj subskrypcjami i przeglądaj płatności
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/plans">
            <Crown className="h-4 w-4" />
            Zarządzaj Planami
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aktywne</p>
                <h3 className="text-3xl font-black mt-1 text-emerald-500">{activeSubscriptions?.count || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">Subskrypcje</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Wszystkie</p>
                <h3 className="text-3xl font-black mt-1">{totalSubscriptions?.count || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">Łącznie</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Wygasłe</p>
                <h3 className="text-3xl font-black mt-1 text-red-500">{expiredSubscriptions?.count || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">Nieaktywne</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Przychód mies.</p>
                <h3 className="text-3xl font-black mt-1 text-primary">{totalRevenue.toFixed(2)} PLN</h3>
                <p className="text-xs text-muted-foreground mt-1">Potencjalny</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Stats */}
      <Card className="border-white/5 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Statystyki Planów
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {planStats.map((plan) => (
              <div 
                key={plan.planId}
                className="p-4 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold">{plan.planName}</h4>
                  <Badge variant="outline">
                    {plan.price} {plan.currency}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Aktywne</p>
                    <p className="text-xl font-bold text-emerald-500">{plan.activeCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Łącznie</p>
                    <p className="text-xl font-bold">{plan.totalCount}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-muted-foreground">Miesięczny przychód</p>
                  <p className="text-lg font-bold text-primary">
                    {(plan.price * plan.activeCount).toFixed(2)} {plan.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Subscriptions */}
      <Card className="border-white/5 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Ostatnie Subskrypcje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak subskrypcji do wyświetlenia
            </div>
          ) : (
            <div className="space-y-3">
              {recentSubscriptions.map((sub) => (
                <div 
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      sub.active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {sub.active ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{sub.userName || sub.userEmail.split('@')[0]}</h4>
                        <Badge variant="outline" className="text-xs">{sub.planName}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{sub.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{sub.price} {sub.currency}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.endsAt 
                        ? `Do: ${new Date(sub.endsAt).toLocaleDateString('pl-PL')}`
                        : 'Bez limitu'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}