import { auth } from '@/lib/auth';
import { query } from '@/server/db';
import { redirect } from 'next/navigation';
import { MonitoringWall } from './monitoring-wall';

export const dynamic = 'force-dynamic';

// Helper to convert libsql results to plain objects
function toPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export default async function MonitoringPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

  const channelsRaw = await query<{
    id: string;
    name: string;
    imageUrl: string;
    streamUrl: string;
    groupTitle: string | null;
    enabled: number;
  }>(
    `SELECT id, name, imageUrl, streamUrl, groupTitle, enabled FROM Channel WHERE enabled = 1 ORDER BY name ASC`
  );

  // Convert to plain objects for client components
  const channels = channelsRaw.map(c => toPlainObject(c));

  return <MonitoringWall channels={channels} />;
}
