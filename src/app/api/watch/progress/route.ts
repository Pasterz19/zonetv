import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { executeSql, queryOne } from '@/server/db';

const SESSION_COOKIE_NAME = "zonetv_session";
const secretKey = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-zonetv-change-me",
);

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, secretKey);
      userId = payload.sub as string;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { movieId, episodeId, timestamp } = body;

    if (!timestamp) {
      return NextResponse.json({ error: 'Timestamp required' }, { status: 400 });
    }

    // Upsert watch progress
    if (movieId) {
      await executeSql(
        `INSERT INTO WatchProgress (id, userId, movieId, timestamp, updatedAt)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(userId, movieId) DO UPDATE SET
           timestamp = excluded.timestamp,
           updatedAt = datetime('now')`,
        [crypto.randomUUID(), userId, movieId, timestamp]
      );
    } else if (episodeId) {
      await executeSql(
        `INSERT INTO WatchProgress (id, userId, episodeId, timestamp, updatedAt)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(userId, episodeId) DO UPDATE SET
           timestamp = excluded.timestamp,
           updatedAt = datetime('now')`,
        [crypto.randomUUID(), userId, episodeId, timestamp]
      );
    } else {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Watch progress error:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, secretKey);
      userId = payload.sub as string;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    const episodeId = searchParams.get('episodeId');

    if (movieId) {
      const result = await queryOne<{ timestamp: number }>(
        `SELECT timestamp FROM WatchProgress WHERE userId = ? AND movieId = ?`,
        [userId, movieId]
      );
      return NextResponse.json({ timestamp: result?.timestamp || 0 });
    }

    if (episodeId) {
      const result = await queryOne<{ timestamp: number }>(
        `SELECT timestamp FROM WatchProgress WHERE userId = ? AND episodeId = ?`,
        [userId, episodeId]
      );
      return NextResponse.json({ timestamp: result?.timestamp || 0 });
    }

    return NextResponse.json({ error: 'Content ID required' }, { status: 400 });
  } catch (error) {
    console.error('Watch progress error:', error);
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 });
  }
}
