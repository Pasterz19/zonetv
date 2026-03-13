import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { queryOne, runQuery } from '@/server/db';

const SESSION_COOKIE_NAME = "zonetv_session";
const secretKey = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-zonetv-change-me",
);

async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;

    const { payload } = await jwtVerify(token, secretKey);
    return payload.sub as string;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { contentId, contentType } = await request.json();

    if (!contentId || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already favorited
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM Favorite WHERE userId = ? AND contentId = ? AND contentType = ?`,
      [userId, contentId, contentType]
    );

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already in favorites' });
    }

    // Add to favorites
    await runQuery(
      `INSERT INTO Favorite (id, userId, contentId, contentType, createdAt) VALUES (?, ?, ?, ?, datetime('now'))`,
      [crypto.randomUUID(), userId, contentId, contentType]
    );

    return NextResponse.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    console.error('Failed to add favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { contentId, contentType } = await request.json();

    if (!contentId || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await runQuery(
      `DELETE FROM Favorite WHERE userId = ? AND contentId = ? AND contentType = ?`,
      [userId, contentId, contentType]
    );

    return NextResponse.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Failed to remove favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type');

    let query = `SELECT contentId, contentType FROM Favorite WHERE userId = ?`;
    const params: string[] = [userId];

    if (contentType) {
      query += ` AND contentType = ?`;
      params.push(contentType);
    }

    const favorites = await queryOne<{ contentId: string; contentType: string }[]>(query, params);
    return NextResponse.json(favorites || []);
  } catch (error) {
    console.error('Failed to get favorites:', error);
    return NextResponse.json({ error: 'Failed to get favorites' }, { status: 500 });
  }
}
