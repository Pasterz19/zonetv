import { NextResponse } from 'next/server';
import { query } from '@/server/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Brak uprawnień' }, { status: 401 });
    }

    const configs = await query<{
      id: string;
      host: string;
      port: string;
      username: string;
      password: string;
      serverName: string | null;
    }>(
      `SELECT id, host, port, username, password, serverName FROM XtreamConfig ORDER BY createdAt DESC`
    );

    // Return configs without exposing full passwords
    const safeConfigs = configs.map(c => ({
      ...c,
      password: c.password ? '••••••••' : '' // Mask password in list
    }));

    return NextResponse.json({ 
      success: true, 
      configs: safeConfigs 
    });

  } catch (error) {
    console.error('Get configs error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Błąd: ${(error as Error).message}` 
    });
  }
}
