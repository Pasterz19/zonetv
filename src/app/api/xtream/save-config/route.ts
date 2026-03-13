import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '@/server/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Brak uprawnień' }, { status: 401 });
    }

    const body = await request.json();
    const { host, port, username, password } = body;

    if (!host || !username || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Brak wymaganych danych' 
      });
    }

    // Check if config already exists
    const existingConfig = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/api/xtream/configs`
    ).then(r => r.json());

    const configs = existingConfig.configs || [];
    const exists = configs.find(
      (c: any) => c.host === host && c.username === username
    );

    if (exists) {
      // Update existing
      await runQuery(
        `UPDATE XtreamConfig SET password = ?, port = ?, updatedAt = datetime('now') 
         WHERE host = ? AND username = ?`,
        [password, port || '80', host, username]
      );
    } else {
      // Insert new
      await runQuery(
        `INSERT INTO XtreamConfig (id, host, port, username, password, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [crypto.randomUUID(), host, port || '80', username, password]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Save config error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Błąd: ${(error as Error).message}` 
    });
  }
}
