import { auth } from '@/lib/auth';
import { query, queryOne, runQuery } from '@/server/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { PlansManager } from './plans-manager';

export const dynamic = 'force-dynamic';

// Helper to convert libsql results to plain objects
function toPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

async function updatePlan(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const planId = formData.get('planId') as string;
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string) || 0;
  const description = formData.get('description') as string;
  const features = formData.get('features') as string;
  const isPromoted = formData.get('isPromoted') === 'true';

  if (!planId) return;

  await runQuery(
    `UPDATE SubscriptionPlan
     SET name = ?, price = ?, description = ?, features = ?, isPromoted = ?, updatedAt = datetime('now')
     WHERE id = ?`,
    [name, price, description || null, features, isPromoted ? 1 : 0, planId]
  );

  revalidatePath('/admin/plans');
}

export { updatePlan };

export default async function PlansPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const plansRaw = await query<{
    id: string;
    name: string;
    price: number;
    currency: string;
    description: string | null;
    features: string;
    isPromoted: number;
    tier: number;
  }>(
    `SELECT id, name, price, currency, description, features, isPromoted, tier
     FROM SubscriptionPlan
     ORDER BY tier ASC`
  );

  // Get subscriber count for each plan
  const plansWithCount = await Promise.all(
    plansRaw.map(async (plan) => {
      const result = await queryOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM Subscription WHERE planId = ? AND active = 1`,
        [plan.id]
      );
      return toPlainObject({
        ...plan,
        subscriberCount: result?.count || 0
      });
    })
  );

  return <PlansManager plans={plansWithCount} updatePlan={updatePlan} />;
}
