import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SettingsPage } from './settings-page';

export const dynamic = 'force-dynamic';

export default async function Settings() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  return <SettingsPage />;
}
