import { auth } from '@/lib/auth';
import { query, queryOne, runQuery } from '@/server/db';
import { redirect } from 'next/navigation';
import { UserManagement } from './user-management';

export const dynamic = 'force-dynamic';

// Helper to convert libsql results to plain objects
function toPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

async function createUser(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'USER');
  const name = String(formData.get('name') ?? '');

  if (!email || !password) return;

  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 10);

  await runQuery(
    `INSERT INTO User (id, email, name, passwordHash, role, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [crypto.randomUUID(), email, name || null, passwordHash, role]
  );

  redirect('/admin/users');
}

async function deleteUser(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const userId = formData.get('userId') as string;
  if (!userId || userId === session.user.id) return;

  await runQuery('DELETE FROM Favorite WHERE userId = ?', [userId]);
  await runQuery('DELETE FROM WatchProgress WHERE userId = ?', [userId]);
  await runQuery('DELETE FROM Notification WHERE userId = ?', [userId]);
  await runQuery('DELETE FROM Subscription WHERE userId = ?', [userId]);
  await runQuery('DELETE FROM ChannelBufferPreference WHERE userId = ?', [userId]);
  await runQuery('DELETE FROM WatchHistory WHERE userId = ?', [userId]);
  await runQuery('DELETE FROM User WHERE id = ?', [userId]);

  redirect('/admin/users');
}

async function updateUserRole(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const userId = formData.get('userId') as string;
  const role = formData.get('role') as string;

  if (!userId || !role) return;

  await runQuery("UPDATE User SET role = ?, updatedAt = datetime('now') WHERE id = ?", [role, userId]);
  redirect('/admin/users');
}

async function assignSubscription(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const userId = formData.get('userId') as string;
  const planId = formData.get('planId') as string;
  const durationDays = parseInt(formData.get('durationDays') as string) || 30;

  if (!userId || !planId) return;

  // Check if user already has a subscription
  const existingSub = await queryOne<{ id: string }>(
    'SELECT id FROM Subscription WHERE userId = ?',
    [userId]
  );

  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setDate(endsAt.getDate() + durationDays);
  const endsAtStr = endsAt.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');

  if (existingSub) {
    // Update existing subscription
    await runQuery(
      `UPDATE Subscription SET planId = ?, active = 1, startedAt = datetime('now'), endsAt = ? WHERE userId = ?`,
      [planId, endsAtStr, userId]
    );
  } else {
    // Create new subscription
    await runQuery(
      `INSERT INTO Subscription (id, userId, planId, active, startedAt, endsAt)
       VALUES (?, ?, ?, 1, datetime('now'), ?)`,
      [crypto.randomUUID(), userId, planId, endsAtStr]
    );
  }

  redirect('/admin/users');
}

async function revokeSubscription(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const userId = formData.get('userId') as string;
  if (!userId) return;

  await runQuery('UPDATE Subscription SET active = 0 WHERE userId = ?', [userId]);
  redirect('/admin/users');
}

export { createUser, deleteUser, updateUserRole, assignSubscription, revokeSubscription };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const usersRaw = await query<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
  }>(
    `SELECT id, email, name, role, createdAt FROM User ORDER BY createdAt DESC`
  );

  const plansRaw = await query<{
    id: string;
    name: string;
    tier: number;
    price: number;
  }>(
    `SELECT id, name, tier, price FROM SubscriptionPlan ORDER BY tier ASC`
  );

  // Get subscriptions for each user
  const usersWithSubs = await Promise.all(
    usersRaw.map(async (user) => {
      const sub = await queryOne<{
        active: number;
        planId: string;
        planName: string;
        endsAt: string | null;
      }>(
        `SELECT s.active, s.planId, s.endsAt, p.name as planName
         FROM Subscription s
         JOIN SubscriptionPlan p ON s.planId = p.id
         WHERE s.userId = ?
         ORDER BY s.startedAt DESC LIMIT 1`,
        [user.id]
      );
      return toPlainObject({
        ...user,
        subscription: sub ? {
          active: sub.active === 1,
          planId: sub.planId,
          planName: sub.planName,
          endsAt: sub.endsAt
        } : null
      });
    })
  );

  const plans = plansRaw.map(p => toPlainObject(p));

  return (
    <UserManagement
      users={usersWithSubs}
      plans={plans}
      currentUser={session.user.id}
      createUser={createUser}
      deleteUser={deleteUser}
      updateUserRole={updateUserRole}
      assignSubscription={assignSubscription}
      revokeSubscription={revokeSubscription}
    />
  );
}
